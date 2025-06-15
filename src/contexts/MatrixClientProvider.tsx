"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { getLS } from "@/tools/localStorage.tool";

const HOMESERVER_URL = "https://matrix.org";

export const MatrixClientContext = createContext<sdk.MatrixClient | null>(null);

export const useMatrixClient = () => useContext(MatrixClientContext);

export function MatrixClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<sdk.MatrixClient | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const accessToken = getLS("matrix_access_token");
    const userId = getLS("matrix_user_id");
    if (!accessToken || !userId) return;

    // Tạo client mới nếu chưa có
    setClient((prev) => {
      if (!prev) {
        return sdk.createClient({
          baseUrl: HOMESERVER_URL,
          accessToken,
          userId,
        });
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (client && !startedRef.current && client.getSyncState?.() === null) {
      client.startClient();
      startedRef.current = true;
    }
    // Lắng nghe sự kiện sync
    if (client) {
      const onSync = (state: string) => {
        if (state === "PREPARED") 
          setIsSynced(true);
      };
      client.on("sync" as any, onSync);
      // Nếu đã sync trước đó (hot reload)
      if (client.getSyncState && client.getSyncState() === "PREPARED") {
        setIsSynced(true);
      }
      return () => {
        client.removeListener("sync" as any, onSync);
        if (startedRef.current) {
          client.stopClient();
          startedRef.current = false;
        }
      };
    }
  }, [client]);

  return (
    <MatrixClientContext.Provider value={isSynced ? client : null}>
      {children}
    </MatrixClientContext.Provider>
  );
}