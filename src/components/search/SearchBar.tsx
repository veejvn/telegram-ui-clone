import { useRef, useState, useEffect } from "react";
import { Search, Sparkles, X } from "lucide-react";

interface SearchBarProps {
  onSearchFocus: () => void;
  onQueryChange: (query: string) => void;
  searchQuery: string;
}

const SearchBar = ({
  onSearchFocus,
  onQueryChange,
  searchQuery,
}: SearchBarProps) => {
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchBarState, setSearchBarState] = useState("collapsed");
  const [expandedSearchActive, setExpandedSearchActive] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node) &&
        searchBarState === "expanded"
      ) {
        setSearchBarState("collapsed");
        onQueryChange("");
        setExpandedSearchActive(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchend", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [searchBarState, onQueryChange]);

  return (
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
            setTimeout(() => onSearchFocus(), 250);
          }
        }}
      >
        {/* Sparkles icon */}
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
          placeholder="Tìm kiếm"
          value={searchQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => {
            if (searchBarState === "collapsed") {
              setSearchBarState("expanded");
              setExpandedSearchActive(true);
              setTimeout(() => onSearchFocus(), 250);
            }
          }}
          readOnly={searchBarState === "collapsed"}
        />

        {/* Right search icon in collapsed state */}
        {searchBarState === "collapsed" && (
          <Search size={16} className="text-gray-500 min-w-[16px] ml-0.5" />
        )}

        {/* X button only shown in expanded state */}
        {searchBarState === "expanded" && !expandedSearchActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSearchBarState("collapsed");
              onQueryChange("");
              setExpandedSearchActive(false);
              if (searchInputRef.current) searchInputRef.current.blur();
            }}
            className="p-1 ml-1 text-[#9370DB]"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .fullscreen-search-enter {
          animation: fadeIn 0.25s ease-out forwards;
          will-change: opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .fullscreen-search-enter {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
