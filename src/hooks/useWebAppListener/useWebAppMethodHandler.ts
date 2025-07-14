/* eslint-disable @typescript-eslint/no-explicit-any */

import { IEventPayload } from "./types/event.name";
import useCallStore from "@/stores/useCallStore";

export const useWebAppMethodHandler = () => {
  const answerCall = useCallStore((s) => s.answerCall);
  const rejectCall = useCallStore((s) => s.rejectCall);

  const acceptCall = async ({ payload }: { payload: IEventPayload }) => {
    console.log(
      "🚀 ~ accept call web action",
      JSON.stringify(payload, null, 2)
    );
    // Tự động accept cuộc gọi khi nhận sự kiện từ mobile
    answerCall();
  };

  const rejectCallAction = async ({ payload }: { payload: IEventPayload }) => {
    console.log(
      "🚀 ~ reject call web action",
      JSON.stringify(payload, null, 2)
    );
    // Tự động reject cuộc gọi khi nhận sự kiện từ mobile
    rejectCall();
  };

  return {
    acceptCall,
    rejectCall: rejectCallAction,
  };
};
