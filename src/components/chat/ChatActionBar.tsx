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
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-gray-300 dark:border-gray-700 px-4 py-5 z-[9999] shadow-md">
      <div className="flex w-full max-w-xs mx-auto justify-between items-center text-base font-medium text-gray-600 dark:text-gray-400">
        <button
          className={`${selectedCount < 2 ? "opacity-50" : ""}`}
          disabled={selectedCount < 2}
          onClick={onReadAll}
        >
          Read All
        </button>
        <button
          className={`${selectedCount === 0 ? "opacity-50" : "text-blue-500"}`}
          disabled={selectedCount === 0}
          onClick={onArchive}
        >
          Archive
        </button>
        <button
          className={`${selectedCount === 0 ? "opacity-50" : "text-blue-500"}`}
          disabled={selectedCount === 0}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
