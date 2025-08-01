/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatLayout from "@/components/chat/ChatLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import styles from "./page.module.css";
import { sendReadReceipt } from "@/services/chatService";
import { useUserStore } from "@/stores/useUserStore";
import { useIgnoreStore } from "@/stores/useIgnoreStore";
import { useSelectionStore } from "@/stores/useSelectionStore";
import clsx from "clsx";
import { createPortal } from "react-dom";

const ChatPage = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [joining, setJoining] = useState(false);
  const [room, setRoom] = useState<sdk.Room | null>();
  const param = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useUserStore.getState().user;
  const client = useMatrixClient();
  const { isSelectionMode } = useSelectionStore();
  const homeserver =
    user && user.homeserver
      ? user.homeserver.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : "";
  const roomId = user ? param.id?.slice(0, 19) + ":" + homeserver : "";
  const router = useRouter();

  // Block user
  const [isBlocked, setIsBlocked] = useState(false);
  const ignoredUsers = useIgnoreStore((state) => state.ignoredUsers);

  // Prevent scroll on iOS when keyboard is open
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    const preventScroll = (e: TouchEvent) => {
      const target = e.target as Element;

      // Allow scrolling inside ScrollArea components
      const scrollableArea =
        target.closest("[data-radix-scroll-area-content]") ||
        target.closest("[data-radix-scroll-area-viewport]") ||
        target.closest("[data-slot='scroll-area']") ||
        target.closest("[data-slot='scroll-area-viewport']");

      if (!scrollableArea) {
        e.preventDefault();
      }
    };

    // Only prevent document-level scroll, not all scroll
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  // Handle visual viewport changes for Safari iOS keyboard
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (!isIOS) return;

    let initialHeight = window.innerHeight;

    // COMPREHENSIVE Safari Fix - address all potential layout issues
    if (isSafari) {
      // 1. Prevent body from having any scrollable content
      document.body.classList.add("chat-page-active");

      // 2. Hide main element completely to prevent layout conflicts
      const mainElement = document.querySelector("main");
      if (mainElement) {
        mainElement.style.display = "none";
      }

      // 3. Debug logging to see what's happening
      console.log("🐛 Initial setup:", {
        bodyHeight: document.body.scrollHeight,
        windowHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        bodyClassList: [...document.body.classList],
      });
    }

    const handleViewportChange = () => {
      if (isSafari) {
        // Safari specific handling
        const currentHeight = window.innerHeight;
        const heightDiff = initialHeight - currentHeight;
        const isKeyboardOpen = heightDiff > 100;

        console.log("🐛 Safari viewport change:", {
          initialHeight,
          currentHeight,
          heightDiff,
          isKeyboardOpen,
          bodyScrollHeight: document.body.scrollHeight,
          documentScrollHeight: document.documentElement.scrollHeight,
          canScroll: document.body.scrollHeight > window.innerHeight,
        });

        const chatContainer = document.querySelector(
          `.${styles.chatContainer}`
        ) as HTMLElement;

        if (chatContainer) {
          if (isKeyboardOpen) {
            // ✅ KEY FIX: Đồng bộ body height với container height
            document.body.style.height = `${currentHeight}px`;
            document.documentElement.style.height = `${currentHeight}px`;

            // Keyboard is open - use current window height
            chatContainer.style.height = `${currentHeight}px`;
            chatContainer.style.maxHeight = `${currentHeight}px`;
            // Force Safari to recalculate layout
            chatContainer.style.transform = "translateZ(0)";
            console.log(
              "🔧 Keyboard open, body & container height set to:",
              currentHeight
            );
          } else {
            // ✅ KEY FIX: Reset body height cùng với container
            document.body.style.height = `${initialHeight}px`;
            document.documentElement.style.height = `${initialHeight}px`;

            // Keyboard is closed - reset to full height
            chatContainer.style.height = `${initialHeight}px`;
            chatContainer.style.maxHeight = `${initialHeight}px`;
            chatContainer.style.transform = "none";
            console.log(
              "🔧 Keyboard closed, body & container height reset to:",
              initialHeight
            );
          }

          // Force immediate layout recalculation
          chatContainer.offsetHeight; // Trigger reflow
        }
      } else {
        // Other browsers - use visual viewport
        const viewport = window.visualViewport;
        if (viewport) {
          const chatContainer = document.querySelector(
            `.${styles.chatContainer}`
          ) as HTMLElement;
          if (chatContainer) {
            chatContainer.style.height = `${viewport.height}px`;
            chatContainer.style.maxHeight = `${viewport.height}px`;
          }
        }
      }

      // Scroll to bottom when keyboard appears/disappears
      if (messagesEndRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "auto",
            block: "end",
          });
        }, 100);
      }
    };

    // Different event listeners for Safari vs other browsers
    if (isSafari) {
      window.addEventListener("resize", handleViewportChange);
      window.addEventListener("orientationchange", handleViewportChange);

      // Additional debug events
      document.addEventListener("scroll", () => {
        console.log("🐛 Document scroll detected!");
      });
      document.body.addEventListener("scroll", () => {
        console.log("🐛 Body scroll detected!");
      });
    } else if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
    }

    // Initial adjustment
    handleViewportChange();

    return () => {
      if (isSafari) {
        window.removeEventListener("resize", handleViewportChange);
        window.removeEventListener("orientationchange", handleViewportChange);

        // Restore main element
        const mainElement = document.querySelector("main");
        if (mainElement) {
          mainElement.style.display = "";
        }

        // ✅ CLEANUP: Reset body và document height
        document.body.style.height = "";
        document.documentElement.style.height = "";

        // Remove class from body
        document.body.classList.remove("chat-page-active");

        console.log("🔄 Cleanup completed");
      } else if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportChange
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleViewportChange
        );
      }

      // Reset container styles when component unmounts
      const chatContainer = document.querySelector(
        `.${styles.chatContainer}`
      ) as HTMLElement;
      if (chatContainer) {
        chatContainer.style.height = "";
        chatContainer.style.maxHeight = "";
        chatContainer.style.transform = "";
      }
    };
  }, []);

  // Kiểm tra xem người dùng có bị chặn không
  useEffect(() => {
    if (!client || !room || !room.getJoinedMembers) return;
    const members = room.getJoinedMembers();
    const otherUser = members.find((m) => m.userId !== client.getUserId());

    if (otherUser) {
      setIsBlocked(ignoredUsers.includes(otherUser.userId));
    }
  }, [client, room, ignoredUsers]);

  const handleUnblockUser = async () => {
    if (!client || !room) return;

    const members = room.getJoinedMembers();
    const otherUser = members.find((m) => m.userId !== client.getUserId());

    const ignored = client.getIgnoredUsers?.() || [];
    if (otherUser && ignored.includes(otherUser.userId)) {
      const updated = ignored.filter((id) => id !== otherUser.userId);
      await client.setIgnoredUsers(updated);
      useIgnoreStore.getState().setIgnoredUsers(updated);
    }
  };

  useEffect(() => {
    if (!client) return;

    const foundRoom = client.getRoom(roomId);
    if (foundRoom) {
      setRoom(foundRoom);
    }
  }, [roomId, client]);

  useEffect(() => {
    if (!client || !room) return;
    const isInvite = room?.getMyMembership() === "invite";
    if (isInvite) {
      joinRoom();
    }
    // Lấy event cuối cùng trong room (nếu có)
    const events = room.getLiveTimeline().getEvents();
    const lastEvent = [...events]
      .reverse()
      .find((ev) => ev.getType() === "m.room.message" && ev.getId());
    if (lastEvent) {
      sendReadReceipt(client, lastEvent);
    }
  }, [room, client]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && mounted) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [room, mounted]);

  if (!mounted) return null;

  if (!room) return null;
  // Kiểm tra trạng thái invite

  const joinRoom = async () => {
    if (!client) return;
    try {
      await client.joinRoom(roomId);

      // Đợi đến khi client sync xong
      await new Promise<void>((resolve) => {
        const onSync = (state: string) => {
          if (state === "SYNCING" || state === "PREPARED") {
            resolve();
            client.removeListener("sync" as any, onSync);
          }
        };
        client.on("sync" as any, onSync);
      });

      // Lấy lại room sau khi sync
      const joinedRoom = client.getRoom(roomId);
      if (joinedRoom) {
        setRoom(joinedRoom);
      } else {
        toast.error("Không thể load dữ liệu phòng sau khi tham gia.");
      }
    } catch (e) {
      toast.error("Không thể tham gia phòng!", {
        action: {
          label: "OK",
          onClick: () => router.push("/chat"),
        },
        duration: 5000,
      });
    }
  };

  return (
    <>
      {/* For Safari iOS - render as portal outside main element */}
      {typeof window !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
        createPortal(
          <ChatLayout roomId={roomId}>
            <div
              className={clsx(
                "bg-gradient-to-b from-cyan-700/30 via-cyan-300/15 to-yellow-600/25",
                styles.chatContainer
              )}
            >
              {/* Header */}
              {!isSelectionMode ? (
                <div className={clsx("shrink-0 z-10", styles.chatHeader)}>
                  <ChatHeader room={room} />
                </div>
              ) : (
                <div className="shrink-0 h-12 bg-transparent"></div>
              )}

              {/* Chat content scrollable */}
              <div
                className={clsx("flex-1 min-h-0 relative", styles.chatContent)}
              >
                <div className={styles.chatMessages}>
                  <ScrollArea className="h-full w-full">
                    <ChatMessages
                      roomId={roomId}
                      messagesEndRef={messagesEndRef}
                    />
                  </ScrollArea>
                </div>
              </div>

              {/* Footer - Fixed at bottom */}
              {isBlocked ? (
                <div
                  className={clsx(
                    "shrink-0 z-10 flex flex-col items-center justify-center py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23232b]",
                    styles.chatFooter
                  )}
                >
                  <button
                    onClick={handleUnblockUser}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Unblock
                  </button>
                </div>
              ) : !isSelectionMode ? (
                <div className={clsx("shrink-0 z-10", styles.chatFooter)}>
                  <ChatComposer roomId={roomId} />
                </div>
              ) : (
                <div className="shrink-0 h-20 bg-transparent"></div>
              )}
            </div>
          </ChatLayout>,
          document.body
        )}

      {/* For other browsers - render normally */}
      {(typeof window === "undefined" ||
        !(
          /iPad|iPhone|iPod/.test(navigator.userAgent) &&
          /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
        )) && (
        <ChatLayout roomId={roomId}>
          <div
            className={clsx(
              "bg-gradient-to-b from-cyan-700/30 via-cyan-300/15 to-yellow-600/25",
              styles.chatContainer
            )}
          >
            {/* Header */}
            {!isSelectionMode ? (
              <div className={clsx("shrink-0 z-10", styles.chatHeader)}>
                <ChatHeader room={room} />
              </div>
            ) : (
              <div className="shrink-0 h-12 bg-transparent"></div>
            )}

            {/* Chat content scrollable */}
            <div
              className={clsx("flex-1 min-h-0 relative", styles.chatContent)}
            >
              <div className={styles.chatMessages}>
                <ScrollArea className="h-full w-full">
                  <ChatMessages
                    roomId={roomId}
                    messagesEndRef={messagesEndRef}
                  />
                </ScrollArea>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            {isBlocked ? (
              <div
                className={clsx(
                  "shrink-0 z-10 flex flex-col items-center justify-center py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23232b]",
                  styles.chatFooter
                )}
              >
                <button
                  onClick={handleUnblockUser}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Unblock
                </button>
              </div>
            ) : !isSelectionMode ? (
              <div className={clsx("shrink-0 z-10", styles.chatFooter)}>
                <ChatComposer roomId={roomId} />
              </div>
            ) : (
              <div className="shrink-0 h-20 bg-transparent"></div>
            )}
          </div>
        </ChatLayout>
      )}
    </>
  );
};

export default ChatPage;
