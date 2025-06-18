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
    <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-center items-center px-4 py-3 z-50">
      <div className="flex w-full max-w-xs justify-between">
        <button
          className={`text-blue-500 font-semibold ${selectedCount < 2 ? "opacity-50" : ""}`}
          disabled={selectedCount < 2}
          onClick={onReadAll}
        >
          Read All
        </button>
        <button
          className={`text-gray-700 font-semibold ${selectedCount === 0 ? "opacity-50" : ""}`}
          disabled={selectedCount === 0}
          onClick={onArchive}
        >
          Archive
        </button>
        <button
          className={`text-red-500 font-semibold ${selectedCount === 0 ? "opacity-50" : ""}`}
          disabled={selectedCount === 0}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}