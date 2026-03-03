"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as sdk from "@/lib/matrix-sdk";
import { waitForClientReady } from "@/lib/matrix";
import { createUserInfo } from "@/utils/createUserInfo";
import { PresenceProvider } from "@/contexts/PresenceProvider";
import {
  normalizeMatrixUserId,
  isValidMatrixUserId,
} from "@/utils/matrixHelpers";
import { clearMatrixAuthCookies } from "@/utils/clearAuthCookies";
import { ErrorDisplay } from "@/components/common/ErrorDisplay";
import { useAuthStore } from "@/stores/useAuthStore";
import useRegisterPushKey from "@/hooks/useRegisterPushKey";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useUserStore } from "@/stores/useUserStore";

const HOMESERVER_URL =
  process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";

export const MatrixClientContext = createContext<sdk.MatrixClient | null>(null);

export const useMatrixClient = () => useContext(MatrixClientContext);

export function MatrixClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<sdk.MatrixClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<sdk.MatrixClient | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const rawUserId = useAuthStore((state) => state.userId);
  const deviceId = useAuthStore((state) => state.deviceId);
  const logout = useAuthStore((state) => state.logout);
  const clearUser = useUserStore.getState().clearUser;
  const prevSyncState = useRef<string | null>(null);

  const handleRetry = () => {
    setError(null);
    setClient(null);
    clientRef.current = null;
    // Trigger re-initialization
    window.location.reload();
  };

  const handleLogout = () => {
    clearMatrixAuthCookies();
    window.location.href = "/chat/login";
  };

  useRegisterPushKey(accessToken);

  useEffect(() => {
    if (error) return; // Don't re-initialize if there's an error

    let isMounted = true;
    let currentClient: sdk.MatrixClient | null = null;
    if (!accessToken || !rawUserId || !deviceId) return;
    if (clientRef.current) {
      // Đã khởi tạo trước đó ➜ reuse
      setClient(clientRef.current);
      return;
    }

    const setupClient = async () => {
      try {
        //console.log(accessToken, rawUserId, deviceId);

        if (!accessToken || !rawUserId || !deviceId) {
          console.log("[MatrixClientProvider] Missing auth credentials");
          setError("Thiếu thông tin xác thực. Vui lòng đăng nhập lại.");
          return;
        }

        // Normalize user ID to ensure correct format
        const userId = normalizeMatrixUserId(rawUserId, HOMESERVER_URL);

        // Validate normalized user ID
        if (!isValidMatrixUserId(userId)) {
          console.error(
            "[MatrixClientProvider] Invalid Matrix User ID format:",
            userId
          );
          setError(
            `User ID không hợp lệ: ${userId}. Format cần: @username:domain`
          );
          return;
        }

        // ✅ Khai báo actualUserId ở đây để sử dụng sau
        let actualUserId = userId;

        // ✅ KIỂM TRA WHOAMI TRƯỚC KHI KHỞI TẠO CLIENT
        try {
          const whoAmIResponse = await fetch(
            `${HOMESERVER_URL}/_matrix/client/v3/account/whoami`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!whoAmIResponse.ok) {
            const errorData = await whoAmIResponse.json();
            throw new Error(
              `WhoAmI failed (${whoAmIResponse.status}): ${errorData.error || "Unknown error"
              }`
            );
          }

          const whoAmIData = await whoAmIResponse.json();
          const tokenUserId = whoAmIData.user_id;

          // ✅ SỬ DỤNG USER ID CHÍNH XÁC TỪ TOKEN
          if (tokenUserId !== userId && tokenUserId !== rawUserId) {
            // Update cookie với user ID chính xác
            const res = await fetch("/chat/api/set-cookie", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: tokenUserId,
              }),
              credentials: "include", // 👈 đảm bảo cookie được gửi kèm trong các request sau
            });
            actualUserId = tokenUserId;

            // Force reload để tránh filter conflicts
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            return;
          } else if (tokenUserId === rawUserId) {
            // Token khớp với raw user ID, sử dụng raw user ID
            actualUserId = rawUserId;
          } else {
            // Token khớp với normalized user ID
            actualUserId = userId;
          }
        } catch (tokenError: any) {
          console.error(
            "[MatrixClientProvider] Token verification failed:",
            tokenError
          );
          setError(`Lỗi xác thực token: ${tokenError.message}
            Chi tiết: - Error: ${tokenError.message}
            Vui lòng đăng nhập lại.`);
          logout();
          clearUser();
          window.location.href = "/chat/login";
          return;
        }

        currentClient = sdk.createClient({
          baseUrl: HOMESERVER_URL,
          accessToken,
          userId: actualUserId,
          deviceId,
        });

        // Lắng nghe lỗi xác thực khi sync
        currentClient.on(
          "sync" as any,
          (state: any, prevState: any, data: any) => {
            if (
              prevSyncState.current === "ERROR" &&
              (state === "PREPARED" || state === "SYNCING")
            ) {
              window.location.reload();
            }
            prevSyncState.current = state;
            if (state === "ERROR") {
              console.error("[MatrixClientProvider] Sync error:", data?.error);

              if (
                data?.error?.httpStatus &&
                [401, 403].includes(data?.error?.httpStatus)
              ) {
                setError("Lỗi xác thực, vui lòng đăng nhập lại.");
                // Stop client
                if (currentClient) {
                  currentClient.stopClient();
                  currentClient = null;
                  clientRef.current = null;
                  if (isMounted) setClient(null);
                }
              } else {
                // Other sync errors
                setError("Mất kết nối đồng bộ, đang thử lại...");
              }
            } else if (state === "PREPARED" || state === "SYNCING") {
              setError(null);
            }
          }
        );

        // // Handle client errors
        // currentClient.on("clientWellKnown" as any, (wellKnown: any) => {});

        // currentClient.on("event" as any, (event: any) => {
        //   // Handle important events if needed
        //   if (event.getType() === "m.room.message") {
        //     // Message event
        //   }
        // });

        currentClient.startClient();

        await waitForClientReady(currentClient);

        if (isMounted && currentClient) {
          clientRef.current = currentClient;
          setClient(currentClient);

          // Create user info after client is ready
          createUserInfo(currentClient);
        }
      } catch (error: any) {
        console.error("[MatrixClientProvider] Failed to setup client:", error);

        const errorMsg = `Lỗi khởi tạo Matrix client: ${error?.message || "Không xác định"
          }

Chi tiết:
- HTTP Status: ${error?.httpStatus || "N/A"}
- Error Code: ${error?.errcode || "N/A"}
- URL: ${HOMESERVER_URL}

Stack trace: ${error?.stack || "N/A"}`;

        setError(errorMsg);

        if (currentClient) {
          try {
            currentClient.stopClient();
          } catch (stopError) {
            console.warn(
              "[MatrixClientProvider] Error stopping client:",
              stopError
            );
          }
          currentClient = null;
        }

        if (isMounted) {
          setClient(null);
        }
      }
    };

    setupClient();

    return () => {
      isMounted = false;
      if (currentClient) {
        try {
          currentClient.stopClient();
          (currentClient as any).removeAllListeners();
        } catch (error) {
          //console.warn("[MatrixClientProvider] Error during cleanup:", error);
        }
      }
    };
  }, []);

  // Show error screen if there's an error
  if (error) {
    console.log(error);
    return (
      // <ErrorDisplay
      //   error={error}
      //   onRetry={handleRetry}
      //   onLogout={handleLogout}
      // />
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <MatrixClientContext.Provider value={client}>
      <PresenceProvider>{children}</PresenceProvider>
    </MatrixClientContext.Provider>
  );
}
