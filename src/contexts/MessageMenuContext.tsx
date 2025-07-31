"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface MessageMenuContextType {
  activeMenuMessageId: string | null;
  setActiveMenuMessageId: (messageId: string | null) => void;
}

const MessageMenuContext = createContext<MessageMenuContextType | undefined>(
  undefined
);

export const MessageMenuProvider = ({ children }: { children: ReactNode }) => {
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(
    null
  );

  return (
    <MessageMenuContext.Provider
      value={{ activeMenuMessageId, setActiveMenuMessageId }}
    >
      {children}
    </MessageMenuContext.Provider>
  );
};

export const useMessageMenu = () => {
  const context = useContext(MessageMenuContext);
  if (context === undefined) {
    throw new Error("useMessageMenu must be used within a MessageMenuProvider");
  }
  return context;
};
