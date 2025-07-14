/* eslint-disable @typescript-eslint/no-explicit-any */

import { IEventPayload } from "./types/event.name";

export const useWebAppMethodHandler = () => {
  const acceptCall = async ({ payload }: { payload: IEventPayload }) => {
    console.log(
      "🚀 ~ accept call web action",
      JSON.stringify(payload, null, 2)
    );
  };

  const rejectCall = async ({ payload }: { payload: IEventPayload }) => {
    console.log(
      "🚀 ~ reject call web action",
      JSON.stringify(payload, null, 2)
    );
  };

  return {
    acceptCall,
    rejectCall,
  };
};
