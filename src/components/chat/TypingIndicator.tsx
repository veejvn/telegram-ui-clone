"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTypingStore } from "@/stores/useTypingStore";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

const TypingIndicator = ({ roomId }: { roomId: string }) => {
  const typingUsers = useTypingStore((state) => state.typingUsers);
  const client = useMatrixClient(); // ✅ dùng selector cho reactive
  const themeProps = useTheme();

  const myId = client?.getUserId();
  const [othersTyping, setOthersTyping] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);

  // Lọc những user đang typing (trừ chính mình)
  useEffect(() => {
    if (!typingUsers || !client) return;

    const others = Object.entries(typingUsers)
      .filter(([id, isTyping]) => id !== myId && isTyping)
      .map(([id]) => id);

    setOthersTyping(others);
  }, [typingUsers, client, myId]);

  //  Lấy tên từ room members
  useEffect(() => {
    if (!client || !roomId || othersTyping.length === 0) return;

    const room = client.getRoom(roomId);
    if (!room) {
      console.warn("🚫 Không tìm thấy room:", roomId);
      return;
    }

    const displayNames = othersTyping.map((userId) => {
      const member = room.getMember(userId);
      console.log("📌 user:", userId, "| member:", member);
      return member?.rawDisplayName || userId;
    });

    setNames(displayNames);
  }, [othersTyping, client, roomId]);

  //  Nếu không ai typing thì ẩn
  if (othersTyping.length === 0) return null;

  const textColor =
    themeProps.theme !== "dark"
      ? "bg-white text-gray-500"
      : "bg-[#2b2b2d] text-gray-400";

  return (
    <p
      className={`text-start text-sm italic px-3 py-1 rounded-tr-full ${textColor}`}
    >
      <span className="pe-1">
        {names.join(", ")} {names.length > 1 ? "are" : "is"} typing
      </span>
      <span className="inline-block animate-bounce [animation-delay:-0.32s]">
        .
      </span>
      <span className="inline-block animate-bounce [animation-delay:-0.16s]">
        .
      </span>
      <span className="inline-block animate-bounce">.</span>
    </p>
  );
};

export default TypingIndicator;
