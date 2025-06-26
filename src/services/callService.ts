import { EventEmitter } from 'events';
import * as sdk from 'matrix-js-sdk';

export type CallType = 'voice' | 'video';

export interface IncomingCall {
    roomId: string;
    callerId: string;
    callType: CallType;
}

class CallService extends EventEmitter {
    private client: sdk.MatrixClient;
    private currentCall?: sdk.MatrixCall;

    constructor() {
        super();
        this.client = sdk.createClient({
            baseUrl: process.env.NEXT_PUBLIC_MATRIX_SERVER_URL!,
            accessToken: process.env.NEXT_PUBLIC_MATRIX_ACCESS_TOKEN!,
            userId: process.env.NEXT_PUBLIC_MATRIX_USER_ID!,
            deviceId: process.env.NEXT_PUBLIC_MATRIX_DEVICE_ID!,
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
        this.registerCallEvents(call); // ĐĂNG KÝ NGAY SAU KHI NHẬN CALL

        const rawType = (call as any).callType;
        const callType: CallType = rawType === 'video' ? 'video' : 'voice';

        console.log('[CallService] Incoming call from', opp.userId, 'type:', callType);

        this.emit('incoming-call', {
            roomId: call.roomId!,
            callerId: opp.userId!,
            callType,
        });

        // KHÔNG auto-answer ở đây, chờ UI gọi answer
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

        // ========================
        // FIX CHO MATRIX CALL V2+
        // ========================
        c.on('feeds_changed', () => {
            // getRemoteFeeds chỉ có ở MatrixCall v2+
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

        c.on('hangup', () => {
            console.log('[CallService] Call ended');
            this.emit('call-ended');
        });

        c.on('error', (err: Error) => {
            console.error('[CallService] Call error:', err);
            this.emit('call-error', err);
        });
    }
    // GỌI ĐI - ĐĂNG KÝ EVENT TRƯỚC KHI CALL
    public async placeCall(roomId: string, type: CallType) {
        if (!this.client) return;
        const call = this.client.createCall(roomId);
        if (!call) return;

        this.currentCall = call;
        this.registerCallEvents(call); // ĐĂNG KÝ NGAY SAU TẠO

        if (type === 'voice') {
            await call.placeVoiceCall(); // PHẢI SAU registerCallEvents
        } else {
            await call.placeVideoCall();
        }

        console.log('[CallService] Outgoing call placed:', type, 'to', roomId);
        this.emit('outgoing-call', { roomId, callType: type });
    }

    // TRẢ LỜI CUỘC GỌI - KHÔNG ĐĂNG KÝ EVENT NỮA (đã đăng ký khi nhận call)
    public answerCall() {
        if (!this.currentCall) return;

        console.log('[CallService] Answering call...');
        this.currentCall.answer();

        // KHÔNG emit connected thủ công bằng setTimeout!
        // CHỈ emit khi nhận được remoteStream thật
    }

    public hangup() {
        if (!this.currentCall) return;

        console.log('[CallService] Hanging up...');
        (this.currentCall as any).hangup();
        this.currentCall = undefined;
        this.emit('call-ended');
    }
    public async upgradeToVideo() {
        if (!this.currentCall) return;
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const videoTrack = videoStream.getVideoTracks()[0];
            const callAny = this.currentCall as any;
            const senders = callAny.peerConn?.getSenders?.();
            if (senders) {
                const videoSender = senders.find((sender: RTCRtpSender) => sender.track && sender.track.kind === 'video');
                if (videoSender) {
                    await videoSender.replaceTrack(videoTrack);
                } else {
                    callAny.peerConn?.addTrack?.(videoTrack, videoStream);
                }
            }
        } catch (err) {
            console.error("[CallService] Không thể bật camera:", err);
            if (err instanceof Error) {
                alert("Không thể bật camera: " + err.message);
            } else {
                alert("Không thể bật camera: " + String(err));
            }
        }
    }


} // <--- ĐÂY là dấu đóng class!


export const callService = new CallService();
