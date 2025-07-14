"use client";

import { useIncomingCall } from "@/stores/useIncomingCall";
import IncomingCall from "@/components/call/IncomingCall";

export default function CallOverlay() {
  const { visible, callerId, acceptCall, rejectCall } = useIncomingCall();

  if (!visible) return null;

  return (
    <IncomingCall
      callerName={callerId || "Unknown"}
      onAccept={acceptCall}
      onReject={rejectCall}
    />
  );
}
