"use client";

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
const { accessToken, userId, deviceId } = useAuthStore.getState(); // Đảm bảo đã đăng nhập

class CallService extends EventEmitter {
    private client: sdk.MatrixClient;
    private currentCall?: sdk.MatrixCall;

    constructor() {
        super();
        this.client = sdk.createClient({
            baseUrl: HOMESERVER_URL!,
            accessToken: accessToken!,
            userId: userId!,
            deviceId: deviceId!,
        });

        this.client.startClient({ initialSyncLimit: 10 });

        // Đăng ký sự kiện nhận cuộc gọi đến
        (this.client as any).on('Call.incoming', this.onIncomingCall.bind(this));
    }

    private onIncomingCall(call: sdk.MatrixCall) {
        if (!call) return;
        const opp = call.getOpponentMember();
        if (!opp) return;

        this.currentCall = call;
        this.registerCallEvents(call);

        const rawType = (call as any).callType;
        const callType: CallType = rawType === 'video' ? 'video' : 'voice';

        console.log('[CallService] Incoming call from', opp.userId, 'type:', callType);

        this.emit('incoming-call', {
            roomId: call.roomId!,
            callerId: opp.userId!,
            callType,
        });
    }

    private registerCallEvents(call: sdk.MatrixCall) {
        const c = call as any;

        // Local stream
        c.on('local_stream', (stream: MediaStream) => {
            console.log('[CallService] Local stream ready:', stream);
            this.emit('local-stream', stream);
        });

        // Remote stream (Matrix Call v1)
        c.on('remote_stream', (stream: MediaStream) => {
            console.log('[CallService] Remote stream received:', stream);
            if (stream) {
                this.emit('remote-stream', stream);
                this.emit('connected');
            } else {
                console.warn('[CallService] remote_stream nhận undefined! Không emit.');
            }
        });

        // Matrix Call v2+
        c.on('feeds_changed', () => {
            const feeds = typeof c.getRemoteFeeds === 'function' ? c.getRemoteFeeds() : undefined;
            if (feeds && feeds.length > 0) {
                const stream = feeds[0].stream;
                if (stream) {
                    console.log('[CallService] feeds_changed - remote stream:', stream);
                    this.emit('remote-stream', stream);
                    this.emit('connected');
                }
            }
        });

        // Hangup - cleanup duy nhất ở đây!
        c.on('hangup', (event: any) => {
            const reason = event?.reason || "user_hangup";
            console.log('[CallService] Hangup received from SDK/peer! Reason:', reason);
            this.emit('call-ended', reason);
            this.currentCall = undefined; // chỉ cleanup tại đây!
        });

        c.on('error', (err: Error) => {
            console.error('[CallService] Call error:', err);
            this.emit('call-error', err);
            this.currentCall = undefined;
        });
    }

    // Gọi đi (voice/video)
    public async placeCall(roomId: string, type: CallType) {
        if (!this.client) return;
        const call = this.client.createCall(roomId);
        if (!call) return;

        this.currentCall = call;
        this.registerCallEvents(call);

        if (type === 'voice') {
            await call.placeVoiceCall();
        } else {
            // LẤY audio + video stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            console.log('🟢 [DEBUG] video call getUserMedia tracks:', stream.getTracks());
            console.log('🟢 [DEBUG] video call getUserMedia video tracks:', stream.getVideoTracks());
            if ((call as any).peerConn) {
                const pc = (call as any).peerConn;
                stream.getTracks().forEach((track: MediaStreamTrack) => {
                    pc.addTrack(track, stream);
                });
            }
            this.emit('local-stream', stream);
            await call.placeVideoCall();
        }

        console.log('[CallService] Outgoing call placed:', type, 'to', roomId);
        this.emit('outgoing-call', { roomId, callType: type });
    }

    public answerCall() {
        if (!this.currentCall) return;
        console.log('[CallService] Answering call...');
        this.currentCall.answer();
    }

    // KHÔNG cleanup currentCall ở đây!
    public hangup() {
        if (!this.currentCall) return;
        console.log('[CallService] Hanging up (send signaling to peer/Element)...');
        (this.currentCall as any).hangup();
        // Không emit call-ended ở đây, cleanup chỉ khi nhận event hangup từ SDK/peer!
        // this.currentCall = undefined;
    }

    public async upgradeToVideo() {
        if (!this.currentCall) return;
        try {
            // 1. Lấy video stream mới
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const videoTrack = videoStream.getVideoTracks()[0];
            const callAny = this.currentCall as any;
            const senders = callAny.peerConn?.getSenders?.();

            // 2. Thêm video track vào peerConn
            if (senders) {
                const videoSender = senders.find((sender: RTCRtpSender) => sender.track && sender.track.kind === 'video');
                if (videoSender) {
                    await videoSender.replaceTrack(videoTrack);
                } else {
                    callAny.peerConn?.addTrack?.(videoTrack, videoStream);
                }
            }

            // 3. Ghép audio cũ (nếu có) với video track mới
            let localStream: MediaStream | undefined = undefined;
            if (callAny.localStream) {
                const audioTracks = callAny.localStream.getAudioTracks();
                localStream = new MediaStream([...audioTracks, videoTrack]);
            } else {
                localStream = new MediaStream([videoTrack]);
            }

            this.emit('local-stream', localStream);
            callAny.localStream = localStream;
        } catch (err) {
            console.error("[CallService] Không thể bật camera:", err);
            alert("Không thể bật camera: " + (err instanceof Error ? err.message : String(err)));
        }
    }
}

export const callService = new CallService();
