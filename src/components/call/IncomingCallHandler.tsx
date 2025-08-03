"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useCallStore from "@/stores/useCallStore";
import IncomingCall from "./IncomingCall";
import { incomingCallStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";  // ← import useMatrixClient

export default function IncomingCallHandler() {
  const router = useRouter();
  const { state, incoming, answerCall, rejectCall } = useCallStore(); // ✅ Sử dụng rejectCall thay vì hangup
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const client = useMatrixClient();
  const [avatarUrl, setAvatarUrl] = useState<string>();

  useEffect(() => {
    if (!client || !incoming) return;
    const room = client.getRoom(incoming.roomId);
    const other = room
      ?.getMembers()
      .find((m: any) => m.userId !== client.getUserId());
    if (!other) return;
    const mxc = other.getAvatarUrl(
      process.env.NEXT_PUBLIC_MATRIX_BASE_URL!,
      96, 96,
      'crop',
      true,
      true
    );
    setAvatarUrl(mxc ?? '');
  }, [client, incoming]);
  // Phát âm thanh khi có cuộc gọi đến
  useEffect(() => {
    if (state === "incoming") {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/ringtone.mp3");
        audioRef.current.loop = true;
        audioRef.current.play().catch((err) => {
          console.warn("[IncomingCallHandler] Failed to play ringtone:", err);
        });
      } else {
        audioRef.current.play().catch((err) => {
          console.warn("[IncomingCallHandler] Failed to resume ringtone:", err);
        });
      }
    }

    // Khi kết thúc hoặc từ chối cuộc gọi, dừng nhạc
    if (
      state === "connected" ||
      state === "ended" ||
      state === "idle" ||
      state === "error"
    ) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    }

    // cleanup nếu component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [state]);

  // Khi kết nối thành công, điều hướng sang giao diện gọi
  useEffect(() => {
    if (state === "connected" && incoming) {
      router.push(
        `/call/${incoming.callType}?calleeId=${incoming.roomId
        }&contact=${encodeURIComponent(incoming.callerId)}`
      );
    }
  }, [state, incoming, router]);

  // ✅ Xử lý khi cuộc gọi kết thúc (bị từ chối hoặc lỗi)
  useEffect(() => {
    if (state === "ended" || state === "error") {
      // Delay một chút để user thấy trạng thái, sau đó reset
      const timer = setTimeout(() => {
        // Reset state về idle sau khi xử lý xong
        useCallStore.getState().reset();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state]);

  // ✅ Chỉ hiển thị khi thực sự có cuộc gọi đến
  if (state !== "incoming" || !incoming) return null;

  // if (state === "incoming") {
  //   // Nếu đang ở trạng thái incoming, không cần hiển thị lại popup
  //   return null;
  // }

  const incomingCallStyle = incomingCallStyleWithStatusBar();

  return (
    <div
      style={incomingCallStyle}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-md rounded-2xl bg-black/80 text-white shadow-xl p-0"
    >
      <IncomingCall
        callerName={incoming.callerId}
        callerAvatarUrl={avatarUrl}
        onAccept={answerCall}
        onReject={rejectCall} // ✅ Sử dụng rejectCall thay vì hangup
        callType={incoming.callType}
      />
    </div>
  );
}
