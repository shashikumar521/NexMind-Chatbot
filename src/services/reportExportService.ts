import { jsPDF } from "jspdf";
import { AnalysisResult } from "../types/nlp";

/**
 * Formats the complete 15+ section analysis report as clean, executive plain text.
 */
export function generateFullReportText(analysis: AnalysisResult): string {
  const dateStr = new Date(analysis.timestamp).toLocaleString();
  const divider = "================================================================================";
  const subDivider = "--------------------------------------------------------------------------------";

  const lines: string[] = [];

  lines.push(divider);
  lines.push("                           NEXMIND ANALYSIS REPORT");
  lines.push("                         Understand Every Message.");
  lines.push(divider);
  lines.push(`Report ID:       #${analysis.id}`);
  lines.push(`Analyzed On:     ${dateStr}`);
  lines.push(`Analysis Type:   ${analysis.inputType.toUpperCase()}`);
  lines.push(`Processing Mode: NexMind Local NLP Engine (Zero-Latency Offline Mode)`);

  if (analysis.inputType === "email" && analysis.emailSpecific) {
    lines.push(subDivider);
    lines.push("EMAIL METADATA & INFORMATION");
    lines.push(`  From:    ${analysis.emailSpecific.from || "Not specified"}`);
    lines.push(`  To:      ${analysis.emailSpecific.to || "Not specified"}`);
    lines.push(`  Subject: ${analysis.emailSpecific.subject || "Not specified"}`);
    lines.push(`  Purpose: ${analysis.emailSpecific.mainPurpose}`);
    lines.push(`  Deadline/Milestone: ${analysis.emailSpecific.deadline}`);
  }

  lines.push(subDivider);
  lines.push("ORIGINAL INPUT");
  lines.push(analysis.inputText);

  lines.push(subDivider);
  lines.push("1. EXECUTIVE SUMMARY");
  lines.push(analysis.summary);

  lines.push(subDivider);
  lines.push("2. OVERALL CLASSIFICATION");
  lines.push(`  Classification: ${analysis.classification.label}`);
  lines.push(`  Confidence:     ${Math.round(analysis.classification.confidence * 100)}%`);
  lines.push(`  Reason:         ${analysis.classification.reason}`);

  lines.push(subDivider);
  lines.push("3. SENTIMENT ANALYSIS");
  const sentimentScoreStr = analysis.sentiment.confidenceAvailable === false
    ? "Confidence: Not available in Local Mode"
    : `${analysis.sentiment.visualBar || `[${analysis.sentiment.label}]`} (${Math.round(analysis.sentiment.confidence * 100)}%)`;
  lines.push(`  Sentiment: ${analysis.sentiment.label}`);
  lines.push(`  Indicator: ${sentimentScoreStr}`);
  lines.push(`  Polarity:  ${analysis.sentiment.polarity >= 0 ? "+" : ""}${analysis.sentiment.polarity.toFixed(2)}`);

  lines.push(subDivider);
  lines.push("4. TONE ANALYSIS");
  lines.push(`  Primary Tone:   ${analysis.tone.primary}`);
  lines.push(`  Sub-tone:       ${analysis.tone.subTone}`);
  lines.push(`  Detection Note: ${analysis.tone.reason || "Evaluated through linguistic phrasing and keyword density."}`);

  lines.push(subDivider);
  lines.push("5. INTENT ANALYSIS");
  lines.push(`  Primary Intent:   ${analysis.intent.primary}`);
  lines.push(`  Architecture:     ${analysis.intent.architecture}`);
  lines.push(`  Explanation Note: ${analysis.intent.explanation || "Classified via clause intent patterns and objective analysis."}`);

  lines.push(subDivider);
  lines.push("6. URGENCY ANALYSIS");
  lines.push(`  Urgency Level: ${analysis.urgency.level.toUpperCase()}`);
  lines.push(`  Target SLA:    ${analysis.urgency.sla}`);
  lines.push(`  Evidence Note: ${analysis.urgency.reason}`);

  lines.push(subDivider);
  lines.push("7. KEYWORD ANALYSIS");
  if (analysis.groupedKeywords) {
    const gk = analysis.groupedKeywords;
    if (gk.topics.length) lines.push(`  • Topics:        ${gk.topics.join(", ")}`);
    if (gk.technologies.length) lines.push(`  • Technologies:  ${gk.technologies.join(", ")}`);
    if (gk.people.length) lines.push(`  • People/Roles:  ${gk.people.join(", ")}`);
    if (gk.organizations.length) lines.push(`  • Organizations: ${gk.organizations.join(", ")}`);
    if (gk.dates.length) lines.push(`  • Dates/Time:    ${gk.dates.join(", ")}`);
    if (gk.other.length) lines.push(`  • Other Terms:   ${gk.other.join(", ")}`);
  } else {
    lines.push(`  ${analysis.keywords.map((k) => k.term).join(", ")}`);
  }

  lines.push(subDivider);
  lines.push("8. ENTITY DETECTION");
  if (analysis.entities && analysis.entities.length > 0) {
    analysis.entities.forEach((ent) => {
      lines.push(`  • [${ent.type}] ${ent.text} (confidence: ${Math.round(ent.confidence * 100)}%)`);
    });
  } else {
    lines.push("  No significant entities detected.");
  }

  lines.push(subDivider);
  lines.push("9. POSITIVE POINTS");
  if (analysis.positivePoints && analysis.positivePoints.length > 0) {
    analysis.positivePoints.forEach((p) => lines.push(`  • ${p}`));
  } else {
    lines.push("  No significant positive points detected.");
  }

  lines.push(subDivider);
  lines.push("10. NEGATIVE POINTS");
  if (analysis.negativePoints && analysis.negativePoints.length > 0) {
    analysis.negativePoints.forEach((p) => lines.push(`  • ${p}`));
  } else {
    lines.push("  No significant negative points detected.");
  }

  lines.push(subDivider);
  lines.push("11. MAIN TOPICS");
  if (analysis.mainTopics && analysis.mainTopics.length > 0) {
    analysis.mainTopics.forEach((t) => lines.push(`  • ${t}`));
  } else {
    lines.push(`  • ${analysis.mainTopic}`);
  }

  lines.push(subDivider);
  lines.push("12. IMPORTANT INFORMATION");
  if (analysis.importantInfo && analysis.importantInfo.length > 0) {
    analysis.importantInfo.forEach((info) => {
      lines.push(`  • ${info.label}: ${info.value}`);
    });
  } else {
    lines.push("  No specific isolated dates, deadlines, or contact details detected.");
  }

  lines.push(subDivider);
  lines.push("13. REQUIRED ACTION");
  lines.push(`  ${analysis.suggestedAction || "No specific action detected."}`);

  lines.push(subDivider);
  lines.push("14. NEXMIND INSIGHTS");
  if (analysis.insights && analysis.insights.length > 0) {
    analysis.insights.forEach((ins) => lines.push(`  • ${ins.label}: ${ins.value}`));
  } else {
    lines.push("  Contextual semantic breakdown confirms consistent communication framing.");
  }

  lines.push(subDivider);
  lines.push("15. FINAL ASSESSMENT");
  lines.push(analysis.finalAssessment || `Overall Assessment: ${analysis.classification.label}. ${analysis.summary}`);

  if (analysis.suggestedReplies) {
    lines.push(subDivider);
    lines.push("SUGGESTED RESPONSE DRAFTS");
    lines.push("[Executive Response]:");
    lines.push(analysis.suggestedReplies.executive);
    lines.push("\n[Technical Response]:");
    lines.push(analysis.suggestedReplies.technical);
    lines.push("\n[Concise Response]:");
    lines.push(analysis.suggestedReplies.concise);
  }

  lines.push(divider);
  lines.push("End of NexMind Analysis Report. Generated by NexMind.");
  lines.push(divider);

  return lines.join("\n");
}

/**
 * Downloads the full analysis report as a formatted `.txt` file.
 */
export function downloadReportAsTXT(analysis: AnalysisResult): void {
  const content = generateFullReportText(analysis);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nexmind-report-${analysis.id.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a clean, multi-page vector PDF report using jsPDF.
 */
export function downloadReportAsPDF(analysis: AnalysisResult): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 30) {
      doc.addPage();
      y = margin;
      renderPageHeader();
    }
  };

  const renderPageHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 165);
    doc.text("NEXMIND ANALYSIS REPORT · BUSINESS INTELLIGENCE", margin, 32);
    doc.text(`ID: #${analysis.id}`, pageWidth - margin - 60, 32);
    doc.setDrawColor(220, 226, 235);
    doc.line(margin, 36, pageWidth - margin, 36);
  };

  // Top Title Banner
  renderPageHeader();
  y = 56;

  // Title & Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text("NexMind Analysis Report", margin, y);

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Understand Every Message · Comprehensive Natural Language Processing Synthesis", margin, y);

  y += 20;

  // Metadata Grid Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 54, 6, 6, "FD");

  const col1 = margin + 14;
  const col2 = margin + contentWidth / 2;

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("REPORT ID:", col1, y + 18);
  doc.text("ANALYSIS TYPE:", col1, y + 36);

  doc.text("ANALYZED ON:", col2, y + 18);
  doc.text("ENGINE MODE:", col2, y + 36);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`#${analysis.id}`, col1 + 65, y + 18);
  doc.text(analysis.inputType.toUpperCase(), col1 + 85, y + 36);

  doc.text(new Date(analysis.timestamp).toLocaleString(), col2 + 80, y + 18);
  doc.text("Local NLP Engine", col2 + 80, y + 36);

  y += 72;

  // Helper for Section Headings
  const renderSectionHeading = (num: string, title: string) => {
    checkPageBreak(36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(2, 132, 199); // Primary Accent Sky-600
    doc.text(`${num}. ${title.toUpperCase()}`, margin, y);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, margin + contentWidth, y);
    y += 14;
  };

  // 1. Original Input Block
  renderSectionHeading("0", "Original Input");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const inputLines = doc.splitTextToSize(analysis.inputText, contentWidth - 20);
  const boxHeight = Math.min(inputLines.length * 12 + 16, 100);

  checkPageBreak(boxHeight + 10);
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 4, 4, "FD");
  doc.text(inputLines.slice(0, 7), margin + 10, y + 14);
  if (inputLines.length > 7) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text("[...content continues in digital viewer]", margin + 10, y + boxHeight - 6);
  }
  y += boxHeight + 18;

  // 1. Executive Summary
  renderSectionHeading("1", "Executive Summary");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  const summaryLines = doc.splitTextToSize(analysis.summary, contentWidth);
  checkPageBreak(summaryLines.length * 13 + 10);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 13 + 14;

  // 2. Classification & 3. Sentiment Row
  renderSectionHeading("2 & 3", "Overall Classification & Sentiment Analysis");
  checkPageBreak(65);

  const cardW = (contentWidth - 12) / 2;
  // Classification Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, cardW, 58, 6, 6, "FD");

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("CLASSIFICATION", margin + 12, y + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(
    analysis.classification.label === "GOOD" ? 22 : analysis.classification.label === "BAD" ? 220 : 15,
    analysis.classification.label === "GOOD" ? 163 : analysis.classification.label === "BAD" ? 38 : 23,
    analysis.classification.label === "GOOD" ? 74 : analysis.classification.label === "BAD" ? 38 : 42
  );
  doc.text(analysis.classification.label, margin + 12, y + 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const reasonText = doc.splitTextToSize(analysis.classification.reason, cardW - 24);
  doc.text(reasonText[0] || "", margin + 12, y + 48);

  // Sentiment Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + cardW + 12, y, cardW, 58, 6, 6, "FD");

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("SENTIMENT VECTOR", margin + cardW + 24, y + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${analysis.sentiment.label}  ${
      analysis.sentiment.confidenceAvailable === false
        ? ""
        : `(${Math.round(analysis.sentiment.confidence * 100)}%)`
    }`,
    margin + cardW + 24,
    y + 34
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    analysis.sentiment.confidenceAvailable === false
      ? "Confidence: Not available in Local Mode"
      : `Polarity score: ${analysis.sentiment.polarity >= 0 ? "+" : ""}${analysis.sentiment.polarity.toFixed(2)}`,
    margin + cardW + 24,
    y + 48
  );

  y += 72;

  // 4. Tone & 5. Intent Row
  renderSectionHeading("4 & 5", "Tone & Intent Decomposition");
  checkPageBreak(65);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, cardW, 58, 6, 6, "FD");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("COMMUNICATION TONE", margin + 12, y + 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(analysis.tone.primary, margin + 12, y + 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Sub-tone: ${analysis.tone.subTone}`, margin + 12, y + 46);

  // Intent
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + cardW + 12, y, cardW, 58, 6, 6, "FD");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("DETECTED INTENT", margin + cardW + 24, y + 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(analysis.intent.primary, margin + cardW + 24, y + 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(analysis.intent.architecture, margin + cardW + 24, y + 46);

  y += 72;

  // 6. Urgency Analysis
  renderSectionHeading("6", "Urgency Assessment");
  checkPageBreak(36);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Urgency: ${analysis.urgency.level.toUpperCase()} (${analysis.urgency.sla})`, margin, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const urgencyLines = doc.splitTextToSize(`“${analysis.urgency.reason}”`, contentWidth);
  doc.text(urgencyLines, margin, y);
  y += urgencyLines.length * 12 + 14;

  // 7. Keyword Analysis
  renderSectionHeading("7", "Keyword Analysis (Grouped Terms)");
  checkPageBreak(40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  if (analysis.groupedKeywords) {
    const gk = analysis.groupedKeywords;
    const kwLines: string[] = [];
    if (gk.topics.length) kwLines.push(`Topics: ${gk.topics.join(", ")}`);
    if (gk.technologies.length) kwLines.push(`Technologies: ${gk.technologies.join(", ")}`);
    if (gk.people.length) kwLines.push(`People/Roles: ${gk.people.join(", ")}`);
    if (gk.organizations.length) kwLines.push(`Organizations: ${gk.organizations.join(", ")}`);
    if (gk.dates.length) kwLines.push(`Dates: ${gk.dates.join(", ")}`);
    if (gk.other.length) kwLines.push(`Key Terms: ${gk.other.join(", ")}`);
    kwLines.forEach((kl) => {
      checkPageBreak(14);
      doc.text(`• ${kl}`, margin, y);
      y += 13;
    });
  } else {
    doc.text(analysis.keywords.map((k) => k.term).join(" · "), margin, y);
    y += 14;
  }
  y += 8;

  // 8. Entity Detection
  renderSectionHeading("8", "Named Entity Detection");
  checkPageBreak(30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  if (analysis.entities && analysis.entities.length > 0) {
    analysis.entities.forEach((ent) => {
      checkPageBreak(14);
      doc.text(`• [${ent.type}] ${ent.text} (Confidence: ${Math.round(ent.confidence * 100)}%)`, margin, y);
      y += 13;
    });
  } else {
    doc.text("No significant entities detected.", margin, y);
    y += 14;
  }
  y += 8;

  // 9. Positive & 10. Negative Points
  renderSectionHeading("9 & 10", "Positive Points & Friction Points");
  checkPageBreak(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(22, 163, 74);
  doc.text("Positive Points:", margin, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  analysis.positivePoints.forEach((p) => {
    checkPageBreak(14);
    const pLines = doc.splitTextToSize(`• ${p}`, contentWidth);
    doc.text(pLines, margin, y);
    y += pLines.length * 12 + 2;
  });

  y += 8;
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(220, 38, 38);
  doc.text("Negative / Friction Points:", margin, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  analysis.negativePoints.forEach((p) => {
    checkPageBreak(14);
    const nLines = doc.splitTextToSize(`• ${p}`, contentWidth);
    doc.text(nLines, margin, y);
    y += nLines.length * 12 + 2;
  });
  y += 14;

  // 11. Main Topics & 12. Important Info
  renderSectionHeading("11 & 12", "Main Topics & Extracted Information");
  checkPageBreak(30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  if (analysis.mainTopics && analysis.mainTopics.length) {
    doc.text(`Primary Topics: ${analysis.mainTopics.join(" · ")}`, margin, y);
    y += 14;
  }
  if (analysis.importantInfo && analysis.importantInfo.length) {
    analysis.importantInfo.forEach((item) => {
      checkPageBreak(14);
      doc.text(`• ${item.label}: ${item.value}`, margin, y);
      y += 13;
    });
  }
  y += 8;

  // 13. Required Action
  renderSectionHeading("13", "Required Action");
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  const actionLines = doc.splitTextToSize(analysis.suggestedAction || "No specific action detected.", contentWidth);
  doc.text(actionLines, margin, y);
  y += actionLines.length * 13 + 14;

  // 14. NexMind Insights
  renderSectionHeading("14", "NexMind Insights");
  checkPageBreak(30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  analysis.insights.forEach((ins) => {
    checkPageBreak(14);
    doc.text(`• ${ins.label}: ${ins.value}`, margin, y);
    y += 13;
  });
  y += 8;

  // 15. Final Assessment
  renderSectionHeading("15", "Final Assessment");
  checkPageBreak(40);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  const finalLines = doc.splitTextToSize(analysis.finalAssessment || `Classification: ${analysis.classification.label}. ${analysis.summary}`, contentWidth - 24);
  const finalH = finalLines.length * 13 + 20;
  doc.roundedRect(margin, y, contentWidth, finalH, 6, 6, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(finalLines, margin + 12, y + 16);
  y += finalH + 20;

  // Save the PDF
  doc.save(`nexmind-analysis-report-${analysis.id.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Copies the complete report to the clipboard.
 */
export async function copyFullReportToClipboard(analysis: AnalysisResult): Promise<boolean> {
  const content = generateFullReportText(analysis);
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    return false;
  }
}
