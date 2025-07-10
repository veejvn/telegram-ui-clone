"use client";
import ForwardHeader from "@/components/chat/ForwardHeader";
import { useForwardStore } from "@/stores/useForwardStore";
import React from "react";

export default function Page() {
  const messages = useForwardStore((state) => state.messages); // ✅ Reactive state

  return (
    <div className="flex flex-col h-screen">
      <ForwardHeader />
    </div>
  );
}
