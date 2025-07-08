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
    incoming?: IncomingCall & { callType: CallType }; // thêm callType
    localStream?: MediaStream
    remoteStream?: MediaStream
    callDuration: number
    callEndedReason?: string
    micOn: boolean
    placeCall: (roomId: string, type: CallType) => void
    answerCall: () => Promise<void>
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
        // console.log('[CallStore] Stopping all tracks in stream:', {
        //     audioTracks: stream.getAudioTracks().length,
        //     videoTracks: stream.getVideoTracks().length
        // });
        stream.getTracks().forEach(track => {
            try {
                track.stop();
                // console.log('[CallStore] Stopped track:', track.kind, track.id);
            } catch (err) {
                // console.warn('[CallStore] Failed to stop track:', track.kind, track.id, err);
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

        // Lắng nghe sự kiện mic-toggled từ CallService
        callService.on('mic-toggled', (isOn: boolean) => {
            // console.log(`[CallStore] Mic toggled from service: ${isOn}`);
            set({ micOn: isOn });
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
                micOn: true, // reset về mặc định
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
                micOn: true
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
                // console.warn(`[CallStore] Already have active call for this room (${roomId}), state=${state}`);
                return;
            }
            callService.placeCall(roomId, type)
        },
        answerCall: async () => {
            set({ state: 'connecting' })
            await callService.answerCall()
        },
        hangup: () => {
            const { localStream, remoteStream } = get();
            stopAllTracks(localStream);
            stopAllTracks(remoteStream);

            // ✅ Force detach video elements để tắt camera indicator
            const videoElements = document.querySelectorAll('video');
            videoElements.forEach(video => {
                if (video.srcObject) {
                    video.srcObject = null;
                    // console.log('[CallStore] Detached video element:', video);
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

            // ✅ Force detach video elements để tắt camera indicator
            const videoElements = document.querySelectorAll('video');
            videoElements.forEach(video => {
                if (video.srcObject) {
                    video.srcObject = null;
                    // console.log('[CallStore] Detached video element in reset:', video);
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
            // console.log(`[CallStore] Toggle camera requested: ${on}`);
            try {
                callService.toggleCamera(on);
            } catch (e) {
                // console.warn('[CallStore] toggleCamera failed:', e);
            }
        },

        toggleMic: (on) => {
            // console.log(`[CallStore] Toggle mic requested: ${on}`);

            // Cập nhật trạng thái UI ngay lập tức
            set({ micOn: on });

            // Gửi tới callService để xử lý thực tế
            try {
                callService.toggleMic(on);
            } catch (e) {
                // console.warn('[CallStore] toggleMic failed:', e);
                // Revert lại trạng thái nếu thất bại
                set({ micOn: !on });
            }
        },

        // Thêm các method mạnh hơn
        hardMute: () => {
            // console.log('[CallStore] Hard mute requested');
            set({ micOn: false });
            try {
                if ('hardMute' in callService) {
                    (callService as any).hardMute();
                }
            } catch (e) {
                // console.warn('[CallStore] hardMute failed:', e);
            }
        },

        muteWithSilentTrack: () => {
            // console.log('[CallStore] Mute with silent track requested');
            set({ micOn: false });
            try {
                if ('muteWithSilentTrack' in callService) {
                    (callService as any).muteWithSilentTrack();
                }
            } catch (e) {
                // console.warn('[CallStore] muteWithSilentTrack failed:', e);
            }
        },

        recreateAudioTrack: async () => {
            // console.log('[CallStore] Recreate audio track requested');
            try {
                if ('recreateAudioTrack' in callService) {
                    await (callService as any).recreateAudioTrack();
                    set({ micOn: true });
                }
            } catch (e) {
                // console.warn('[CallStore] recreateAudioTrack failed:', e);
            }
        },

        upgradeToVideo: async () => {
            try {
                await callService.upgradeToVideo();
            } catch (err) {
                // console.error("[CallStore] upgradeToVideo error:", err);
            }
        },
    }
})

export default useCallStore