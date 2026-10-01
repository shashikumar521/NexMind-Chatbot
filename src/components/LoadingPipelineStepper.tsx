import React, { useEffect, useState } from "react";

interface LoadingPipelineStepperProps {
  currentStep: number; // 0 to 5
  elapsedTime: number; // in seconds
}

const STAGES = [
  "Reading your message...",
  "Understanding context...",
  "Extracting keywords...",
  "Detecting sentiment and intent...",
  "Generating insights...",
  "Analysis complete ✓",
];

export const LoadingPipelineStepper: React.FC<LoadingPipelineStepperProps> = ({
  currentStep,
  elapsedTime,
}) => {
  return (
    <div className="rounded-xl bg-surface-container-low p-space-lg shadow-xl space-y-space-md border border-outline-variant/20 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs text-primary font-headline-sm text-headline-sm">
          <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
          <span>{STAGES[Math.min(currentStep, STAGES.length - 1)]}</span>
        </div>
        <span className="font-mono text-body-sm font-body-sm text-primary-fixed">
          {elapsedTime.toFixed(2)}s
        </span>
      </div>

      {/* Progress Step Sequence */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-space-xs text-center font-label-sm text-label-sm">
        {STAGES.slice(0, 5).map((label, index) => {
          const isDone = currentStep > index;
          const isCurrent = currentStep === index;
          return (
            <div
              key={index}
              className={`p-space-xs rounded transition-all duration-300 flex items-center justify-center gap-1 ${
                isDone
                  ? "bg-primary-container text-on-primary-container font-semibold shadow-md"
                  : isCurrent
                  ? "bg-primary/20 text-primary border border-primary/50 animate-pulse font-semibold"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              <span>
                {index + 1}. {label.replace("...", "")}
              </span>
              {isDone && (
                <span className="material-symbols-outlined text-[14px]">check</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
