import { useChatBot } from "@/hooks/useChatBot";

export function InviteChatBot() {
  const { isAddingBot, error } = useChatBot();

  // Log để debug
  if (error) {
    //console.error("Lỗi chat bot:", error);
  }

  if (isAddingBot) {
    //console.log("Đang thêm chat bot...");
  }

  return null;
}
