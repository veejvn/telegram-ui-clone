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

        // ✅ FIX: Thêm xử lý sự kiện từ chối cuộc gọi
        c.on('reject', (event: any) => {
            console.log('[CallService] Call rejected by remote party');
            this.emit('call-ended', 'rejected');
            this.cleanup();
        });

        c.on('hangup', (event: any) => {
            const reason = event?.reason || 'user_hangup';
            console.log('[CallService] Call hangup:', reason);

            // ✅ Cleanup local stream tracks
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    track.stop();
                });
            }

            // ✅ Cleanup peer connection tracks
            const callAny = call as any;
            if (callAny.peerConn) {
                const senders = callAny.peerConn.getSenders();
                senders.forEach((sender: RTCRtpSender) => {
                    if (sender.track) {
                        sender.track.stop();
                    }
                });
            }

            // ✅ Delay cleanup để tránh race condition với events đến sau
            setTimeout(() => {
                this.emit('call-ended', reason);
                this.cleanup();
            }, 1000);
        });

        c.on('error', (err: Error) => {
            console.error('[CallService] Call error:', err);

            // ✅ Handle specific WebRTC errors
            if (err.message.includes('setRemoteDescription') || err.message.includes('stable')) {
                console.warn('[CallService] WebRTC state conflict detected, ignoring error');
                return;
            }

            this.emit('call-error', err);

            // ✅ Delay cleanup cho error cases
            setTimeout(() => {
                this.cleanup();
            }, 500);
        });
    }

    // ✅ FIX: Thêm method cleanup riêng
    private cleanup() {
        this.currentCall = undefined;
        this.currentRoomId = undefined;
        this.localStream = undefined;
        console.log('[CallService] Call cleanup completed');
    }

    public async placeCall(roomId: string, type: CallType) {
        if (this.currentCall && this.currentRoomId === roomId) return;

        const call = this.client.createCall(roomId);
        if (!call) return;
        this.registerCallEvents(call);

        this.currentCall = call;
        this.currentRoomId = roomId;

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
            const isVideo = this.currentCall.type === 'video' || callAny.hasLocalUserMediaVideoTrack;
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: isVideo
            });

            this.localStream = stream;
            this.emit('local-stream', stream);

            (this.currentCall as any).answer({ audio: true, video: isVideo });

            console.log('[CallService] Answered call with local stream:', {
                audioTracks: stream.getAudioTracks().length,
                videoTracks: stream.getVideoTracks().length,
                isVideo
            });

        } catch (err) {
            console.error('[CallService] Failed to get user media for answer:', err);
            this.currentCall.answer();
        }
    }

    // ✅ FIX: Thêm method để từ chối cuộc gọi
    public rejectCall() {
        if (!this.currentCall) return;

        console.log('[CallService] Rejecting call');

        try {
            // Matrix SDK method để từ chối cuộc gọi
            (this.currentCall as any).reject();

            // Emit event để UI biết cuộc gọi đã bị từ chối
            this.emit('call-ended', 'rejected');

            // Cleanup
            this.cleanup();
        } catch (err) {
            console.error('[CallService] Failed to reject call:', err);
            // Fallback: force cleanup
            this.cleanup();
        }
    }

    public hangup() {
        if (!this.currentCall) return;

        console.log('[CallService] Manual hangup called');

        // ✅ Cleanup local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop();
            });
        }

        // ✅ Cleanup peer connection tracks
        const callAny = this.currentCall as any;
        if (callAny.peerConn) {
            const senders = callAny.peerConn.getSenders();
            senders.forEach((sender: RTCRtpSender) => {
                if (sender.track) {
                    sender.track.stop();
                }
            });
        }

        // ✅ Call hangup với delay để tránh race condition
        try {
            (this.currentCall as any).hangup();
            console.log('[CallService] Hangup called successfully');
        } catch (err) {
            console.warn('[CallService] Hangup failed, forcing cleanup:', err);
            setTimeout(() => {
                this.emit('call-ended', 'user_hangup');
                this.cleanup();
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

            const audioTracks = this.localStream?.getAudioTracks() ?? [];
            const newStream = new MediaStream([...audioTracks, videoTrack]);
            callAny.localStream = newStream;
            this.localStream = newStream;

            this.emit('local-stream', newStream);

            if (typeof callAny._updateRemoteFeeds === 'function') {
                callAny._updateRemoteFeeds();
            }
        } catch (err) {
            console.error('[CallService] Không thể bật camera:', err);
            alert('Không thể bật camera: ' + (err instanceof Error ? err.message : String(err)));
        }
    }

    public async toggleCamera(on: boolean) {
        if (!this.currentCall) return;

        const callAny = this.currentCall as any;
        const pc = callAny.peerConn as RTCPeerConnection;
        const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');

        if (videoSender && videoSender.track) {
            videoSender.track.enabled = on;
            this.localStream?.getVideoTracks().forEach(t => t.enabled = on);
            this.emit('local-stream', this.localStream!);
        } else if (on) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const videoTrack = stream.getVideoTracks()[0];

                pc.addTrack(videoTrack, stream);
                this.localStream?.addTrack(videoTrack);
                this.emit('local-stream', this.localStream!);
            } catch (err) {
                console.error('[CallService] toggleCamera failed to get video track:', err);
            }
        }
    }

    public async toggleMic(on: boolean) {
        if (!this.currentCall) return;

        console.log(`[CallService] Toggling mic: ${on}`);

        const callAny = this.currentCall as any;
        const pc = callAny.peerConn as RTCPeerConnection;
        const senders = pc?.getSenders?.();
        const audioSender = senders?.find(s => s.track?.kind === 'audio');

        if (!audioSender) {
            console.warn('[CallService] No audio sender found');
            return;
        }

        if (!on) {
            const silentTrack = createSilentAudioTrack();
            await audioSender.replaceTrack(silentTrack);
            console.log('[CallService] Mic muted using silent track');

            this.localStream?.getAudioTracks().forEach(t => t.stop());
            const videoTracks = this.localStream?.getVideoTracks() ?? [];
            this.localStream = new MediaStream(videoTracks);
        } else {
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const newTrack = newStream.getAudioTracks()[0];
                await audioSender.replaceTrack(newTrack);
                console.log('[CallService] Mic unmuted');

                this.localStream?.addTrack(newTrack);
            } catch (err) {
                console.error('[CallService] Failed to unmute mic:', err);
            }
        }

        this.emit('mic-toggled', on);
    }
}

export const callService = new CallService();