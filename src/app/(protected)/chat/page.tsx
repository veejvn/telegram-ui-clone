/* eslint-disable @next/next/no-img-element */
"use client";

import SearchBar from "@/components/layouts/SearchBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ChatList } from "@/components/chat/ChatList";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import ChatEditButton from "@/components/chat/ChatEditButton";
import ChatActionBar from "@/components/chat/ChatActionBar";
import DeleteChatModal from "@/components/chat/DeleteChatModal";
import { getUserRooms } from "@/services/chatService";
import { CircleFadingPlus, Loader2, SquarePen } from "lucide-react";
import useSortedRooms from "@/hooks/useSortedRooms";

export default function ChatsPage() {
  // const [rooms, setRooms] = useState<sdk.Room[]>([]);
  const { rooms, refreshRooms, loading } = useSortedRooms();
  const client = useMatrixClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleReadAll = () => {
    alert("Read All: " + selectedRooms.join(", "));
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

  return (
    <div>
      <div className="sticky bg-white dark:bg-black top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 ">
          <ChatEditButton
            isEditMode={isEditMode}
            onEdit={() => setIsEditMode(true)}
            onDone={handleDone}
          />
          <h1 className="text-md font-semibold">Chats</h1>
          <div className="flex gap-3 items-center">
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
          </div>
        </div>
        <SearchBar />
      </div>

      {loading ? (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[calc(100vh-112px)] pb-8">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500 mb-2" />
          <p className="text-muted-foreground text-sm">Loading chats...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-1 flex-col justify-between min-h-[calc(100vh-112px)] pb-8">
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
          <div className="w-full pb-12 px-15">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base rounded-lg py-6 cursor-pointer">
              <Link href={"/chat/newMessage"}>New Message</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-3">
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

      {isEditMode && (
        <ChatActionBar
          selectedCount={selectedRooms.length}
          onReadAll={handleReadAll}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      )}

      <DeleteChatModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteMine={handleDeleteMine}
        onDeleteBoth={handleDeleteBoth}
      />
    </div>
  );
}
