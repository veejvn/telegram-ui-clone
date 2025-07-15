import { create } from 'zustand'
import { callService, CallType, IncomingCall } from '@/services/callService'

type State =
    | 'idle'
    | 'ringing'
    | 'incoming'
    | 'connecting'
    | 'connected'
    | 'waiting-for-recipient' // 🆕
    | 'recalling'             // 🆕
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
    recallCountdown?: number // 🆕
    placeCall: (roomId: string, type: CallType) => void | Promise<void>
    answerCall: () => Promise<void>
    rejectCall: () => void
    hangup: () => void
    reset: () => void
    toggleCamera: (on: boolean) => void
    toggleMic: (on: boolean) => void
    hardMute: () => void
    muteWithSilentTrack: () => void
    recreateAudioTrack: () => Promise<void>
    upgradeToVideo: () => Promise<void>
    startRecallWatcher: (userId: string, roomId: string, type: CallType) => void // 🆕
    recallCall: (roomId: string, type: CallType) => Promise<void> // 🆕
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

// 🆕 Biến toàn cục để quản lý watcher/timer recall
let _recallInterval: ReturnType<typeof setInterval> | null = null;
let _recallListener: ((event: any) => void) | null = null;

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
        // 🆕 Thay thế placeCall để kiểm tra presence trước khi gọi
        placeCall: async (roomId, type) => {
            const { state } = get();
            // Không cho phép gọi mới khi đang waiting/recalling
            if ([
                'ringing',
                'connecting',
                'connected',
                'waiting-for-recipient',
                'recalling',
            ].includes(state)) {
                console.warn(`[CallStore] Already have active or pending call for this room (${roomId}), state=${state}`);
                return;
            }
            // Nếu muốn kiểm tra presence, lấy client từ callService
            try {
                const client = (callService as any).getClient?.();
                if (client) {
                    // Nếu muốn kiểm tra presence, có thể thêm đoạn này:
                    /*
                    const getRecipientIdFromRoom = (roomId: string): string => {
                        const myId = client.getUserId?.();
                        const room = client.getRoom?.(roomId);
                        if (!room) return '';
                        const members = room.getJoinedMembers?.();
                        if (!members) return '';
                        const other = members.find((m: any) => m.userId !== myId);
                        return other?.userId || '';
                    };
                    const userId = getRecipientIdFromRoom(roomId);
                    const user = client.getUser?.(userId);
                    if (user?.presence === 'offline') {
                        set({ state: 'waiting-for-recipient', recallCountdown: 30 });
                        get().startRecallWatcher(userId, roomId, type);
                        return;
                    }
                    */
                }
            } catch (e) {
                // Nếu không lấy được client, vẫn thử gọi callService.placeCall
            }
            await callService.placeCall(roomId, type);
            set({ state: 'ringing' });
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
            if (_recallInterval) {
                clearInterval(_recallInterval);
                _recallInterval = null;
            }
            if (_recallListener) {
                const client = (window as any).matrixClient;
                if (client) client.removeListener('event', _recallListener);
                _recallListener = null;
            }
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
            if (_recallInterval) {
                clearInterval(_recallInterval);
                _recallInterval = null;
            }
            if (_recallListener) {
                const client = (window as any).matrixClient;
                if (client) client.removeListener('event', _recallListener);
                _recallListener = null;
            }
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
        // 🆕 Theo dõi recipient online và countdown recall
        startRecallWatcher: (userId, roomId, type) => {
            // 🆕 Cleanup watcher/timer cũ nếu có
            if (_recallInterval) {
                clearInterval(_recallInterval);
                _recallInterval = null;
            }
            if (_recallListener) {
                const client = (window as any).matrixClient;
                if (client) client.removeListener('event', _recallListener);
                _recallListener = null;
            }
            let countdown = 60;
            set({ recallCountdown: countdown });
            _recallInterval = setInterval(() => {
                countdown -= 1;
                set({ recallCountdown: countdown });
                if (countdown <= 0) {
                    if (_recallInterval) {
                        clearInterval(_recallInterval);
                        _recallInterval = null;
                    }
                    set({
                        state: 'ended',
                        callEndedReason: 'recipient-offline-timeout',
                        recallCountdown: undefined,
                    });
                }
            }, 1000);
            const client = (window as any).matrixClient;
            if (!client) return;
            _recallListener = (event: any) => {
                if (event.getType?.() !== 'm.presence') return;
                if (event.getSender?.() !== userId) return;
                if (event.getContent?.().presence === 'online') {
                    if (_recallInterval) {
                        clearInterval(_recallInterval);
                        _recallInterval = null;
                    }
                    client.removeListener('event', _recallListener!);
                    _recallListener = null;
                    get().recallCall(roomId, type);
                }
            };
            client.on('event', _recallListener);
        },
        // 🆕 recallCall: chuyển sang recalling rồi gọi lại
        recallCall: async (roomId, type) => {
            set({ state: 'recalling', recallCountdown: undefined });
            await callService.placeCall(roomId, type);
            set({ state: 'ringing' });
        },
    }
})

export default useCallStore