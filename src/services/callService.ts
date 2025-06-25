// src/services/callService.ts
import { EventEmitter } from 'events';
import * as sdk from 'matrix-js-sdk';

export type CallType = 'voice' | 'video';
export interface IncomingCall { roomId: string; callerId: string; callType: CallType }

class CallService extends EventEmitter {
    private client: sdk.MatrixClient;
    private currentCall?: sdk.MatrixCall;

    constructor() {
        super();
        this.client = sdk.createClient({
            baseUrl: process.env.NEXT_PUBLIC_MATRIX_SERVER_URL!,
            accessToken: process.env.NEXT_PUBLIC_MATRIX_ACCESS_TOKEN!,
            userId: process.env.NEXT_PUBLIC_MATRIX_USER_ID!,
            deviceId: process.env.NEXT_PUBLIC_MATRIX_DEVICE_ID!,    // ← thêm dòng này

        });
        this.client.startClient({ initialSyncLimit: 10 });

        // incoming call
        ; (this.client as any).on('Call.incoming', this.onIncomingCall.bind(this));
    }

    private onIncomingCall(call: sdk.MatrixCall) {
        if (!call) return;

        // guard opponent
        const opp = call.getOpponentMember();
        if (!opp) return;

        this.currentCall = call;
        this.registerCallEvents(call);

        // read undocumented `.callType` defensively
        const rawType = (call as any).callType;
        const callType: CallType = rawType === 'video' ? 'video' : 'voice';

        this.emit('incoming-call', {
            roomId: call.roomId!,
            callerId: opp.userId!,
            callType,
        });

        // answer if you want auto-answer, or let UI call answerCall()
        call.answer();
    }

    private registerCallEvents(call: sdk.MatrixCall) {
        const c = call as any;
        c.once('local_stream', (s: MediaStream) => this.emit('local-stream', s));
        c.once('remote_stream', (s: MediaStream) => {
            this.emit('remote-stream', s);
            this.emit('connected');
        });
        c.once('hangup', () => this.emit('call-ended'));
        c.once('error', (e: Error) => this.emit('call-error', e));
    }

    public async placeCall(roomId: string, type: CallType) {
        if (!this.client) return;
        const call = this.client.createCall(roomId);
        if (!call) return;

        this.currentCall = call;
        this.registerCallEvents(call);

        if (type === 'voice') {
            await call.placeVoiceCall();
        } else {
            await call.placeVideoCall();
        }
        this.emit('outgoing-call', { roomId, callType: type });
    }

    public answerCall() {
        if (!this.currentCall) return;
        this.currentCall.answer();
    }

    public hangup() {
        if (!this.currentCall) return;
        // runtime accepts no args, but d.ts requires them – cast to any
        (this.currentCall as any).hangup();
        this.currentCall = undefined;
        this.emit('call-ended');
    }
}

export const callService = new CallService();
