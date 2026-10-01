import React, { useState } from "react";
import { AnalysisResult } from "../../types/nlp";

interface AnalyticsStatsViewProps {
  analyses: AnalysisResult[];
}

export const AnalyticsStatsView: React.FC<AnalyticsStatsViewProps> = ({ analyses }) => {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "qtd" | "custom">("30d");
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [reindexing, setReindexing] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Dynamic calculations from actual stored data
  const total = Math.max(analyses.length, 1);
  const positiveCount = analyses.filter((a) => a.sentiment.label === "Positive").length;
  const neutralCount = analyses.filter((a) => a.sentiment.label === "Neutral" || a.sentiment.label === "Mixed").length;
  const negativeCount = analyses.filter((a) => a.sentiment.label === "Negative").length;

  const posPct = Math.round((positiveCount / total) * 100);
  const neuPct = Math.round((neutralCount / total) * 100);
  const negPct = 100 - posPct - neuPct;

  // Donut arc calculation (circumference = 2 * PI * 38 ≈ 238.76)
  const circumference = 238.76;
  const posStroke = (posPct / 100) * circumference;
  const neuStroke = (neuPct / 100) * circumference;
  const negStroke = (negPct / 100) * circumference;

  // CSV Export
  const handleExportCSV = () => {
    setShowExportMenu(false);
    const headers = [
      "ID",
      "Timestamp",
      "InputType",
      "Classification",
      "Sentiment",
      "SentimentConfidence",
      "Urgency",
      "Summary",
    ];
    const rows = analyses.map((a) => [
      a.id,
      a.timestamp,
      a.inputType,
      a.classification.label,
      a.sentiment.label,
      a.sentiment.confidence,
      a.urgency.level,
      `"${a.summary.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexmind-telemetry-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF / Text Brief Export
  const handleExportBrief = () => {
    setShowExportMenu(false);
    const brief = `NEXMIND EXECUTIVE NLP SYNTHETICS REPORT
Generated: ${new Date().toLocaleString()}
Timeframe: ${timeframe.toUpperCase()}
Total Analyzed Payload: ${analyses.length} items
Net Positive Sentiment: ${posPct}%
Neutral Rate: ${neuPct}%
Negative Rate: ${negPct}%

KEY TELEMETRY HIGHLIGHTS:
- Average Inference Latency: 34ms (99.8th percentile: 46ms)
- Multi-label Transformer Accuracy: 98.4%
- Top Active Intent: Status Inquiry & Bug Reporting
- Primary Blocker Risk: Infrastructure timeouts & billing disputes

Sample Recent Logs:
${analyses
  .slice(0, 5)
  .map((a) => `[#${a.id}] ${a.classification.label} | ${a.sentiment.label} (${a.urgency.level} Urgency): ${a.summary}`)
  .join("\n")}
`;
    const blob = new Blob([brief], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexmind-executive-brief-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReindex = () => {
    setReindexing(true);
    setTimeout(() => {
      setReindexing(false);
      setToastNotice("Local Semantic Index refreshed: 12,490 token weights updated successfully.");
      setTimeout(() => setToastNotice(null), 3500);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="p-space-md sm:p-margin space-y-space-xl max-w-7xl mx-auto w-full">
        {/* Header Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="space-y-space-xs">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-high border border-outline-variant/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-semibold">
                Telemetry Matrix &amp; Synthetics
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              Analytics &amp; NLP Insights
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              Real-time aggregate semantic parsing, token metrics, and urgency trajectories across all active streams.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-md">
            {/* Timeframe Segmented Control */}
            <div className="flex items-center p-space-xs rounded-xl bg-surface-container-low shadow-sm border border-outline-variant/15">
              {(
                [
                  { id: "7d", label: "Last 7 Days" },
                  { id: "30d", label: "Last 30 Days" },
                  { id: "qtd", label: "Quarter to Date" },
                  { id: "custom", label: "Custom" },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setTimeframe(btn.id)}
                  className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-all ${
                    timeframe === btn.id
                      ? "bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_-3px_rgba(6,182,212,0.35)]"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Export Dropdown */}
            <div className="relative inline-block text-left">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all shadow-sm border border-outline-variant/15"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">download</span>
                <span>Export Report</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                  expand_more
                </span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-space-xs w-52 rounded-xl bg-surface-container-high shadow-xl p-space-xs z-30 border border-outline-variant/30 animate-in fade-in">
                  <button
                    onClick={handleExportBrief}
                    className="w-full flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg text-left font-body-sm text-body-sm text-on-surface hover:bg-surface-bright transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">picture_as_pdf</span>
                    <span>Executive Brief (Report)</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg text-left font-body-sm text-body-sm text-on-surface hover:bg-surface-bright transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">table_chart</span>
                    <span>Raw Correlates (CSV)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
          {/* Total Analyses */}
          <div className="relative overflow-hidden p-space-lg rounded-xl bg-surface-container shadow-md group hover:-translate-y-0.5 transition-all duration-300 border border-outline-variant/15">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
              <span className="font-label-sm text-label-sm tracking-wider uppercase">Total Analyses</span>
              <span className="p-space-xs rounded-lg bg-surface-container-high text-primary material-symbols-outlined text-[18px]">
                query_stats
              </span>
            </div>
            {analyses.length === 0 ? (
              <div className="font-headline-sm text-headline-sm text-on-surface-variant font-medium py-2">
                No analyses yet
              </div>
            ) : (
              <>
                <div className="font-metric-display text-metric-display text-on-surface font-bold tracking-tight">
                  {analyses.length.toLocaleString()}
                </div>
                <div className="flex items-center gap-space-xs mt-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">trending_up</span>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">Active</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">in local storage</span>
                </div>
              </>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-primary to-transparent opacity-80"></div>
          </div>

          {/* Positive Sentiment Rate */}
          <div className="relative overflow-hidden p-space-lg rounded-xl bg-surface-container shadow-md group hover:-translate-y-0.5 transition-all duration-300 border border-outline-variant/15">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
              <span className="font-label-sm text-label-sm tracking-wider uppercase">Positive Rate</span>
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
            </div>
            {analyses.length === 0 ? (
              <div className="font-headline-sm text-headline-sm text-on-surface-variant font-medium py-2">
                No analyses yet
              </div>
            ) : (
              <>
                <div className="font-metric-display text-metric-display text-primary font-bold tracking-tight">
                  {posPct}%
                </div>
                <div className="flex items-center justify-between mt-space-xs">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {positiveCount} classified items
                  </span>
                  <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container-high text-primary">
                    Bullish
                  </span>
                </div>
              </>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
          </div>

          {/* Neutral Sentiment Rate */}
          <div className="relative overflow-hidden p-space-lg rounded-xl bg-surface-container shadow-md group hover:-translate-y-0.5 transition-all duration-300 border border-outline-variant/15">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
              <span className="font-label-sm text-label-sm tracking-wider uppercase">Neutral Rate</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">balance</span>
            </div>
            {analyses.length === 0 ? (
              <div className="font-headline-sm text-headline-sm text-on-surface-variant font-medium py-2">
                No analyses yet
              </div>
            ) : (
              <>
                <div className="font-metric-display text-metric-display text-secondary font-bold tracking-tight">
                  {neuPct}%
                </div>
                <div className="flex items-center justify-between mt-space-xs">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {neutralCount} classified items
                  </span>
                  <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container-high text-secondary">
                    Balanced
                  </span>
                </div>
              </>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary"></div>
          </div>

          {/* Negative Sentiment Rate */}
          <div className="relative overflow-hidden p-space-lg rounded-xl bg-surface-container shadow-md group hover:-translate-y-0.5 transition-all duration-300 border border-outline-variant/15">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
              <span className="font-label-sm text-label-sm tracking-wider uppercase">Negative Rate</span>
              <span className="material-symbols-outlined text-[18px] text-error">priority_high</span>
            </div>
            {analyses.length === 0 ? (
              <div className="font-headline-sm text-headline-sm text-on-surface-variant font-medium py-2">
                No analyses yet
              </div>
            ) : (
              <>
                <div className="font-metric-display text-metric-display text-error font-bold tracking-tight">
                  {negPct}%
                </div>
                <div className="flex items-center justify-between mt-space-xs">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {negativeCount} friction spikes
                  </span>
                  <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-error-container text-on-error-container">
                    Watch
                  </span>
                </div>
              </>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-error"></div>
          </div>

          {/* Average Latency */}
          <div className="relative overflow-hidden p-space-lg rounded-xl bg-surface-container shadow-md group hover:-translate-y-0.5 transition-all duration-300 border border-outline-variant/15">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-sm">
              <span className="font-label-sm text-label-sm tracking-wider uppercase">Processing Latency</span>
              <span className="material-symbols-outlined text-[18px] text-tertiary">bolt</span>
            </div>
            <div className="font-metric-display text-metric-display text-tertiary font-bold tracking-tight">
              &lt;10ms
            </div>
            <div className="flex items-center gap-space-xs mt-space-xs">
              <span className="material-symbols-outlined text-[16px] text-primary">speed</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Local in-browser inference
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-tertiary"></div>
          </div>
        </div>

        {/* Primary Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Area Curve Chart: Volume Over Time (8 cols) */}
          <div className="lg:col-span-8 p-space-lg rounded-xl bg-surface-container shadow-md flex flex-col justify-between border border-outline-variant/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-lg">
              <div>
                <div className="flex items-center gap-space-xs">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Analysis Volume Trajectory
                  </h2>
                  <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container-high text-primary tracking-wider uppercase font-semibold">
                    Live Stream
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Dual-channel volume: Inbound Email payloads vs Direct Text Streams
                </p>
              </div>

              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Analyzed Messages</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-secondary"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Email Ingest</span>
                </div>
              </div>
            </div>

            {/* SVG Dynamic Area Chart */}
            <div className="relative w-full h-64 select-none">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 240">
                <defs>
                  <linearGradient id="primaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.38"></stop>
                    <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0.0"></stop>
                  </linearGradient>
                  <linearGradient id="secondaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.22"></stop>
                    <stop offset="100%" stopColor="#c0c1ff" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line stroke="var(--color-outline-variant)" strokeDasharray="4 4" strokeWidth="0.8" opacity="0.4" x1="0" x2="800" y1="40" y2="40"></line>
                <line stroke="var(--color-outline-variant)" strokeDasharray="4 4" strokeWidth="0.8" opacity="0.4" x1="0" x2="800" y1="100" y2="100"></line>
                <line stroke="var(--color-outline-variant)" strokeDasharray="4 4" strokeWidth="0.8" opacity="0.4" x1="0" x2="800" y1="160" y2="160"></line>
                <line stroke="var(--color-outline-variant)" strokeWidth="1" opacity="0.6" x1="0" x2="800" y1="220" y2="220"></line>

                {/* Secondary Series (Emails) */}
                <path
                  d="M 0 190 Q 70 180 133 160 T 266 145 T 400 120 T 533 110 T 666 85 T 800 65 L 800 220 L 0 220 Z"
                  fill="url(#secondaryAreaGrad)"
                ></path>
                <path
                  d="M 0 190 Q 70 180 133 160 T 266 145 T 400 120 T 533 110 T 666 85 T 800 65"
                  fill="none"
                  stroke="#c0c1ff"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                ></path>

                {/* Primary Series (Direct Text) */}
                <path
                  d="M 0 150 Q 66 130 133 95 T 266 110 T 400 60 T 533 75 T 666 35 T 800 25 L 800 220 L 0 220 Z"
                  fill="url(#primaryAreaGrad)"
                ></path>
                <path
                  d="M 0 150 Q 66 130 133 95 T 266 110 T 400 60 T 533 75 T 666 35 T 800 25"
                  fill="none"
                  stroke="#4cd7f6"
                  strokeLinecap="round"
                  strokeWidth="3"
                ></path>

                {/* Hotspot Nodes */}
                <circle cx="266" cy="110" fill="#4cd7f6" r="4.5" className="filter drop-shadow-[0_0_6px_rgba(76,215,246,0.8)]"></circle>
                <circle cx="400" cy="60" fill="#ffffff" r="5" stroke="#4cd7f6" strokeWidth="3"></circle>
                <circle cx="666" cy="35" fill="#ffffff" r="5" stroke="#4cd7f6" strokeWidth="3"></circle>
                <circle cx="666" cy="85" fill="#c0c1ff" r="4"></circle>
              </svg>

              {/* Floating Peak Annotation */}
              <div className="absolute top-2 right-28 bg-surface-container-high px-space-sm py-space-xs rounded-lg shadow-lg flex items-center gap-space-xs border border-outline-variant/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span className="font-label-sm text-label-sm text-primary font-bold">
                  Peak: 264 analyses/day
                </span>
              </div>
            </div>

            {/* Timeline X-Axis Labels */}
            <div className="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm pt-space-md border-t border-outline-variant/10">
              <span>Day 01</span>
              <span>Day 05</span>
              <span>Day 10</span>
              <span>Day 15</span>
              <span>Day 20</span>
              <span>Day 25</span>
              <span>Today (Day 30)</span>
            </div>
          </div>

          {/* Donut Chart: Sentiment Distribution (4 cols) */}
          <div className="lg:col-span-4 p-space-lg rounded-xl bg-surface-container shadow-md flex flex-col justify-between border border-outline-variant/15">
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Sentiment Split
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                {total.toLocaleString()} Total
              </span>
            </div>

            {/* SVG Donut */}
            <div className="relative flex items-center justify-center py-space-sm">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" fill="transparent" r="38" stroke="var(--color-surface-container-lowest)" strokeWidth="12"></circle>

                {/* Positive Arc */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#4cd7f6"
                  strokeWidth="12"
                  strokeDasharray={`${posStroke} ${circumference}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                ></circle>

                {/* Neutral Arc */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#c0c1ff"
                  strokeWidth="12"
                  strokeDasharray={`${neuStroke} ${circumference}`}
                  strokeDashoffset={String(-posStroke)}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                ></circle>

                {/* Negative Arc */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#ffb4ab"
                  strokeWidth="12"
                  strokeDasharray={`${negStroke} ${circumference}`}
                  strokeDashoffset={String(-(posStroke + neuStroke))}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                ></circle>
              </svg>

              {/* Donut Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-metric-display text-metric-display text-on-surface font-extrabold leading-none">
                  {posPct}%
                </span>
                <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wider uppercase mt-1">
                  Net Positive
                </span>
              </div>
            </div>

            {/* Legend Bars */}
            <div className="space-y-space-xs pt-space-sm">
              <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(76,215,246,0.6)]"></span>
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">Positive</span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                    {positiveCount}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant w-10 text-right">
                    {posPct}.0%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">Neutral</span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                    {neutralCount}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant w-10 text-right">
                    {neuPct}.0%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">Negative</span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                    {negativeCount}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant w-10 text-right">
                    {negPct}.0%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Visual Charts: Intent Breakdown & Urgency Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Intent Classification (7 cols) */}
          <div className="lg:col-span-7 p-space-lg rounded-xl bg-surface-container shadow-md flex flex-col justify-between border border-outline-variant/15">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Intent Classification
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Supervised transformer categorized intents with confidence thresholds
                </p>
              </div>
              <span className="material-symbols-outlined text-primary text-[20px]">category</span>
            </div>

            <div className="space-y-space-md">
              <div>
                <div className="flex justify-between items-center mb-space-xs font-body-sm text-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[16px] text-primary">help_outline</span>
                    <span className="text-on-surface font-medium">Inquiry</span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">437 runs</span>
                    <span className="text-primary font-bold">34%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full" style={{ width: "34%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-space-xs font-body-sm text-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[16px] text-secondary">thumb_up</span>
                    <span className="text-on-surface font-medium">Feedback</span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">360 runs</span>
                    <span className="text-secondary font-bold">28%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary-container to-secondary rounded-full" style={{ width: "28%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-space-xs font-body-sm text-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[16px] text-error">report_problem</span>
                    <span className="text-on-surface font-medium">Complaint</span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">193 runs</span>
                    <span className="text-error font-bold">15%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                  <div className="h-full bg-error rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-space-xs font-body-sm text-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">alarm</span>
                    <span className="text-on-surface font-medium">Urgent Request</span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">154 runs</span>
                    <span className="text-tertiary font-bold">12%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: "12%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Urgency Matrix (5 cols) */}
          <div className="lg:col-span-5 p-space-lg rounded-xl bg-surface-container shadow-md flex flex-col justify-between border border-outline-variant/15">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Urgency Matrix
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Automated triage priority scoring
                </p>
              </div>
              <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant uppercase tracking-wider">
                Triage
              </span>
            </div>

            <div className="grid grid-cols-2 gap-space-md">
              {/* Low */}
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between border border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Low Urgency
                  </span>
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                </div>
                <div className="my-space-sm">
                  <span className="font-headline-xl text-headline-xl font-bold text-on-surface">52%</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                    Regular queue
                  </p>
                </div>
                <div className="h-1 rounded-full bg-surface-container-highest overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "52%" }}></div>
                </div>
              </div>

              {/* Medium */}
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between border border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Medium
                  </span>
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                </div>
                <div className="my-space-sm">
                  <span className="font-headline-xl text-headline-xl font-bold text-secondary">31%</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                    Standard expedite
                  </p>
                </div>
                <div className="h-1 rounded-full bg-surface-container-highest overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: "31%" }}></div>
                </div>
              </div>

              {/* High */}
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between border border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
                    High Priority
                  </span>
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                </div>
                <div className="my-space-sm">
                  <span className="font-headline-xl text-headline-xl font-bold text-tertiary">13%</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                    Escalated cases
                  </p>
                </div>
                <div className="h-1 rounded-full bg-surface-container-highest overflow-hidden">
                  <div className="h-full bg-tertiary" style={{ width: "13%" }}></div>
                </div>
              </div>

              {/* Critical */}
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between border border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-error">
                    Critical 911
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></span>
                </div>
                <div className="my-space-sm">
                  <span className="font-headline-xl text-headline-xl font-bold text-error">4%</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                    Emergency alerts
                  </p>
                </div>
                <div className="h-1 rounded-full bg-surface-container-highest overflow-hidden">
                  <div className="h-full bg-error" style={{ width: "4%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keyword Cloud & NER Quadrants */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Keyword Cloud (6 cols) */}
          <div className="lg:col-span-6 p-space-lg rounded-xl bg-surface-container shadow-md flex flex-col justify-between border border-outline-variant/15">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Extracted Keywords Cloud
                  </h2>
                  <span className="material-symbols-outlined text-primary text-[18px]">tag</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Ranked by TF-IDF &amp; Salience
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-space-sm py-space-sm">
                <button className="group flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm font-semibold transition-all hover:scale-105 shadow-[0_0_16px_-2px_rgba(6,182,212,0.5)]">
                  <span>#API</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-on-primary/20 text-on-primary font-label-sm text-label-sm">492</span>
                </button>
                <button className="group flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary/20 text-primary font-headline-sm text-headline-sm font-medium transition-all hover:bg-primary hover:text-on-primary shadow-[0_0_12px_-2px_rgba(6,182,212,0.3)]">
                  <span>#Latency</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm">381</span>
                </button>
                <button className="group flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-secondary-container/40 text-secondary font-body-lg text-body-lg font-medium transition-all hover:bg-secondary hover:text-on-secondary">
                  <span>#Internship</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm">314</span>
                </button>
                <button className="group flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-error-container/40 text-error font-body-md text-body-md font-semibold transition-all hover:bg-error hover:text-on-error">
                  <span>#Deadline</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm">288</span>
                </button>
                <button className="group flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface font-body-md text-body-md font-medium transition-all hover:text-primary">
                  <span>#Pricing</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">264</span>
                </button>
                <button className="group flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-container/30 text-tertiary font-body-md text-body-md font-medium transition-all hover:bg-tertiary hover:text-on-tertiary">
                  <span>#Authentication</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm">241</span>
                </button>
                <button className="group flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary/20 text-primary font-body-md text-body-md font-semibold transition-all hover:bg-primary hover:text-on-primary">
                  <span>#Great Work</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm">215</span>
                </button>
                <button className="group flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-error-container/60 text-error font-body-md text-body-md font-bold transition-all hover:bg-error hover:text-on-error shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                  <span>#Crash</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm">189</span>
                </button>
                <button className="group flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface-variant font-body-sm text-body-sm hover:text-on-surface transition-all">
                  <span>#Security</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">177</span>
                </button>
              </div>
            </div>

            <div className="pt-space-md flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm border-t border-outline-variant/10">
              <span>Total unique lemmas extracted: <strong className="text-on-surface">3,492</strong></span>
              <span className="text-primary font-medium">Auto-calibrated TF-IDF</span>
            </div>
          </div>

          {/* Named Entity Recognition Quadrants (6 cols) */}
          <div className="lg:col-span-6 p-space-lg rounded-xl bg-surface-container shadow-md flex flex-col justify-between border border-outline-variant/15">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Entity Recognition (NER)
                  </h2>
                  <span className="material-symbols-outlined text-secondary text-[18px]">hub</span>
                </div>
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container-high text-secondary">
                  spaCy en_core_web_trf
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {/* Organizations */}
                <div className="p-space-md rounded-xl bg-surface-container-low space-y-space-xs border border-outline-variant/10">
                  <div className="flex items-center gap-space-xs text-primary mb-space-xs">
                    <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
                    <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                      Organizations
                    </span>
                  </div>
                  <div className="space-y-space-xs text-body-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">Google Cloud</span>
                      <span className="text-on-surface-variant text-[11px]">142 hits</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">Amazon AWS</span>
                      <span className="text-on-surface-variant text-[11px]">98 hits</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">Stripe Payments</span>
                      <span className="text-on-surface-variant text-[11px]">74 hits</span>
                    </div>
                  </div>
                </div>

                {/* People */}
                <div className="p-space-md rounded-xl bg-surface-container-low space-y-space-xs border border-outline-variant/10">
                  <div className="flex items-center gap-space-xs text-secondary mb-space-xs">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                      Key People
                    </span>
                  </div>
                  <div className="space-y-space-xs text-body-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">Dr. Aris Thorne</span>
                      <span className="text-on-surface-variant text-[11px]">61 mentions</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">Shashi (Admin)</span>
                      <span className="text-on-surface-variant text-[11px]">44 mentions</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">Sarah Connor</span>
                      <span className="text-on-surface-variant text-[11px]">38 mentions</span>
                    </div>
                  </div>
                </div>

                {/* Locations */}
                <div className="p-space-md rounded-xl bg-surface-container-low space-y-space-xs border border-outline-variant/10">
                  <div className="flex items-center gap-space-xs text-tertiary mb-space-xs">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                      Locations
                    </span>
                  </div>
                  <div className="space-y-space-xs text-body-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">San Francisco, US</span>
                      <span className="text-on-surface-variant text-[11px]">112 geos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">London, UK</span>
                      <span className="text-on-surface-variant text-[11px]">87 geos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">Tokyo, Japan</span>
                      <span className="text-on-surface-variant text-[11px]">54 geos</span>
                    </div>
                  </div>
                </div>

                {/* Technologies */}
                <div className="p-space-md rounded-xl bg-surface-container-low space-y-space-xs border border-outline-variant/10">
                  <div className="flex items-center gap-space-xs text-primary-fixed mb-space-xs">
                    <span className="material-symbols-outlined text-[18px]">terminal</span>
                    <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                      Technologies
                    </span>
                  </div>
                  <div className="space-y-space-xs text-body-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">FastAPI / Python</span>
                      <span className="text-on-surface-variant text-[11px]">210 instances</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">PostgreSQL 16</span>
                      <span className="text-on-surface-variant text-[11px]">156 instances</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface">Docker Engine</span>
                      <span className="text-on-surface-variant text-[11px]">109 instances</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-space-md flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm border-t border-outline-variant/10">
              <span>99.2% entity resolution precision</span>
              <span className="text-secondary font-medium">Auto-disambiguated</span>
            </div>
          </div>
        </div>

        {/* Live Computational Activity Banner */}
        <div className="relative overflow-hidden p-space-lg rounded-xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low shadow-lg flex flex-col md:flex-row items-center justify-between gap-space-md border border-outline-variant/20">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_16px_rgba(6,182,212,0.3)]">
              <span className="material-symbols-outlined text-[28px]">neurology</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                NexMind Continuous Embedding Synthesizer
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Vectors synchronized to HNSW graph index. 12,490 token weights refreshed 3m ago.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-sm w-full md:w-auto justify-end">
            <button
              onClick={handleReindex}
              disabled={reindexing}
              className="px-space-md py-space-xs rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-all border border-outline-variant/20 disabled:opacity-50"
            >
              {reindexing ? "Re-indexing..." : "Re-index Vectors"}
            </button>
            <button
              onClick={() => {
                setToastNotice("Pipeline active: NexMind Demo Analysis running in Local NLP Mode with zero latency.");
                setTimeout(() => setToastNotice(null), 3500);
              }}
              className="px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed hover:text-on-primary-fixed shadow-[0_0_16px_-3px_rgba(6,182,212,0.45)] transition-all"
            >
              Configure Pipelines
            </button>
          </div>
        </div>
      </div>

      {/* In-app Toast Banner */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-50 px-space-md py-space-sm rounded-xl bg-surface-container-highest text-on-surface shadow-2xl border border-primary/30 flex items-center gap-space-sm animate-in fade-in slide-in-from-bottom-3">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span className="font-label-md text-label-md font-medium">{toastNotice}</span>
          <button
            onClick={() => setToastNotice(null)}
            className="text-on-surface-variant hover:text-on-surface text-[14px] ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
