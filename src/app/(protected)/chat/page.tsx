/*src/app/(protected)/chat/page.tsx*/
/* eslint-disable @next/next/no-img-element */
"use client";

import SearchBar from "@/components/layouts/SearchBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ChatList } from "@/components/chat/ChatList";
import { useEffect, useRef, useState } from "react";
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
  Sparkles,
  SquarePen,
  UserCheck,
  X,
} from "lucide-react";
import useSortedRooms from "@/hooks/useSortedRooms";
import useListenRoomInvites from "@/hooks/useListenRoomInvites";
import { getLS, removeLS } from "@/tools/localStorage.tool";
import { useSearchParams } from "next/navigation";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import { useRoomStore } from "@/stores/useRoomStore";
import { searchMatrixUsers } from "@/services/matrixUserSearch";
import ContactService from "@/services/contactService";
import { getDetailedStatus } from "@/utils/chat/presencesHelpers";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastProvider";

export default function ChatsPage() {
  const { refreshRooms, loading } = useSortedRooms();
  const rooms = useRoomStore((state) => state.rooms);
  const client = useMatrixClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  useListenRoomInvites();
  const router = useRouter();
  const { showToast } = useToast(); // Tìm kiếm states

  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFullScreenSearch, setIsFullScreenSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [messageResults, setMessageResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchBarState, setSearchBarState] = useState("collapsed");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSearchActive, setExpandedSearchActive] = useState(false);
  const userIdChatBot =
    process.env.NEXT_PUBLIC_USER_ID_BOT || "@bot:matrix.teknix.dev"; // Chức năng chọn phòng
  const handleSelectRoom = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  }; // Chức năng đánh dấu đã đọc tất cả

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
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node) &&
        searchBarState === "expanded"
      ) {
        setSearchBarState("collapsed");
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchBarState]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node) &&
        searchBarState === "expanded"
      ) {
        setSearchBarState("collapsed");
        setSearchQuery("");
        setExpandedSearchActive(false);
      }
    }

    // Use both mousedown and touchend for better mobile support
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchend", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [searchBarState]);
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

  const hide = getLS("hide") || [];
  const hideArray = typeof hide === "string" ? hide.split(",") : hide;
  const options = Array.isArray(hideArray) ? hideArray : []; // Các hàm utility cho tìm kiếm

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
      console.error(`Lỗi xử lý avatar URL:`, error);
      return null;
    }
  }; // Tải danh sách liên hệ

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
              console.error("Lỗi khi lấy avatar URL:", error);
            }

            let processedAvatarUrl = null;
            if (avatarUrl) {
              try {
                processedAvatarUrl = getMxcAvatarUrl(avatarUrl);
              } catch (error) {
                console.error("Lỗi khi chuyển đổi avatar URL:", error);
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
              console.error("Lỗi khi lấy thông tin presence:", error);
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
        console.error("Lỗi khi tải danh sách liên hệ:", err);
      }
    };

    loadContacts();
  }, [client]); // Tải recent searches từ localStorage
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
              console.error("Lỗi khi xử lý URL:", error);
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
  }, [client]); // Xử lý tìm kiếm

  useEffect(() => {
    if (searchTerm.length > 0 && client && isFullScreenSearch) {
      setSearchLoading(true);
      setIsSearching(true);

      const processedUserIds = new Set();
      let combinedResults: any[] = []; // Tìm trong danh sách contacts và recent searches

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
      }); // Tìm trong phòng chat

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
                console.error("Lỗi khi lấy avatar URL:", error);
              }

              let processedAvatarUrl = null;
              if (avatarUrl) {
                try {
                  processedAvatarUrl = getMxcAvatarUrl(avatarUrl);
                } catch (error) {
                  console.error("Lỗi khi xử lý avatar URL:", error);
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
                console.error("Lỗi khi lấy thông tin presence:", error);
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
        // Tìm kiếm thông qua API Matrix
        searchMatrixUsers(client, searchTerm)
          .then((apiResults) => {
            const filteredApiResults = apiResults.filter(
              (user) => user.user_id !== userIdChatBot
            ); // Xử lý avatar URL và presence info
            const processedApiResults = apiResults.map((user) => {
              if (user.avatar_url && !user.processed_avatar_url) {
                try {
                  user.processed_avatar_url = getMxcAvatarUrl(user.avatar_url);
                } catch (error) {
                  console.error("Lỗi xử lý avatar từ API:", error);
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
                  console.error("Lỗi khi lấy thông tin presence:", error);
                }
              }

              return user;
            }); // Kết hợp kết quả và loại bỏ trùng lặp

            processedApiResults.forEach((user) => {
              if (!processedUserIds.has(user.user_id)) {
                processedUserIds.add(user.user_id);
                combinedResults.push(user);
              }
            }); // Loại bỏ trùng lặp bằng Set

            const uniqueResults = Array.from(
              new Map(
                combinedResults.map((item) => [item.user_id, item])
              ).values()
            );

            setSearchResults(uniqueResults);
            setSearchLoading(false);
          })
          .catch((err) => {
            console.error("Lỗi tìm kiếm API:", err); // Loại bỏ trùng lặp

            const uniqueResults = Array.from(
              new Map(
                combinedResults.map((item) => [item.user_id, item])
              ).values()
            );
            setSearchResults(uniqueResults);
            setSearchLoading(false);
          }); // Tìm tin nhắn

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
  }, [searchTerm, client, isFullScreenSearch, contacts, recentSearches]); // Các hàm xử lý

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
        closeFullScreenSearch();
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo phòng:", error.message);
    }
  };

  const handleUserClick = async (user: any) => {
    if (!client || user.user_id === userIdChatBot) return; // Thêm vào recent searches

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
        console.error("Lỗi chuyển đổi mxc URL:", error);
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
      console.error("Lỗi khi lấy thông tin presence:", error);
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
        closeFullScreenSearch();
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
        console.error("Lỗi khi xử lý avatar trong renderAvatar:", error);
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
              console.error("Lỗi tải avatar:", avatarUrl);
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

  const openFullScreenSearch = () => {
    setIsFullScreenSearch(true);
    setSearchTerm("");
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const closeFullScreenSearch = () => {
    setIsFullScreenSearch(false);
    setSearchTerm("");
    setSearchQuery("");
    setSearchBarState("collapsed");
    setExpandedSearchActive(false);

    // Reset focus
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
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
        console.error("Lỗi khi xử lý avatar trong renderContactItem:", error);
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
                console.error("Lỗi tải avatar:", avatarUrl);
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
      {/* HEADER */}
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
                  <Ellipsis className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
        {/* Only show Service section when not in edit mode */}

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
      <div className="fixed -bottom-3 left-0 w-full z-5 pointer-events-none">
        <div className="w-full h-36 bg-gradient-to-b from-transparent via-white/20 to-gray-400/30" />
      </div>
      {/* Search bar */}
      <div className="fixed bottom-10 left-0 w-full z-10 flex justify-center pointer-events-none">
        <div
          ref={searchBarRef}
          className={`
      group flex items-center rounded-full
      transition-all duration-300 ease-in-out
      pointer-events-auto
      ${
        searchBarState === "collapsed"
          ? "bg-white py-1.5 px-2.5 w-[120px]"
          : "bg-[#fce0f0] py-2 px-3 w-[90vw] max-w-md"
      }
    `}
          style={{
            marginBottom: "env(safe-area-inset-bottom, 12px)",
            boxShadow:
              searchBarState === "expanded"
                ? "0 0 0 1px #9370DB, 0 0 10px 1px rgba(147, 112, 219, 0.5)"
                : "0 1px 5px rgba(0,0,0,0.06)",
            transform: `scale(${searchBarState === "expanded" ? "1.05" : "1"}) 
       translateY(${searchBarState === "expanded" ? "-5px" : "0"})`,
            transition: "all 0.3s ease-out",
          }}
          onClick={() => {
            if (searchBarState === "collapsed") {
              setSearchBarState("expanded");
              setExpandedSearchActive(true);

              // Short delay to ensure smooth animation on mobile
              setTimeout(() => {
                setIsFullScreenSearch(true);
              }, 2000);
            }
          }}
        >
          {/* Sparkles icon - consistent in both expanded and fullscreen states */}
          {searchBarState !== "collapsed" && (
            <div className="w-9 h-9 rounded-full bg-[#6b46c1] flex items-center justify-center mr-2 my-0 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white transition-all duration-300" />
            </div>
          )}

          <input
            ref={searchInputRef}
            type="text"
            className={`
        outline-none bg-transparent transition-all duration-300 text-gray-800 text-sm
        ${
          searchBarState === "collapsed"
            ? "w-[80px] text-center px-0"
            : "w-full text-base text-left"
        }
      `}
            placeholder={
              searchBarState === "collapsed" ? "Tìm kiếm" : "Tìm kiếm"
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchTerm(e.target.value);
            }}
            onFocus={() => {
              if (searchBarState === "collapsed") {
                setSearchBarState("expanded");
                setExpandedSearchActive(true);

                // Use the same delay for consistency
                setTimeout(() => {
                  setIsFullScreenSearch(true);
                }, 250);
              }
            }}
            readOnly={searchBarState === "collapsed"}
          />

          {/* Right search icon in collapsed state */}
          {searchBarState === "collapsed" && (
            <Search size={16} className="text-gray-500 min-w-[16px] ml-0.5" />
          )}

          {/* X button only shown in expanded state */}
          {searchBarState === "expanded" && !isFullScreenSearch && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSearchBarState("collapsed");
                setSearchQuery("");
                setExpandedSearchActive(false);
                if (searchInputRef.current) {
                  searchInputRef.current.blur();
                }
              }}
              className="p-1 ml-1 text-[#9370DB]"
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile-optimized animation and keyboard handling styles */}
      <style jsx global>{`
        /* Animation styles */
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fullscreen-search-enter {
          animation: slideUp 0.3s ease-out forwards;
          will-change: transform, opacity;
          transform-origin: center bottom;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* Keyboard visibility fixes */
        @media screen and (max-height: 500px) {
          /* When keyboard is visible (viewport height decreases) */
          .search-bottom-bar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background-color: rgba(247, 242, 234, 0.95) !important;
            z-index: 9999 !important;
            border-top: 1px solid #a7cfe8;
            padding-bottom: env(safe-area-inset-bottom, 8px) !important;
          }

          /* Add padding to content so nothing is hidden under the search bar */
          .fullscreen-search-enter .overflow-y-auto {
            padding-bottom: 80px !important;
          }
        }

        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          .search-bottom-bar {
            position: fixed !important;
            bottom: 0 !important;
            z-index: 9999 !important;
          }
        }
      `}</style>

      {/* Full screen search interface with keyboard handling */}
      {isFullScreenSearch && (
        <div
          className="fixed inset-0 z-50 flex flex-col fullscreen-search-enter"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #c7e2f0, #c5cfd6, #d6d3cf, #e4d6c6, #f4e4ca)",
          }}
        >
          {/* Search header - fixed at top */}
          <div className="flex items-center justify-between p-3 flex-shrink-0 bg-[#c7e2f0] sticky top-0 z-10">
            <div className="text-2xl font-medium px-4 text-black">Search</div>
            <button
              onClick={() => {
                setIsFullScreenSearch(false);
                setSearchTerm("");
                setSearchQuery("");
                setSearchBarState("collapsed");
                setExpandedSearchActive(false);
              }}
              className="w-10 h-10 rounded-full bg-[#e2edf3] flex items-center justify-center text-black"
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content area - scrollable */}
          <div className="flex-1 overflow-y-auto pb-24">
            {/* Your search content here */}
            {!(
              searchTerm.length > 0 &&
              !searchLoading &&
              searchResults.length === 0 &&
              messageResults.length === 0
            ) && (
              <div className="px-4 py-2 text-sm text-gray-600 border-t border-b border-[#a7cfe8] flex-shrink-0">
                Contact and chat
              </div>
            )}
            {/* Rest of your search content */}
          </div>

          {/* Search bar - always visible above keyboard */}
          <div className="px-4 py-3 border-t border-[#a7cfe8] bg-[#e4d6c6] search-bottom-bar">
            <div
              className="flex items-center rounded-full overflow-hidden px-2 bg-[#fce0f0]"
              style={{
                boxShadow:
                  "0 0 0 1px #9370DB, 0 0 10px 1px rgba(147, 112, 219, 0.5)",
              }}
            >
              {/* Sparkles icon */}
              <div className="w-9 h-9 rounded-full bg-[#6b46c1] flex items-center justify-center mr-2 my-1">
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              {/* Text input field */}
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Tìm kiếm"
                className="flex-1 h-10 px-1 border-none focus:outline-none bg-transparent text-gray-800 text-base"
              />

              {/* Search icon */}
              <div className="flex items-center justify-center w-9 h-9 rounded-full">
                <Search className="w-5 h-5 text-[#9370DB]" />
              </div>

              {/* Clear button when there's text */}
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSearchQuery("");
                  }}
                  className="p-2 text-[#9370DB]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add transition styles for the fullscreen search */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fullscreen-search-enter {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>

      {/* Full screen search interface */}
      {isFullScreenSearch && (
        <div
          className="fixed inset-0 z-50 flex flex-col fullscreen-search-enter"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #c7e2f0, #c5cfd6, #d6d3cf, #e4d6c6, #f4e4ca)",
          }}
        >
          {/* Search header */}
          <div className="flex items-center justify-between p-3 flex-shrink-0">
            <div className="text-2xl font-medium px-4 text-black">Search</div>
            <button
              onClick={closeFullScreenSearch}
              className="w-10 h-10 rounded-full bg-[#e2edf3] flex items-center justify-center text-black"
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>
          {/* Contact and chat section header */}
          {!(
            searchTerm.length > 0 &&
            !searchLoading &&
            searchResults.length === 0 &&
            messageResults.length === 0
          ) && (
            <div className="px-4 py-2 text-sm text-gray-600 border-t border-b border-[#a7cfe8] flex-shrink-0">
              Contact and chat
            </div>
          )}
          {/* Search content with scroll */}
          <div className="flex-1 overflow-y-auto">
            {searchTerm.length > 0 ? (
              <div className="flex flex-col">
                {searchLoading ? (
                  <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6ab3e2] mb-4 mx-auto"></div>
                    <div className="text-gray-600">Đang tìm kiếm...</div>
                  </div>
                ) : searchResults.filter(
                    (user) =>
                      user.user_id !== client?.getUserId() &&
                      user.user_id !== userIdChatBot
                  ).length === 0 && messageResults.length === 0 ? (
                  // Thay đổi điều kiện để kiểm tra sau khi lọc, không phải trước khi lọc
                  <div className="text-center p-8">
                    <div className="bg-[#8ac2ee] w-16 h-16 rounded-md mx-auto mb-4 flex items-center justify-center">
                      <X size={32} className="text-[#4193cf]" />
                    </div>
                    <div className="text-black text-xl font-medium mb-2">
                      No results
                    </div>
                    <div className="text-gray-600">
                      No results found for
                      <span className="font-medium">{" " + searchTerm}</span>.
                      Please try a different search.
                    </div>
                  </div>
                ) : (
                  <div className="pb-4">
                    {searchResults
                      .filter(
                        (user) =>
                          user.user_id !== client?.getUserId() &&
                          user.user_id !== userIdChatBot
                      )
                      .map((user) => {
                        let onlineStatus = "offline";
                        let isOnline = user.isOnline || false;

                        if (user.lastSeen) {
                          isOnline =
                            Date.now() - new Date(user.lastSeen).getTime() <
                            2 * 60 * 1000;

                          onlineStatus = getDetailedStatus(user.lastSeen);
                        }

                        return (
                          <div
                            key={user.user_id}
                            className="flex items-center px-4 py-3 border-b border-[#a7cfe8]"
                            onClick={() => handleUserClick(user)}
                          >
                            <div className="w-12 h-12 mr-3 relative">
                              {renderAvatar(user)}
                            </div>
                            <div>
                              <div>
                                <div className="font-medium text-black">
                                  {user.display_name ||
                                    user.user_id ||
                                    "Người dùng"}
                                </div>
                                <div className="text-sm text-blue-500">
                                  {isOnline ? "online" : onlineStatus}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Hiển thị liên hệ theo hàng ngang */}
                {contacts.length > 0 && (
                  <div className="flex overflow-x-auto px-4 py-2 space-x-4 no-scrollbar">
                    {contacts
                      .slice(0, 10)
                      .map((contact) => renderContactItem(contact))}
                  </div>
                )}
                {/* Recent section */}
                <div className="flex justify-between items-center px-4 py-2 border-t border-b border-[#a7cfe8] mt-2 bg-[#d4e5f0]">
                  <span className="text-sm text-gray-500">Recent</span>
                  <button
                    className="text-sm text-red-500"
                    onClick={clearHistory}
                  >
                    Clear history
                  </button>
                </div>
                {/* Hiển thị danh sách recent searches */}
                {recentSearches.length > 0 ? (
                  <div className="pb-4">
                    {recentSearches.map((item) => {
                      let avatarUrl = item.processed_avatar_url;
                      if (!avatarUrl && item.avatar_url && client) {
                        try {
                          avatarUrl = getMxcAvatarUrl(item.avatar_url);
                          item.processed_avatar_url = avatarUrl;
                        } catch (error) {
                          console.error("Lỗi khi xử lý avatar URL:", error);
                        }
                      }

                      let statusText = "Recent search";
                      if (item.isOnline) {
                        statusText = "online";
                      } else if (item.lastSeen) {
                        statusText = getDetailedStatus(item.lastSeen);
                      }

                      return (
                        <div
                          key={item.user_id}
                          className="flex items-center px-4 py-3 border-b border-[#a7cfe8] cursor-pointer"
                          onClick={() => handleUserClick(item)}
                        >
                          <div className="w-12 h-12 mr-3">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={item.display_name || "User"}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                  console.error("Lỗi tải avatar:", avatarUrl);
                                  e.currentTarget.style.display = "none";
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const fallbackAvatar =
                                      document.createElement("div");
                                    fallbackAvatar.className =
                                      "w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center";
                                    fallbackAvatar.innerHTML = `<span class="text-orange-800 font-medium">${(
                                      item.display_name || "U"
                                    )
                                      .charAt(0)
                                      .toUpperCase()}</span>`;
                                    parent.appendChild(fallbackAvatar);
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <span className="text-orange-800 font-medium">
                                  {(item.display_name || item.user_id || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-black">
                              {item.display_name ||
                                item.user_id ||
                                "Unknown User"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {statusText}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pb-4">
                    {/* Demo data khi không có recent searches */}
                    <div className="flex items-center px-4 py-3 border-b border-[#a7cfe8] cursor-pointer">
                      <div className="w-12 h-12 bg-gray-300 rounded-full mr-3 flex items-center justify-center overflow-hidden">
                        <div className="flex flex-wrap w-full h-full">
                          <div className="w-1/2 h-1/2 bg-yellow-200"></div>
                          <div className="w-1/2 h-1/2 bg-blue-200"></div>
                          <div className="w-1/2 h-1/2 bg-green-200"></div>
                          <div className="w-1/2 h-1/2 bg-red-200"></div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-black">
                          Workspace group
                        </div>
                        <div className="text-sm text-gray-500">Group</div>
                      </div>
                    </div>
                    <div className="flex items-center px-4 py-3 border-b border-[#a7cfe8] cursor-pointer">
                      <div className="w-12 h-12 bg-blue-500 rounded-md mr-3 flex items-center justify-center text-white font-bold">
                        DOC
                      </div>
                      <div>
                        <div className="font-medium text-black">
                          Papercoin.docs
                        </div>
                        <div className="text-sm text-gray-500">File</div>
                      </div>
                    </div>
                    <div className="flex items-center px-4 py-3 border-b border-[#a7cfe8] cursor-pointer">
                      <div className="w-12 h-12 bg-gray-800 rounded-md mr-3 flex items-center justify-center overflow-hidden">
                        <div className="text-xs text-white font-bold">BDS</div>
                      </div>
                      <div>
                        <div className="font-medium text-black">BDS.Land</div>
                        <div className="text-sm text-blue-500">
                          https://website.com.vn
                        </div>
                        <div className="text-xs text-gray-500">Link</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Search input at bottom */}
          <div className="px-4 py-3 border-t border-[#a7cfe8] flex-shrink-0">
            {/* Thanh tìm kiếm với hiệu ứng hào quang */}
            <div
              className="relative flex items-center rounded-full overflow-hidden px-2 bg-[#fce0f0]"
              style={{
                boxShadow:
                  "0 0 0 1px #9370DB, 0 0 10px 1px rgba(147, 112, 219, 0.5)",
              }}
            >
              {/* Biểu tượng tròn bên trái */}
              <div className="w-9 h-9 rounded-full bg-[#6b46c1] flex items-center justify-center mr-2 my-1">
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              {/* Text input field */}
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm"
                className="flex-1 h-10 px-1 border-none focus:outline-none bg-transparent text-gray-800"
              />

              {/* Right search icon */}
              <div className="flex items-center justify-center w-9 h-9 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-[#9370DB]"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Clear button (only shown when there's text) */}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="p-2 text-[#9370DB]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
