import { create } from 'zustand'
import { CallType } from '@/services/callService'

export type CallStatus = 'accepted' | 'missed' | 'rejected'

export interface CallRecord {
    id: string
    calleeId: string
    type: CallType
    calleeName?: string;     // <-- Thêm dòng này!
    status: CallStatus
    duration: number    // giây
    timestamp: number   // ms từ 1970
}

interface CallHistoryStore {
    history: CallRecord[]
    addCall: (record: Omit<CallRecord, 'id' | 'timestamp'>) => void
    removeCall: (id: string) => void
    clearAll: () => void
}

function uuid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const useCallHistoryStore = create<CallHistoryStore>((set) => ({
    history: [],

    addCall: ({ calleeId, calleeName, type, status, duration }) =>
        set((s) => ({
            history: [
                {
                    id: uuid(),
                    calleeId,
                    type,
                    calleeName,     // <-- Thêm dòng này!
                    status,
                    duration,
                    timestamp: Date.now(),
                },
                ...s.history,
            ],
        })),

    removeCall: (id) =>
        set((s) => ({ history: s.history.filter((r) => r.id !== id) })),

    clearAll: () => set({ history: [] }),
}))

export default useCallHistoryStore
