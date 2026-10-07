import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-sm bg-[#141517] border border-zinc-800 rounded-xl p-5 text-zinc-100 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {isDestructive && (
            <div className="p-2 rounded-full bg-rose-950/50 border border-rose-800/40 text-rose-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`
              px-3.5 py-1.5 text-xs font-medium rounded transition-colors
              ${
                isDestructive
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-zinc-100 hover:bg-white text-zinc-950"
              }
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
