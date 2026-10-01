import React from "react";
import { UserProfile } from "../types/nlp";

export type PageId =
  | "dashboard"
  | "analyze-text"
  | "email-analyzer"
  | "chat-with-nexmind"
  | "analysis-history"
  | "saved-analyses"
  | "analytics-and-stats"
  | "settings";

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onLogout: () => void;
  theme: "light" | "dark" | "system";
  onSetTheme: (theme: "light" | "dark") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenOnMobile,
  onCloseMobile,
  userProfile,
  onOpenProfile,
  onLogout,
  theme,
  onSetTheme,
}) => {
  const navItems: Array<{ id: PageId; label: string; icon: string }> = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "analyze-text", label: "Analyze Text", icon: "chat" },
    { id: "email-analyzer", label: "Email Analyzer", icon: "mail" },
    { id: "chat-with-nexmind", label: "Chat with NexMind", icon: "smart_toy" },
    { id: "analysis-history", label: "Analysis History", icon: "history" },
    { id: "saved-analyses", label: "Saved Analyses", icon: "star" },
    { id: "analytics-and-stats", label: "Analytics & Stats", icon: "insights" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-low/95 backdrop-blur-xl z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-outline-variant/20 transition-transform duration-300 lg:translate-x-0 ${
          isOpenOnMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Status Header */}
          <div className="p-space-lg">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-space-sm mb-space-xs cursor-pointer select-none"
                onClick={() => {
                  onNavigate("dashboard");
                  onCloseMobile();
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                </div>
                <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
                  NexMind
                </span>
              </div>
              <button
                className="lg:hidden p-1 text-on-surface-variant hover:text-on-surface"
                onClick={onCloseMobile}
                aria-label="Close Sidebar"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
              Understand Every Message.
            </p>
            <div className="inline-flex flex-col gap-0.5 px-space-sm py-space-xs rounded-lg bg-surface-container-high border border-outline-variant/30 w-full">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                <span className="font-label-sm text-label-sm uppercase text-primary tracking-wider font-semibold">
                  Local NLP Mode Active
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant leading-tight">
                AI API integration can be enabled later.
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-space-xs px-space-md">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all text-left ${
                    isActive
                      ? "bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_-3px_rgba(6,182,212,0.35)]"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="font-label-lg text-label-lg">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Theme Toggle & User Profile Footer */}
        <div className="flex flex-col gap-space-sm p-space-md">
          {/* Working Light / Dark Theme Switcher */}
          <div className="p-1 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => onSetTheme("light")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-label-md font-semibold transition-all ${
                theme === "light"
                  ? "bg-surface-container-low text-primary shadow-sm ring-1 ring-primary/20"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title="Switch to Light Theme"
            >
              <span className="text-[14px]">☀️</span>
              <span>Light</span>
            </button>
            <button
              onClick={() => onSetTheme("dark")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-label-md font-semibold transition-all ${
                theme === "dark" || (theme !== "light" && document.documentElement.classList.contains("dark"))
                  ? "bg-surface-container-high text-primary shadow-sm ring-1 ring-primary/20"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title="Switch to Dark Theme"
            >
              <span className="text-[14px]">🌙</span>
              <span>Dark</span>
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-space-sm cursor-pointer min-w-0"
                onClick={onOpenProfile}
                title="Edit Profile"
              >
                <img
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-primary/40"
                  src={userProfile.avatarUrl}
                />
                <div className="truncate">
                  <p className="font-label-lg text-label-lg text-on-surface font-medium leading-none truncate">
                    {userProfile.name}
                  </p>
                  <p className="font-label-sm text-label-sm text-primary mt-space-xs truncate">
                    Local Demo Account
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-xs shrink-0">
                <button
                  aria-label="Settings"
                  className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                  onClick={() => onNavigate("settings")}
                  title="Settings"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </button>
                <button
                  aria-label="Log Out"
                  className="p-space-xs rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors"
                  onClick={onLogout}
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
