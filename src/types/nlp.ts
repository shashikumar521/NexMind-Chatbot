export type SentimentLabel = 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
export type ClassificationLabel = 'GOOD' | 'BAD' | 'NEUTRAL' | 'CRITICAL' | 'ESCALATE' | 'EXCELLENT';
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type InputType = 'text' | 'email' | 'review' | 'complaint' | 'chat';

export interface KeywordEntity {
  term: string;
  category: 'Role' | 'Topic' | 'Tech' | 'Date' | 'Intent' | 'Metric' | 'General';
  salience?: number;
}

export interface NamedEntity {
  text: string;
  type: 'Person' | 'Organization' | 'Location' | 'Timestamp' | 'Technology' | 'Metric' | 'Product' | 'Doc Requirement';
  confidence: number;
}

export interface EmailMetadata {
  from?: string;
  to?: string;
  subject?: string;
}

export interface EmailSpecificAnalysis {
  from?: string;
  to?: string;
  subject?: string;
  mainPurpose: string;
  deadline: string; // e.g., "Friday, 5:00 PM EST" or "Not detected"
  explicitRequestedAction: string;
  recommendedStrategicMove: string;
  readingTime: string;
  fleschScore: number;
  dkimTrust: string;
  linguisticsConfidence: number;
}

export interface SuggestedReplies {
  executive: string;
  technical: string;
  concise: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  inputType: InputType;
  inputText: string;
  metadata?: EmailMetadata;
  classification: {
    label: ClassificationLabel;
    confidence: number;
    reason: string;
  };
  sentiment: {
    label: SentimentLabel;
    confidence: number;
    polarity: number; // -1 to +1
    confidenceAvailable?: boolean;
    confidenceText?: string;
    visualBar?: string; // e.g. "████████░░ 82%"
  };
  tone: {
    primary: string;
    subTone: string;
    reason?: string;
    weights: {
      formal: number;
      urgent: number;
      collaborative: number;
      analytical: number;
      enthusiastic?: number;
      concerned?: number;
    };
  };
  intent: {
    primary: string;
    confidence: number;
    secondary?: string;
    secondaryConfidence?: number;
    explanation?: string;
    architecture: string;
  };
  urgency: {
    level: UrgencyLevel;
    confidence: number;
    sla: string;
    reason: string;
  };
  keywords: KeywordEntity[];
  groupedKeywords?: {
    topics: string[];
    technologies: string[];
    people: string[];
    organizations: string[];
    dates: string[];
    other: string[];
  };
  entities: NamedEntity[];
  summary: string;
  mainTopic: string;
  mainTopics?: string[];
  positivePoints: string[];
  negativePoints: string[];
  importantInfo?: Array<{
    label: string;
    value: string;
  }>;
  insights: Array<{
    label: string;
    value: string;
  }>;
  suggestedAction: string;
  finalAssessment?: string;
  communicationStyleScore?: number; // e.g. 9.4
  emailSpecific?: EmailSpecificAnalysis;
  suggestedReplies?: SuggestedReplies;
  isSaved?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  analysis?: AnalysisResult;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatarUrl: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  enterToSend: boolean;
  showConfidence: boolean;
  showKeywords: boolean;
  showDetailedInsights: boolean;
  autoAnalyzePaste: boolean;
}
