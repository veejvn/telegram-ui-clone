"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as sdk from "@/lib/matrix-sdk";
import { getCookie, deleteCookie, setCookie } from "@/utils/cookie";
import { waitForClientReady } from "@/lib/matrix";
import { createUserInfo } from "@/utils/createUserInfo";
import { PresenceProvider } from "@/contexts/PresenceProvider";
import { normalizeMatrixUserId, isValidMatrixUserId } from "@/utils/matrixHelpers";
import { clearMatrixAuthCookies } from "@/utils/clearAuthCookies";

const HOMESERVER_URL =
  process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";

export const MatrixClientContext = createContext<sdk.MatrixClient | null>(null);

export const useMatrixClient = () => useContext(MatrixClientContext);

// Error Display Component
function ErrorDisplay({ error, onRetry, onLogout }: { 
  error: string; 
  onRetry: () => void; 
  onLogout: () => void; 
}) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLogout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Lỗi Kết Nối Matrix
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
              <strong>Chi tiết lỗi:</strong>
              <div className="mt-1 font-mono text-xs">{error}</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Thử Lại
            </button>
            <button
              onClick={onLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Đăng Xuất ({countdown}s)
            </button>
          </div>

          <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            Tự động đăng xuất sau {countdown} giây
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatrixClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<sdk.MatrixClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<sdk.MatrixClient | null>(null);

  const handleRetry = () => {
    setError(null);
    setClient(null);
    clientRef.current = null;
    // Trigger re-initialization
    window.location.reload();
  };

  const handleLogout = () => {
    clearMatrixAuthCookies();
    window.location.href = '/login';
  };

  useEffect(() => {
    if (error) return; // Don't re-initialize if there's an error
    
    let isMounted = true;
    let currentClient: sdk.MatrixClient | null = null;

    if (clientRef.current) {
      // Đã khởi tạo trước đó ➜ reuse
      setClient(clientRef.current);
      return;
    }

    const setupClient = async () => {
      try {
        const accessToken = getCookie("matrix_token");
        const rawUserId = getCookie("matrix_user_id");
        const deviceId = getCookie("matrix_device_id");
        
        if (!accessToken || !rawUserId || !deviceId) {
          console.log("[MatrixClientProvider] Missing auth credentials");
          setError("Thiếu thông tin xác thực. Vui lòng đăng nhập lại.");
          return;
        }

        // Normalize user ID to ensure correct format
        const userId = normalizeMatrixUserId(rawUserId, HOMESERVER_URL);
        
        // Validate normalized user ID
        if (!isValidMatrixUserId(userId)) {
          console.error("[MatrixClientProvider] Invalid Matrix User ID format:", userId);
          setError(`User ID không hợp lệ: ${userId}. Format cần: @username:domain`);
          return;
        }



        // ✅ Khai báo actualUserId ở đây để sử dụng sau
        let actualUserId = userId;

        // ✅ KIỂM TRA WHOAMI TRƯỚC KHI KHỞI TẠO CLIENT
        try {
          const whoAmIResponse = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/account/whoami`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (!whoAmIResponse.ok) {
            const errorData = await whoAmIResponse.json();
            throw new Error(`WhoAmI failed (${whoAmIResponse.status}): ${errorData.error || 'Unknown error'}`);
          }

          const whoAmIData = await whoAmIResponse.json();
          const tokenUserId = whoAmIData.user_id;
          


          // ✅ SỬ DỤNG USER ID CHÍNH XÁC TỪ TOKEN
          if (tokenUserId !== userId && tokenUserId !== rawUserId) {
            // Update cookie với user ID chính xác
            setCookie("matrix_user_id", tokenUserId, 30);
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
          console.error("[MatrixClientProvider] Token verification failed:", tokenError);
          setError(`Lỗi xác thực token: ${tokenError.message}

Chi tiết:
- Stored User ID: ${userId}
- Token: ${accessToken ? '***EXISTS***' : 'MISSING'}
- Error: ${tokenError.message}

Vui lòng đăng nhập lại.`);
          return;
        }



        currentClient = sdk.createClient({
          baseUrl: HOMESERVER_URL,
          accessToken,
          userId: actualUserId,
          deviceId,
        });

        // Lắng nghe lỗi xác thực khi sync
        currentClient.on("sync" as any, (state: any, prevState: any, data: any) => {
          if (state === "ERROR") {
            console.error("[MatrixClientProvider] Sync error:", data?.error);
            
            if (data?.error?.httpStatus && [401, 403].includes(data?.error?.httpStatus)) {
              const errorMsg = `Lỗi xác thực (${data.error.httpStatus}): ${data.error.message || 'Không có quyền truy cập'}. 
              
Chi tiết: ${JSON.stringify(data.error, null, 2)}`;
              
              console.error("[MatrixClientProvider] Authentication error details:", data.error);
              setError(errorMsg);
              
              // Stop client
              if (currentClient) {
                currentClient.stopClient();
                currentClient = null;
                clientRef.current = null;
                if (isMounted) setClient(null);
              }
            } else {
              // Other sync errors
              const errorMsg = `Lỗi đồng bộ: ${data?.error?.message || 'Không xác định'}
              
Chi tiết: ${JSON.stringify(data?.error, null, 2)}`;
              console.error("[MatrixClientProvider] Sync error:", errorMsg);
              setError(errorMsg);
            }
          } else if (state === "PREPARED") {
    
          } else if (state === "SYNCING") {
    
          }
        });

        // Handle client errors
        currentClient.on("clientWellKnown" as any, (wellKnown: any) => {
  
        });

        currentClient.on("event" as any, (event: any) => {
          // Handle important events if needed
          if (event.getType() === "m.room.message") {
            // Message event
          }
        });


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
        
        const errorMsg = `Lỗi khởi tạo Matrix client: ${error?.message || 'Không xác định'}

Chi tiết:
- HTTP Status: ${error?.httpStatus || 'N/A'}
- Error Code: ${error?.errcode || 'N/A'}
- URL: ${HOMESERVER_URL}

Stack trace: ${error?.stack || 'N/A'}`;

        setError(errorMsg);
        
        if (currentClient) {
          try {
            currentClient.stopClient();
          } catch (stopError) {
            console.warn("[MatrixClientProvider] Error stopping client:", stopError);
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
          console.warn("[MatrixClientProvider] Error during cleanup:", error);
        }
      }
    };
  }, [error]);

  // Show error screen if there's an error
  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} onLogout={handleLogout} />;
  }

  return (
    <MatrixClientContext.Provider value={client}>
      <PresenceProvider>{children}</PresenceProvider>
    </MatrixClientContext.Provider>
  );
}