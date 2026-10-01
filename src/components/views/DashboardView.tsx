import React, { useState, useEffect } from "react";
import { AnalysisResult, UserProfile } from "../../types/nlp";
import { AnalysisBreakdownCard } from "../AnalysisBreakdownCard";
import { LoadingPipelineStepper } from "../LoadingPipelineStepper";
import { analyzeTextAPI } from "../../services/apiService";
import { saveAnalysisToHistory, toggleSaveAnalysis, deleteAnalysisFromHistory } from "../../services/storageService";
import { downloadReportAsPDF, downloadReportAsTXT } from "../../services/reportExportService";

interface DashboardViewProps {
  userProfile: UserProfile;
  analyses: AnalysisResult[];
  onInspectAnalysis: (analysis: AnalysisResult) => void;
  onNavigate: (page: any) => void;
  theme?: "light" | "dark";
  onSetTheme?: (theme: "light" | "dark") => void;
}

const PRESET_SAMPLES = {
  internship: {
    title: "Internship Inquiry",
    text: "Dear Hiring Team, I hope this email finds you well. I am following up on my Spring 2025 Machine Learning Internship submission from last Thursday. Could you please share a quick status update? I am happy to provide code samples or letters of reference if needed before Friday.",
  },
  complaint: {
    title: "Customer Complaint",
    text: "I have contacted support three times regarding billing invoice #4920 being debited twice. Nobody has resolved the dispute and our account has been locked. This is unacceptable service and requires immediate manager intervention before we initiate a chargeback.",
  },
  praise: {
    title: "Product Praise",
    text: "Just wanted to congratulate your engineering squad! The new BERT v2 integration reduced our response categorization latency down to 28ms while keeping recall above 99%. Stellar work.",
  },
  urgent: {
    title: "Urgent Support",
    text: "CRITICAL ALERT: Production API endpoint /v1/infer is throwing 504 gateway timeouts for all North American region users. We have triggered automated failover but need your primary cluster team on war room immediately.",
  },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  analyses,
  onInspectAnalysis,
  onNavigate,
  theme,
  onSetTheme,
}) => {
  const [inputText, setInputText] = useState<string>(PRESET_SAMPLES.internship.text);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(analyses[0] || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [recentFilter, setRecentFilter] = useState<"all" | "positive" | "action" | "urgent">("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadDropdownId, setDownloadDropdownId] = useState<string | null>(null);

  // Sync active analysis if list updates and none selected
  useEffect(() => {
    if (!activeAnalysis && analyses.length > 0) {
      setActiveAnalysis(analyses[0]);
    }
  }, [analyses, activeAnalysis]);

  // Calculate dynamic dashboard stats from actual stored analyses
  const totalCount = analyses.length;
  const positiveCount = analyses.filter((a) => a.sentiment.label === "Positive").length;
  const avgSentiment = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 76;

  // Character and word counting
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  // Run analysis workflow
  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = (textToAnalyze !== undefined ? textToAnalyze : inputText).trim();
    if (!text) {
      setErrorMessage("Please enter some text for NexMind to analyze.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    setLoadingStep(0);
    setElapsedTime(0);

    const startTime = Date.now();
    const clockInterval = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 50);

    // Progressive stage advancement
    const step1 = setTimeout(() => setLoadingStep(1), 200);
    const step2 = setTimeout(() => setLoadingStep(2), 400);
    const step3 = setTimeout(() => setLoadingStep(3), 650);
    const step4 = setTimeout(() => setLoadingStep(4), 900);

    try {
      const result = await analyzeTextAPI({
        text,
        inputType: text.includes("Subject:") || text.includes("@") ? "email" : "text",
      });

      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);

      setLoadingStep(5);
      saveAnalysisToHistory(result);
      setActiveAnalysis(result);

      setTimeout(() => {
        setIsLoading(false);
        clearInterval(clockInterval);
        document.getElementById("analysis-output-section")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } catch (err: any) {
      clearInterval(clockInterval);
      setIsLoading(false);
      setErrorMessage(err.message || "NexMind couldn't complete the analysis. Please try again.");
    }
  };

  // Preset loader
  const handleLoadPreset = (key: keyof typeof PRESET_SAMPLES) => {
    const sample = PRESET_SAMPLES[key];
    setInputText(sample.text);
    handleAnalyze(sample.text);
  };

  // File import (.txt, .eml, .json)
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(txt|eml|json|msg|log)$/i)) {
      setErrorMessage("This file type is not supported. Please upload a .txt or .eml document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      handleAnalyze(content);
    };
    reader.readAsText(file);
  };

  // Filter recent analyses stream
  const filteredRecent = analyses.filter((item) => {
    if (recentFilter === "positive") return item.sentiment.label === "Positive";
    if (recentFilter === "urgent") return item.urgency.level === "High" || item.urgency.level === "Critical";
    if (recentFilter === "action")
      return item.classification.label === "ESCALATE" || item.classification.label === "CRITICAL" || item.classification.label === "BAD";
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full px-space-md lg:px-margin pb-space-xl overflow-hidden">
        {/* Decorative ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-48 left-10 w-80 h-80 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* 1. Top Welcome Banner & KPI Stats Ribbon */}
        <header className="pt-space-md pb-space-lg flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm border border-outline-variant/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Local NLP Mode · NexMind Demo Analysis
              </div>

              {/* Working Light / Dark Theme Control */}
              {onSetTheme && (
                <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-surface-container border border-outline-variant/30 text-label-sm">
                  <button
                    onClick={() => onSetTheme("light")}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-all ${
                      theme === "light"
                        ? "bg-surface-container-low text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    title="Switch to Light Mode"
                  >
                    <span>☀️</span>
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => onSetTheme("dark")}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-all ${
                      theme === "dark" || (theme !== "light" && document.documentElement.classList.contains("dark"))
                        ? "bg-surface-container-high text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    title="Switch to Dark Mode"
                  >
                    <span>🌙</span>
                    <span>Dark</span>
                  </button>
                </div>
              )}
            </div>

            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
              Hi, {userProfile.name} <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              What would you like <span className="text-primary font-semibold">NexMind</span> to understand today?
              <span className="block text-body-sm text-primary-fixed-dim mt-0.5">
                Running in Local Mode. AI API integration can be enabled later.
              </span>
            </p>
          </div>

          {/* Quick KPI Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm bg-surface-container-low p-space-sm rounded-xl shadow-lg border border-outline-variant/15">
            {/* Total Analyses */}
            <div className="bg-surface-container/80 p-space-sm rounded-lg flex flex-col justify-between border border-outline-variant/10">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Total Analyses
                </span>
                <span className="material-symbols-outlined text-primary text-[18px]">query_stats</span>
              </div>
              <div className="mt-space-xs flex items-baseline gap-space-xs">
                {totalCount === 0 ? (
                  <span className="text-body-sm text-on-surface-variant font-medium">No analyses yet</span>
                ) : (
                  <>
                    <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                      {totalCount.toLocaleString()}
                    </span>
                    <span className="font-label-sm text-label-sm text-primary">Saved</span>
                  </>
                )}
              </div>
            </div>

            {/* Avg Sentiment */}
            <div className="bg-surface-container/80 p-space-sm rounded-lg flex flex-col justify-between border border-outline-variant/10">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Avg Sentiment
                </span>
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  sentiment_satisfied
                </span>
              </div>
              <div className="mt-space-xs flex items-baseline gap-space-xs">
                {totalCount === 0 ? (
                  <span className="text-body-sm text-on-surface-variant font-medium">No analyses yet</span>
                ) : (
                  <>
                    <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                      {avgSentiment}%
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary-fixed">Positive</span>
                  </>
                )}
              </div>
            </div>

            {/* Inference Speed */}
            <div className="bg-surface-container/80 p-space-sm rounded-lg flex flex-col justify-between border border-outline-variant/10">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Processing Speed
                </span>
                <span className="material-symbols-outlined text-tertiary text-[18px]">bolt</span>
              </div>
              <div className="mt-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  Instant<span className="text-body-sm font-normal"> / local</span>
                </span>
              </div>
            </div>

            {/* NLP Mode */}
            <div className="bg-surface-container/80 p-space-sm rounded-lg flex flex-col justify-between border border-outline-variant/10">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Engine Architecture
                </span>
                <span className="material-symbols-outlined text-primary-container text-[18px]">
                  verified
                </span>
              </div>
              <div className="mt-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  Deterministic
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Local NLP</span>
              </div>
            </div>
          </div>
        </header>

        {/* 2. Hero Action Card */}
        <section className="relative rounded-2xl bg-surface-container-low p-space-lg lg:p-space-xl overflow-hidden shadow-2xl mb-space-xl border border-outline-variant/15">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="max-w-3xl space-y-space-sm">
              <div className="flex flex-wrap items-center gap-space-sm">
                <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                  NexMind AI Analyzer
                </h2>
                <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-primary-container/20 text-primary font-label-md text-label-md shadow-[0_0_16px_-3px_rgba(6,182,212,0.35)] border border-primary/30">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  Local NLP Engine
                </span>
                <span className="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm border border-outline-variant/20">
                  Zero External API Dependency
                </span>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Analyze complex customer emails, support tickets, reviews, and ambiguous conversations using our local multi-task processing pipeline with instant semantic decomposition.
              </p>
              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                <button
                  className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-surface font-headline-sm text-headline-sm hover:opacity-95 shadow-[0_0_20px_-3px_rgba(6,182,212,0.45)] transition-all"
                  onClick={() => {
                    const el = document.getElementById("quick-analyzer-input");
                    el?.focus();
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  <span>Start Quick Analysis</span>
                </button>
                <button
                  className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container text-primary font-headline-sm text-headline-sm hover:bg-surface-container-high transition-all border border-outline-variant/20"
                  onClick={() => handleLoadPreset("internship")}
                >
                  <span className="material-symbols-outlined text-[20px]">science</span>
                  <span>Try Demo Sample</span>
                </button>
                <button
                  className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
                  onClick={() => onNavigate("analysis-history")}
                >
                  <span className="material-symbols-outlined text-[20px]">history</span>
                  <span className="font-headline-sm text-headline-sm">View History</span>
                </button>
              </div>
            </div>

            {/* Neural Pipeline Badge */}
            <div className="hidden xl:flex flex-col gap-space-xs p-space-md rounded-xl bg-surface-container/90 backdrop-blur-md shadow-xl min-w-[280px] border border-outline-variant/15">
              <div className="flex items-center justify-between pb-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Neural Pipeline
                </span>
                <span className="font-label-sm text-label-sm text-primary font-semibold">Active</span>
              </div>
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">Syntactic Parsing</span>
                  <span className="text-primary font-mono">0.99</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[99%]"></div>
                </div>

                <div className="flex items-center justify-between text-body-sm font-body-sm pt-space-xs">
                  <span className="text-on-surface-variant">Intent Classification</span>
                  <span className="text-secondary font-mono">0.94</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[94%]"></div>
                </div>

                <div className="flex items-center justify-between text-body-sm font-body-sm pt-space-xs">
                  <span className="text-on-surface-variant">Tone Vectorization</span>
                  <span className="text-tertiary font-mono">0.97</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full w-[97%]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Quick Analysis Input Card */}
        <section
          id="quick-analyzer-card"
          className="rounded-2xl bg-surface-container-low p-space-lg lg:p-space-xl shadow-2xl mb-space-xl border border-outline-variant/15 transition-all"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm mb-space-md">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">terminal</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                  Analyze Anything
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                Paste an email, message, review, complaint or any textual document below for live neural extraction.
              </p>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mr-1">
                Presets:
              </span>
              {(Object.keys(PRESET_SAMPLES) as Array<keyof typeof PRESET_SAMPLES>).map((key) => (
                <button
                  key={key}
                  onClick={() => handleLoadPreset(key)}
                  className="px-space-sm py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-outline-variant/20 transition-colors"
                >
                  {PRESET_SAMPLES[key].title}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-space-sm p-space-sm rounded-lg bg-error-container/30 border border-error/40 text-error flex items-center justify-between text-body-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-on-surface-variant hover:text-on-surface">
                ✕
              </button>
            </div>
          )}

          {/* Textarea Container */}
          <div className="relative rounded-xl bg-surface-container-lowest p-space-xs border border-outline-variant/20 focus-within:ring-1 focus-within:ring-primary-container focus-within:shadow-[0_0_24px_-4px_rgba(6,182,212,0.35)] transition-all">
            <textarea
              id="quick-analyzer-input"
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste an email, message, review, complaint or any text here..."
              className="w-full bg-transparent p-space-md text-on-surface font-body-md text-body-md placeholder:text-outline outline-none resize-y leading-relaxed font-mono selection:bg-primary-container selection:text-on-primary-container"
            ></textarea>

            {/* Active telemetry footer */}
            <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container-low/70 rounded-lg border-t border-outline-variant/10">
              <div className="flex flex-wrap items-center gap-space-md text-body-sm font-body-sm text-on-surface-variant">
                <span className="font-mono">
                  {charCount.toLocaleString()} / 10,000 characters
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="font-mono hidden sm:inline">
                  {wordCount.toLocaleString()} words
                </span>
                <span className="hidden md:inline">·</span>
                <span className="hidden md:inline text-primary-fixed">Encoding: UTF-8</span>
              </div>

              <div className="flex items-center gap-space-xs">
                <label className="flex items-center gap-1 px-space-sm py-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                  <span className="font-label-sm text-label-sm hidden sm:inline">Import Document</span>
                  <input
                    type="file"
                    accept=".txt,.eml,.json,.msg"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setInputText("")}
                  className="px-space-sm py-1 rounded text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors font-label-sm text-label-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-space-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
              <span>
                Mode: <strong className="text-on-surface font-medium">Deep Neural Synthesizer</strong>
              </span>
            </div>

            <button
              id="run-analyze-btn"
              disabled={isLoading}
              onClick={() => handleAnalyze()}
              className="flex items-center justify-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-headline-sm hover:brightness-110 active:scale-[0.98] shadow-[0_0_20px_-3px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isLoading ? "animate-spin" : ""
                }`}
              >
                {isLoading ? "progress_activity" : "auto_awesome"}
              </span>
              <span>{isLoading ? "Processing..." : "Analyze with NexMind"}</span>
            </button>
          </div>
        </section>

        {/* 4. Live Analysis Pipeline Output */}
        <section id="analysis-output-section" className="space-y-space-lg">
          {isLoading && (
            <LoadingPipelineStepper currentStep={loadingStep} elapsedTime={elapsedTime} />
          )}

          {activeAnalysis && !isLoading && (
            <AnalysisBreakdownCard
              analysis={activeAnalysis}
              onToggleSave={toggleSaveAnalysis}
              isSaved={activeAnalysis.isSaved}
            />
          )}
        </section>

        {/* 5. Recent Analyses Feed Table */}
        <section className="mt-space-xl space-y-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                Recent Analyses Stream
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Inspect recent team extractions and sentiment logs
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-space-xs">
              <button
                onClick={() => setRecentFilter("all")}
                className={`px-space-md py-1 rounded-full font-label-md text-label-md transition-colors ${
                  recentFilter === "all"
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                All ({analyses.length})
              </button>
              <button
                onClick={() => setRecentFilter("positive")}
                className={`px-space-md py-1 rounded-full font-label-md text-label-md transition-colors ${
                  recentFilter === "positive"
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Positive
              </button>
              <button
                onClick={() => setRecentFilter("action")}
                className={`px-space-md py-1 rounded-full font-label-md text-label-md transition-colors ${
                  recentFilter === "action"
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Needs Action
              </button>
              <button
                onClick={() => setRecentFilter("urgent")}
                className={`px-space-md py-1 rounded-full font-label-md text-label-md transition-colors ${
                  recentFilter === "urgent"
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Urgent
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-xl bg-surface-container-low overflow-hidden shadow-xl border border-outline-variant/15">
            {filteredRecent.length === 0 ? (
              <div className="p-space-xl text-center space-y-space-xs">
                <span className="material-symbols-outlined text-[36px] text-outline">history</span>
                <p className="font-headline-sm text-headline-sm text-on-surface">No analyses match this filter</p>
                <p className="text-body-sm text-on-surface-variant">Try analyzing new text or switching the filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-md text-body-md">
                  <thead className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider border-b border-outline-variant/10">
                    <tr>
                      <th className="py-space-sm px-space-md font-semibold">Subject / Message Excerpt</th>
                      <th className="py-space-sm px-space-md font-semibold">Classification</th>
                      <th className="py-space-sm px-space-md font-semibold">Sentiment</th>
                      <th className="py-space-sm px-space-md font-semibold">Intent</th>
                      <th className="py-space-sm px-space-md font-semibold">Time</th>
                      <th className="py-space-sm px-space-md font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredRecent.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-surface-container/50 transition-colors cursor-pointer"
                        onClick={() => onInspectAnalysis(item)}
                      >
                        <td className="py-space-md px-space-md max-w-xs sm:max-w-md">
                          <div className="font-headline-sm text-headline-sm text-on-surface font-medium truncate">
                            "{item.inputText.slice(0, 75)}..."
                          </div>
                          <div className="text-body-sm font-body-sm text-on-surface-variant truncate">
                            {item.metadata?.from
                              ? `From: ${item.metadata.from}`
                              : `ID: #${item.id} · ${item.summary.slice(0, 50)}...`}
                          </div>
                        </td>
                        <td className="py-space-md px-space-md whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                              item.classification.label === "GOOD" || item.classification.label === "EXCELLENT"
                                ? "bg-primary/20 text-primary"
                                : item.classification.label === "ESCALATE" || item.classification.label === "CRITICAL"
                                ? "bg-error-container text-error"
                                : "bg-secondary-container/40 text-secondary"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.classification.label === "GOOD" || item.classification.label === "EXCELLENT"
                                  ? "bg-primary"
                                  : item.classification.label === "ESCALATE" || item.classification.label === "CRITICAL"
                                  ? "bg-error"
                                  : "bg-secondary"
                              }`}
                            ></span>
                            {item.classification.label}
                          </span>
                        </td>
                        <td className="py-space-md px-space-md whitespace-nowrap">
                          <span className="font-mono text-primary font-bold">
                            {Math.round(item.sentiment.confidence * 100)}%
                          </span>{" "}
                          {item.sentiment.label}
                        </td>
                        <td className="py-space-md px-space-md text-on-surface-variant whitespace-nowrap">
                          {item.intent.primary}
                        </td>
                        <td className="py-space-md px-space-md text-on-surface-variant font-mono text-body-sm font-body-sm whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-space-md px-space-md text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="p-1.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                              title="Inspect Details"
                              onClick={() => onInspectAnalysis(item)}
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button
                              className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                              title="Delete"
                              onClick={() => deleteAnalysisFromHistory(item.id)}
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
