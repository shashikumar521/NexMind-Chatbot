/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sidebar, PageId } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./components/views/DashboardView";
import { AnalyzeTextView } from "./components/views/AnalyzeTextView";
import { EmailAnalyzerView } from "./components/views/EmailAnalyzerView";
import { ChatView } from "./components/views/ChatView";
import { HistoryView } from "./components/views/HistoryView";
import { SavedAnalysesView } from "./components/views/SavedAnalysesView";
import { AnalyticsStatsView } from "./components/views/AnalyticsStatsView";
import { SettingsView } from "./components/views/SettingsView";
import { DemoLoginView } from "./components/views/DemoLoginView";
import { InspectModal } from "./components/InspectModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ProfileModal } from "./components/ProfileModal";
import { AnalysisResult, AppSettings, UserProfile } from "./types/nlp";
import {
  getStoredAnalyses,
  getStoredSettings,
  saveSettings,
  getStoredTheme,
  saveTheme,
  getStoredProfile,
  saveProfile,
  isUserLoggedIn,
  logoutUser,
} from "./services/storageService";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard");
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [analyses, setAnalyses] = useState<AnalysisResult[]>(getStoredAnalyses());
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(getStoredTheme());
  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredProfile());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isUserLoggedIn());

  // Modal states
  const [inspectedAnalysis, setInspectedAnalysis] = useState<AnalysisResult | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Theme application
  useEffect(() => {
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [currentTheme]);

  // Synchronize history & profile updates from storage service events
  useEffect(() => {
    const handleHistoryUpdate = () => {
      setAnalyses(getStoredAnalyses());
    };
    const handleProfileUpdate = () => {
      setUserProfile(getStoredProfile());
    };
    const handleSettingsUpdate = () => {
      const s = getStoredSettings();
      setSettings(s);
      setCurrentTheme(getStoredTheme());
    };
    const handleAuthUpdate = () => {
      setIsLoggedIn(isUserLoggedIn());
      setUserProfile(getStoredProfile());
    };
    const handleThemeEvent = (e: any) => {
      if (e.detail === "light" || e.detail === "dark") {
        setCurrentTheme(e.detail);
      }
    };

    window.addEventListener("nexmind_history_updated", handleHistoryUpdate);
    window.addEventListener("nexmind_profile_updated", handleProfileUpdate);
    window.addEventListener("nexmind_settings_updated", handleSettingsUpdate);
    window.addEventListener("nexmind_auth_updated", handleAuthUpdate);
    window.addEventListener("nexmind_theme_updated", handleThemeEvent);

    return () => {
      window.removeEventListener("nexmind_history_updated", handleHistoryUpdate);
      window.removeEventListener("nexmind_profile_updated", handleProfileUpdate);
      window.removeEventListener("nexmind_settings_updated", handleSettingsUpdate);
      window.removeEventListener("nexmind_auth_updated", handleAuthUpdate);
      window.removeEventListener("nexmind_theme_updated", handleThemeEvent);
    };
  }, []);

  const handleSetTheme = (newTheme: "light" | "dark") => {
    setCurrentTheme(newTheme);
    saveTheme(newTheme);
  };

  const handleToggleTheme = () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    handleSetTheme(nextTheme);
  };

  const handleOpenConfirmModal = (opts: { title: string; message: string; onConfirm: () => void }) => {
    setConfirmModalState({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      onConfirm: opts.onConfirm,
    });
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    saveProfile(updated);
  };

  const handleLogout = () => {
    handleOpenConfirmModal({
      title: "End Demo Session",
      message: "Are you sure you want to log out of this Local Demo Account?",
      onConfirm: () => {
        logoutUser();
        setIsLoggedIn(false);
      },
    });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query && currentPage !== "analysis-history" && currentPage !== "saved-analyses") {
      setCurrentPage("analysis-history");
    }
  };

  // If not logged in, show safe local demo access landing/login
  if (!isLoggedIn) {
    return (
      <DemoLoginView
        initialProfile={userProfile}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setCurrentPage("dashboard");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
      {/* Navigation Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpenOnMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        userProfile={userProfile}
        onOpenProfile={() => setProfileModalOpen(true)}
        onLogout={handleLogout}
        theme={currentTheme}
        onSetTheme={handleSetTheme}
      />

      {/* Main View Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onToggleSidebarMobile={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          onNewAnalysis={() => setCurrentPage("analyze-text")}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          userProfile={userProfile}
          onOpenProfile={() => setProfileModalOpen(true)}
          theme={currentTheme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Page Content Container */}
        <main className="relative pt-16 flex-1 bg-surface">
          {currentPage === "dashboard" && (
            <DashboardView
              userProfile={userProfile}
              analyses={analyses}
              onInspectAnalysis={(item) => setInspectedAnalysis(item)}
              onNavigate={setCurrentPage}
              theme={currentTheme}
              onSetTheme={handleSetTheme}
            />
          )}

          {currentPage === "analyze-text" && (
            <AnalyzeTextView onInspectAnalysis={(item) => setInspectedAnalysis(item)} />
          )}

          {currentPage === "email-analyzer" && <EmailAnalyzerView />}

          {currentPage === "chat-with-nexmind" && (
            <ChatView
              userProfile={userProfile}
              onOpenConfirmModal={handleOpenConfirmModal}
            />
          )}

          {currentPage === "analysis-history" && (
            <HistoryView
              analyses={analyses}
              onInspectAnalysis={(item) => setInspectedAnalysis(item)}
              onOpenConfirmModal={handleOpenConfirmModal}
            />
          )}

          {currentPage === "saved-analyses" && (
            <SavedAnalysesView
              analyses={analyses}
              onInspectAnalysis={(item) => setInspectedAnalysis(item)}
              onOpenConfirmModal={handleOpenConfirmModal}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === "analytics-and-stats" && (
            <AnalyticsStatsView analyses={analyses} />
          )}

          {currentPage === "settings" && (
            <SettingsView
              settings={settings}
              onUpdateSettings={setSettings}
              userProfile={userProfile}
              onOpenConfirmModal={handleOpenConfirmModal}
              onToggleTheme={handleToggleTheme}
            />
          )}
        </main>
      </div>

      {/* Full Details Inspection Modal */}
      <InspectModal
        analysis={inspectedAnalysis}
        onClose={() => setInspectedAnalysis(null)}
      />

      {/* Profile Editor Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        userProfile={userProfile}
        onSave={handleSaveProfile}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        onConfirm={() => {
          confirmModalState.onConfirm();
          setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
