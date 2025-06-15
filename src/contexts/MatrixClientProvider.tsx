"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as sdk from "matrix-js-sdk";
import { getLS } from "@/tools/localStorage.tool";
import { waitForClientReady } from "@/lib/matrix";

const HOMESERVER_URL = "https://matrix.org";

export const MatrixClientContext = createContext<sdk.MatrixClient | null>(null);

export const useMatrixClient = () => useContext(MatrixClientContext);

export function MatrixClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<sdk.MatrixClient | null>(null);

  useEffect(() => {
    let isMounted = true;
    const setupClient = async () => {
      const accessToken = getLS("matrix_access_token");
      const userId = getLS("matrix_user_id");
      if (!accessToken || !userId) return;

      const client = sdk.createClient({
        baseUrl: HOMESERVER_URL,
        accessToken,
        userId,
      });

      client.startClient();

      await waitForClientReady(client);
      
      if (isMounted) setClient(client);
    };

    setupClient();

    return () => {
      isMounted = false;
      if (client) {
        client.stopClient();
      }
    };
  }, []);

  return (
    <MatrixClientContext.Provider value={client}>
      {children}
    </MatrixClientContext.Provider>
  );
}
