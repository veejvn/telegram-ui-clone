import { Message } from "@/stores/useChatStore";

export interface MessagePros { msg: Message, isSender: boolean, animate?: boolean }

export interface ChatEditButtonPros{ 
    isEditMode: boolean, 
    onEdit: () => void, 
    onDone: () => void
}