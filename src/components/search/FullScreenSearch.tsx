import { useRef } from "react";
import { X, Search, Sparkles } from "lucide-react";
import { getDetailedStatus } from "@/utils/chat/presencesHelpers";

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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col fullscreen-search-enter"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #c7e2f0, #c5cfd6, #d6d3cf, #e4d6c6, #f4e4ca)",
      }}
    >
      {/* Search header */}
      <div className="flex items-center justify-between p-3 flex-shrink-0 bg-[#c7e2f0] sticky top-0 z-10">
        <div className="text-2xl font-medium px-4 text-black">Search</div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#e2edf3] flex items-center justify-center text-black"
          aria-label="Close search"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto pb-24">
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
            <div className="flex justify-between items-center px-4 py-2 border-t border-b border-[#a7cfe8] mt-2 bg-[#d4e5f0]">
              <span className="text-sm text-gray-500">Recent</span>
              <button className="text-sm text-red-500" onClick={clearHistory}>
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
              <div className="pb-4">
                {/* Demo data for empty recent searches */}
                {/* Workspace group example */}
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

                {/* Document example */}
                <div className="flex items-center px-4 py-3 border-b border-[#a7cfe8] cursor-pointer">
                  <div className="w-12 h-12 bg-blue-500 rounded-md mr-3 flex items-center justify-center text-white font-bold">
                    DOC
                  </div>
                  <div>
                    <div className="font-medium text-black">Papercoin.docs</div>
                    <div className="text-sm text-gray-500">File</div>
                  </div>
                </div>

                {/* BDS example */}
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

          {/* Search input */}
          <input
            ref={searchInputRef}
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

          {/* Clear button */}
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSearchQuery("");
              }}
              className="p-2 text-[#9370DB]"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Keyboard handling styles */}
      <style jsx global>{`
        /* Keyboard visibility fixes */
        @media screen and (max-height: 500px) {
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

          .fullscreen-search-enter .overflow-y-auto {
            padding-bottom: 80px !important;
          }
        }

        @supports (-webkit-touch-callout: none) {
          .search-bottom-bar {
            position: fixed !important;
            bottom: 0 !important;
            z-index: 9999 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FullScreenSearch;
