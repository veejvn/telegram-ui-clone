// src/stores/useCallHistoryStore.ts
import { create } from "zustand";

interface CallEntry {
    name: string;
    status: string;
    missed: boolean;
    date: string;
}

interface CallHistoryState {
    calls: CallEntry[];
    addCall: (entry: CallEntry) => void;
    deleteCall: (index: number) => void;
    clearCalls: () => void;
}

export const useCallHistoryStore = create<CallHistoryState>((set) => ({
    calls: [],
    addCall: (entry) =>
        set((state) => ({ calls: [entry, ...state.calls] })),
    deleteCall: (index) =>
        set((state) => {
            const updated = [...state.calls];
            updated.splice(index, 1);
            return { calls: updated };
        }),
    clearCalls: () => set({ calls: [] }),
}));
