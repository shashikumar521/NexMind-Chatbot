import React, { useState } from "react";
import { AnalysisResult } from "../types/nlp";
import {
  downloadReportAsPDF,
  downloadReportAsTXT,
  copyFullReportToClipboard,
} from "../services/reportExportService";

interface AnalysisBreakdownCardProps {
  analysis: AnalysisResult;
  onToggleSave?: (id: string) => void;
  isSaved?: boolean;
  onNewAnalysis?: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export const AnalysisBreakdownCard: React.FC<AnalysisBreakdownCardProps> = ({
  analysis,
  onToggleSave,
  isSaved = false,
  onNewAnalysis,
  onBack,
  showBack = false,
}) => {
  const [copyReportLabel, setCopyReportLabel] = useState<string>("Copy Report");
  const [copiedAction, setCopiedAction] = useState<boolean>(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState<boolean>(false);
  const [isInputExpanded, setIsInputExpanded] = useState<boolean>(false);
  const [activeReplyTab, setActiveReplyTab] = useState<"executive" | "technical" | "concise">("executive");
  const [replyCopied, setReplyCopied] = useState<boolean>(false);

  // Copy Full Report
  const handleCopyReport = async () => {
    const success = await copyFullReportToClipboard(analysis);
    if (success) {
      setCopyReportLabel("Report copied ✓");
      setTimeout(() => setCopyReportLabel("Copy Report"), 2500);
    }
  };

  // Copy Recommended Action
  const handleCopyAction = () => {
    navigator.clipboard.writeText(analysis.suggestedAction);
    setCopiedAction(true);
    setTimeout(() => setCopiedAction(false), 2000);
  };

  // Copy Suggested Reply
  const handleCopyReply = (text: string) => {
    navigator.clipboard.writeText(text);
    setReplyCopied(true);
    setTimeout(() => setReplyCopied(false), 2000);
  };

  // Classification styling
  const getClassificationBadge = () => {
    const label = analysis.classification.label.toUpperCase();
    if (label === "GOOD" || label === "EXCELLENT") {
      return (
        <span className="px-space-sm py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-headline-sm text-headline-sm font-bold flex items-center gap-1.5 border border-emerald-500/20">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {label}
        </span>
      );
    }
    if (label === "CRITICAL" || label === "ESCALATE" || label === "BAD") {
      return (
        <span className="px-space-sm py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-headline-sm text-headline-sm font-bold flex items-center gap-1.5 border border-rose-500/20">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {label}
        </span>
      );
    }
    return (
      <span className="px-space-sm py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-headline-sm text-headline-sm font-bold flex items-center gap-1.5 border border-amber-500/20">
        <span className="material-symbols-outlined text-[18px]">info</span>
        {label}
      </span>
    );
  };

  // Urgency styling
  const getUrgencyBadge = () => {
    const level = analysis.urgency.level.toUpperCase();
    if (level === "CRITICAL" || level === "HIGH") {
      return (
        <span className="px-space-sm py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-label-md text-label-md font-semibold flex items-center gap-1.5 border border-rose-500/20">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          {level}
        </span>
      );
    }
    if (level === "MEDIUM") {
      return (
        <span className="px-space-sm py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-label-md text-label-md font-semibold flex items-center gap-1.5 border border-amber-500/20">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          {level}
        </span>
      );
    }
    return (
      <span className="px-space-sm py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-label-md text-label-md font-semibold flex items-center gap-1.5 border border-sky-500/20">
        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
        {level}
      </span>
    );
  };

  const sentimentPct = Math.round(analysis.sentiment.confidence * 100);

  return (
    <div className="rounded-2xl bg-surface-container-low p-space-md sm:p-space-lg lg:p-space-xl shadow-xl space-y-space-lg border border-outline-variant/30 transition-colors duration-200">
      {/* 1. REPORT HEADER (Sticky/Prominent Toolbar) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md pb-space-md border-b border-outline-variant/30">
        <div className="space-y-1">
          <div className="flex items-center gap-space-sm flex-wrap">
            {showBack && onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-body-sm font-medium mr-1 transition-colors"
                title="Back to Previous View"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back</span>
              </button>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold tracking-wide uppercase">
              NexMind Analysis Report
            </span>
            <span className="text-on-surface-variant font-mono text-body-sm">
              #{analysis.id}
            </span>
          </div>

          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Semantic Intelligence Synthesis
          </h2>

          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant flex-wrap pt-0.5">
            <span>
              <strong>Analyzed on:</strong> {new Date(analysis.timestamp).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} at {new Date(analysis.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong>Analysis Type:</strong> <span className="capitalize">{analysis.inputType}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-primary font-medium">Local NLP Mode</span>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
          {/* Download Report Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed hover:text-on-primary-fixed shadow-sm transition-all"
              title="Download Full Report"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download Report</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-surface-container-high rounded-xl p-1.5 shadow-2xl z-40 border border-outline-variant/30 animate-in fade-in">
                <button
                  onClick={() => {
                    downloadReportAsPDF(analysis);
                    setShowDownloadMenu(false);
                  }}
                  className="w-full text-left px-space-sm py-2 rounded-lg hover:bg-surface-container text-on-surface flex items-center gap-2 font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">picture_as_pdf</span>
                  <div>
                    <div className="font-semibold">Download PDF</div>
                    <div className="text-[11px] text-on-surface-variant">Formatted executive document</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    downloadReportAsTXT(analysis);
                    setShowDownloadMenu(false);
                  }}
                  className="w-full text-left px-space-sm py-2 rounded-lg hover:bg-surface-container text-on-surface flex items-center gap-2 font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">description</span>
                  <div>
                    <div className="font-semibold">Download TXT</div>
                    <div className="text-[11px] text-on-surface-variant">Clean structured text file</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Copy Report Button */}
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-outline-variant/30 transition-colors"
            title="Copy complete analysis report to clipboard"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">
              {copyReportLabel.includes("✓") ? "check" : "content_copy"}
            </span>
            <span>{copyReportLabel}</span>
          </button>

          {/* Save Analysis Button */}
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(analysis.id)}
              className={`flex items-center gap-1.5 px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-colors border ${
                isSaved || analysis.isSaved
                  ? "bg-primary-container text-on-primary-container font-semibold border-primary/30"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface border-outline-variant/30"
              }`}
              title={isSaved || analysis.isSaved ? "Saved in Bookmarks" : "Save this analysis report"}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSaved || analysis.isSaved ? "bookmark" : "bookmark_border"}
              </span>
              <span>{isSaved || analysis.isSaved ? "Saved" : "Save"}</span>
            </button>
          )}

          {/* New Analysis Button */}
          {onNewAnalysis && (
            <button
              onClick={onNewAnalysis}
              className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-outline-variant/30 transition-colors"
              title="Start a new analysis"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">New Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. ORIGINAL SUBMITTED INPUT SECTION */}
      <section className="bg-surface-container/70 rounded-xl p-space-md border border-outline-variant/20 space-y-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">input</span>
            <span className="font-label-md text-label-md font-semibold text-on-surface uppercase tracking-wider">
              Original Input
            </span>
            <span className="text-body-sm text-on-surface-variant font-mono">
              ({analysis.inputText.length} chars · ~{analysis.inputText.split(/\s+/).filter(Boolean).length} words)
            </span>
          </div>
          <button
            onClick={() => setIsInputExpanded(!isInputExpanded)}
            className="text-body-sm text-primary hover:underline font-medium"
          >
            {isInputExpanded ? "Collapse" : "Expand text"}
          </button>
        </div>
        <div
          className={`font-body-md text-body-md text-on-surface/90 whitespace-pre-wrap leading-relaxed bg-surface-container-low/80 p-space-sm rounded-lg border border-outline-variant/20 font-mono text-[13px] ${
            isInputExpanded ? "max-h-none" : "max-h-32 overflow-y-auto"
          }`}
        >
          {analysis.inputText}
        </div>
      </section>

      {/* EMAIL SPECIFIC METADATA & PURPOSE (If Email Input) */}
      {analysis.inputType === "email" && analysis.emailSpecific && (
        <section className="bg-surface-container/70 rounded-xl p-space-md border border-outline-variant/20 space-y-space-md">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">mail</span>
              <span className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider">
                Email Header &amp; Purpose Information
              </span>
            </div>
            <span className="px-space-xs py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
              {analysis.emailSpecific.readingTime}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
            <div className="p-space-xs bg-surface-container-low rounded-lg border border-outline-variant/20">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
                From Sender
              </span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium truncate block">
                {analysis.emailSpecific.from || "Not specified"}
              </span>
            </div>
            <div className="p-space-xs bg-surface-container-low rounded-lg border border-outline-variant/20">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
                To Recipient
              </span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium truncate block">
                {analysis.emailSpecific.to || "Not specified"}
              </span>
            </div>
            <div className="p-space-xs bg-surface-container-low rounded-lg border border-outline-variant/20">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
                Subject Line
              </span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium truncate block">
                {analysis.emailSpecific.subject || "No Subject"}
              </span>
            </div>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded-lg border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-primary font-bold block">
                Email Main Purpose
              </span>
              <span className="font-body-md text-body-md text-on-surface font-medium">
                {analysis.emailSpecific.mainPurpose}
              </span>
            </div>
            {analysis.emailSpecific.deadline !== "Not detected" && (
              <div className="shrink-0 px-space-sm py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20 text-body-sm font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">alarm</span>
                <span>Deadline: {analysis.emailSpecific.deadline}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. SECTION 1: EXECUTIVE SUMMARY */}
      <section className="bg-surface-container/60 rounded-xl p-space-md sm:p-space-lg border border-outline-variant/20 space-y-space-xs">
        <div className="flex items-center gap-space-xs text-primary font-semibold font-label-md text-label-md uppercase tracking-wider">
          <span className="material-symbols-outlined text-[20px]">summarize</span>
          <span>1. Executive Summary</span>
        </div>
        <p className="font-body-lg text-body-lg text-on-surface leading-relaxed pt-1">
          {analysis.summary}
        </p>
      </section>

      {/* 4. SECTION 2 & 3: OVERALL CLASSIFICATION & SENTIMENT ANALYSIS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        {/* Classification */}
        <div className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 flex flex-col justify-between space-y-space-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                2. Overall Classification
              </span>
              <span className="text-body-sm text-on-surface-variant font-mono">
                {analysis.sentiment.confidenceAvailable === false ? "" : `${sentimentPct}% Confidence`}
              </span>
            </div>
            <div className="mt-space-sm flex items-center gap-space-sm">
              {getClassificationBadge()}
            </div>
          </div>
          <div className="pt-space-xs border-t border-outline-variant/15 text-body-sm text-on-surface-variant">
            <strong className="text-on-surface">Classification Reason:</strong> {analysis.classification.reason}
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 flex flex-col justify-between space-y-space-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                3. Sentiment Analysis
              </span>
              <span className="text-body-sm text-on-surface-variant font-mono">
                Polarity: {analysis.sentiment.polarity >= 0 ? `+${analysis.sentiment.polarity.toFixed(2)}` : analysis.sentiment.polarity.toFixed(2)}
              </span>
            </div>
            <div className="mt-space-sm flex items-center justify-between">
              <span className="font-headline-md text-headline-md font-bold text-on-surface">
                {analysis.sentiment.label}
              </span>
              <span className="font-mono text-body-md text-primary font-bold">
                {analysis.sentiment.confidenceAvailable === false ? "" : `${sentimentPct}%`}
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden mt-space-xs">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  analysis.sentiment.label === "Positive"
                    ? "bg-emerald-500"
                    : analysis.sentiment.label === "Negative"
                    ? "bg-rose-500"
                    : "bg-sky-500"
                }`}
                style={{ width: `${analysis.sentiment.confidenceAvailable === false ? 50 : sentimentPct}%` }}
              ></div>
            </div>
          </div>
          <div className="pt-space-xs border-t border-outline-variant/15 text-body-sm text-on-surface-variant font-mono">
            {analysis.sentiment.confidenceAvailable === false ? (
              <span className="text-amber-500 font-sans">Confidence unavailable in Local NLP Mode</span>
            ) : (
              <span>{analysis.sentiment.visualBar || `${analysis.sentiment.label} [Score: ${sentimentPct}%]`}</span>
            )}
          </div>
        </div>
      </section>

      {/* 5. SECTION 4 & 5: TONE ANALYSIS & INTENT ANALYSIS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        {/* Tone Analysis */}
        <div className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 flex flex-col justify-between space-y-space-sm">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              4. Tone Analysis
            </span>
            <div className="mt-space-sm flex items-baseline gap-space-sm">
              <span className="font-headline-md text-headline-md font-bold text-on-surface">
                {analysis.tone.primary}
              </span>
              <span className="text-body-sm text-on-surface-variant">
                ({analysis.tone.subTone})
              </span>
            </div>
          </div>
          <div className="pt-space-xs border-t border-outline-variant/15 text-body-sm text-on-surface-variant">
            <strong className="text-on-surface">Tone Explanation:</strong> {analysis.tone.reason || "Determined through phrasing structure and key emotional indicators."}
          </div>
        </div>

        {/* Intent Analysis */}
        <div className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 flex flex-col justify-between space-y-space-sm">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              5. Intent Analysis
            </span>
            <div className="mt-space-sm flex items-baseline gap-space-sm">
              <span className="font-headline-md text-headline-md font-bold text-primary">
                {analysis.intent.primary}
              </span>
              <span className="text-body-sm text-on-surface-variant">
                {analysis.intent.secondary ? `+ ${analysis.intent.secondary}` : ""}
              </span>
            </div>
          </div>
          <div className="pt-space-xs border-t border-outline-variant/15 text-body-sm text-on-surface-variant">
            <strong className="text-on-surface">Intent Rationale:</strong> {analysis.intent.explanation || "Identified based on semantic action clauses and objective objectives."}
          </div>
        </div>
      </section>

      {/* 6. SECTION 6: URGENCY LEVEL */}
      <section className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 space-y-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
            6. Urgency Level
          </span>
          <span className="text-body-sm text-on-surface-variant font-medium">
            Target SLA: {analysis.urgency.sla}
          </span>
        </div>
        <div className="flex items-center gap-space-sm pt-1">
          {getUrgencyBadge()}
          <span className="font-body-md text-body-md text-on-surface">
            “{analysis.urgency.reason}”
          </span>
        </div>
      </section>

      {/* 7. SECTION 7: KEY POINTS */}
      <section className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 space-y-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
            7. Key Points &amp; Keywords
          </span>
          <span className="text-body-sm text-on-surface-variant">
            {analysis.keywords.length} terms extracted
          </span>
        </div>

        {analysis.groupedKeywords ? (
          <div className="space-y-space-xs">
            {analysis.groupedKeywords.topics.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-label-sm text-on-surface-variant font-semibold min-w-24">Topics:</span>
                {analysis.groupedKeywords.topics.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface font-body-sm text-body-sm border border-outline-variant/20">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {analysis.groupedKeywords.technologies.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-label-sm text-on-surface-variant font-semibold min-w-24">Technologies:</span>
                {analysis.groupedKeywords.technologies.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-body-sm text-body-sm border border-sky-500/20">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {analysis.groupedKeywords.people.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-label-sm text-on-surface-variant font-semibold min-w-24">People/Roles:</span>
                {analysis.groupedKeywords.people.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-body-sm text-body-sm border border-indigo-500/20">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {analysis.groupedKeywords.organizations.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-label-sm text-on-surface-variant font-semibold min-w-24">Organizations:</span>
                {analysis.groupedKeywords.organizations.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-body-sm text-body-sm border border-purple-500/20">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {analysis.groupedKeywords.dates.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-label-sm text-on-surface-variant font-semibold min-w-24">Dates/Time:</span>
                {analysis.groupedKeywords.dates.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-body-sm text-body-sm border border-amber-500/20">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {analysis.groupedKeywords.other.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-label-sm text-on-surface-variant font-semibold min-w-24">Key Terms:</span>
                {analysis.groupedKeywords.other.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface font-body-sm text-body-sm border border-outline-variant/20">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((k, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface font-body-sm text-body-sm border border-outline-variant/20">
                {k.term}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 8. SECTION 8 & 9: POSITIVE & NEGATIVE POINTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        {/* Positive Points */}
        <div className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 space-y-space-sm">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-label-md text-label-md font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">thumb_up</span>
            <span>8. Positive Points</span>
          </div>
          {analysis.positivePoints && analysis.positivePoints.length > 0 && !analysis.positivePoints[0].includes("No explicit positive") ? (
            <ul className="space-y-1.5 font-body-md text-body-md text-on-surface">
              {analysis.positivePoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant italic">
              No significant positive points detected.
            </p>
          )}
        </div>

        {/* Negative Points */}
        <div className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 space-y-space-sm">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-label-md text-label-md font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>9. Negative Points</span>
          </div>
          {analysis.negativePoints && analysis.negativePoints.length > 0 && !analysis.negativePoints[0].includes("No friction") ? (
            <ul className="space-y-1.5 font-body-md text-body-md text-on-surface">
              {analysis.negativePoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-500 mt-1 font-bold">✕</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant italic">
              No significant negative points detected.
            </p>
          )}
        </div>
      </section>

      {/* 10. SECTION 10: RECOMMENDED ACTION */}
      <section className="bg-surface-container-high/80 rounded-xl p-space-md sm:p-space-lg border border-primary/20 space-y-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
            <span className="font-label-md text-label-md font-bold text-primary uppercase tracking-wider">
              10. Recommended Action
            </span>
          </div>
          <button
            onClick={handleCopyAction}
            className="flex items-center gap-1 text-label-sm text-label-sm text-on-surface-variant hover:text-on-surface font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copiedAction ? "check" : "content_copy"}
            </span>
            <span>{copiedAction ? "Copied" : "Copy Action"}</span>
          </button>
        </div>
        <p className="font-body-lg text-body-lg text-on-surface font-semibold pt-1">
          {analysis.suggestedAction || "No specific action detected."}
        </p>
      </section>

      {/* 11. SECTION 11: EXTRACTED ENTITIES */}
      <section className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 space-y-space-sm">
        <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
          11. Extracted Entities
        </span>
        {analysis.entities && analysis.entities.length > 0 && analysis.entities[0].text !== "General Context" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-sm">
            {analysis.entities.map((ent, idx) => (
              <div key={idx} className="p-space-xs bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-primary block">
                    {ent.type}
                  </span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">
                    {ent.text}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-on-surface-variant">
                  {Math.round(ent.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-body-md text-body-md text-on-surface-variant italic">
            No significant entities detected.
          </p>
        )}
      </section>

      {/* 12. SECTION 12: MAIN TOPICS & KEY INFORMATION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        {/* Main Topics */}
        <div className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 space-y-space-sm">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
            12. Main Topics
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {(analysis.mainTopics || [analysis.mainTopic]).map((topic, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-body-md text-body-md font-medium border border-outline-variant/20">
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 space-y-space-sm">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
            Key Dates, Deadlines &amp; Contacts
          </span>
          {analysis.importantInfo && analysis.importantInfo.length > 0 ? (
            <div className="space-y-1.5 font-body-sm text-body-sm">
              {analysis.importantInfo.map((info, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-semibold text-primary min-w-32">{info.label}:</span>
                  <span className="text-on-surface">{info.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant italic">
              No specific isolated dates, deadlines, or contact details detected.
            </p>
          )}
        </div>
      </section>

      {/* 13. SECTION 13: NEXMIND INSIGHTS & FINAL ASSESSMENT */}
      <section className="bg-surface-container/60 rounded-xl p-space-md border border-outline-variant/20 space-y-space-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
            13. NexMind Insights
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm pt-1">
          {analysis.insights.map((ins, i) => (
            <div key={i} className="p-space-sm bg-surface-container-low rounded-lg border border-outline-variant/20">
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                {ins.label}
              </span>
              <span className="font-body-sm text-body-sm font-semibold text-on-surface mt-1 block">
                {ins.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 14. SECTION 14: FINAL ASSESSMENT */}
      <section className="bg-surface-container/80 rounded-xl p-space-md sm:p-space-lg border border-outline-variant/30 space-y-space-xs">
        <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold block">
          14. Final Assessment
        </span>
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20">
          <p className="font-body-md text-body-md text-on-surface leading-relaxed">
            {analysis.finalAssessment || `Classification: ${analysis.classification.label}. ${analysis.summary}`}
          </p>
        </div>
      </section>

      {/* SUGGESTED REPLIES (For Email or Direct Follow-up) */}
      {analysis.suggestedReplies && (
        <section className="bg-surface-container/60 rounded-xl p-space-md sm:p-space-lg border border-outline-variant/20 space-y-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider block">
                Suggested Response Drafts
              </span>
              <span className="text-body-sm text-on-surface-variant">
                Pre-formatted recipient responses tailored by tone
              </span>
            </div>

            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
              <button
                onClick={() => setActiveReplyTab("executive")}
                className={`px-3 py-1 rounded-md text-label-sm font-medium transition-colors ${
                  activeReplyTab === "executive"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Executive
              </button>
              <button
                onClick={() => setActiveReplyTab("technical")}
                className={`px-3 py-1 rounded-md text-label-sm font-medium transition-colors ${
                  activeReplyTab === "technical"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Technical
              </button>
              <button
                onClick={() => setActiveReplyTab("concise")}
                className={`px-3 py-1 rounded-md text-label-sm font-medium transition-colors ${
                  activeReplyTab === "concise"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Concise
              </button>
            </div>
          </div>

          <div className="relative bg-surface-container-low p-space-md rounded-xl border border-outline-variant/20">
            <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap leading-relaxed font-sans">
              {analysis.suggestedReplies[activeReplyTab]}
            </p>
            <div className="mt-space-sm pt-space-sm border-t border-outline-variant/15 flex justify-end">
              <button
                onClick={() => handleCopyReply(analysis.suggestedReplies![activeReplyTab])}
                className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-outline-variant/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {replyCopied ? "check" : "content_copy"}
                </span>
                <span>{replyCopied ? "Copied ✓" : "Copy Response"}</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
