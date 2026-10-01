import React, { useState } from "react";
import { AnalysisResult } from "../../types/nlp";
import { toggleSaveAnalysis, deleteAnalysisFromHistory } from "../../services/storageService";
import { downloadReportAsPDF, downloadReportAsTXT } from "../../services/reportExportService";

interface HistoryViewProps {
  analyses: AnalysisResult[];
  onInspectAnalysis: (analysis: AnalysisResult) => void;
  onOpenConfirmModal: (opts: { title: string; message: string; onConfirm: () => void }) => void;
  onNavigate?: (page: any) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  analyses,
  onInspectAnalysis,
  onOpenConfirmModal,
  onNavigate,
}) => {
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "all" | "positive" | "neutral" | "negative" | "email" | "text"
  >("all");
  const [downloadDropdownId, setDownloadDropdownId] = useState<string | null>(null);

  const filteredAnalyses = analyses.filter((item) => {
    // Type/sentiment tab filter
    if (activeTab === "positive" && item.sentiment.label !== "Positive") return false;
    if (activeTab === "neutral" && item.sentiment.label !== "Neutral" && item.sentiment.label !== "Mixed")
      return false;
    if (activeTab === "negative" && item.sentiment.label !== "Negative") return false;
    if (activeTab === "email" && item.inputType !== "email") return false;
    if (activeTab === "text" && item.inputType !== "text") return false;

    // Search query filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchText = item.inputText.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchIntent = item.intent.primary.toLowerCase().includes(q);
      const matchSentiment = item.sentiment.label.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((k) => k.term.toLowerCase().includes(q));
      const matchEntities = item.entities.some((e) => e.text.toLowerCase().includes(q));
      return matchText || matchSummary || matchIntent || matchSentiment || matchKeywords || matchEntities;
    }

    return true;
  });

  const handleDelete = (id: string, excerpt: string) => {
    onOpenConfirmModal({
      title: "Delete Analysis Report",
      message: `Are you sure you want to permanently delete analysis #${id} ("${excerpt.slice(0, 45)}...")?`,
      onConfirm: () => {
        deleteAnalysisFromHistory(id);
      },
    });
  };

  return (
    <div className="px-space-md lg:px-margin py-space-lg flex flex-col gap-space-xl max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
              Analysis Registry · Local Storage
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {analyses.length} Total Reports
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
            Analysis History
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Review, download, search, and inspect past text, review, and email extractions with full report reconstruction.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Local Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/20">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-space-xs">
          {(
            [
              { id: "all", label: `All (${analyses.length})` },
              { id: "positive", label: "Positive" },
              { id: "neutral", label: "Neutral" },
              { id: "negative", label: "Negative" },
              { id: "email", label: "Email" },
              { id: "text", label: "Text" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-space-md py-1 rounded-full font-label-md text-label-md transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-on-primary font-semibold shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search text, intent, keywords..."
            className="w-full bg-surface-container pl-9 pr-3 py-1.5 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20"
          />
        </div>
      </div>

      {/* Analyses Stream / Cards */}
      {analyses.length === 0 ? (
        /* Empty State */
        <div className="bg-surface-container-low rounded-2xl p-space-xl text-center space-y-space-md border border-outline-variant/20 max-w-lg mx-auto my-space-lg">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto text-primary">
            <span className="material-symbols-outlined text-[36px]">history_edu</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              No analysis yet
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Enter a message, email or text to generate your first NexMind report.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("analyze-text")}
              className="px-space-lg py-space-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-all shadow-sm"
            >
              Start Analysis
            </button>
          )}
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="p-space-xl text-center space-y-space-xs bg-surface-container-low rounded-xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-[44px] text-on-surface-variant">search_off</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">No matching analyses</h3>
          <p className="text-body-sm text-on-surface-variant">
            No reports matching “{searchFilter}” in this filter category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {filteredAnalyses.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-surface-container-low p-space-md sm:p-space-lg shadow-md border border-outline-variant/20 flex flex-col justify-between gap-space-md hover:border-primary/40 transition-all group"
            >
              {/* Card Header */}
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface font-label-lg text-label-lg">
                      NexMind Analysis
                    </span>
                    <span className="text-primary font-mono text-body-sm font-semibold">
                      #{item.id}
                    </span>
                  </div>
                  <span className="text-[12px] font-mono text-on-surface-variant">
                    {new Date(item.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })} · {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Short Input Preview */}
                <p className="font-body-md text-body-md text-on-surface/90 line-clamp-2 leading-relaxed bg-surface-container/60 p-space-xs rounded-lg border border-outline-variant/15 text-[13px] font-mono">
                  "{item.inputText}"
                </p>
              </div>

              {/* Signals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-outline-variant/15">
                {/* Sentiment */}
                <div>
                  <span className="text-[10px] uppercase font-semibold text-on-surface-variant block">
                    Sentiment
                  </span>
                  <span className={`text-label-md font-bold ${
                    item.sentiment.label === "Positive"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : item.sentiment.label === "Negative"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-sky-600 dark:text-sky-400"
                  }`}>
                    {item.sentiment.label}
                  </span>
                </div>

                {/* Classification */}
                <div>
                  <span className="text-[10px] uppercase font-semibold text-on-surface-variant block">
                    Classification
                  </span>
                  <span className="text-label-md font-bold text-on-surface">
                    {item.classification.label}
                  </span>
                </div>

                {/* Intent */}
                <div>
                  <span className="text-[10px] uppercase font-semibold text-on-surface-variant block">
                    Intent
                  </span>
                  <span className="text-label-md font-medium text-on-surface truncate block">
                    {item.intent.primary}
                  </span>
                </div>

                {/* Urgency */}
                <div>
                  <span className="text-[10px] uppercase font-semibold text-on-surface-variant block">
                    Urgency
                  </span>
                  <span className={`text-label-md font-bold ${
                    item.urgency.level === "Critical" || item.urgency.level === "High"
                      ? "text-rose-600 dark:text-rose-400"
                      : item.urgency.level === "Medium"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-sky-600 dark:text-sky-400"
                  }`}>
                    {item.urgency.level}
                  </span>
                </div>
              </div>

              {/* Action Buttons: View Report, Download, Save, Delete */}
              <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/15">
                <div className="flex items-center gap-space-xs">
                  <button
                    onClick={() => onInspectAnalysis(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors shadow-sm"
                    title="Open Complete Analysis Report"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>View Report</span>
                  </button>

                  {/* Download Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setDownloadDropdownId(downloadDropdownId === item.id ? null : item.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-outline-variant/20 transition-colors"
                      title="Download Report"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>Download</span>
                      <span className="material-symbols-outlined text-[14px]">expand_more</span>
                    </button>

                    {downloadDropdownId === item.id && (
                      <div className="absolute left-0 bottom-full mb-1 w-36 bg-surface-container-high rounded-lg p-1 shadow-xl z-30 border border-outline-variant/30 animate-in fade-in">
                        <button
                          onClick={() => {
                            downloadReportAsPDF(item);
                            setDownloadDropdownId(null);
                          }}
                          className="w-full text-left px-2 py-1 rounded text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px] text-primary">picture_as_pdf</span>
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => {
                            downloadReportAsTXT(item);
                            setDownloadDropdownId(null);
                          }}
                          className="w-full text-left px-2 py-1 rounded text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px] text-secondary">description</span>
                          <span>TXT</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleSaveAnalysis(item.id)}
                    className={`p-1.5 rounded-lg transition-colors border ${
                      item.isSaved
                        ? "bg-primary-container text-on-primary-container border-primary/30"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-outline-variant/20"
                    }`}
                    title={item.isSaved ? "Saved" : "Save Analysis"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {item.isSaved ? "bookmark" : "bookmark_border"}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.inputText)}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-rose-500/20 text-on-surface-variant hover:text-rose-600 dark:hover:text-rose-400 border border-outline-variant/20 transition-colors"
                    title="Delete Analysis"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
