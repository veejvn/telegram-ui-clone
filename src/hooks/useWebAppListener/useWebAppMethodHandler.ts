/* eslint-disable @typescript-eslint/no-explicit-any */

import { IEventPayload } from "./types/event.name";
import useCallStore from "@/stores/useCallStore";
import { useRouter } from "next/navigation";

export const useWebAppMethodHandler = () => {
  const answerCall = useCallStore((s) => s.answerCall);
  const rejectCall = useCallStore((s) => s.rejectCall);
  const reset = useCallStore((s) => s.reset);
  const router = useRouter();

  const acceptCall = async ({ payload }: { payload: IEventPayload }) => {
    console.log(
      "🚀 ~ accept call web action",
      JSON.stringify(payload, null, 2)
    );
    // Tự động accept cuộc gọi khi nhận sự kiện từ mobile
    await answerCall();
    reset(); // Ẩn popup
    // Điều hướng sang UI call tương ứng
    if (payload.type === 1) {
      router.replace(`/call/video?calleeId=${payload.extra.roomId}&contact=${encodeURIComponent(payload.nameCaller)}`);
    } else {
      router.replace(`/call/voice?calleeId=${payload.extra.roomId}&contact=${encodeURIComponent(payload.nameCaller)}`);
    }
  };

  const rejectCallAction = async ({ payload }: { payload: IEventPayload }) => {
    console.log(
      "🚀 ~ reject call web action",
      JSON.stringify(payload, null, 2)
    );
    // Tự động reject cuộc gọi khi nhận sự kiện từ mobile
    rejectCall();
    reset(); // Ẩn popup nếu có
  };

  return {
    acceptCall,
    rejectCall: rejectCallAction,
  };
};
