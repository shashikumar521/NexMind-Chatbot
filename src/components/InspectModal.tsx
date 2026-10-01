import React, { useEffect } from "react";
import { AnalysisResult } from "../types/nlp";
import { AnalysisBreakdownCard } from "./AnalysisBreakdownCard";
import { toggleSaveAnalysis } from "../services/storageService";

interface InspectModalProps {
  analysis: AnalysisResult | null;
  onClose: () => void;
}

export const InspectModal: React.FC<InspectModalProps> = ({ analysis, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-sm sm:p-space-lg bg-black/75 backdrop-blur-md animate-in fade-in">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-space-md sm:px-space-lg py-space-sm bg-surface-container flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              NexMind Report Viewer · #{analysis.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1 font-label-md text-label-md"
            title="Close (Esc)"
          >
            <span>Close</span>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-space-sm sm:p-space-md lg:p-space-lg overflow-y-auto space-y-space-md">
          <AnalysisBreakdownCard
            analysis={analysis}
            onToggleSave={toggleSaveAnalysis}
            isSaved={analysis.isSaved}
            showBack={true}
            onBack={onClose}
          />
        </div>
      </div>
    </div>
  );
};
