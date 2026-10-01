import { AnalysisResult, AppSettings, ChatMessage, UserProfile } from "../types/nlp";

const HISTORY_KEY = "nexmind_analysis_history_v1";
const CHAT_KEY = "nexmind_chat_messages_v1";
const SETTINGS_KEY = "nexmind_app_settings_v1";
const PROFILE_KEY = "nexmind_user_profile_v1";
const AUTH_KEY = "nexmind_auth_session_v1";

const DEFAULT_PROFILE: UserProfile = {
  name: "Shashi",
  role: "AI/ML Researcher",
  email: "shashi.research@nexmind.io",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqsRwEu-rrtRHV2L5BEi24RuPX_AgzXLVuBwb3ZSIfHZZ45hSslGA3ASK9X6VIrz8_HjWMF7Djtns-krDlk42G2I2eE85XLuDFd4dJx9424gfE7PhM207RO_Uxl7vtYyMj3GGval4DYGxz8H4ppC8gOq0byW7Kj6f1Gar2yvE884ECXoaVY-zDT3Y7wyo8YQMivu8mjLmad6e_mkJ1n1js0VD6Mt4otYkaMDdA2W9iEO3P_FpU0ZCV",
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  enterToSend: true,
  showConfidence: true,
  showKeywords: true,
  showDetailedInsights: true,
  autoAnalyzePaste: true,
};

export const INITIAL_SEED_ANALYSES: AnalysisResult[] = [
  {
    id: "NX-8941",
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    inputType: "email",
    inputText:
      "Dear Hiring Team, I hope this email finds you well. I am following up on my Spring 2025 Machine Learning Internship submission from last Thursday. Could you please share a quick status update? I am happy to provide code samples or letters of reference if needed before Friday.",
    metadata: {
      from: "alex.chen@stanford.edu",
      to: "careers@nexmind.io",
      subject: "Spring 2025 Machine Learning Internship Status Update",
    },
    classification: {
      label: "GOOD",
      confidence: 0.92,
      reason: "Clear professional request with courteous phrasing and zero hostile indicators.",
    },
    sentiment: {
      label: "Positive",
      confidence: 0.92,
      polarity: 0.84,
    },
    tone: {
      primary: "Professional",
      subTone: "Courteous & Respectful Framing",
      reason: "Structured vocabulary, conventional salutations, and standard corporate etiquette.",
      weights: {
        formal: 0.91,
        urgent: 0.45,
        collaborative: 0.78,
        analytical: 0.85,
        enthusiastic: 0.7,
      },
    },
    intent: {
      primary: "Status Inquiry",
      confidence: 0.88,
      secondary: "Follow-up Request",
      secondaryConfidence: 0.12,
      explanation: "Sender is seeking clarification on internship review milestones.",
      architecture: "Status Inquiry (Primary) + Follow-up Request",
    },
    urgency: {
      level: "Medium",
      confidence: 0.84,
      sla: "48h SLA",
      reason: "High priority timeline mentioned with request for confirmation before Friday.",
    },
    keywords: [
      { term: "Internship", category: "Role", salience: 0.96 },
      { term: "Status Update", category: "Topic", salience: 0.93 },
      { term: "NLP Pipeline", category: "Tech", salience: 0.89 },
      { term: "Spring 2025", category: "Date", salience: 0.91 },
      { term: "Application", category: "Intent", salience: 0.85 },
    ],
    entities: [
      { text: "Spring 2025", type: "Timestamp", confidence: 0.96 },
      { text: "Machine Learning Internship", type: "Role" as any, confidence: 0.98 },
      { text: "alex.chen@stanford.edu", type: "Person", confidence: 0.99 },
    ],
    summary:
      "The sender is requesting an official status update regarding their internship application submitted last week, expressing readiness to provide supplementary documents upon request.",
    mainTopic: "Internship Recruitment Phase 2",
    positivePoints: [
      "Clear structured inquiry without ambiguity",
      "Polite and highly cooperative opening tone",
      "Explicit willingness to provide supplementary materials",
    ],
    negativePoints: [
      "Time-sensitive deadline mentioned requiring acknowledgement",
    ],
    insights: [
      { label: "Key Topic", value: "Internship Recruitment Phase 2" },
      { label: "Requested Action", value: "Timeline or Application Stage Status" },
      { label: "Comm. Style Score", value: "9.4 / 10 (Constructive)" },
    ],
    suggestedAction: 'Send canned acknowledgement "Application Under Review" with expected decision target date.',
    communicationStyleScore: 9.4,
    emailSpecific: {
      from: "alex.chen@stanford.edu",
      to: "careers@nexmind.io",
      subject: "Spring 2025 Machine Learning Internship Status Update",
      mainPurpose: "Internship Application Status Check",
      deadline: "Friday",
      explicitRequestedAction: "Status update regarding candidate submission",
      recommendedStrategicMove: "Send standard pipeline update with candidate profile linked to HR portal.",
      readingTime: "~30s read",
      fleschScore: 78,
      dkimTrust: "100% Trust",
      linguisticsConfidence: 0.998,
    },
    suggestedReplies: {
      executive: "Hi Alex,\n\nThank you for following up. Your application for the Spring 2025 ML Internship is currently under active review by the technical hiring squad. We anticipate sharing an update by end of day Friday.\n\nBest regards,\nNexMind Talent Team",
      technical: "Hi Alex,\n\nIn review. The committee is assessing submissions against our Q1 engineering capacity. Expect decision status by Friday.\n\nBest,\nEngineering Recruitment",
      concise: "Hi Alex,\n\nThanks for reaching out! Your submission is in review and we will be in touch by Friday with next steps.\n\n- NexMind Team",
    },
    isSaved: true,
  },
  {
    id: "NX-9042",
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    inputType: "text",
    inputText:
      "CRITICAL ALERT: Production API endpoint /v1/infer is throwing 504 gateway timeouts for all North American region users. We have triggered automated failover but need your primary cluster team on war room immediately.",
    classification: {
      label: "ESCALATE",
      confidence: 0.96,
      reason: "Severe active production outage affecting core API inference availability with failover in progress.",
    },
    sentiment: {
      label: "Negative",
      confidence: 0.94,
      polarity: -0.86,
    },
    tone: {
      primary: "Urgent & Direct",
      subTone: "Critical Infrastructure Warning",
      reason: "High priority operational warnings and critical disruption flags.",
      weights: {
        formal: 0.72,
        urgent: 0.98,
        collaborative: 0.5,
        analytical: 0.9,
      },
    },
    intent: {
      primary: "Bug Report / Outage",
      confidence: 0.95,
      secondary: "War Room Escalation",
      secondaryConfidence: 0.05,
      explanation: "Active production blocker requiring immediate technical cluster intervention.",
      architecture: "Bug Report / Outage (Primary) + War Room Escalation",
    },
    urgency: {
      level: "Critical",
      confidence: 0.99,
      sla: "<15m P0",
      reason: "504 Gateway Timeouts impacting production customer traffic across North America.",
    },
    keywords: [
      { term: "504 Gateway Timeout", category: "Tech", salience: 0.98 },
      { term: "Outage", category: "Topic", salience: 0.97 },
      { term: "API Cluster", category: "Tech", salience: 0.94 },
      { term: "Production Down", category: "Topic", salience: 0.96 },
      { term: "War Room", category: "Intent", salience: 0.91 },
    ],
    entities: [
      { text: "/v1/infer", type: "Technology", confidence: 0.99 },
      { text: "North American region", type: "Location", confidence: 0.95 },
      { text: "504 gateway timeouts", type: "Metric", confidence: 0.98 },
    ],
    summary:
      "P0 production incident reported for North American /v1/infer endpoint experiencing severe 504 timeouts, requiring active war room response.",
    mainTopic: "Production API 504 Outage",
    positivePoints: [
      "Automated cluster failover was successfully initiated",
      "Immediate unambiguous incident notification",
    ],
    negativePoints: [
      "504 gateway timeouts impacting 100% of North American regional users",
      "Primary inference cluster degraded",
    ],
    insights: [
      { label: "Key Topic", value: "Production Outage P0" },
      { label: "Requested Action", value: "Primary cluster team join war room immediately" },
      { label: "Comm. Style Score", value: "8.8 / 10 (Urgent Technical)" },
    ],
    suggestedAction: "Acknowledge P0 pager, join bridge war room, and inspect load balancer upstream pool metrics.",
    communicationStyleScore: 8.8,
    isSaved: false,
  },
  {
    id: "NX-7819",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    inputType: "review",
    inputText:
      "The new NLP extraction precision increased our agent triage speed by 3x. Our support managers can now handle twice the email load without missing any urgent SLA tickets. Incredible engineering work!",
    classification: {
      label: "EXCELLENT",
      confidence: 0.98,
      reason: "Strong positive commercial testimonial validating 3x operational efficiency gains and SLA compliance.",
    },
    sentiment: {
      label: "Positive",
      confidence: 0.98,
      polarity: 0.94,
    },
    tone: {
      primary: "Appreciative & Enthusiastic",
      subTone: "Delighted Enterprise Client",
      reason: "Direct praise and enthusiastic commendation for engineering milestones.",
      weights: {
        formal: 0.65,
        urgent: 0.1,
        collaborative: 0.85,
        analytical: 0.8,
        enthusiastic: 0.98,
      },
    },
    intent: {
      primary: "Testimonial / Praise",
      confidence: 0.97,
      secondary: "Product Commendation",
      secondaryConfidence: 0.03,
      explanation: "Enterprise client providing positive customer testimonial and feedback.",
      architecture: "Testimonial / Praise (Primary) + Product Commendation",
    },
    urgency: {
      level: "Low",
      confidence: 0.95,
      sla: "No Action Req.",
      reason: "Informational customer review commending performance.",
    },
    keywords: [
      { term: "NLP Extraction", category: "Tech", salience: 0.97 },
      { term: "Triage Speed 3x", category: "Metric", salience: 0.95 },
      { term: "Support Managers", category: "Role", salience: 0.88 },
      { term: "SLA Tickets", category: "Topic", salience: 0.91 },
      { term: "Engineering Praise", category: "Topic", salience: 0.93 },
    ],
    entities: [
      { text: "3x", type: "Metric", confidence: 0.99 },
      { text: "NLP extraction", type: "Technology", confidence: 0.96 },
    ],
    summary:
      "Client review praising NexMind NLP extraction for tripling support agent triage speed and doubling manager bandwidth while safeguarding SLA compliance.",
    mainTopic: "Product Performance Commendation",
    positivePoints: [
      "Agent triage speed increased by 300%",
      "Support managers successfully double email processing throughput",
      "Zero missed urgent SLA tickets reported",
    ],
    negativePoints: ["None identified"],
    insights: [
      { label: "Key Topic", value: "Enterprise ROI & Speed Testimonial" },
      { label: "Requested Action", value: "Archive for customer case study" },
      { label: "Comm. Style Score", value: "9.9 / 10 (Exemplary)" },
    ],
    suggestedAction: "Forward testimonial to Product and Marketing squads for inclusion in quarterly case studies.",
    communicationStyleScore: 9.9,
    isSaved: true,
  },
];

// Helper: load stored analyses
export function getStoredAnalyses(): AnalysisResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(INITIAL_SEED_ANALYSES));
      return INITIAL_SEED_ANALYSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_ANALYSES;
  } catch {
    return INITIAL_SEED_ANALYSES;
  }
}

// Helper: save analysis to history
export function saveAnalysisToHistory(analysis: AnalysisResult): void {
  const existing = getStoredAnalyses();
  const index = existing.findIndex((item) => item.id === analysis.id);
  let updated: AnalysisResult[];
  if (index >= 0) {
    updated = [analysis, ...existing.filter((item) => item.id !== analysis.id)];
  } else {
    updated = [analysis, ...existing];
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("nexmind_history_updated"));
}

// Helper: toggle bookmark/saved
export function toggleSaveAnalysis(id: string): boolean {
  const existing = getStoredAnalyses();
  let newState = false;
  const updated = existing.map((item) => {
    if (item.id === id) {
      newState = !item.isSaved;
      return { ...item, isSaved: newState };
    }
    return item;
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("nexmind_history_updated"));
  return newState;
}

// Helper: delete analysis
export function deleteAnalysisFromHistory(id: string): void {
  const existing = getStoredAnalyses();
  const updated = existing.filter((item) => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("nexmind_history_updated"));
}

// Helper: clear all history
export function clearAllHistory(): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent("nexmind_history_updated"));
}

// Helper: clear only saved
export function clearSavedAnalyses(): void {
  const existing = getStoredAnalyses();
  const updated = existing.map((item) => ({ ...item, isSaved: false }));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("nexmind_history_updated"));
}

// Chat message storage
export function getStoredChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) {
      const defaultWelcome: ChatMessage[] = [
        {
          id: "welcome-1",
          sender: "assistant",
          timestamp: "10:41 AM",
          text: "Hi Shashi! I'm NexMind, your intelligent NLP assistant. Send me an email, customer review, Slack snippet, or complaint, and I'll break down the sentiment, underlying tone, intent, and hidden urgency in real time.",
        },
      ];
      localStorage.setItem(CHAT_KEY, JSON.stringify(defaultWelcome));
      return defaultWelcome;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveChatMessage(msg: ChatMessage): void {
  const existing = getStoredChatMessages();
  const updated = [...existing, msg];
  localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("nexmind_chat_updated"));
}

export function clearChatHistory(): void {
  const defaultWelcome: ChatMessage[] = [
    {
      id: "welcome-fresh",
      sender: "assistant",
      timestamp: "Active",
      text: "Session cleared. NexMind is ready for a fresh document, raw email, or customer feedback snippet.",
    },
  ];
  localStorage.setItem(CHAT_KEY, JSON.stringify(defaultWelcome));
  window.dispatchEvent(new CustomEvent("nexmind_chat_updated"));
}

// Settings
export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getStoredTheme(): "light" | "dark" {
  try {
    const directTheme = localStorage.getItem("nexmind_theme");
    if (directTheme === "light" || directTheme === "dark") return directTheme;
    const settings = getStoredSettings();
    if (settings.theme === "light" || settings.theme === "dark") return settings.theme;
    return "dark";
  } catch {
    return "dark";
  }
}

export function saveTheme(theme: "light" | "dark"): void {
  try {
    localStorage.setItem("nexmind_theme", theme);
    const settings = getStoredSettings();
    settings.theme = theme;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(new CustomEvent("nexmind_settings_updated"));
    window.dispatchEvent(new CustomEvent("nexmind_theme_updated", { detail: theme }));
  } catch {}
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  if (settings.theme === "dark") {
    document.documentElement.classList.add("dark");
    localStorage.setItem("nexmind_theme", "dark");
  } else if (settings.theme === "light") {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("nexmind_theme", "light");
  }
  window.dispatchEvent(new CustomEvent("nexmind_settings_updated"));
}

// User Profile
export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent("nexmind_profile_updated"));
}

// Demo Auth Session Management (purely local, safe demo account)
export function isUserLoggedIn(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === "true";
  } catch {
    return false;
  }
}

export function loginUser(name: string, email: string, role?: string): void {
  const current = getStoredProfile();
  const updated: UserProfile = {
    ...current,
    name: name.trim() || current.name,
    email: email.trim() || current.email,
    role: role?.trim() || current.role,
  };
  saveProfile(updated);
  localStorage.setItem(AUTH_KEY, "true");
  window.dispatchEvent(new CustomEvent("nexmind_auth_updated"));
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new CustomEvent("nexmind_auth_updated"));
}

