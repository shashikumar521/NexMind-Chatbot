import React, { useState } from "react";
import { AppSettings, UserProfile } from "../../types/nlp";
import {
  saveSettings,
  clearAllHistory,
  clearSavedAnalyses,
  getStoredAnalyses,
} from "../../services/storageService";

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  userProfile: UserProfile;
  onOpenConfirmModal: (opts: { title: string; message: string; onConfirm: () => void }) => void;
  onToggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  userProfile,
  onOpenConfirmModal,
  onToggleTheme,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  const handleToggle = (key: keyof AppSettings) => {
    const updated = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    saveSettings(updated);
    showNotice("Setting updated.");
  };

  const handleThemeChange = (newTheme: "dark" | "light" | "system") => {
    const updated: AppSettings = { ...localSettings, theme: newTheme };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    saveSettings(updated);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    }
    showNotice(`Theme switched to ${newTheme}.`);
  };

  const showNotice = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(null), 2500);
  };

  const handleClearHistory = () => {
    onOpenConfirmModal({
      title: "Clear All Analysis History",
      message: "This will permanently erase all past text and email analyses from your local storage. Are you sure?",
      onConfirm: () => {
        clearAllHistory();
        showNotice("Analysis history cleared.");
      },
    });
  };

  const handleClearSaved = () => {
    onOpenConfirmModal({
      title: "Clear Bookmarked Analyses",
      message: "This will unpin/remove all saved analyses. Are you sure?",
      onConfirm: () => {
        clearSavedAnalyses();
        showNotice("Saved analyses cleared.");
      },
    });
  };

  const handleExportAll = () => {
    const data = {
      profile: userProfile,
      settings: localSettings,
      analyses: getStoredAnalyses(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexmind-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice("Complete database exported.");
  };

  return (
    <div className="px-space-md lg:px-margin py-space-lg flex flex-col gap-space-xl max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
            System Preferences // Engine Config
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Client Workspace</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
          Settings
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Configure appearance, NLP display sensitivity, chat behavior, and persistent local data storage.
        </p>
      </div>

      {saveBanner && (
        <div className="p-space-sm rounded-lg bg-primary-container/20 border border-primary/40 text-primary flex items-center gap-2 text-body-sm animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{saveBanner}</span>
        </div>
      )}

      {/* 1. Appearance Section */}
      <div className="bg-surface-container-low rounded-2xl p-space-lg shadow-sm border border-outline-variant/15 space-y-space-md">
        <div className="flex items-center gap-space-xs pb-space-xs border-b border-outline-variant/10">
          <span className="material-symbols-outlined text-primary text-[20px]">palette</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Appearance</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs">
          <button
            onClick={() => handleThemeChange("dark")}
            className={`p-space-md rounded-xl text-left border flex flex-col justify-between gap-space-sm transition-all ${
              localSettings.theme === "dark"
                ? "bg-surface-container-high border-primary ring-1 ring-primary"
                : "bg-surface-container border-outline-variant/15 hover:bg-surface-container-high"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[24px] text-primary">dark_mode</span>
              {localSettings.theme === "dark" && (
                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
              )}
            </div>
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface font-medium">Dark Mode</p>
              <p className="text-body-sm text-on-surface-variant">Carbon-slate high contrast cybernetic visual system.</p>
            </div>
          </button>

          <button
            onClick={() => handleThemeChange("light")}
            className={`p-space-md rounded-xl text-left border flex flex-col justify-between gap-space-sm transition-all ${
              localSettings.theme === "light"
                ? "bg-surface-container-high border-primary ring-1 ring-primary"
                : "bg-surface-container border-outline-variant/15 hover:bg-surface-container-high"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[24px] text-secondary">light_mode</span>
              {localSettings.theme === "light" && (
                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
              )}
            </div>
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface font-medium">Light Mode</p>
              <p className="text-body-sm text-on-surface-variant">Crisp daylight palette designed for bright workspaces.</p>
            </div>
          </button>

          <button
            onClick={() => handleThemeChange("system")}
            className={`p-space-md rounded-xl text-left border flex flex-col justify-between gap-space-sm transition-all ${
              localSettings.theme === "system"
                ? "bg-surface-container-high border-primary ring-1 ring-primary"
                : "bg-surface-container border-outline-variant/15 hover:bg-surface-container-high"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[24px] text-tertiary">computer</span>
              {localSettings.theme === "system" && (
                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
              )}
            </div>
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface font-medium">System Sync</p>
              <p className="text-body-sm text-on-surface-variant">Syncs automatically with operating system theme.</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Chat & Interaction Preferences */}
      <div className="bg-surface-container-low rounded-2xl p-space-lg shadow-sm border border-outline-variant/15 space-y-space-md">
        <div className="flex items-center gap-space-xs pb-space-xs border-b border-outline-variant/10">
          <span className="material-symbols-outlined text-secondary text-[20px]">chat</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Chat &amp; Interaction
          </h2>
        </div>

        <div className="space-y-space-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface font-medium">Enter to Send</p>
              <p className="text-body-sm text-on-surface-variant">Pressing Enter dispatches the message immediately; Shift+Enter creates a new line.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.enterToSend}
                onChange={() => handleToggle("enterToSend")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/10">
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface font-medium">Auto-Analyze Pasted Content</p>
              <p className="text-body-sm text-on-surface-variant">Automatically detect emails, reviews, or logs when pasted and prepare analysis.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoAnalyzePaste}
                onChange={() => handleToggle("autoAnalyzePaste")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Analysis Display Options */}
      <div className="bg-surface-container-low rounded-2xl p-space-lg shadow-sm border border-outline-variant/15 space-y-space-md">
        <div className="flex items-center gap-space-xs pb-space-xs border-b border-outline-variant/10">
          <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Analysis Display Features
          </h2>
        </div>

        <div className="space-y-space-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface font-medium">Show Confidence Percentages</p>
              <p className="text-body-sm text-on-surface-variant">Render calculated precision scores alongside sentiment, tone, and intent tags.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showConfidence}
                onChange={() => handleToggle("showConfidence")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/10">
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface font-medium">Render Extracted Keywords &amp; NER</p>
              <p className="text-body-sm text-on-surface-variant">Include named entity recognition chips, dates, technologies, and organizations.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showKeywords}
                onChange={() => handleToggle("showKeywords")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/10">
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface font-medium">Detailed Strategic Insights &amp; Attribution Map</p>
              <p className="text-body-sm text-on-surface-variant">Display token attention highlights and actionable strategic recommendations.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showDetailedInsights}
                onChange={() => handleToggle("showDetailedInsights")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Data Storage & Management */}
      <div className="bg-surface-container-low rounded-2xl p-space-lg shadow-sm border border-outline-variant/15 space-y-space-md">
        <div className="flex items-center gap-space-xs pb-space-xs border-b border-outline-variant/10">
          <span className="material-symbols-outlined text-error text-[20px]">database</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Data Storage &amp; Privacy
          </h2>
        </div>

        <p className="text-body-sm text-on-surface-variant">
          NexMind persists your analysis runs, bookmarked reports, and chat transcripts securely in your browser's private local state. No personal data is sold or shared.
        </p>

        <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-outline-variant/20 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">download</span>
            <span>Export Full Database (JSON)</span>
          </button>

          <button
            onClick={handleClearSaved}
            className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-outline-variant/20 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">bookmark_remove</span>
            <span>Clear Saved Analyses</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-error-container/40 hover:bg-error-container text-error font-label-md text-label-md border border-error/30 transition-all shadow-sm ml-auto"
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            <span>Clear History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
