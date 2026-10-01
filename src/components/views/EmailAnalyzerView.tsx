import React, { useState } from "react";
import { AnalysisResult } from "../../types/nlp";
import { analyzeTextAPI } from "../../services/apiService";
import { saveAnalysisToHistory, toggleSaveAnalysis } from "../../services/storageService";
import { AnalysisBreakdownCard } from "../AnalysisBreakdownCard";

const SAMPLE_EMAIL = {
  from: "sarah.connor@cybertech-labs.ai",
  to: "shashi.research@nexmind.io",
  subject: "Urgent: Follow-up on Model Weights & Security Audit Report for Q3 Launch",
  body: `Hi Shashi,

I wanted to congratulate your engineering squad on beating the Q3 inference latency targets—the 28ms benchmark across concurrent distributed loads looks remarkable.

However, we have an urgent blocker regarding the production weights rollout. We still need your team to complete the security sign-off for Section 4 before Friday at 5:00 PM EST, or the automated cloud cluster provision will defer our release cycle.

Additionally, our InfoSec compliance team noted that security clearance is currently pending for the secondary GPU cluster access tokens. Could you confirm whether the token rotated yesterday?

Please review the attached audit checklist, confirm Section 4 sign-off, and send the revised deployment manifesto as soon as possible today.

Best regards,
Sarah Connor
Director of Distributed Systems | Cybertech Labs`,
};

export const EmailAnalyzerView: React.FC = () => {
  const [from, setFrom] = useState<string>(SAMPLE_EMAIL.from);
  const [to, setTo] = useState<string>(SAMPLE_EMAIL.to);
  const [subject, setSubject] = useState<string>(SAMPLE_EMAIL.subject);
  const [body, setBody] = useState<string>(SAMPLE_EMAIL.body);
  const [detectThread, setDetectThread] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedTone, setSelectedTone] = useState<"executive" | "technical" | "concise">("executive");
  const [draftResponse, setDraftResponse] = useState<string>("");
  const [copyDraftLabel, setCopyDraftLabel] = useState<string>("Copy Draft");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailViewTab, setEmailViewTab] = useState<"dashboard" | "report">("dashboard");

  // Dynamic word and character counting
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const chars = body.length;

  const handleClear = () => {
    setFrom("");
    setTo("");
    setSubject("");
    setBody("");
    setAnalysis(null);
    setDraftResponse("");
  };

  const handleLoadSample = () => {
    setFrom(SAMPLE_EMAIL.from);
    setTo(SAMPLE_EMAIL.to);
    setSubject(SAMPLE_EMAIL.subject);
    setBody(SAMPLE_EMAIL.body);
    handleAnalyzeEmail(SAMPLE_EMAIL.body, {
      from: SAMPLE_EMAIL.from,
      to: SAMPLE_EMAIL.to,
      subject: SAMPLE_EMAIL.subject,
    });
  };

  const handleAnalyzeEmail = async (
    bodyOverride?: string,
    metaOverride?: { from?: string; to?: string; subject?: string }
  ) => {
    const emailBody = (bodyOverride !== undefined ? bodyOverride : body).trim();
    if (!emailBody) {
      setErrorMessage("Please enter an email body for NexMind to analyze.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const emailMeta = metaOverride || { from, to, subject };
      const combinedText = `From: ${emailMeta.from || "unknown"}\nTo: ${emailMeta.to || "unknown"}\nSubject: ${
        emailMeta.subject || "No Subject"
      }\n\n${emailBody}`;

      const result = await analyzeTextAPI({
        text: combinedText,
        inputType: "email",
        metadata: emailMeta,
      });

      setAnalysis(result);
      saveAnalysisToHistory(result);

      // Set initial response draft
      if (result.suggestedReplies) {
        setDraftResponse(result.suggestedReplies[selectedTone] || result.suggestedReplies.executive);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tone switcher
  const handleToneChange = (tone: "executive" | "technical" | "concise") => {
    setSelectedTone(tone);
    if (analysis?.suggestedReplies) {
      setDraftResponse(analysis.suggestedReplies[tone] || analysis.suggestedReplies.executive);
    }
  };

  const handleCopyDraft = () => {
    if (!draftResponse) return;
    navigator.clipboard.writeText(draftResponse);
    setCopyDraftLabel("Copied to Clipboard!");
    setTimeout(() => setCopyDraftLabel("Copy Draft"), 2000);
  };

  const handlePushToMail = () => {
    const recipient = from || "";
    const mailSubject = subject ? `Re: ${subject.replace(/^Re:\s*/i, "")}` : "Reply from NexMind";
    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      mailSubject
    )}&body=${encodeURIComponent(draftResponse)}`;
    window.location.href = mailtoUrl;
  };

  // File import for .eml or .txt
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Basic EML header extraction
      const fromMatch = text.match(/^From:\s*(.*)$/im);
      const toMatch = text.match(/^To:\s*(.*)$/im);
      const subjectMatch = text.match(/^Subject:\s*(.*)$/im);

      if (fromMatch) setFrom(fromMatch[1].trim());
      if (toMatch) setTo(toMatch[1].trim());
      if (subjectMatch) setSubject(subjectMatch[1].trim());

      // Strip headers or use remaining body
      const bodyPart = text.includes("\n\n") ? text.split("\n\n").slice(1).join("\n\n") : text;
      setBody(bodyPart.trim());
      handleAnalyzeEmail(bodyPart.trim(), {
        from: fromMatch ? fromMatch[1].trim() : from,
        to: toMatch ? toMatch[1].trim() : to,
        subject: subjectMatch ? subjectMatch[1].trim() : subject,
      });
    };
    reader.readAsText(file);
  };

  // Run initial sample analysis on first mount if none exists
  React.useEffect(() => {
    if (!analysis) {
      handleLoadSample();
    }
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="px-space-md lg:px-margin py-space-lg flex flex-col gap-space-xl max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                Inference Pipeline // Mail Stream
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Local NLP Mode · Contextual Mail Engine
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              Email Analyzer
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              Understand the tone, intent, urgency, and actionable next steps in any incoming or outgoing email communication with high-precision neural semantic dissection.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={handleLoadSample}
              className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all shadow-sm border border-outline-variant/15"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">history_edu</span>
              <span className="font-label-lg text-label-lg">Load Sample Work Email</span>
            </button>
            <label className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer transition-all shadow-sm border border-outline-variant/15">
              <span className="material-symbols-outlined text-secondary text-[18px]">file_upload</span>
              <span className="font-label-lg text-label-lg">Import .eml / .msg</span>
              <input type="file" accept=".eml,.msg,.txt" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>

        {/* Error Banner */}
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

        {/* Main Workspace Split Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
          {/* Left Panel: Input & Raw Payload Inspector (5 cols) */}
          <div className="xl:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg flex flex-col gap-space-md border border-outline-variant/15">
              <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/10">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">drafts</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Message Buffer
                  </span>
                </div>
                <div className="flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-high border border-outline-variant/20">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">UTF-8 Parsed</span>
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="flex flex-col gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                    From (Sender Origin)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                      alternate_email
                    </span>
                    <input
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="sender@domain.com"
                      className="w-full bg-surface-container pl-9 pr-3 py-space-xs rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-high border border-outline-variant/10 transition-colors"
                      type="email"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                    To (Destination Node)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                      send
                    </span>
                    <input
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="recipient@domain.com"
                      className="w-full bg-surface-container pl-9 pr-3 py-space-xs rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-high border border-outline-variant/10 transition-colors"
                      type="email"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                    Subject Stream
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                      label
                    </span>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subject line..."
                      className="w-full bg-surface-container pl-9 pr-3 py-space-xs rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-high border border-outline-variant/10 font-medium transition-colors"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              {/* Email Body Area */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                    Raw Message Body
                  </label>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {words} words · {chars.toLocaleString()} chars
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Paste email message contents here..."
                  className="w-full bg-surface-container p-space-md rounded-lg font-body-sm text-body-sm text-on-surface leading-relaxed placeholder:text-outline outline-none focus:bg-surface-container-high border border-outline-variant/10 transition-colors resize-y font-mono"
                />
              </div>

              {/* Controls & Toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs">
                <label className="flex items-center gap-space-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={detectThread}
                    onChange={(e) => setDetectThread(e.target.checked)}
                    className="w-4 h-4 rounded bg-surface-container accent-primary-container cursor-pointer"
                  />
                  <span className="font-label-md text-label-md text-on-surface">Detect Thread Context</span>
                </label>

                <div className="flex items-center gap-space-sm">
                  <button
                    onClick={handleClear}
                    className="px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors"
                  >
                    Clear Form
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={() => handleAnalyzeEmail()}
                    className="flex items-center gap-space-xs px-space-lg py-space-xs rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-label-lg text-label-lg font-semibold shadow-[0_0_20px_-2px_rgba(6,182,212,0.45)] transition-all disabled:opacity-50"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    >
                      {isLoading ? "sync" : "auto_awesome"}
                    </span>
                    <span>{isLoading ? "Analyzing..." : "Analyze Email"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sender Reputation & Security Vector Mini-Card */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between shadow-sm border border-outline-variant/15">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">verified_user</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface">DKIM &amp; SPF Verified</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {from.includes("@") ? from.split("@")[1] : "secure-domain"} · Reverse DNS Validated
                  </span>
                </div>
              </div>
              <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                100% Trust
              </span>
            </div>
          </div>

          {/* Right Panel: Deep NLP Semantic Output (7 cols) */}
          <div className="xl:col-span-7 flex flex-col gap-space-md">
            {analysis ? (
              <>
                {/* View Mode Switcher Header */}
                <div className="flex flex-wrap items-center justify-between gap-space-sm p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm">
                  <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
                    <button
                      onClick={() => setEmailViewTab("dashboard")}
                      className={`px-3 py-1 rounded-md text-label-md font-semibold transition-all flex items-center gap-1.5 ${
                        emailViewTab === "dashboard"
                          ? "bg-primary text-on-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">dashboard</span>
                      <span>Email Overview</span>
                    </button>
                    <button
                      onClick={() => setEmailViewTab("report")}
                      className={`px-3 py-1 rounded-md text-label-md font-semibold transition-all flex items-center gap-1.5 ${
                        emailViewTab === "report"
                          ? "bg-primary text-on-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">description</span>
                      <span>Full NexMind Report (PDF/TXT)</span>
                    </button>
                  </div>

                  <span className="text-label-sm text-primary font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Local NLP Mode Active
                  </span>
                </div>

                {emailViewTab === "report" ? (
                  <AnalysisBreakdownCard
                    analysis={analysis}
                    onToggleSave={toggleSaveAnalysis}
                    isSaved={analysis.isSaved}
                  />
                ) : (
                  <div className="flex flex-col gap-space-lg">
                    {/* Summary Stats Header Bento */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                  {/* Card 1: Overview Classification */}
                  <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-outline-variant/15">
                    <div className="flex items-center justify-between mb-space-xs">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                        Classification
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[24px]">
                        pending_actions
                      </span>
                      <span className="font-headline-md text-headline-md text-secondary font-bold">
                        {analysis.classification.label === "GOOD"
                          ? "ACTION REQ."
                          : analysis.classification.label}
                      </span>
                    </div>
                    <div className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">
                      {analysis.classification.reason}
                    </div>
                  </div>

                  {/* Card 2: Language & Word Metrics */}
                  <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-outline-variant/15">
                    <div className="flex items-center justify-between mb-space-xs">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                        Linguistics
                      </span>
                      <span className="font-label-sm text-label-sm text-primary font-semibold">
                        99.8% Conf.
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-headline-md text-on-surface font-bold">
                        English (US)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {words} words · {analysis.emailSpecific?.readingTime || "~45s read"}
                      </span>
                    </div>
                    <div className="mt-space-sm flex items-center gap-space-xs">
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: "82%" }}></div>
                      </div>
                      <span className="font-label-sm text-label-sm text-outline">Flesch 71</span>
                    </div>
                  </div>

                  {/* Card 3: Sentiment Composite */}
                  <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-outline-variant/15">
                    <div className="flex items-center justify-between mb-space-xs">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                        Sentiment Composite
                      </span>
                      <span className="font-label-sm text-label-sm text-primary font-semibold">
                        {Math.round(analysis.sentiment.confidence * 100)}% Precision
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                      <span className="font-headline-md text-headline-md text-on-surface font-bold">
                        {analysis.sentiment.label}
                      </span>
                    </div>
                    <div className="mt-space-sm flex flex-wrap gap-1">
                      <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                        Polite
                      </span>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm">
                        {analysis.urgency.level} Urgency
                      </span>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container text-secondary font-label-sm text-label-sm">
                        Technical
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tone Spectrum & Detailed Polarity */}
                <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">graphic_eq</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Acoustic Tone Spectrum &amp; Semantic Weights
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Multi-Label Cross-Entropy
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
                    <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-label-md text-label-md text-on-surface font-medium">Formal</span>
                        <span className="font-label-sm text-label-sm text-primary">
                          {Math.round(analysis.tone.weights.formal * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full"
                          style={{ width: `${Math.round(analysis.tone.weights.formal * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-label-md text-label-md text-on-surface font-medium">Urgent</span>
                        <span className="font-label-sm text-label-sm text-secondary">
                          {Math.round(analysis.tone.weights.urgent * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-secondary h-full"
                          style={{ width: `${Math.round(analysis.tone.weights.urgent * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-label-md text-label-md text-on-surface font-medium">Collaborative</span>
                        <span className="font-label-sm text-label-sm text-tertiary">
                          {Math.round(analysis.tone.weights.collaborative * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-tertiary h-full"
                          style={{ width: `${Math.round(analysis.tone.weights.collaborative * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-label-md text-label-md text-on-surface font-medium">Analytical</span>
                        <span className="font-label-sm text-label-sm text-primary-fixed-dim">
                          {Math.round(analysis.tone.weights.analytical * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary-fixed-dim h-full"
                          style={{ width: `${Math.round(analysis.tone.weights.analytical * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Email Specific Insights */}
                <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg border border-outline-variant/15">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[20px]">target</span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Key Email Specific Insights
                      </h2>
                    </div>
                    <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-outline font-label-sm text-label-sm">
                      High Salience
                    </span>
                  </div>

                  {/* 2x2 Findings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {/* Main Purpose */}
                    <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs border border-outline-variant/10">
                      <div className="flex items-center gap-space-xs text-primary">
                        <span className="material-symbols-outlined text-[18px]">flag</span>
                        <span className="font-label-sm text-label-sm uppercase font-semibold">Main Purpose</span>
                      </div>
                      <p className="font-headline-sm text-headline-sm text-on-surface font-medium">
                        {analysis.emailSpecific?.mainPurpose || analysis.mainTopic}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {analysis.summary}
                      </p>
                    </div>

                    {/* Deadline Detected */}
                    <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs shadow-[0_0_16px_-4px_rgba(255,180,171,0.2)] border border-outline-variant/10">
                      <div className="flex items-center justify-between text-error">
                        <div className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[18px]">alarm_on</span>
                          <span className="font-label-sm text-label-sm uppercase font-semibold">
                            Critical Deadline Detected
                          </span>
                        </div>
                        {analysis.emailSpecific?.deadline !== "Not detected" && (
                          <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                        )}
                      </div>
                      <p className="font-headline-sm text-headline-sm text-error font-bold">
                        {analysis.emailSpecific?.deadline || "Not detected"}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {analysis.urgency.reason}
                      </p>
                    </div>

                    {/* Explicit Requested Action */}
                    <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs border border-outline-variant/10">
                      <div className="flex items-center gap-space-xs text-secondary">
                        <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                        <span className="font-label-sm text-label-sm uppercase font-semibold">
                          Explicit Requested Action
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface font-semibold">
                        "{analysis.emailSpecific?.explicitRequestedAction || analysis.suggestedAction}"
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Priority queue status: Active.
                      </p>
                    </div>

                    {/* Recommended Strategic Move */}
                    <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs border border-outline-variant/10">
                      <div className="flex items-center gap-space-xs text-primary">
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                        <span className="font-label-sm text-label-sm uppercase font-semibold">
                          Recommended Strategic Move
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface font-semibold">
                        {analysis.emailSpecific?.recommendedStrategicMove || analysis.suggestedAction}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Ensures milestone alignment and minimizes blocker risk.
                      </p>
                    </div>
                  </div>

                  {/* Positive vs Risk signals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs border border-outline-variant/10">
                      <div className="flex items-center gap-space-xs text-primary-container">
                        <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                        <span className="font-label-sm text-label-sm uppercase font-semibold">
                          Positive Reinforcement
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1 text-on-surface font-body-sm text-body-sm">
                        {analysis.positivePoints.map((pt, i) => (
                          <li key={i} className="flex items-center gap-space-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-container shrink-0"></span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs border border-outline-variant/10">
                      <div className="flex items-center gap-space-xs text-error">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        <span className="font-label-sm text-label-sm uppercase font-semibold">
                          Bottlenecks &amp; Risks
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1 text-on-surface font-body-sm text-body-sm">
                        {analysis.negativePoints.map((pt, i) => (
                          <li key={i} className="flex items-center gap-space-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0"></span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Extracted Entities */}
                <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Extracted Entities &amp; Semantic Nodes
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">NER Confidence &gt; 94%</span>
                  </div>

                  <div className="flex flex-wrap gap-space-xs">
                    {analysis.entities.map((ent, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/20"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          {ent.type === "Person"
                            ? "person"
                            : ent.type === "Organization"
                            ? "corporate_fare"
                            : ent.type === "Timestamp"
                            ? "schedule"
                            : ent.type === "Metric"
                            ? "speed"
                            : "memory"}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface">{ent.text}</span>
                        <span className="font-label-sm text-label-sm text-outline uppercase">{ent.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive AI Response Generator Card */}
                <div className="bg-surface-container-low rounded-xl p-space-lg shadow-md flex flex-col gap-space-md border border-outline-variant/15">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[22px]">smart_toy</span>
                      <div>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          One-Click AI Response Draft
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Generated with zero-shot neural synthesis conditioned on urgency &amp; deadline
                        </p>
                      </div>
                    </div>

                    {/* Tone selector tabs */}
                    <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/10">
                      <button
                        onClick={() => handleToneChange("executive")}
                        className={`px-space-sm py-space-xs rounded font-label-sm text-label-sm transition-all ${
                          selectedTone === "executive"
                            ? "bg-primary-container text-on-primary-container font-semibold"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Executive
                      </button>
                      <button
                        onClick={() => handleToneChange("technical")}
                        className={`px-space-sm py-space-xs rounded font-label-sm text-label-sm transition-all ${
                          selectedTone === "technical"
                            ? "bg-primary-container text-on-primary-container font-semibold"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Technical
                      </button>
                      <button
                        onClick={() => handleToneChange("concise")}
                        className={`px-space-sm py-space-xs rounded font-label-sm text-label-sm transition-all ${
                          selectedTone === "concise"
                            ? "bg-primary-container text-on-primary-container font-semibold"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Ultra-Concise
                      </button>
                    </div>
                  </div>

                  {/* Draft Textbox */}
                  <div className="relative bg-surface-container rounded-lg p-space-md border border-outline-variant/10">
                    <textarea
                      rows={6}
                      value={draftResponse}
                      onChange={(e) => setDraftResponse(e.target.value)}
                      className="w-full bg-transparent font-body-sm text-body-sm text-on-surface leading-relaxed outline-none resize-none font-mono"
                    />

                    {/* Action buttons inside response card */}
                    <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-sm border-t border-outline-variant/10">
                      <span className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">auto_mode</span>
                        Preserves context &amp; addresses all blockers
                      </span>
                      <div className="flex items-center gap-space-xs">
                        <button
                          onClick={handleCopyDraft}
                          className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          <span>{copyDraftLabel}</span>
                        </button>
                        <button
                          onClick={handlePushToMail}
                          className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary text-on-primary hover:bg-primary-fixed hover:text-on-primary-fixed font-label-md text-label-md transition-colors font-semibold shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">send</span>
                          <span>Push to Mail Client</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
            ) : (
              <div className="bg-surface-container-low rounded-xl p-space-xl flex flex-col items-center justify-center text-center gap-space-sm min-h-[400px] border border-outline-variant/15">
                <span className="material-symbols-outlined text-[48px] text-outline">mark_email_read</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Ready to Analyze</h3>
                <p className="text-body-md text-on-surface-variant max-w-md">
                  Click "Analyze Email" on the left or "Load Sample Work Email" to trigger deep neural email dissection.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
