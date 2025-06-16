export default function ChatActionBar({
  selectedCount,
  onReadAll,
  onArchive,
  onDelete,
  onDone,
}: {
  selectedCount: number;
  onReadAll: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onDone: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-between items-center px-4 py-3 z-50">
      <button className="text-blue-500 font-semibold" onClick={onDone}>
        Done
      </button>
      <div className="flex gap-8">
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