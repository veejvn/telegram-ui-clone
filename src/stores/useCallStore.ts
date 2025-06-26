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
    placeCall: (roomId: string, type: CallType) => void
    answerCall: () => void
    hangup: () => void
    reset: () => void
}

// Audio setup
const outgoingAudio = typeof Audio !== 'undefined' ? new Audio('/sounds/outgoing.mp3') : null
const ringtoneAudio = typeof Audio !== 'undefined' ? new Audio('/sounds/ringtone.mp3') : null

if (outgoingAudio) outgoingAudio.loop = true
if (ringtoneAudio) ringtoneAudio.loop = true

let _timer: ReturnType<typeof setInterval> | null = null

const stopAllTracks = (stream?: MediaStream) => {
    console.log('Nhận remoteStream:', stream); // <--- THÊM LOG NÀY!

    if (stream) {
        stream.getTracks().forEach(track => {
            try { track.stop() } catch { }
        })
    }
}

const useCallStore = create<CallStore>((set, get) => {
    // subscribe matrix-js-sdk events
    callService.on('outgoing-call', () => {
        outgoingAudio?.play().catch(() => { })
        set({ state: 'ringing', incoming: undefined, callDuration: 0 })
    })

    callService.on('incoming-call', (data: IncomingCall) => {
        ringtoneAudio?.play().catch(() => { })
        set({ state: 'incoming', incoming: data, callDuration: 0 })
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

        // start duration timer
        if (_timer) clearInterval(_timer)
        set({ callDuration: 0 })
        _timer = setInterval(() => {
            set((s) => ({ callDuration: s.callDuration + 1 }))
        }, 1000)
    })

    callService.on('call-ended', () => {
        if (_timer) {
            clearInterval(_timer)
            _timer = null
        }
        outgoingAudio?.pause()
        ringtoneAudio?.pause()
        if (outgoingAudio) outgoingAudio.currentTime = 0
        if (ringtoneAudio) ringtoneAudio.currentTime = 0

        // STOP ALL TRACKS
        const { localStream, remoteStream } = get();
        stopAllTracks(localStream);
        stopAllTracks(remoteStream);

        set({
            state: 'ended',
            localStream: undefined,
            remoteStream: undefined,
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

        // STOP ALL TRACKS
        const { localStream, remoteStream } = get();
        stopAllTracks(localStream);
        stopAllTracks(remoteStream);

        set({ state: 'error' })
    })

    return {
        state: 'idle',
        callDuration: 0,
        placeCall: (roomId, type) => {
            callService.placeCall(roomId, type)
        },
        answerCall: () => {
            set({ state: 'connecting' })
            callService.answerCall()
        },
        hangup: () => {
            callService.hangup()
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

            // STOP ALL TRACKS
            const { localStream, remoteStream } = get();
            stopAllTracks(localStream);
            stopAllTracks(remoteStream);

            set({
                state: 'idle',
                incoming: undefined,
                localStream: undefined,
                remoteStream: undefined,
                callDuration: 0,
            });
        }
    }
})

export default useCallStore
