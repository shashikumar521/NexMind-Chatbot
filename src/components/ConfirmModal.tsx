import React, { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md bg-surface-container rounded-2xl p-space-lg shadow-2xl border border-outline-variant/30 space-y-space-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-space-xs text-error">
          <span className="material-symbols-outlined text-[24px]">warning</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{title}</h3>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-space-sm pt-space-xs">
          <button
            onClick={onCancel}
            className="px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-space-md py-space-xs rounded-lg bg-error text-on-error font-label-md text-label-md hover:opacity-90 transition-all font-semibold shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
