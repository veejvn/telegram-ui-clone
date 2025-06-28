"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as sdk from "matrix-js-sdk";
import { getLS, removeLS } from "@/tools/localStorage.tool";
import { waitForClientReady } from "@/lib/matrix";
import { createUserInfo } from "@/utils/createUserInfo";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";

const HOMESERVER_URL = process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";

export const MatrixClientContext = createContext<sdk.MatrixClient | null>(null);

export const useMatrixClient = () => useContext(MatrixClientContext);

export function MatrixClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [client, setClient] = useState<sdk.MatrixClient | null>(null);
  const logout = useAuthStore((state) => state.logout);
  const clearUser = useUserStore.getState().clearUser;

  useEffect(() => {
    let isMounted = true;
    const setupClient = async () => {
      const accessToken = getLS("matrix_access_token");
      const userId = getLS("matrix_user_id");
      if (!accessToken || !userId) return;

      try{
        const client = sdk.createClient({
          baseUrl: HOMESERVER_URL,
          accessToken,
          userId,
        });

        // Lắng nghe lỗi xác thực khi sync
        client.on("sync" as any, (state : any, prevState: any, data: any) => {
          if (
            state === "ERROR" &&
            data?.error?.httpStatus &&
            [401, 403].includes(data.error.httpStatus)
          ) {
            removeLS("matrix_access_token");
            removeLS("matrix_user_id");
            removeLS("matrix_device_id");
            setClient(null);
            clearUser();
            logout()
            router.replace("/login");
          }
        });
  
        client.startClient();
  
        await waitForClientReady(client);
  
        createUserInfo(client);
  
        if (isMounted) setClient(client);
      }catch(error: any){
        if (client) {
          client.stopClient();
        }
        removeLS("matrix_access_token");
        removeLS("matrix_user_id");
        removeLS("matrix_device_id");
        setClient(null);
        clearUser();
        logout();
        router.replace("/login");
      }
    };

    setupClient();

    return () => {
      isMounted = false;
      if (client) {
        client.stopClient();
      }
    };
  }, [HOMESERVER_URL, router]);

  return (
    <MatrixClientContext.Provider value={client}>
      {children}
    </MatrixClientContext.Provider>
  );
}
