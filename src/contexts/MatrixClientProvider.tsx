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

      try {
        await client.setPresence({ presence: "online" });
      } catch (e) {
        console.warn("Set presence error:", e);
      }
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

  // useEffect(() => {
  //   if (!client) return;

  //   const onPresence = (event: any, member: any) => {
  //     // Khi có sự kiện presence mới, bạn có thể trigger cập nhật UI hoặc log
  //     // Ví dụ: console.log trạng thái mới
  //     console.log(
  //       `Presence update: ${member.userId} - ${(member as any).presence}, lastActiveAgo: ${(member as any).lastActiveAgo}`
  //     );
  //   };

  //   client.on("RoomMember.presence" as any, onPresence);

  //   return () => {
  //     client.removeListener("RoomMember.presence" as any, onPresence);
  //   };
  // }, [client]);

  return (
    <MatrixClientContext.Provider value={client}>
      {children}
    </MatrixClientContext.Provider>
  );
}
