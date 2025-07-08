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
    incoming?: IncomingCall & { callType: CallType }
    localStream?: MediaStream
    remoteStream?: MediaStream
    callDuration: number
    callEndedReason?: string
    micOn: boolean
    placeCall: (roomId: string, type: CallType) => void
    answerCall: () => Promise<void>
    rejectCall: () => void  // ✅ FIX: Thêm method rejectCall
    hangup: () => void
    reset: () => void
    toggleCamera: (on: boolean) => void
    toggleMic: (on: boolean) => void
    hardMute: () => void
    muteWithSilentTrack: () => void
    recreateAudioTrack: () => Promise<void>
    upgradeToVideo: () => Promise<void>
}

const outgoingAudio = typeof Audio !== 'undefined' ? new Audio('/chat/sounds/outgoing.mp3') : null
const ringtoneAudio = typeof Audio !== 'undefined' ? new Audio('/chat/sounds/ringtone.mp3') : null

if (outgoingAudio) outgoingAudio.loop = true
if (ringtoneAudio) ringtoneAudio.loop = true

let _timer: ReturnType<typeof setInterval> | null = null

const stopAllTracks = (stream?: MediaStream) => {
    if (stream) {
        stream.getTracks().forEach(track => {
            try {
                track.stop();
            } catch (err) {
                console.warn('[CallStore] Failed to stop track:', track.kind, track.id, err);
            }
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
            ringtoneAudio?.play().catch(() => { });
            set({ state: 'incoming', incoming: { ...data }, callDuration: 0, callEndedReason: undefined });
        });

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

        callService.on('mic-toggled', (isOn: boolean) => {
            set({ micOn: isOn });
        })

        // ✅ FIX: Cải thiện xử lý call-ended với thông tin chi tiết hơn
        callService.on('call-ended', (reason?: string) => {
            console.log('[CallStore] Call ended with reason:', reason);

            if (_timer) {
                clearInterval(_timer)
                _timer = null
            }

            // Stop all audio
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
                micOn: true,
                incoming: undefined  // ✅ Clear incoming call data
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

            set({
                state: 'error',
                callEndedReason: 'error',
                micOn: true,
                incoming: undefined  // ✅ Clear incoming call data
            })
        })

        _hasListener = true;
    }

    return {
        state: 'idle',
        callDuration: 0,
        micOn: true,
        placeCall: (roomId, type) => {
            const { state } = get();
            if (state === 'ringing' || state === 'connecting' || state === 'connected') {
                console.warn(`[CallStore] Already have active call for this room (${roomId}), state=${state}`);
                return;
            }
            callService.placeCall(roomId, type)
        },
        answerCall: async () => {
            set({ state: 'connecting' })
            await callService.answerCall()
        },

        // ✅ FIX: Thêm method rejectCall
        rejectCall: () => {
            console.log('[CallStore] Rejecting call');

            // Stop ringtone immediately
            ringtoneAudio?.pause()
            if (ringtoneAudio) ringtoneAudio.currentTime = 0

            // Call service to reject
            callService.rejectCall()

            // Update state immediately
            set({
                state: 'ended',
                callEndedReason: 'rejected',
                incoming: undefined
            })
        },

        hangup: () => {
            const { localStream, remoteStream } = get();
            stopAllTracks(localStream);
            stopAllTracks(remoteStream);

            const videoElements = document.querySelectorAll('video');
            videoElements.forEach(video => {
                if (video.srcObject) {
                    video.srcObject = null;
                }
            });

            set({ localStream: undefined, remoteStream: undefined });
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

            const { localStream, remoteStream } = get();
            stopAllTracks(localStream);
            stopAllTracks(remoteStream);

            const videoElements = document.querySelectorAll('video');
            videoElements.forEach(video => {
                if (video.srcObject) {
                    video.srcObject = null;
                }
            });

            set({
                state: 'idle',
                incoming: undefined,
                localStream: undefined,
                remoteStream: undefined,
                callDuration: 0,
                callEndedReason: undefined,
                micOn: true
            });
        },
        toggleCamera: (on: boolean) => {
            try {
                callService.toggleCamera(on);
            } catch (e) {
                console.warn('[CallStore] toggleCamera failed:', e);
            }
        },

        toggleMic: (on) => {
            set({ micOn: on });
            try {
                callService.toggleMic(on);
            } catch (e) {
                console.warn('[CallStore] toggleMic failed:', e);
                set({ micOn: !on });
            }
        },

        hardMute: () => {
            set({ micOn: false });
            try {
                if ('hardMute' in callService) {
                    (callService as any).hardMute();
                }
            } catch (e) {
                console.warn('[CallStore] hardMute failed:', e);
            }
        },

        muteWithSilentTrack: () => {
            set({ micOn: false });
            try {
                if ('muteWithSilentTrack' in callService) {
                    (callService as any).muteWithSilentTrack();
                }
            } catch (e) {
                console.warn('[CallStore] muteWithSilentTrack failed:', e);
            }
        },

        recreateAudioTrack: async () => {
            try {
                if ('recreateAudioTrack' in callService) {
                    await (callService as any).recreateAudioTrack();
                    set({ micOn: true });
                }
            } catch (e) {
                console.warn('[CallStore] recreateAudioTrack failed:', e);
            }
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