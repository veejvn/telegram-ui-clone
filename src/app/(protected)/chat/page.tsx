/*src/app/(protected)/chat/page.tsx*/
/* eslint-disable @next/next/no-img-element */
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ChatList } from "@/components/chat/ChatList";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import * as sdk from "@/lib/matrix-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import ChatActionBar from "@/components/chat/ChatActionBar";
import DeleteChatModal from "@/components/chat/DeleteChatModal";
import {
  Bell,
  ChevronLeft,
  Ellipsis,
  Loader2,
  QrCode,
  ShoppingCart,
  UserPlus2,
  Users2,
  X,
} from "lucide-react";
import useSortedRooms from "@/hooks/useSortedRooms";
import useListenRoomInvites from "@/hooks/useListenRoomInvites";
import { getLS, removeLS } from "@/tools/localStorage.tool";
import { useRoomStore } from "@/stores/useRoomStore";
import { searchMatrixUsers } from "@/services/matrixUserSearch";
import ContactService from "@/services/contactService";
import { getDetailedStatus } from "@/utils/chat/presencesHelpers";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastProvider";
// Import our extracted search components
import SearchBar from "@/components/search/SearchBar";
import FullScreenSearch from "@/components/search/FullScreenSearch";
import NavigationMenu from "@/components/layouts/NavigationMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export default function ChatsPage() {
  const { refreshRooms, loading } = useSortedRooms();
  const rooms = useRoomStore((state) => state.rooms);
  const client = useMatrixClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  useListenRoomInvites();
  const router = useRouter();
  const { showToast } = useToast();

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [isFullScreenSearch, setIsFullScreenSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [messageResults, setMessageResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userIdChatBot =
    process.env.NEXT_PUBLIC_USER_ID_BOT || "@bot:matrix.teknix.dev";

  // Room selection handling
  const handleSelectRoom = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  // Mark all as read functionality
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

  // Handle back navigation to main app
  const backUrl = getLS("backUrl");
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

  // Utility functions for search
  const getMxcAvatarUrl = (url: string | null) => {
    if (!url || !client) return null;

    try {
      if (url.startsWith("mxc://")) {
        return client.mxcUrlToHttp(url, 60, 60, "crop");
      } else if (url.startsWith("http")) {
        return url;
      }
      return null;
    } catch (error) {
      console.error(`Error processing avatar URL:`, error);
      return null;
    }
  };

  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      if (!client) return;

      try {
        const directRooms = await ContactService.getDirectMessageRooms(client);

        const contactsList = directRooms
          .map((room) => {
            const otherMembers = room
              .getJoinedMembers()
              .filter(
                (member) =>
                  member.userId !== client.getUserId() &&
                  member.userId !== userIdChatBot
              );

            if (otherMembers.length === 0) return null;

            const otherUser = otherMembers[0];

            let avatarUrl = null;
            try {
              if (otherUser.getAvatarUrl) {
                avatarUrl = otherUser.getAvatarUrl(
                  client.getHomeserverUrl(),
                  60,
                  60,
                  "crop",
                  false,
                  false,
                  false
                );
              }
            } catch (error) {
              console.error("Error getting avatar URL:", error);
            }

            let processedAvatarUrl = null;
            if (avatarUrl) {
              try {
                processedAvatarUrl = getMxcAvatarUrl(avatarUrl);
              } catch (error) {
                console.error("Error converting avatar URL:", error);
              }
            }

            let lastSeen = null;
            let isOnline = false;

            try {
              const presence = client.getUser(otherUser.userId)?.presence;
              if (presence) {
                if (presence === "online") {
                  isOnline = true;
                  lastSeen = new Date();
                } else if (
                  typeof presence === "object" &&
                  presence !== null &&
                  "lastActiveAgo" in presence &&
                  typeof (presence as { lastActiveAgo?: number })
                    .lastActiveAgo === "number"
                ) {
                  const lastActive =
                    Date.now() -
                    (presence as { lastActiveAgo: number }).lastActiveAgo;
                  lastSeen = new Date(lastActive);
                  isOnline = Date.now() - lastActive < 2 * 60 * 1000;
                }
              }
            } catch (error) {
              console.error("Error getting presence info:", error);
            }

            return {
              user_id: otherUser.userId,
              display_name: otherUser.name || otherUser.userId,
              avatar_url: avatarUrl,
              processed_avatar_url: processedAvatarUrl,
              room_id: room.roomId,
              isOnline: isOnline,
              lastSeen: lastSeen,
            };
          })
          .filter(Boolean);

        setContacts(contactsList);
      } catch (err) {
        console.error("Error loading contacts:", err);
      }
    };

    loadContacts();
  }, [client, userIdChatBot]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        const parsedSearches = JSON.parse(saved);

        const processedSearches = parsedSearches.map((item: any) => {
          if (
            item.avatar_url &&
            (!item.processed_avatar_url || item.processed_avatar_url === "") &&
            client
          ) {
            try {
              const avatarUrl = getMxcAvatarUrl(item.avatar_url);
              return {
                ...item,
                processed_avatar_url: avatarUrl || null,
              };
            } catch (error) {
              console.error("Error processing URL:", error);
              return item;
            }
          }
          return item;
        });

        setRecentSearches(processedSearches);
      }
    } catch (err) {
      console.error("Failed to load recent searches:", err);
    }
  }, [client]);

  // Search processing effect
  useEffect(() => {
    if (searchTerm.length > 0 && client && isFullScreenSearch) {
      setSearchLoading(true);
      setIsSearching(true);

      const processedUserIds = new Set();
      let combinedResults: any[] = [];

      // Search in contacts and recent searches
      const localResults = [...contacts, ...recentSearches].filter(
        (contact) => {
          const displayName = (contact.display_name || "").toLowerCase();
          const userId = (contact.user_id || "").toLowerCase();
          const term = searchTerm.toLowerCase();

          return (
            userId !== userIdChatBot.toLowerCase() &&
            (displayName.includes(term) || userId.includes(term))
          );
        }
      );

      localResults.forEach((user) => {
        if (!processedUserIds.has(user.user_id)) {
          processedUserIds.add(user.user_id);
          combinedResults.push(user);
        }
      });

      // Search in chat rooms
      if (client) {
        const rooms = client.getRooms() || [];

        for (const room of rooms) {
          const isDirectRoom =
            client.getAccountData("m.direct" as keyof sdk.AccountDataEvents) &&
            Object.values(
              client
                .getAccountData("m.direct" as keyof sdk.AccountDataEvents)
                ?.getContent() || {}
            ).some(
              (roomIds: any) =>
                Array.isArray(roomIds) && roomIds.includes(room.roomId)
            );
          if (!isDirectRoom) continue;

          const members = room
            .getJoinedMembers()
            .filter((member) => member.userId !== client.getUserId());

          for (const member of members) {
            const memberName = (member.name || "").toLowerCase();
            const memberId = member.userId.toLowerCase();
            const term = searchTerm.toLowerCase();

            if (
              (memberName.includes(term) || memberId.includes(term)) &&
              !processedUserIds.has(member.userId)
            ) {
              processedUserIds.add(member.userId);

              let avatarUrl = null;
              try {
                if (member.getAvatarUrl) {
                  avatarUrl = member.getAvatarUrl(
                    client.getHomeserverUrl(),
                    60,
                    60,
                    "crop",
                    false,
                    false,
                    false
                  );
                }
              } catch (error) {
                console.error("Error getting avatar URL:", error);
              }

              let processedAvatarUrl = null;
              if (avatarUrl) {
                try {
                  processedAvatarUrl = getMxcAvatarUrl(avatarUrl);
                } catch (error) {
                  console.error("Error processing avatar URL:", error);
                }
              }

              let lastSeen = null;
              let isOnline = false;

              try {
                const presence = client.getUser(member.userId)?.presence;
                if (presence) {
                  if (presence === "online") {
                    isOnline = true;
                    lastSeen = new Date();
                  } else if (
                    typeof presence === "object" &&
                    presence !== null &&
                    "lastActiveAgo" in presence &&
                    typeof (presence as { lastActiveAgo?: number })
                      .lastActiveAgo === "number"
                  ) {
                    const lastActive =
                      Date.now() -
                      (presence as { lastActiveAgo: number }).lastActiveAgo;
                    lastSeen = new Date(lastActive);
                    isOnline = Date.now() - lastActive < 2 * 60 * 1000;
                  }
                }
              } catch (error) {
                console.error("Error getting presence info:", error);
              }

              combinedResults.push({
                user_id: member.userId,
                display_name: member.name || member.userId,
                avatar_url: avatarUrl || "",
                processed_avatar_url: processedAvatarUrl,
                room_id: room.roomId,
                isOnline: isOnline,
                lastSeen: lastSeen,
              });
              break;
            }
          }
        }
      }

      const timeoutId = setTimeout(() => {
        // Search through Matrix API
        searchMatrixUsers(client, searchTerm)
          .then((apiResults) => {
            const filteredApiResults = apiResults.filter(
              (user) => user.user_id !== userIdChatBot
            );

            // Process avatar URLs and presence info
            const processedApiResults = apiResults.map((user) => {
              if (user.avatar_url && !user.processed_avatar_url) {
                try {
                  user.processed_avatar_url = getMxcAvatarUrl(user.avatar_url);
                } catch (error) {
                  console.error("Error processing API avatar:", error);
                }
              }

              if (client) {
                try {
                  const presence = client.getUser(user.user_id)?.presence;
                  if (presence) {
                    if (presence === "online") {
                      user.isOnline = true;
                      user.lastSeen = new Date();
                    } else if (
                      typeof presence === "object" &&
                      presence !== null &&
                      "lastActiveAgo" in presence &&
                      typeof (presence as { lastActiveAgo?: number })
                        .lastActiveAgo === "number"
                    ) {
                      const lastActive =
                        Date.now() -
                        (presence as { lastActiveAgo: number }).lastActiveAgo;
                      user.lastSeen = new Date(lastActive);
                      user.isOnline = Date.now() - lastActive < 2 * 60 * 1000;
                    }
                  }
                } catch (error) {
                  console.error("Error getting presence info:", error);
                }
              }

              return user;
            });

            // Combine results and remove duplicates
            processedApiResults.forEach((user) => {
              if (!processedUserIds.has(user.user_id)) {
                processedUserIds.add(user.user_id);
                combinedResults.push(user);
              }
            });

            // Remove duplicates using Map
            const uniqueResults = Array.from(
              new Map(
                combinedResults.map((item) => [item.user_id, item])
              ).values()
            );

            setSearchResults(uniqueResults);
            setSearchLoading(false);
          })
          .catch((err) => {
            console.error("API search error:", err);

            // Remove duplicates
            const uniqueResults = Array.from(
              new Map(
                combinedResults.map((item) => [item.user_id, item])
              ).values()
            );
            setSearchResults(uniqueResults);
            setSearchLoading(false);
          });

        // Search messages
        client
          .searchMessageText({ query: searchTerm })
          .then((res) => {
            const rawResults =
              res?.search_categories?.room_events?.results || [];
            const filteredMessages = rawResults.filter((msg: any) => {
              const content = msg?.result?.content?.body || "";
              return content.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setMessageResults(filteredMessages);
          })
          .catch(() => {
            setMessageResults([]);
          });
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setMessageResults([]);
      setSearchLoading(false);
      setIsSearching(false);
    }
  }, [
    searchTerm,
    client,
    isFullScreenSearch,
    contacts,
    recentSearches,
    userIdChatBot,
  ]);

  // User interaction handlers
  const normalizeUserIdInput = (raw: string, client: sdk.MatrixClient) => {
    if (!raw) return raw;
    let id = raw.trim();
    if (!id.startsWith("@")) id = "@" + id;

    if (!id.includes(":")) {
      const domain = client
        .getHomeserverUrl()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
      id += `:${domain}`;
    }

    return id;
  };

  const handleAddContact = async (client: sdk.MatrixClient, rawId: string) => {
    const userId = normalizeUserIdInput(rawId, client);
    try {
      const room = await ContactService.addContact(client, userId);
      if (room) {
        router.push(`/chat/${room.roomId}`);
        //closeFullScreenSearch();
      }
    } catch (error: any) {
      console.error("Error creating room:", error.message);
    }
  };

  const handleUserClick = async (user: any) => {
    if (!client || user.user_id === userIdChatBot) return;

    // Add to recent searches
    const newRecent = [...recentSearches];
    const existingIndex = newRecent.findIndex(
      (r) => r.user_id === user.user_id
    );

    let avatarUrl = null;
    if (user.processed_avatar_url && user.processed_avatar_url !== "") {
      avatarUrl = user.processed_avatar_url;
    } else if (user.avatar_url && user.avatar_url !== "") {
      try {
        avatarUrl = getMxcAvatarUrl(user.avatar_url);
      } catch (error) {
        console.error("Error converting mxc URL:", error);
      }
    }

    let lastSeen = user.lastSeen;
    let isOnline = user.isOnline;

    try {
      const presence = client.getUser(user.user_id)?.presence;
      if (presence) {
        if (presence === "online") {
          isOnline = true;
          lastSeen = new Date();
        } else if (
          typeof presence === "object" &&
          presence !== null &&
          "lastActiveAgo" in presence &&
          typeof (presence as { lastActiveAgo?: number }).lastActiveAgo ===
            "number"
        ) {
          const lastActive =
            Date.now() - (presence as { lastActiveAgo: number }).lastActiveAgo;
          lastSeen = new Date(lastActive);
          isOnline = Date.now() - lastActive < 2 * 60 * 1000;
        }
      }
    } catch (error) {
      console.error("Error getting presence info:", error);
    }

    const userToSave = {
      ...user,
      processed_avatar_url: avatarUrl,
      isOnline: isOnline,
      lastSeen: lastSeen,
    };

    if (existingIndex >= 0) {
      newRecent.splice(existingIndex, 1);
    }

    newRecent.unshift(userToSave);
    const updatedRecent = newRecent.slice(0, 5);
    setRecentSearches(updatedRecent);

    try {
      localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));
    } catch (err) {
      console.error("Failed to save recent searches:", err);
    }

    const isFriend = client
      ?.getRooms()
      .some((room) =>
        room.getJoinedMembers().some((member) => member.userId === user.user_id)
      );

    if (isFriend) {
      const room = client
        .getRooms()
        .find((r) =>
          r.getJoinedMembers().some((m) => m.userId === user.user_id)
        );
      if (room) {
        router.push(`/chat/${room.roomId}`);
        //closeFullScreenSearch();
      }
    } else {
      await handleAddContact(client, user.user_id);
    }
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const renderAvatar = (user: any) => {
    let avatarUrl = user.processed_avatar_url;

    if (!avatarUrl && user.avatar_url) {
      try {
        avatarUrl = getMxcAvatarUrl(user.avatar_url);
        user.processed_avatar_url = avatarUrl;
      } catch (error) {
        console.error("Error processing avatar in renderAvatar:", error);
      }
    }

    if (avatarUrl) {
      return (
        <div className="relative w-full h-full">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              console.error("Error loading avatar:", avatarUrl);
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallbackAvatar = document.createElement("div");
                fallbackAvatar.className =
                  "w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-800 text-lg";
                fallbackAvatar.innerText = (
                  user.display_name ||
                  user.user_id ||
                  "?"
                )
                  .charAt(0)
                  .toUpperCase();
                parent.appendChild(fallbackAvatar);
              }
            }}
          />
          {user.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      );
    }

    const firstChar = (user.display_name || user.user_id || "?")
      .charAt(0)
      .toUpperCase();

    return (
      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-800 text-lg relative">
        {firstChar}
        {user.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
    );
  };

  const closeFullScreenSearch = () => {
    setIsFullScreenSearch(false);
    setSearchTerm("");
    setSearchQuery("");
  };

  const renderContactItem = (contact: any) => {
    const name = contact.display_name?.split(" ")[0] || "User";
    const shortenedName =
      name.length > 10 ? name.substring(0, 7) + "..." : name;

    let avatarUrl = contact.processed_avatar_url;

    if (!avatarUrl && contact.avatar_url) {
      try {
        avatarUrl = getMxcAvatarUrl(contact.avatar_url);
        contact.processed_avatar_url = avatarUrl;
      } catch (error) {
        console.error("Error processing avatar in renderContactItem:", error);
      }
    }

    let statusText = "offline";
    if (contact.isOnline) {
      statusText = "online";
    } else if (contact.lastSeen) {
      statusText = getDetailedStatus(contact.lastSeen);
    }

    return (
      <div
        key={contact.user_id}
        className="flex flex-col items-center cursor-pointer"
        onClick={() => handleUserClick(contact)}
      >
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={contact.display_name}
              className="w-14 h-14 rounded-full object-cover"
              onError={(e) => {
                console.error("Error loading avatar:", avatarUrl);
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallbackAvatar = document.createElement("div");
                  fallbackAvatar.className =
                    "w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center";
                  fallbackAvatar.innerHTML = `<span class="text-orange-800 font-medium text-xl">${(
                    contact.display_name || "U"
                  )
                    .charAt(0)
                    .toUpperCase()}</span>`;
                  parent.appendChild(fallbackAvatar);
                }
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-800 font-medium text-xl">
                {(contact.display_name || "U").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {contact.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="mt-1 text-xs text-center text-gray-600 max-w-[60px] truncate">
          {shortenedName}
          <span className="block text-xs text-blue-500 mt-1">{statusText}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen space-y-2 bg-gradient-to-b from-cyan-700/30 via-cyan-300/15 to-yellow-600/25">
      {/* Header */}
      <div className="shrink-0 p-3.5">
        <div className="flex justify-between items-center border-b border-gray-200/30 pb-3">
          {isEditMode ? (
            <>
              <p className="font-bold text-2xl">Message</p>
              <button
                className="text-blue-500 font-medium"
                onClick={handleDone}
              >
                Done
              </button>
            </>
          ) : (
            <>
              <p className="font-bold text-2xl">Message</p>
              <div className="flex items-center gap-2">
                <button
                  className="h-10 px-4 text-sm font-medium border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
                  onClick={() => {
                    setIsEditMode(true);
                    setSelectedRooms([]);
                  }}
                >
                  Edit
                </button>
                <button
                  className="h-10 w-10 flex items-center justify-center border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
                  aria-label="More options"
                  title="More options"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Ellipsis className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      // align="end"
                      className="rounded-3xl p-2 mx-3 my-3 w-[210px]"
                    >
                      <DropdownMenuItem
                        className="flex items-center justify-between"
                        onSelect={() =>
                          router.push("/chat/newMessage/addMember")
                        }
                      >
                        Create Group
                        <Users2 className="scale-125 text-blue-600" />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex items-center justify-between">
                        Add new contact
                        <UserPlus2 className="scale-125 text-blue-600" />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex items-center justify-between">
                        QR Code <QrCode className="scale-125 text-blue-600" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Service buttons */}
        <div className="flex items-center space-x-2 pt-3">
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

      {/* Chat list */}
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

      {/* Gradient overlay at bottom */}
      <div className="fixed -bottom-3 left-0 w-full z-5 pointer-events-none">
        <div className="w-full h-36 bg-gradient-to-b from-transparent via-white/20 to-gray-400/30" />
      </div>

      <NavigationMenu className="z-[100]" />

      {/* Search bar component */}
      <SearchBar
        onSearchFocus={() => setIsFullScreenSearch(true)}
        onQueryChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Full screen search component */}
      {isFullScreenSearch && (
        <FullScreenSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClose={closeFullScreenSearch}
          searchLoading={searchLoading}
          searchResults={searchResults}
          messageResults={messageResults}
          contacts={contacts}
          recentSearches={recentSearches}
          handleUserClick={handleUserClick}
          clearHistory={clearHistory}
          renderAvatar={renderAvatar}
          renderContactItem={renderContactItem}
          getMxcAvatarUrl={getMxcAvatarUrl}
          clientUserId={client?.getUserId() ?? undefined}
          userIdChatBot={userIdChatBot}
        />
      )}

      {/* Action bar for edit mode */}
      {isEditMode && (
        <ChatActionBar
          selectedCount={selectedRooms.length}
          onReadAll={handleReadAll}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      )}

      {/* Delete modal */}
      <DeleteChatModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteMine={handleDeleteMine}
        onDeleteBoth={handleDeleteBoth}
      />
    </div>
  );
}
