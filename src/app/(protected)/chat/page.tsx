/* eslint-disable @next/next/no-img-element */
"use client";

import SearchBar from "@/components/layouts/SearchBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ChatList } from "@/components/chat/ChatList";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import * as sdk from "@/lib/matrix-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import ChatEditButton from "@/components/chat/ChatEditButton";
import ChatActionBar from "@/components/chat/ChatActionBar";
import DeleteChatModal from "@/components/chat/DeleteChatModal";
import { getUserRooms } from "@/services/chatService";
import {
  Bell,
  ChevronLeft,
  CircleFadingPlus,
  Ellipsis,
  Loader2,
  Search,
  ShoppingCart,
  SquarePen,
} from "lucide-react";
import useSortedRooms from "@/hooks/useSortedRooms";
import useListenRoomInvites from "@/hooks/useListenRoomInvites";
import { getLS, removeLS } from "@/tools/localStorage.tool";
import { useSearchParams } from "next/navigation";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import { useRoomStore } from "@/stores/useRoomStore";

export default function ChatsPage() {
  // const [rooms, setRooms] = useState<sdk.Room[]>([]);
  const { refreshRooms, loading } = useSortedRooms();
  const rooms = useRoomStore((state) => state.rooms);
  const client = useMatrixClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  useListenRoomInvites();
  // useEffect(() => {
  //   if (!client) return;
  //   getUserRooms(client)
  //     .then((res) => {
  //       if (res.success && res.rooms) {
  //         setRooms(res.rooms);
  //       } else {
  //         console.error("Failed to fetch user rooms or rooms are undefined.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("An error occurred while fetching user rooms:", error);
  //     });
  // }, [client]);

  const handleSelectRoom = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleReadAll = async () => {
    if (!client || selectedRooms.length < 2) return;

    try {
      await Promise.all(
        selectedRooms.map(async (roomId) => {
          const room = client.getRoom(roomId);
          if (!room) return;

          const timeline = room.getLiveTimeline();
          const events = timeline.getEvents();
          const lastEvent = [...events]
            .reverse()
            .find((e) => e.getType() !== "m.room.encrypted");

          if (lastEvent) {
            await client.sendReadReceipt(lastEvent);
          }
        })
      );

      setIsEditMode(false);
      setSelectedRooms([]);
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleArchive = () => {
    alert("Archive: " + selectedRooms.join(", "));
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  // const refreshRooms = () => {
  //   if (!client) return;
  //   getUserRooms(client)
  //     .then((res) => {
  //       if (res.success && res.rooms) {
  //         setRooms(res.rooms);
  //       } else {
  //         console.error("Failed to fetch user rooms or rooms are undefined.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("An error occurred while fetching user rooms:", error);
  //     });
  // };

  const handleDeleteMine = async () => {
    if (!client) return;

    await Promise.all(
      selectedRooms.map(async (roomId) => {
        await client.leave(roomId);
        await client.forget(roomId);
      })
    );

    refreshRooms();
    setSelectedRooms([]);
    setIsEditMode(false);
    setShowDeleteModal(false);
  };

  const handleDeleteBoth = async () => {
    if (!client) return;

    await Promise.all(
      selectedRooms.map(async (roomId) => {
        await client.sendEvent(roomId, "m.room.delete_for_everyone" as any, {
          by: client.getUserId(),
        });
        await client.leave(roomId);
        await client.forget(roomId);
      })
    );

    refreshRooms();
    setSelectedRooms([]);
    setIsEditMode(false);
    setShowDeleteModal(false);
  };

  const handleDone = () => {
    setIsEditMode(false);
    setSelectedRooms([]);
  };

  const headerStyle = getHeaderStyleWithStatusBar();

  // const [showBackButton, setShowBackButton] = useState(false);

  const backUrl = getLS("backUrl");

  const fromMainApp = getLS("fromMainApp");

  const MAIN_APP_ORIGIN =
    typeof window !== "undefined" ? window.location.origin : "";

  const handleBack = () => {
    if (backUrl) {
      removeLS("backUrl");
      removeLS("fromMainApp");
      removeLS("hide");
      removeLS("backToMain");
      window.location.href = MAIN_APP_ORIGIN + backUrl;
    } else {
      removeLS("backUrl");
      removeLS("fromMainApp");
      removeLS("hide");
      removeLS("backToMain");
      window.location.href = MAIN_APP_ORIGIN;
    }
  };

  // const searchParams = useSearchParams();
  // const hideFromQuery = searchParams.get("hide");
  const hide = getLS("hide") || [];
  const hideArray = typeof hide === "string" ? hide.split(",") : hide;
  const options = Array.isArray(hideArray) ? hideArray : [];
  //console.log(options)

  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex flex-col h-screen space-y-2 bg-gradient-to-b from-cyan-700/30 via-cyan-300/15 to-yellow-600/25">
      {/*
      <div
        style={headerStyle}
        className="sticky bg-white bg-white dark:bg-[#1a1a1a] top-0 z-10"
      >
        <div className="grid grid-cols-3 items-center px-4 py-4">
          <div className="flex items-center">
            {fromMainApp && (
              <button
                className="text-blue-500 font-medium w-10 cursor-pointer"
                onClick={handleBack}
                title="Back"
                aria-label="Back"
              >
                <ChevronLeft />
              </button>
            )}
            {!fromMainApp && (
              <ChatEditButton
                isEditMode={isEditMode}
                onEdit={() => setIsEditMode(true)}
                onDone={handleDone}
              />
            )}
          </div>

          <h1 className="text-center text-lg">Chats</h1>

          <div className="flex gap-3 justify-end items-center">
            {fromMainApp && (
              <ChatEditButton
                isEditMode={isEditMode}
                onEdit={() => setIsEditMode(true)}
                onDone={handleDone}
              />
            )}
            {!fromMainApp && (
              <>
                <div
                  className="text-blue-500 cursor-pointer
            hover:scale-105 duration-500 transition-all ease-in-out
            hover:opacity-50"
                >
                  <CircleFadingPlus className="rotate-y-180" />
                </div>
                <div
                  className="text-blue-500 cursor-pointer
            hover:scale-105 duration-500 transition-all ease-in-out
            hover:opacity-50"
                >
                  <Link href={"/chat/newMessage"}>
                    <SquarePen />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
        {!options.includes("search") && <SearchBar />}
      </div>
      */}

      {/* HEADER */}
      <div className="shrink-0 space-y-4 p-3.5">
        <div className="flex justify-between items-center">
          <p className="font-bold text-2xl">Message</p>
          <div className="flex items-center gap-2">
            <button className="h-10 px-4 text-sm font-medium border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out">
              Edit
            </button>
            <button className="h-10 w-10 flex items-center justify-center border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out" 
              aria-label="More options" title="More options"
            >
              <Ellipsis className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Service */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2 bg-blue-600 py-3 px-4.5 text-white rounded-2xl outline">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="">Primary</p>
          </div>
          <div className="p-3 rounded-2xl text-white bg-gray-400/55 outline">
            <ShoppingCart />
          </div>
          <div className="p-3 rounded-2xl text-white bg-gray-400/55 outline">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
              />
            </svg>
          </div>
          <div className="p-3 rounded-2xl text-white bg-gray-400/55 outline">
            <Bell />
          </div>
        </div>
      </div>

      {/* ChatList scroll được */}
      <ScrollArea className="flex-1 min-h-0 m-0">
        {loading ? (
          <div className="flex flex-1 flex-col justify-center items-center min-h-[calc(100vh-112px)] pb-8">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500 mb-2" />
            <p className="text-muted-foreground text-sm">Loading chats...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-1 flex-col justify-between min-h-[calc(100vh-112px)] pb-9d">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <img
                src="https://symbl-cdn.com/i/webp/97/613a80b3ab97dad9149e2b43f6112d.webp"
                width={100}
                height={100}
                alt="no conversations"
                className="mb-2"
              />
              <p className="text-sm whitespace-pre-line">
                You have no{"\n"}conversations yet.
              </p>
            </div>
            <div className="w-full pb-30 px-15">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base rounded-lg py-6 cursor-pointer">
                <Link href={"/chat/newMessage"}>New Message</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <ChatList
              rooms={rooms}
              isEditMode={isEditMode}
              selectedRooms={selectedRooms}
              onSelectRoom={handleSelectRoom}
              onMute={() => {}}
              onDelete={async (roomId, type) => {
                if (!client) return;
                if (type === "me") {
                  await client.leave(roomId);
                  await client.forget(roomId);
                } else if (type === "both") {
                  await client.sendEvent(
                    roomId,
                    "m.room.delete_for_everyone" as any,
                    {
                      by: client.getUserId(),
                    }
                  );
                  await client.leave(roomId);
                  await client.forget(roomId);
                }
                refreshRooms();
              }}
              onArchive={(roomId) => {
                alert("Archive: " + roomId);
              }}
            />
          </div>
        )}
      </ScrollArea>

      <div className="fixed -bottom-3 left-0 w-full z-5  pointer-events-none">
        <div className="w-full h-36  bg-gradient-to-b from-transparent via-white/20 to-gray-400/30" />
      </div>

      {/* Search bar */}
      <div className="fixed bottom-10 left-0 w-full z-10 flex justify-center pointer-events-none">
        <label
          className={`
            group flex items-center rounded-full
            transition-all duration-300
            shadow-lg
            backdrop-blur-md
            pointer-events-auto
            ${
              isFocused || searchValue
                ? "bg-white/50 px-5 py-2 w-[90vw] max-w-md"
                : "bg-white px-3 py-1 w-30"
            }
          `}
          style={{ marginBottom: "env(safe-area-inset-bottom, 12px)" }}
        >
          <input
            type="text"
            className={`
              outline-none bg-transparent w-full
              transition-all duration-300
            `}
            placeholder={
              isFocused || searchValue ? "Tìm kiếm mọi thứ bằng AI" : "Tìm kiếm"
            }
            value={searchValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Search size={20} className="text-zinc-700" />
        </label>
      </div>

      {/* Action bar cố định */}
      {isEditMode && (
        <ChatActionBar
          selectedCount={selectedRooms.length}
          onReadAll={handleReadAll}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      )}
      {/* Modal cố định */}
      <DeleteChatModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteMine={handleDeleteMine}
        onDeleteBoth={handleDeleteBoth}
      />
    </div>
  );
}
