"use client";

import { X } from "lucide-react";
import { useReplyStore } from "@/stores/useReplyStore";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";

const ReplyPreview = () => {
  const { replyMessage, clearReply } = useReplyStore();

  if (!replyMessage) return null;

  return (
    <div className="mx-3 mb-2 bg-white/80 border border-gray-200 rounded-xl p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-10 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-xs text-blue-500 font-medium">
                Reply to {replyMessage.senderDisplayName}
              </div>
              <div className="text-xs text-gray-500">
                {formatMsgTime(replyMessage.time)}
              </div>
            </div>
          </div>
          <div className="ml-3 text-sm text-gray-700 truncate">
            {replyMessage.text}
          </div>
        </div>
        <button
          onClick={clearReply}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Cancel reply"
          aria-label="Cancel reply"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default ReplyPreview;
