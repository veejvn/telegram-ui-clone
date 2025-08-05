import { useRef, useEffect, useState } from "react";
import { X, Search, Sparkles } from "lucide-react";
import { getDetailedStatus } from "@/utils/chat/presencesHelpers";
import styles from "./FullScreenSearch.module.css";

interface FullScreenSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onClose: () => void;
  searchLoading: boolean;
  searchResults: any[];
  messageResults: any[];
  contacts: any[];
  recentSearches: any[];
  handleUserClick: (user: any) => void;
  clearHistory: () => void;
  renderAvatar: (user: any) => React.ReactNode;
  renderContactItem: (contact: any) => React.ReactNode;
  getMxcAvatarUrl: (url: string | null) => string | null;
  clientUserId?: string;
  userIdChatBot?: string;
}

const FullScreenSearch = ({
  searchTerm,
  setSearchTerm,
  searchQuery,
  setSearchQuery,
  onClose,
  searchLoading,
  searchResults,
  messageResults,
  contacts,
  recentSearches,
  handleUserClick,
  clearHistory,
  renderAvatar,
  renderContactItem,
  getMxcAvatarUrl,
  clientUserId,
  userIdChatBot,
}: FullScreenSearchProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [initialViewportHeight, setInitialViewportHeight] = useState(0);

  useEffect(() => {
    // Check if device is mobile
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      "ontouchstart" in window ||
      window.innerWidth <= 768;

    // Only initialize keyboard detection on mobile devices
    if (!isMobile) {
      return;
    }

    // Store initial viewport height
    const initialHeight = window.visualViewport?.height || window.innerHeight;
    setInitialViewportHeight(initialHeight);

    console.log("Mobile device detected, initialHeight:", initialHeight);

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDifference = initialHeight - currentHeight;

        // Debug log for testing on real device
        console.log("Viewport change:", {
          initialHeight,
          currentHeight,
          heightDifference,
          isKeyboard: heightDifference > 150,
          userAgent: navigator.userAgent.slice(0, 50) + "...",
        });

        // More precise keyboard detection
        const isKeyboardVisible = heightDifference > 150;
        setIsKeyboardOpen(isKeyboardVisible);

        // Calculate actual keyboard height
        if (isKeyboardVisible) {
          setKeyboardHeight(heightDifference);
        } else {
          setKeyboardHeight(0);
        }
      }
    };

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;

      // Fallback for browsers without visualViewport
      const isKeyboardVisible = heightDifference > 150;
      setIsKeyboardOpen(isKeyboardVisible);

      if (isKeyboardVisible) {
        setKeyboardHeight(heightDifference);
      } else {
        setKeyboardHeight(0);
      }
    };

    // Use visualViewport if available (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
    } else {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportChange
        );
      } else {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  useEffect(() => {
    // Set CSS custom property for keyboard height
    if (isKeyboardOpen) {
      document.documentElement.style.setProperty(
        "--keyboard-height",
        `${keyboardHeight}px`
      );

      console.log("Keyboard opened, height:", keyboardHeight);
    } else {
      document.documentElement.style.removeProperty("--keyboard-height");
      console.log("Keyboard closed");
    }

    return () => {
      document.documentElement.style.removeProperty("--keyboard-height");
    };
  }, [isKeyboardOpen, keyboardHeight]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${
        styles.fullscreenSearchEnter
      } bg-gradient-to-b from-[#c2e3f5] to-[#fbe9cc] ${
        isKeyboardOpen ? styles.keyboardActive : ""
      }`}
    >
      {/* Search header */}
      <div className="flex items-center justify-between p-3 flex-shrink-0 bg-[#c7e2f0] sticky top-0 z-10">
        <div className="text-2xl font-medium px-4 text-black">Search</div>
        <button
          onClick={onClose}
          className="h-10 w-10 flex items-center justify-center text-black/70 border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
          aria-label="Close search"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content area */}
      <div
        className={`flex-1 overflow-y-auto pb-24 ${styles.searchContentArea}`}
      >
        {!(
          searchTerm.length > 0 &&
          !searchLoading &&
          searchResults.length === 0 &&
          messageResults.length === 0
        ) && (
          <div className="px-4 py-2 text-sm text-[#121212] border-t border-b border-[#a7cfe8] flex-shrink-0 bg-white/30 backdrop-blur-[2px]">
            Contact and chat
          </div>
        )}

        {searchTerm.length > 0 ? (
          <div className="flex flex-col">
            {searchLoading ? (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6ab3e2] mb-4 mx-auto"></div>
                <div className="text-gray-600">Đang tìm kiếm...</div>
              </div>
            ) : searchResults.filter(
                (user) =>
                  user.user_id !== clientUserId &&
                  user.user_id !== userIdChatBot
              ).length === 0 && messageResults.length === 0 ? (
              <div className="text-center p-8">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  {/* Icon */}
                  <div className="mb-4">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 49 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        opacity="0.4"
                        d="M34.3652 2.5H14.6348C12.7299 2.49999 11.2088 2.49998 9.98027 2.60035C8.72024 2.7033 7.63648 2.91927 6.64108 3.42645C5.0417 4.24137 3.74137 5.5417 2.92645 7.14108C2.41927 8.13648 2.2033 9.22024 2.10035 10.4803C1.99998 11.7088 1.99999 13.2299 2 15.1348V24.8652C1.99999 26.7701 1.99998 28.2912 2.10035 29.5197C2.2033 30.7798 2.41927 31.8635 2.92645 32.8589C3.74137 34.4583 5.0417 35.7586 6.64108 36.5736C7.63648 37.0807 8.72024 37.2967 9.98027 37.3997C11.2088 37.5 12.7298 37.5 14.6346 37.5H34.3653C36.2701 37.5 37.7912 37.5 39.0197 37.3997C40.2798 37.2967 41.3635 37.0807 42.3589 36.5736C43.9583 35.7586 45.2586 34.4583 46.0736 32.8589C46.5807 31.8635 46.7967 30.7798 46.8997 29.5197C47 28.2912 47 26.7702 47 24.8654V15.1347C47 13.2299 47 11.7088 46.8997 10.4803C46.7967 9.22024 46.5807 8.13648 46.0736 7.14108C45.2586 5.5417 43.9583 4.24137 42.3589 3.42645C41.3635 2.91927 40.2798 2.7033 39.0197 2.60035C37.7912 2.49998 36.2701 2.49999 34.3652 2.5Z"
                        fill="#4193cf"
                      />
                      <path
                        d="M31.5607 27.0603C30.9749 27.6461 30.0251 27.6461 29.4393 27.0603L24.5001 22.121L19.5606 27.0605C18.9749 27.6463 18.0251 27.6463 17.4393 27.0605C16.8535 26.4747 16.8535 25.525 17.4393 24.9392L22.3788 19.9997L17.4393 15.0603C16.8536 14.4745 16.8536 13.5247 17.4393 12.939C18.0251 12.3532 18.9749 12.3532 19.5607 12.939L24.5001 17.8784L29.4393 12.9392C30.0251 12.3534 30.9749 12.3534 31.5606 12.9392C32.1464 13.525 32.1464 14.4747 31.5606 15.0605L26.6214 19.9997L31.5607 24.939C32.1464 25.5247 32.1464 26.4745 31.5607 27.0603Z"
                        fill="#4193cf"
                      />
                      <path
                        d="M30 37.4998H19V39.9998C19 41.3806 17.8807 42.4998 16.5 42.4998H15.5C14.6716 42.4998 14 43.1714 14 43.9998C14 44.8283 14.6716 45.4998 15.5 45.4998H33.5C34.3284 45.4998 35 44.8283 35 43.9998C35 43.1714 34.3284 42.4998 33.5 42.4998H32.5C31.1193 42.4998 30 41.3806 30 39.9998V37.4998Z"
                        fill="#4193cf"
                      />
                    </svg>
                  </div>
                </div>

                <div className="text-black text-xl font-medium mb-2">
                  No results
                </div>
                <div className="text-gray-600">
                  No results found for
                  <span className="text-black font-medium">{` '${searchTerm}'`}</span>
                  . Please try a different search.
                </div>
              </div>
            ) : (
              <div className="pb-4">
                {searchResults
                  .filter(
                    (user) =>
                      user.user_id !== clientUserId &&
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
                          <div className="font-medium text-black">
                            {user.display_name || user.user_id || "Người dùng"}
                          </div>
                          <div className="text-sm text-blue-500">
                            {isOnline ? "online" : onlineStatus}
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
            {/* Contacts row */}
            {contacts.length > 0 && (
              <div className="flex overflow-x-auto px-4 py-2 space-x-4 no-scrollbar">
                {contacts
                  .slice(0, 10)
                  .map((contact) => renderContactItem(contact))}
              </div>
            )}

            {/* Recent searches */}
            <div className="flex justify-between items-center px-4 py-2 border-t border-b border-[#a7cfe8] mt-2 bg-white/30 backdrop-blur-[2px]">
              <span className="text-sm text-[#121212] font-medium">Recent</span>
              <button
                className="text-sm text-red-500 font-medium"
                onClick={clearHistory}
              >
                Clear history
              </button>
            </div>

            {recentSearches.length > 0 ? (
              <div className="pb-4">
                {/* Recent searches list */}
                {recentSearches.map((item) => (
                  /* Content of each recent search item */
                  <div
                    key={item.user_id}
                    className="flex items-center px-4 py-3 border-b border-[#a7cfe8] cursor-pointer"
                    onClick={() => handleUserClick(item)}
                  >
                    {/* Search item content */}
                    <div className="w-12 h-12 mr-3 relative">
                      {renderAvatar(item)}
                    </div>
                    <div>
                      <div className="font-medium text-black">
                        {item.display_name || item.user_id || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.isOnline
                          ? "online"
                          : item.lastSeen
                          ? getDetailedStatus(item.lastSeen)
                          : "Recent search"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pb-4"></div>
            )}
          </div>
        )}
      </div>

      {/* Search bar - fixed at the bottom, won't move with keyboard */}
      <div
        className={`fixed bottom-0 left-0 right-0 px-4 py-3 backdrop-blur-sm z-50 ${
          styles.searchBarContainer
        } ${isKeyboardOpen ? styles.keyboardActive : ""}`}
      >
        <div
          className={`flex items-center rounded-full overflow-hidden px-2 bg-[#fce0f0] ${styles.searchInputWrapper}`}
        >
          {/* Sparkles icon with fixed dimensions */}
          <div className="min-w-[36px] w-9 h-9 rounded-full bg-[#6b46c1] flex items-center justify-center mr-2 my-1 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          {/* Search input*/}
          <input
            ref={searchInputRef}
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchQuery(e.target.value);
            }}
            onFocus={() => {
              // Only handle keyboard detection on mobile devices
              const isMobile =
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                  navigator.userAgent
                ) ||
                "ontouchstart" in window ||
                window.innerWidth <= 768;

              if (!isMobile) {
                console.log("Desktop detected, skipping keyboard detection");
                return;
              }

              // For mobile devices, trigger manual keyboard detection
              setTimeout(() => {
                const currentHeight =
                  window.visualViewport?.height || window.innerHeight;
                const heightDifference = initialViewportHeight - currentHeight;

                console.log("Mobile focus event:", {
                  initialHeight: initialViewportHeight,
                  currentHeight,
                  heightDifference,
                  userAgent: navigator.userAgent.slice(0, 50) + "...",
                });

                if (heightDifference > 100) {
                  setIsKeyboardOpen(true);
                  setKeyboardHeight(heightDifference);
                } else {
                  // Fallback for Android Chrome - force keyboard detection on focus
                  const isAndroid = /Android/i.test(navigator.userAgent);
                  if (isAndroid) {
                    setIsKeyboardOpen(true);
                    setKeyboardHeight(320); // Standard Android keyboard height
                  }
                }
              }, 300);
            }}
            onBlur={() => {
              // Only handle keyboard detection on mobile devices
              const isMobile =
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                  navigator.userAgent
                ) ||
                "ontouchstart" in window ||
                window.innerWidth <= 768;

              if (!isMobile) {
                return;
              }

              // Reset keyboard state when input loses focus
              setTimeout(() => {
                setIsKeyboardOpen(false);
                setKeyboardHeight(0);
              }, 100);
            }}
            placeholder="Tìm kiếm"
            className="flex-1 h-10 px-1 border-none focus:outline-none bg-transparent text-gray-800 text-base"
          />

          {/* Search icon */}
          <div className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0">
            <Search className="w-5 h-5 text-[#121212]" />
          </div>

          {/* Clear button */}
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSearchQuery("");
              }}
              className="p-2 text-[#121212] flex-shrink-0"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Keyboard handling styles are now in FullScreenSearch.module.css */}
    </div>
  );
};

export default FullScreenSearch;
