import { create } from "zustand";

export interface ReplyMessage {
  eventId: string;
  text: string;
  sender: string;
  senderDisplayName: string;
  time: string;
  type?: string;
}

interface ReplyStore {
  replyMessage: ReplyMessage | null;
  setReplyMessage: (message: ReplyMessage | null) => void;
  clearReply: () => void;
}

export const useReplyStore = create<ReplyStore>((set) => ({
  replyMessage: null,
  setReplyMessage: (message) => set({ replyMessage: message }),
  clearReply: () => set({ replyMessage: null }),
}));
