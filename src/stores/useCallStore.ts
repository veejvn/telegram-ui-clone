import { create } from 'zustand'
import { callService, CallType, IncomingCall } from '@/services/callService'

type State =
    | 'idle'
    | 'ringing'
    | 'incoming'
    | 'connecting'
    | 'connected'
    | 'ended'
    | 'error'

interface CallStore {
    state: State
    incoming?: IncomingCall
    localStream?: MediaStream
    remoteStream?: MediaStream
    callDuration: number
    callEndedReason?: string
    placeCall: (roomId: string, type: CallType) => void
    answerCall: () => void
    hangup: () => void
    reset: () => void
    upgradeToVideo: () => Promise<void>
}

// Audio setup
const outgoingAudio = typeof Audio !== 'undefined' ? new Audio('/sounds/outgoing.mp3') : null
const ringtoneAudio = typeof Audio !== 'undefined' ? new Audio('/sounds/ringtone.mp3') : null

if (outgoingAudio) outgoingAudio.loop = true
if (ringtoneAudio) ringtoneAudio.loop = true

let _timer: ReturnType<typeof setInterval> | null = null

const stopAllTracks = (stream?: MediaStream) => {
    if (stream) {
        stream.getTracks().forEach(track => {
            try { track.stop() } catch { }
        })
    }
}

let _hasListener = false;

const useCallStore = create<CallStore>((set, get) => {
    if (!_hasListener) {
        callService.on('outgoing-call', () => {
            outgoingAudio?.play().catch(() => { })
            set({ state: 'ringing', incoming: undefined, callDuration: 0, callEndedReason: undefined })
        })

        callService.on('incoming-call', (data: IncomingCall) => {
            ringtoneAudio?.play().catch(() => { })
            set({ state: 'incoming', incoming: data, callDuration: 0, callEndedReason: undefined })
        })

        callService.on('local-stream', (stream: MediaStream) => {
            set({ localStream: stream })
        })

        callService.on('remote-stream', (stream: MediaStream) => {
            outgoingAudio?.pause()
            ringtoneAudio?.pause()
            if (outgoingAudio) outgoingAudio.currentTime = 0
            if (ringtoneAudio) ringtoneAudio.currentTime = 0

            set({ remoteStream: stream, state: 'connected' })

            if (_timer) clearInterval(_timer)
            set({ callDuration: 0 })
            _timer = setInterval(() => {
                set((s) => ({ callDuration: s.callDuration + 1 }))
            }, 1000)
        })

        callService.on('call-ended', (reason?: string) => {
            if (_timer) {
                clearInterval(_timer)
                _timer = null
            }
            outgoingAudio?.pause()
            ringtoneAudio?.pause()
            if (outgoingAudio) outgoingAudio.currentTime = 0
            if (ringtoneAudio) ringtoneAudio.currentTime = 0

            const { localStream, remoteStream } = get();
            stopAllTracks(localStream);
            stopAllTracks(remoteStream);

            set({
                state: 'ended',
                localStream: undefined,
                remoteStream: undefined,
                callEndedReason: reason,
            })
        })

        callService.on('call-error', () => {
            if (_timer) {
                clearInterval(_timer)
                _timer = null
            }
            outgoingAudio?.pause()
            ringtoneAudio?.pause()
            if (outgoingAudio) outgoingAudio.currentTime = 0
            if (ringtoneAudio) ringtoneAudio.currentTime = 0

            const { localStream, remoteStream } = get();
            stopAllTracks(localStream);
            stopAllTracks(remoteStream);

            set({ state: 'error', callEndedReason: 'error' })
        })

        _hasListener = true;
    }

    return {
        state: 'idle',
        callDuration: 0,
        placeCall: (roomId, type) => {
            const { state } = get();
            if (state === 'ringing' || state === 'connecting' || state === 'connected') {
                console.warn(`[CallStore] Already have active call for this room (${roomId}), state=${state}`);
                return;
            }
            callService.placeCall(roomId, type)
        },
        answerCall: () => {
            set({ state: 'connecting' })
            callService.answerCall()
        },
        hangup: () => {
            // Immediately stop local/remote tracks on hangup
            const { localStream, remoteStream } = get();
            stopAllTracks(localStream);
            stopAllTracks(remoteStream);
            // Optionally clear from state immediately (optional, can keep for UI until call-ended)
            set({ localStream: undefined, remoteStream: undefined });
            callService.hangup()
            // KHÔNG cleanup state tại đây!
        },
        reset: () => {
            if (_timer) {
                clearInterval(_timer)
                _timer = null
            }
            outgoingAudio?.pause()
            ringtoneAudio?.pause()
            if (outgoingAudio) outgoingAudio.currentTime = 0
            if (ringtoneAudio) ringtoneAudio.currentTime = 0

            const { localStream, remoteStream } = get();
            stopAllTracks(localStream);
            stopAllTracks(remoteStream);

            set({
                state: 'idle',
                incoming: undefined,
                localStream: undefined,
                remoteStream: undefined,
                callDuration: 0,
                callEndedReason: undefined,
            });
        },
        upgradeToVideo: async () => {
            try {
                await callService.upgradeToVideo();
            } catch (err) {
                console.error("[CallStore] upgradeToVideo error:", err);
            }
        },
    }
})

export default useCallStore
