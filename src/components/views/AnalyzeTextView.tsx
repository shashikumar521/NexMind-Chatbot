import React, { useState } from "react";
import { AnalysisResult } from "../../types/nlp";
import { AnalysisBreakdownCard } from "../AnalysisBreakdownCard";
import { LoadingPipelineStepper } from "../LoadingPipelineStepper";
import { analyzeTextAPI } from "../../services/apiService";
import { saveAnalysisToHistory, toggleSaveAnalysis } from "../../services/storageService";

interface AnalyzeTextViewProps {
  onInspectAnalysis: (analysis: AnalysisResult) => void;
}

const TEXT_TEMPLATES = [
  {
    name: "Customer Review (Mixed)",
    text: "The app interface is gorgeous and the insights are super sharp! But it crashed twice when uploading a 5MB CSV file. If this gets fixed, it's definitely a 5-star tool.",
  },
  {
    name: "Billing Complaint (Urgent)",
    text: "I have contacted support three times regarding billing invoice #4920 being debited twice. Nobody has resolved the dispute and our account has been locked. This is unacceptable service and requires immediate manager intervention before we initiate a chargeback.",
  },
  {
    name: "Status Follow-up",
    text: "I applied for an internship two weeks ago but haven't received any update. Could you please let me know if my application is still being considered?",
  },
  {
    name: "Engineering Commendation",
    text: "Just wanted to congratulate your engineering squad! The new BERT v2 integration reduced our response categorization latency down to 28ms while keeping recall above 99%. Stellar work.",
  },
];

export const AnalyzeTextView: React.FC<AnalyzeTextViewProps> = () => {
  const [inputText, setInputText] = useState<string>(TEXT_TEMPLATES[0].text);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const handleAnalyze = async (textOverride?: string) => {
    const text = (textOverride !== undefined ? textOverride : inputText).trim();
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

    const step1 = setTimeout(() => setLoadingStep(1), 200);
    const step2 = setTimeout(() => setLoadingStep(2), 400);
    const step3 = setTimeout(() => setLoadingStep(3), 600);
    const step4 = setTimeout(() => setLoadingStep(4), 850);

    try {
      const result = await analyzeTextAPI({
        text,
        inputType: "text",
      });

      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);

      setLoadingStep(5);
      saveAnalysisToHistory(result);
      setAnalysis(result);

      setTimeout(() => {
        setIsLoading(false);
        clearInterval(clockInterval);
        document.getElementById("text-analysis-result")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } catch (err: any) {
      clearInterval(clockInterval);
      setIsLoading(false);
      setErrorMessage(err.message || "NexMind couldn't complete the analysis. Please try again.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      handleAnalyze(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="px-space-md lg:px-margin py-space-lg flex flex-col gap-space-xl max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
            Semantic Text Extraction Workbench
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            NexMind Demo Analysis · Local NLP Engine
          </span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
          Analyze Text
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          Paste customer reviews, support transcripts, Slack threads, or arbitrary feedback to decompose complete holistic sentiment, intention, tone, and action urgency.
        </p>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-space-sm bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/15">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider pl-space-xs">
          Sample Templates:
        </span>
        {TEXT_TEMPLATES.map((tmpl, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputText(tmpl.text);
              handleAnalyze(tmpl.text);
            }}
            className="px-space-md py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-outline-variant/20 transition-all"
          >
            {tmpl.name}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-space-sm rounded-lg bg-error-container/30 border border-error/40 text-error flex items-center justify-between text-body-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-on-surface-variant hover:text-on-surface">
            ✕
          </button>
        </div>
      )}

      {/* Input Workbench */}
      <div className="bg-surface-container-low rounded-2xl p-space-lg shadow-xl border border-outline-variant/15 space-y-space-md">
        <div className="flex items-center justify-between">
          <label className="font-label-md text-label-md uppercase tracking-wider text-outline">
            Raw Text Payload
          </label>
          <div className="flex items-center gap-space-sm">
            <label className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface cursor-pointer font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Upload Document</span>
              <input type="file" accept=".txt,.eml,.json" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={() => setInputText("")}
              className="text-on-surface-variant hover:text-error font-label-sm text-label-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="relative rounded-xl bg-surface-container-lowest p-space-xs border border-outline-variant/20 focus-within:ring-1 focus-within:ring-primary-container focus-within:shadow-[0_0_24px_-4px_rgba(6,182,212,0.35)] transition-all">
          <textarea
            rows={8}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste customer message, review, or ticket here..."
            className="w-full bg-transparent p-space-md text-on-surface font-body-md text-body-md placeholder:text-outline outline-none resize-y leading-relaxed font-mono"
          />

          <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container-low/70 rounded-lg border-t border-outline-variant/10 text-body-sm text-on-surface-variant">
            <span>
              {charCount.toLocaleString()} chars · {wordCount.toLocaleString()} words
            </span>
            <span className="text-primary-fixed">Encoding: UTF-8</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            disabled={isLoading}
            onClick={() => handleAnalyze()}
            className="flex items-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-headline-sm hover:brightness-110 active:scale-[0.98] shadow-[0_0_20px_-3px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[20px] ${isLoading ? "animate-spin" : ""}`}>
              {isLoading ? "progress_activity" : "auto_awesome"}
            </span>
            <span>{isLoading ? "Processing Pipeline..." : "Analyze with NexMind"}</span>
          </button>
        </div>
      </div>

      {/* Loading & Output */}
      {isLoading && <LoadingPipelineStepper currentStep={loadingStep} elapsedTime={elapsedTime} />}

      {analysis && !isLoading && (
        <div id="text-analysis-result">
          <AnalysisBreakdownCard
            analysis={analysis}
            onToggleSave={toggleSaveAnalysis}
            isSaved={analysis.isSaved}
          />
        </div>
      )}
    </div>
  );
};
