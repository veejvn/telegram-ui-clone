/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
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
import clsx from "clsx";

const ChatPage = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [joining, setJoining] = useState(false);
  const [room, setRoom] = useState<sdk.Room | null>();
  const param = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useUserStore.getState().user;
  const client = useMatrixClient();
  const homeserver =
    user && user.homeserver
      ? user.homeserver.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : "";
  const roomId = user ? param.id?.slice(0, 19) + ":" + homeserver : "";
  const router = useRouter();

  // Block user
  const [isBlocked, setIsBlocked] = useState(false);
  const ignoredUsers = useIgnoreStore((state) => state.ignoredUsers);

  // Track keyboard state for layout adjustment
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Prevent scroll on iOS when keyboard is open
  useEffect(() => {
    // More accurate iOS Safari detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
      (/iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as any).MSStream);

    console.log("🔍 Browser detection:", {
      isIOS,
      isSafari,
      userAgent: navigator.userAgent,
    });

    if (!isIOS) return;

    let initialScrollY = 0;

    // Fix viewport height for iOS Safari
    const setViewportHeight = () => {
      // Use visualViewport API if available (iOS Safari 13+)
      if ((window as any).visualViewport) {
        const vh = (window as any).visualViewport.height * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);

        // More accurate keyboard detection for Safari iOS
        const visualHeight = (window as any).visualViewport.height;
        const windowHeight = window.innerHeight;
        const heightDiff = windowHeight - visualHeight;

        // Safari iOS specific threshold
        const threshold = isSafari ? 150 : 100;
        const keyboardOpen = heightDiff > threshold;

        console.log("🖥️ Viewport change detected:", {
          visualHeight,
          windowHeight,
          heightDiff,
          threshold,
          keyboardOpen,
          isSafari,
        });
        setIsKeyboardOpen(keyboardOpen);
      } else {
        // Fallback for older versions
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);

        // For older iOS versions, use window.innerHeight changes
        const heightDiff = window.screen.height - window.innerHeight;
        const keyboardOpen = heightDiff > 200;
        setIsKeyboardOpen(keyboardOpen);
      }

      // Auto scroll to bottom when layout changes (keyboard appears/disappears)
      setTimeout(() => {
        if (messagesEndRef.current && isKeyboardOpen) {
          console.log("🖥️ Layout changed, scrolling to bottom");
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 300);
    };

    // Set initial viewport and capture scroll position
    setViewportHeight();
    initialScrollY = window.scrollY;

    // Visual Viewport API listeners (iOS Safari 13+)
    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener(
        "resize",
        setViewportHeight
      );
    }

    // Fallback listeners
    window.addEventListener("resize", setViewportHeight);
    window.addEventListener("orientationchange", () => {
      // Delay to ensure orientation change is complete
      setTimeout(setViewportHeight, 100);
    });

    const preventScroll = (e: TouchEvent) => {
      const target = e.target as Element;

      // Allow scrolling inside ScrollArea components
      const scrollableArea =
        target.closest("[data-radix-scroll-area-content]") ||
        target.closest("[data-radix-scroll-area-viewport]") ||
        target.closest("[data-slot='scroll-area']") ||
        target.closest("[data-slot='scroll-area-viewport']");

      // Allow touch events on interactive elements
      const interactiveElement =
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.closest("[data-radix-dropdown-menu-trigger]") ||
        target.closest("[data-radix-popover-trigger]") ||
        target.closest(".cursor-pointer") ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.tagName === "A";

      console.log("🎯 Touch event:", {
        targetTag: target.tagName,
        hasScrollArea: !!scrollableArea,
        hasInteractive: !!interactiveElement,
        isSafari,
        isKeyboardOpen,
        willPrevent: !scrollableArea && !interactiveElement
      });

      // Only prevent scroll for non-interactive elements outside scroll areas
      if (!scrollableArea && !interactiveElement) {
        // For Safari iOS, be more careful about when to prevent
        if (isSafari && isKeyboardOpen) {
          e.preventDefault();
        } else if (!isSafari) {
          e.preventDefault();
        }
      }
    };

    // Store scroll position and lock it
    document.body.style.position = "fixed";
    document.body.style.top = `-${initialScrollY}px`;
    document.body.style.width = "100%";
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";

    // Lock document element
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.position = "relative";

    // Safari iOS specific body locking
    if (isSafari) {
      (document.body.style as any).webkitOverflowScrolling = "touch";
      document.body.style.touchAction = "none";
      document.documentElement.style.touchAction = "none";
    }

    // Add event listeners with more careful options for Safari
    document.addEventListener("touchmove", preventScroll, false);

    // Store references for cleanup
    let scrollHandler: ((e: Event) => void) | null = null;
    let windowScrollHandler: ((e: Event) => void) | null = null;

    // For Safari iOS, only prevent scroll events, not touch events for interactions
    if (isSafari) {
      scrollHandler = (e: Event) => {
        const target = e.target as Element;
        const interactiveElement =
          target.closest("button") ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest("select") ||
          target.closest("a") ||
          target.closest("[role='button']") ||
          target.closest("[data-radix-dropdown-menu-trigger]") ||
          target.closest("[data-radix-popover-trigger]") ||
          target.closest(".cursor-pointer");
        
        if (!interactiveElement) {
          e.preventDefault();
        }
      };
      
      windowScrollHandler = (e: Event) => {
        const target = e.target as Element;
        const interactiveElement =
          target?.closest("button") ||
          target?.closest("input") ||
          target?.closest("textarea") ||
          target?.closest("select") ||
          target?.closest("a") ||
          target?.closest("[role='button']") ||
          target?.closest("[data-radix-dropdown-menu-trigger]") ||
          target?.closest("[data-radix-popover-trigger]") ||
          target?.closest(".cursor-pointer");
        
        if (!interactiveElement) {
          e.preventDefault();
        }
      };
      
      document.addEventListener("scroll", scrollHandler, false);
      window.addEventListener("scroll", windowScrollHandler, false);
    }

    return () => {
      document.removeEventListener("touchmove", preventScroll, false);

      // Remove Safari iOS specific events
      if (isSafari && scrollHandler && windowScrollHandler) {
        document.removeEventListener("scroll", scrollHandler, false);
        window.removeEventListener("scroll", windowScrollHandler, false);
      }

      if ((window as any).visualViewport) {
        (window as any).visualViewport.removeEventListener(
          "resize",
          setViewportHeight
        );
      }
      window.removeEventListener("resize", setViewportHeight);
      window.removeEventListener("orientationchange", setViewportHeight);

      // Reset body styles
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.overflow = "";

      // Reset Safari iOS specific styles
      if (isSafari) {
        (document.body.style as any).webkitOverflowScrolling = "";
        document.body.style.touchAction = "";
        document.documentElement.style.touchAction = "";
      }

      // Reset document styles
      document.documentElement.style.overflow = "";
      document.documentElement.style.position = "";

      // Restore scroll position
      window.scrollTo(0, initialScrollY);
    };
  }, [messagesEndRef, isKeyboardOpen]);

  // Auto scroll when keyboard state changes
  useEffect(() => {
    if (isKeyboardOpen && messagesEndRef.current) {
      console.log("📱 Keyboard opened, auto scrolling to bottom");
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 400);
    }
  }, [isKeyboardOpen]);

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
    <div
      className={clsx("bg-chat", styles.chatContainer, {
        [styles.keyboardOpen]: isKeyboardOpen,
      })}
    >
      {/* Header */}
      <div className={clsx("shrink-0 z-10", styles.chatHeader)}>
        <ChatHeader room={room} />
      </div>

      {/* Chat content scrollable */}
      <div className={clsx("flex-1 min-h-0 relative", styles.chatContent)}>
        <div className={styles.chatMessages}>
          <ScrollArea className="h-full w-full">
            <ChatMessages roomId={roomId} messagesEndRef={messagesEndRef} />
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
      ) : (
        <div className={clsx("shrink-0 z-10", styles.chatFooter)}>
          <ChatComposer roomId={roomId} messagesEndRef={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
