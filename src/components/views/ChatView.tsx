import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserProfile, AnalysisResult } from "../../types/nlp";
import { sendChatMessageAPI } from "../../services/apiService";
import {
  getStoredChatMessages,
  saveChatMessage,
  clearChatHistory,
  saveAnalysisToHistory,
} from "../../services/storageService";

interface ChatViewProps {
  userProfile: UserProfile;
  onOpenConfirmModal: (opts: { title: string; message: string; onConfirm: () => void }) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ userProfile, onOpenConfirmModal }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(getStoredChatMessages());
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>("Local NLP Engine (Offline Mode)");
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync stored messages
  useEffect(() => {
    const handleUpdate = () => {
      setMessages(getStoredChatMessages());
    };
    window.addEventListener("nexmind_chat_updated", handleUpdate);
    return () => window.removeEventListener("nexmind_chat_updated", handleUpdate);
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isSending) return;

    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text,
    };
    saveChatMessage(userMsg);
    setIsSending(true);

    try {
      // Build conversation history for API
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.sender,
        content: m.text,
      }));

      const apiResponse = await sendChatMessageAPI(conversationHistory);

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: apiResponse.replyText,
        analysis: apiResponse.analysis,
      };

      if (apiResponse.analysis) {
        saveAnalysisToHistory(apiResponse.analysis);
      }

      saveChatMessage(assistantMsg);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `NexMind couldn't complete the response: ${err.message || "Connection error"}. Please try again.`,
      };
      saveChatMessage(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    onOpenConfirmModal({
      title: "Clear Conversation History",
      message: "Are you sure you want to clear the current chat history? This action cannot be undone.",
      onConfirm: () => {
        clearChatHistory();
      },
    });
  };

  const handleExportChat = () => {
    const exportData = JSON.stringify(messages, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexmind-conversation-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAction = (id: string, actionText: string) => {
    navigator.clipboard.writeText(actionText);
    setCopiedActionId(id);
    setTimeout(() => setCopiedActionId(null), 2000);
  };

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const handleToggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechNotice("Speech recognition is not supported in this browser. Please type your message.");
      setTimeout(() => setSpeechNotice(null), 3500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechNotice("Listening... Speak your message now.");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        setSpeechNotice(null);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechNotice("Microphone unavailable or speech not detected.");
        setTimeout(() => setSpeechNotice(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechNotice("Could not access microphone.");
      setTimeout(() => setSpeechNotice(null), 3000);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-space-lg p-space-md lg:p-margin max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)]">
        {/* Top Action & Context Header Bar */}
        <div className="bg-surface-container-low rounded-xl p-space-md sm:p-space-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-outline-variant/15">
          <div className="flex flex-wrap items-center gap-space-md min-w-0">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shadow-[0_0_16px_-3px_rgba(6,182,212,0.35)]">
                <span className="material-symbols-outlined text-[24px]">smart_toy</span>
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight leading-snug">
                  Chat with NexMind
                </h1>
                <div className="flex items-center gap-space-xs mt-space-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                    Online · Local NLP Mode Active
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block h-6 w-px bg-surface-container-highest"></div>

            {/* Model Switcher Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-bright px-space-md py-space-xs rounded-lg text-on-surface transition-all border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">neurology</span>
                <span className="font-label-md text-label-md">{selectedModel}</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                  expand_more
                </span>
              </button>

              {showModelDropdown && (
                <div className="absolute top-full left-0 mt-space-xs w-72 bg-surface-container-highest rounded-xl p-space-xs shadow-xl z-30 border border-outline-variant/30 animate-in fade-in">
                  <button
                    onClick={() => {
                      setSelectedModel("Local NLP Engine (Offline Mode)");
                      setShowModelDropdown(false);
                    }}
                    className="w-full text-left px-space-sm py-space-xs rounded-lg hover:bg-surface-container text-on-surface flex flex-col gap-space-xs"
                  >
                    <span className="font-label-md text-label-md font-semibold text-primary">
                      Local NLP Engine (Offline Mode)
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Zero latency, deterministic multi-vector parser
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedModel("Local DeepReason (Contextual Mode)");
                      setShowModelDropdown(false);
                    }}
                    className="w-full text-left px-space-sm py-space-xs rounded-lg hover:bg-surface-container text-on-surface flex flex-col gap-space-xs"
                  >
                    <span className="font-label-md text-label-md font-semibold text-secondary">
                      Local DeepReason (Contextual Mode)
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Heuristic clause evaluation with resolution analysis
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Session Utility Actions */}
          <div className="flex items-center gap-space-sm self-end md:self-auto">
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors shadow-sm border border-outline-variant/15"
              title="Clear Conversation"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span className="font-label-md text-label-md hidden sm:inline">Clear History</span>
            </button>
            <button
              onClick={handleExportChat}
              className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors shadow-sm border border-outline-variant/15"
              title="Export Conversation"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span className="font-label-md text-label-md hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Conversational Stream */}
        <div className="flex flex-col gap-space-xl min-h-[420px] pb-space-lg">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";

            if (isUser) {
              return (
                <div key={msg.id} className="flex items-start gap-space-md max-w-3xl ml-auto flex-row-reverse">
                  <img
                    alt={userProfile.name}
                    src={userProfile.avatarUrl}
                    className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm ring-1 ring-primary/40"
                  />
                  <div className="flex flex-col gap-space-xs items-end">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {msg.timestamp}
                      </span>
                      <span className="font-label-md text-label-md font-semibold text-on-surface">
                        {userProfile.name}
                      </span>
                    </div>
                    <div className="bg-surface-container-high rounded-xl rounded-tr-sm p-space-md text-on-surface shadow-md border border-outline-variant/15">
                      <p className="font-body-md text-body-md leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // Assistant Message
            return (
              <div key={msg.id} className="flex items-start gap-space-md max-w-4xl">
                <div className="w-9 h-9 rounded-xl bg-surface-container-high shrink-0 flex items-center justify-center text-primary shadow-[0_0_16px_-3px_rgba(6,182,212,0.35)] border border-primary/20">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div className="flex flex-col gap-space-sm w-full">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      NexMind Intelligence
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {msg.timestamp}
                    </span>
                    {msg.analysis && (
                      <span className="px-space-xs py-0.5 rounded-full bg-primary-container/20 font-label-sm text-label-sm text-primary">
                        CONFIDENCE: {Math.round(msg.analysis.sentiment.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Standard Text Bubble */}
                  <div className="bg-surface-container-low rounded-xl rounded-tl-sm p-space-md text-on-surface shadow-sm border border-outline-variant/15">
                    <p className="font-body-md text-body-md leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>

                  {/* If this message contains structured NLP analysis, render the deep card */}
                  {msg.analysis && (
                    <div className="bg-surface-container-low rounded-xl p-space-md sm:p-space-lg shadow-xl flex flex-col gap-space-md border border-outline-variant/20 mt-space-xs animate-in fade-in">
                      {/* Executive Signal Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
                        {/* Sentiment */}
                        <div className="bg-surface-container p-space-md rounded-lg flex flex-col justify-between border border-outline-variant/10">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                            Overall Sentiment
                          </span>
                          <div className="flex items-center gap-space-xs mt-space-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                            <span className="font-headline-sm text-headline-sm text-on-surface">
                              {msg.analysis.sentiment.label}
                            </span>
                          </div>
                          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-sm overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${Math.round(msg.analysis.sentiment.confidence * 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant mt-space-xs">
                            {Math.round(msg.analysis.sentiment.confidence * 100)}% confidence
                          </span>
                        </div>

                        {/* Classification */}
                        <div className="bg-surface-container p-space-md rounded-lg flex flex-col justify-between border border-outline-variant/10">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                            Classification
                          </span>
                          <div className="flex items-center gap-space-xs mt-space-xs">
                            <span className="material-symbols-outlined text-[20px] text-primary">verified</span>
                            <span className="font-headline-sm text-headline-sm text-primary font-bold">
                              {msg.analysis.classification.label}
                            </span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs line-clamp-2">
                            {msg.analysis.classification.reason}
                          </p>
                        </div>

                        {/* Tone */}
                        <div className="bg-surface-container p-space-md rounded-lg flex flex-col justify-between border border-outline-variant/10">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                            Detected Tone
                          </span>
                          <div className="flex items-center gap-space-xs mt-space-xs">
                            <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
                            <span className="font-headline-sm text-headline-sm text-on-surface">
                              {msg.analysis.tone.primary}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-space-xs">
                            <span className="px-space-xs py-0.5 rounded bg-surface-container-high font-label-sm text-label-sm text-secondary">
                              {msg.analysis.tone.subTone}
                            </span>
                          </div>
                        </div>

                        {/* Urgency */}
                        <div className="bg-surface-container p-space-md rounded-lg flex flex-col justify-between border border-outline-variant/10">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                            Urgency Vector
                          </span>
                          <div className="flex items-center gap-space-xs mt-space-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                            <span className="font-headline-sm text-headline-sm text-tertiary">
                              {msg.analysis.urgency.level}
                            </span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                            {msg.analysis.urgency.sla} · {msg.analysis.urgency.reason}
                          </p>
                        </div>
                      </div>

                      {/* Intent Architecture */}
                      <div className="bg-surface-container p-space-md rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm border border-outline-variant/10">
                        <div className="flex items-center gap-space-sm">
                          <span className="material-symbols-outlined text-[20px] text-primary">alt_route</span>
                          <div>
                            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block">
                              Primary Intent Architecture
                            </span>
                            <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                              {msg.analysis.intent.architecture}
                            </span>
                          </div>
                        </div>
                        <span className="px-space-sm py-space-xs rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                          Parser: Token Splitter v2
                        </span>
                      </div>

                      {/* Positive vs Negative Decomposition */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                        {/* Positive */}
                        <div className="bg-surface-container p-space-md rounded-lg flex flex-col gap-space-sm border border-outline-variant/10">
                          <div className="flex items-center gap-space-xs text-primary">
                            <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                            <span className="font-label-md text-label-md font-semibold tracking-wide uppercase">
                              Positive Vectors
                            </span>
                          </div>
                          <ul className="flex flex-col gap-space-xs">
                            {msg.analysis.positivePoints.map((pt, i) => (
                              <li key={i} className="flex items-start gap-space-xs text-on-surface font-body-sm text-body-sm">
                                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 shrink-0">
                                  check_circle
                                </span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Negative */}
                        <div className="bg-surface-container p-space-md rounded-lg flex flex-col gap-space-sm border border-outline-variant/10">
                          <div className="flex items-center gap-space-xs text-error">
                            <span className="material-symbols-outlined text-[18px]">warning</span>
                            <span className="font-label-md text-label-md font-semibold tracking-wide uppercase">
                              Friction Points
                            </span>
                          </div>
                          <ul className="flex flex-col gap-space-xs">
                            {msg.analysis.negativePoints.map((pt, i) => (
                              <li key={i} className="flex items-start gap-space-xs text-on-surface font-body-sm text-body-sm">
                                <span className="material-symbols-outlined text-[16px] text-error mt-0.5 shrink-0">
                                  error
                                </span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Recommended Action Item Banner */}
                      <div className="bg-surface-container-high p-space-md rounded-lg flex items-center justify-between gap-space-md border border-outline-variant/10">
                        <div className="flex items-center gap-space-sm min-w-0">
                          <div className="w-8 h-8 rounded bg-primary-container/20 shrink-0 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider block">
                              Recommended Action Item
                            </span>
                            <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                              {msg.analysis.suggestedAction}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyAction(msg.id, msg.analysis!.suggestedAction)}
                          className="shrink-0 px-space-sm py-space-xs bg-surface-container hover:bg-surface-bright rounded text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-space-xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {copiedActionId === msg.id ? "check" : "content_copy"}
                          </span>
                          <span className="hidden sm:inline">
                            {copiedActionId === msg.id ? "Copied" : "Copy"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Follow-up Suggestion Chips */}
                  {msg.analysis && (
                    <div className="flex flex-wrap items-center gap-space-xs mt-space-xs">
                      <span className="font-label-sm text-label-sm text-on-surface-variant mr-space-xs">
                        Follow-up prompts:
                      </span>
                      <button
                        onClick={() =>
                          handleSendMessage("Extract all technical entities and roles mentioned in this review.")
                        }
                        className="group flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high px-space-md py-space-xs rounded-full text-on-surface transition-all shadow-sm border border-outline-variant/15 text-left"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary group-hover:rotate-45 transition-transform">
                          auto_awesome
                        </span>
                        <span className="font-label-sm text-label-sm font-medium">
                          Extract entities from this review
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          handleSendMessage(
                            "Draft an empathetic developer response addressing the customer's crash issue."
                          )
                        }
                        className="group flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high px-space-md py-space-xs rounded-full text-on-surface transition-all shadow-sm border border-outline-variant/15 text-left"
                      >
                        <span className="material-symbols-outlined text-[16px] text-secondary group-hover:rotate-45 transition-transform">
                          edit_note
                        </span>
                        <span className="font-label-sm text-label-sm font-medium">
                          Draft empathetic developer response
                        </span>
                      </button>

                      <button
                        onClick={() => handleSendMessage("Summarize the key takeaways in exactly one sentence.")}
                        className="group flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high px-space-md py-space-xs rounded-full text-on-surface transition-all shadow-sm border border-outline-variant/15 text-left"
                      >
                        <span className="material-symbols-outlined text-[16px] text-tertiary group-hover:rotate-45 transition-transform">
                          short_text
                        </span>
                        <span className="font-label-sm text-label-sm font-medium">Summarize in 1 sentence</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-start gap-space-md max-w-3xl">
              <div className="w-9 h-9 rounded-xl bg-surface-container-high shrink-0 flex items-center justify-center text-primary animate-pulse">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/15">
                <div className="flex items-center gap-2 text-on-surface-variant text-body-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  <span>NexMind is reasoning and extracting semantic tokens...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Persistent Bottom Chat Input Dock */}
        <div className="sticky bottom-4 z-30 mt-auto">
          <div className="bg-surface-container-low/95 backdrop-blur-xl p-space-sm sm:p-space-md rounded-2xl shadow-xl flex flex-col gap-space-xs border border-outline-variant/20">
            {/* Input Textarea & Micro-actions Row */}
            <div className="flex items-end gap-space-sm bg-surface-container rounded-xl p-space-xs sm:p-space-sm border border-outline-variant/15">
              {/* Attachment Button */}
              <label
                className="p-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0 cursor-pointer"
                title="Attach file, email, or log"
              >
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
                <input
                  type="file"
                  accept=".txt,.eml,.json,.csv"
                  onChange={handleAttachFile}
                  className="hidden"
                />
              </label>

              {/* Voice Input Button */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-space-sm rounded-lg transition-colors shrink-0 ${
                  isListening
                    ? "bg-primary text-on-primary animate-pulse"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
                title={isListening ? "Listening... click to stop" : "Voice Input (Speech-to-text)"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isListening ? "graphic_eq" : "mic"}
                </span>
              </button>

              {/* Dynamic Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask NexMind anything or paste text to analyze... (Shift+Enter for newline)"
                className="flex-1 bg-transparent border-0 outline-none text-on-surface placeholder:text-outline font-body-md text-body-md resize-none py-space-xs px-space-xs max-h-32 min-h-[24px]"
              />

              {/* Send Action Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={isSending || !inputText.trim()}
                className="p-space-sm rounded-lg bg-primary-container text-on-primary-container hover:opacity-90 transition-all shrink-0 flex items-center justify-center shadow-[0_0_16px_-3px_rgba(6,182,212,0.45)] disabled:opacity-40"
                title="Send Message"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>

            {/* Speech recognition or status notification banner */}
            {speechNotice && (
              <div className="mx-space-xs px-space-sm py-1 rounded-lg bg-surface-container-highest text-primary font-label-sm text-label-sm flex items-center gap-space-xs border border-primary/20 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span>{speechNotice}</span>
              </div>
            )}

            {/* Helper Legend Footer */}
            <div className="flex flex-wrap items-center justify-between px-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[14px] text-primary">keyboard_return</span>
                <span>Enter to send · NexMind analyzes sentiment, tone &amp; intent automatically</span>
              </div>
              <div className="hidden sm:flex items-center gap-space-md">
                <span>Latency: 24ms</span>
                <span>Tokens: 3.4k / 8k</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
