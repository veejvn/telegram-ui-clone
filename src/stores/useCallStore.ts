// src/stores/useCallStore.ts
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
}

let _timer: ReturnType<typeof setInterval> | null = null

const useCallStore = create<CallStore>((set, get) => {
    // subscribe matrix-js-sdk events
    callService.on('outgoing-call', () => {
        // caller đã gửi invite
        set({ state: 'ringing', incoming: undefined, callDuration: 0 })
    })

    callService.on('incoming-call', (data: IncomingCall) => {
        // callee nhận cuộc gọi
        set({ state: 'incoming', incoming: data, callDuration: 0 })
    })

    callService.on('local-stream', (stream: MediaStream) => {
        set({ localStream: stream })
    })

    callService.on('remote-stream', (stream: MediaStream) => {
        // khi peer đã bắt đầu media
        set({ remoteStream: stream, state: 'connected' })
        // start duration timer
        if (_timer) clearInterval(_timer)
        set({ callDuration: 0 })
        _timer = setInterval(() => {
            set((s) => ({ callDuration: s.callDuration + 1 }))
        }, 1000)
    })

    callService.on('call-ended', () => {
        // cleanup on hangup
        if (_timer) {
            clearInterval(_timer)
            _timer = null
        }
        set({
            state: 'ended',
            localStream: undefined,
            remoteStream: undefined,
        })
    })

    callService.on('call-error', () => {
        // error cũng end call
        if (_timer) {
            clearInterval(_timer)
            _timer = null
        }
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
    }
})

export default useCallStore
