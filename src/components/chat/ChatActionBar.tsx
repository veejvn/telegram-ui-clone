export default function ChatActionBar({
  selectedCount,
  onReadAll,
  onArchive,
  onDelete,
}: {
  selectedCount: number;
  onReadAll: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/50 border-t border-gray-200 px-4 pt-3 pb-8 z-[60] backdrop-blur-sm">
      <div className="flex w-full max-w-md mx-auto justify-between gap-2">
        <button
          className={`rounded-full h-[42px] flex items-center justify-center whitespace-nowrap px-4 backdrop-blur-sm
            ${
              selectedCount < 2
                ? "text-gray-400 bg-gray-100/80 border border-gray-200"
                : "text-[#026AE0] bg-white/70 shadow-sm"
            }`}
          disabled={selectedCount < 2}
          onClick={onReadAll}
          style={{
            fontFamily:
              "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: "160%",
            minWidth: "82px",
          }}
        >
          Read all
        </button>

        <button
          className={`rounded-full h-[42px] flex items-center justify-center whitespace-nowrap px-4 backdrop-blur-sm
            ${
              selectedCount === 0
                ? "text-gray-400 bg-gray-100/80 border border-gray-200"
                : "text-[#026AE0] bg-white/70 shadow-sm"
            }`}
          disabled={selectedCount === 0}
          onClick={onArchive}
          style={{
            fontFamily:
              "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: "160%",
            minWidth: "80px",
          }}
        >
          Archive
        </button>

        <button
          className={`rounded-full h-[42px] flex items-center justify-center whitespace-nowrap px-4 backdrop-blur-sm
            ${
              selectedCount === 0
                ? "text-gray-400 bg-gray-100/80 border border-gray-200"
                : "text-[#FF434E] bg-white/70 shadow-sm"
            }`}
          disabled={selectedCount === 0}
          onClick={onDelete}
          style={{
            fontFamily:
              "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: "160%",
            minWidth: "100px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
          Delete{selectedCount > 0 ? `(${selectedCount})` : ""}
        </button>
      </div>
    </div>
  );
}
