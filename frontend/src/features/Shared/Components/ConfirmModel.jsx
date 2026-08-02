import React from "react";

const ConfirmModal = ({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Remove",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(27,28,26,0.5)" }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#fbf9f6] max-w-sm w-full p-8 shadow-xl"
      >
        <h3 className="font-serif text-2xl text-[#1b1c1a] mb-3">{title}</h3>
        <p className="text-sm text-[#7A6E63] leading-relaxed mb-8">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-medium border border-[#d0c5b5] text-[#7A6E63] hover:border-[#745a27] hover:text-[#745a27] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-medium bg-[#ba1a1a] text-white hover:bg-[#8f1414] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? "Removing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
