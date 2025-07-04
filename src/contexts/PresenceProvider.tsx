// PresenceContext.tsx
import React, { createContext, useContext } from "react";
import { UseMatrixPresenceReturn, usePresence } from "@/hooks/usePresence";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

const PresenceContext = createContext<UseMatrixPresenceReturn | null>(null);

export const PresenceProvider = ({ children } : { children : React.ReactNode}  ) => {
  const client = useMatrixClient();
  const presence = usePresence(client);
  presence.setPresence("online");
  return (
    <PresenceContext.Provider value={presence}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresenceContext = () => useContext(PresenceContext);