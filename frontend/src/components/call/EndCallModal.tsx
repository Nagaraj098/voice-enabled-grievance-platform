"use client";

export default function EndCallModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 text-white p-6 rounded-xl shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-2">End Call?</h2>
        <p className="text-sm text-gray-400">
          Are you sure you want to end this call?
        </p>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-1 border border-gray-600 rounded"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-1 bg-red-500 rounded text-white"
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
}