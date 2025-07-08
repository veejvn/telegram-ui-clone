'use client';

import { EventEmitter } from 'events';
import * as sdk from 'matrix-js-sdk';
import { useAuthStore } from '@/stores/useAuthStore';

export type CallType = 'voice' | 'video';

export interface IncomingCall {
    roomId: string;
    callerId: string;
    callType: CallType;
}

const HOMESERVER_URL: string = process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";
const { accessToken, userId, deviceId } = useAuthStore.getState();

function createSilentAudioTrack(): MediaStreamTrack {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination()) as MediaStreamAudioDestinationNode;
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    return Object.assign(track, { enabled: false });
}


class CallService extends EventEmitter {
    private client: sdk.MatrixClient;
    private currentCall?: sdk.MatrixCall;
    private currentRoomId?: string;
    private localStream?: MediaStream;

    constructor() {
        super();
        this.client = sdk.createClient({
            baseUrl: HOMESERVER_URL,
            accessToken: accessToken!,
            userId: userId!,
            deviceId: deviceId!,
        });

        this.client.startClient({ initialSyncLimit: 10 });
        (this.client as any).on('Call.incoming', this.onIncomingCall.bind(this));
        this.client.on('event', (event: any) => {
            console.log('[MatrixClient] Event:', {
                type: event.getType ? event.getType() : event.type,
                sender: event.getSender ? event.getSender() : event.sender,
                roomId: event.getRoomId ? event.getRoomId() : event.room_id,
                content: event.getContent ? event.getContent() : event.content,
                raw: event
            });

            // Bổ sung: lắng nghe m.call.hangup ở cấp client
            const type = event.getType ? event.getType() : event.type;
            if (type === 'm.call.hangup') {
                const content = event.getContent ? event.getContent() : event.content;
                const callId = content?.call_id;
                if (this.currentCall && this.currentCall.callId === callId) {
                    console.log('[CallService] Global hangup detected for currentCall', callId);
                    this.emit('call-ended', 'remote_hangup');
                    this.currentCall = undefined;
                    this.currentRoomId = undefined;
                    this.localStream = undefined;
                }
            }
        });
    }

    private onIncomingCall(call: sdk.MatrixCall) {
        const opp = call.getOpponentMember();
        if (!opp) return;

        this.currentCall = call;
        this.registerCallEvents(call);

        const isVideo = call.hasLocalUserMediaVideoTrack || call.type === 'video';
        const callType: CallType = isVideo ? 'video' : 'voice';


        this.emit('incoming-call', {
            roomId: call.roomId!,
            callerId: opp.userId!,
            callType,
        });
    }

    private registerCallEvents(call: sdk.MatrixCall) {
        const c = call as any;

        c.on('local_stream', (stream: MediaStream) => {
            this.localStream = stream;
            this.emit('local-stream', stream);
        });

        c.on('remote_stream', (stream: MediaStream) => {
            if (stream) {
                this.emit('remote-stream', stream);
                this.emit('connected');
            }
        });

        c.on('feeds_changed', () => {
            const feeds = typeof c.getRemoteFeeds === 'function' ? c.getRemoteFeeds() : undefined;
            if (feeds && feeds.length > 0 && feeds[0].stream) {
                const stream = feeds[0].stream as MediaStream;
                this.emit('remote-stream', stream);
                this.emit('connected');
            }
        });

        c.on('hangup', (event: any) => {
            const reason = event?.reason || 'user_hangup';
            console.log('[CallService] hangup event received', reason, event);

            // ✅ Cleanup local stream tracks
            if (this.localStream) {
                console.log('[CallService] Stopping local stream tracks:', {
                    audioTracks: this.localStream.getAudioTracks().length,
                    videoTracks: this.localStream.getVideoTracks().length
                });
                this.localStream.getTracks().forEach(track => {
                    track.stop();
                    console.log('[CallService] Stopped track:', track.kind, track.id);
                });
            }

            // ✅ Cleanup peer connection tracks
            const callAny = call as any;
            if (callAny.peerConn) {
                const senders = callAny.peerConn.getSenders();
                senders.forEach((sender: RTCRtpSender) => {
                    if (sender.track) {
                        sender.track.stop();
                        console.log('[CallService] Stopped peer connection track:', sender.track.kind, sender.track.id);
                    }
                });
            }

            // ✅ Delay cleanup để tránh race condition với events đến sau
            setTimeout(() => {
                this.emit('call-ended', reason);
                this.currentCall = undefined;
                this.currentRoomId = undefined;
                this.localStream = undefined;
                console.log('[CallService] Call cleanup completed after delay');
            }, 1000); // Delay 1 giây
        });

        c.on('error', (err: Error) => {
            // console.error('[CallService] Call error:', err);

            // ✅ Handle specific WebRTC errors
            if (err.message.includes('setRemoteDescription') || err.message.includes('stable')) {
                // console.warn('[CallService] WebRTC state conflict detected, ignoring error');
                return; // Don't cleanup on WebRTC state conflicts
            }

            this.emit('call-error', err);

            // ✅ Delay cleanup cho error cases
            setTimeout(() => {
                this.currentCall = undefined;
                // console.log('[CallService] Call cleanup completed after error');
            }, 500);
        });
    }

    public async placeCall(roomId: string, type: CallType) {
        if (this.currentCall && this.currentRoomId === roomId) return;

        const call = this.client.createCall(roomId);
        if (!call) return;

        this.currentCall = call;
        this.currentRoomId = roomId;
        this.registerCallEvents(call);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
        this.localStream = stream;

        const pc = (call as any).peerConn;
        if (pc) {
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });
        }

        this.emit('local-stream', stream);
        if (type === 'video') {
            await call.placeVideoCall();
        } else {
            await call.placeVoiceCall();
        }

        this.emit('outgoing-call', { roomId, callType: type });
    }

    public async answerCall() {
        if (!this.currentCall) return;

        const callAny = this.currentCall as any;

        try {
            // ✅ Lấy local stream TRƯỚC khi answer
            const isVideo = this.currentCall.type === 'video' || callAny.hasLocalUserMediaVideoTrack;
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: isVideo
            });

            this.localStream = stream;
            this.emit('local-stream', stream);

            // ✅ Answer với constraints (Matrix SDK sẽ tự động lấy stream)
            (this.currentCall as any).answer({ audio: true, video: isVideo });

            // console.log('[CallService] Answered call with local stream:', {
            //     audioTracks: stream.getAudioTracks().length,
            //     videoTracks: stream.getVideoTracks().length,
            //     isVideo
            // });

        } catch (err) {
            // console.error('[CallService] Failed to get user media for answer:', err);
            // Fallback: answer without stream (audio only)
            this.currentCall.answer();
        }
    }


    public hangup() {
        if (!this.currentCall) return;

        // console.log('[CallService] Manual hangup called');

        // ✅ Cleanup local stream tracks
        if (this.localStream) {
            // console.log('[CallService] Stopping local stream tracks on manual hangup:', {
            //     audioTracks: this.localStream.getAudioTracks().length,
            //     videoTracks: this.localStream.getVideoTracks().length
            // });
            this.localStream.getTracks().forEach(track => {
                track.stop();
                // console.log('[CallService] Stopped track on manual hangup:', track.kind, track.id);
            });
        }

        // ✅ Cleanup peer connection tracks
        const callAny = this.currentCall as any;
        if (callAny.peerConn) {
            const senders = callAny.peerConn.getSenders();
            senders.forEach((sender: RTCRtpSender) => {
                if (sender.track) {
                    sender.track.stop();
                    // console.log('[CallService] Stopped peer connection track on manual hangup:', sender.track.kind, sender.track.id);
                }
            });
        }

        // ✅ Call hangup với delay để tránh race condition
        try {
            (this.currentCall as any).hangup();
            // console.log('[CallService] Hangup called successfully');
        } catch (err) {
            // console.warn('[CallService] Hangup failed, forcing cleanup:', err);
            // Force cleanup nếu hangup fail
            setTimeout(() => {
                this.currentCall = undefined;
                this.currentRoomId = undefined;
                this.localStream = undefined;
                this.emit('call-ended', 'user_hangup');
            }, 100);
        }
    }

    public async upgradeToVideo() {
        if (!this.currentCall) return;

        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const videoTrack = videoStream.getVideoTracks()[0];
            videoTrack.enabled = true;

            const callAny = this.currentCall as any;

            const senders = callAny.peerConn?.getSenders?.();
            const videoSender = senders?.find((sender: RTCRtpSender) => sender.track?.kind === 'video');

            if (videoSender) {
                await videoSender.replaceTrack(videoTrack);
            } else {
                callAny.peerConn?.addTrack?.(videoTrack, videoStream);
            }

            // Combine lại stream
            const audioTracks = this.localStream?.getAudioTracks() ?? [];
            const newStream = new MediaStream([...audioTracks, videoTrack]);
            callAny.localStream = newStream;
            this.localStream = newStream;

            // Trigger UI update
            this.emit('local-stream', newStream);

            // Trigger renegotiation
            if (typeof callAny._updateRemoteFeeds === 'function') {
                callAny._updateRemoteFeeds();
            }
        } catch (err) {
            // console.error('[CallService] Không thể bật camera:', err);
            alert('Không thể bật camera: ' + (err instanceof Error ? err.message : String(err)));
        }
    }
    public async toggleCamera(on: boolean) {
        if (!this.currentCall) return;

        const callAny = this.currentCall as any;
        const pc = callAny.peerConn as RTCPeerConnection;
        // tìm sender đang gửi video
        const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');

        if (videoSender && videoSender.track) {
            // Chỉ enable/disable track
            videoSender.track.enabled = on;
            // Đồng bộ lên localStream
            this.localStream?.getVideoTracks().forEach(t => t.enabled = on);
            this.emit('local-stream', this.localStream!);
        } else if (on) {
            // Trường hợp chưa có video track, mới add track
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const videoTrack = stream.getVideoTracks()[0];

                // thêm vào peer connection
                pc.addTrack(videoTrack, stream);
                // thêm vào localStream hiện có
                this.localStream?.addTrack(videoTrack);
                this.emit('local-stream', this.localStream!);
            } catch (err) {
                // console.error('[CallService] toggleCamera failed to get video track:', err);
            }
        }
    }
    public async toggleMic(on: boolean) {
        if (!this.currentCall) return;

        // console.log(`[CallService] Toggling mic: ${on}`);

        const callAny = this.currentCall as any;
        const pc = callAny.peerConn as RTCPeerConnection;
        const senders = pc?.getSenders?.();
        const audioSender = senders?.find(s => s.track?.kind === 'audio');

        if (!audioSender) {
            // console.warn('[CallService] No audio sender found');
            return;
        }

        if (!on) {
            // 🔇 MUTE: Replace track bằng silent và xoá hết audio track khỏi stream
            const silentTrack = createSilentAudioTrack();
            await audioSender.replaceTrack(silentTrack);
            // console.log('[CallService] Mic muted using silent track');

            // Stop & remove old tracks
            this.localStream?.getAudioTracks().forEach(t => t.stop());
            const videoTracks = this.localStream?.getVideoTracks() ?? [];
            this.localStream = new MediaStream(videoTracks);
        } else {
            // 🔊 UNMUTE: Tạo lại track từ getUserMedia
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const newTrack = newStream.getAudioTracks()[0];
                await audioSender.replaceTrack(newTrack);
                // console.log('[CallService] Mic unmuted');

                // Thêm track mới vào stream
                this.localStream?.addTrack(newTrack);
            } catch (err) {
                // console.error('[CallService] Failed to unmute mic:', err);
            }
        }

        this.emit('mic-toggled', on);
    }


}

export const callService = new CallService();