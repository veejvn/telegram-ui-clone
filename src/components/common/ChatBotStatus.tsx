import { useChatBot } from "@/hooks/useChatBot";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export function ChatBotStatus() {
  const { isAddingBot, error } = useChatBot();

  if (isAddingBot) {
    console.log("Đang thêm chat bot...");
  }

  if (error) {
    console.error("Lỗi chat bot:", error);
  }

  return null;
}
