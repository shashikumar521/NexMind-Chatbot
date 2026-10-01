import React, { useState, useEffect } from "react";
import { UserProfile } from "../types/nlp";

interface HeaderProps {
  onToggleSidebarMobile: () => void;
  onNewAnalysis: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  theme: "dark" | "light" | "system";
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebarMobile,
  onNewAnalysis,
  searchQuery,
  onSearchChange,
  userProfile,
  onOpenProfile,
  theme,
  onToggleTheme,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // ⌘K hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input");
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="fixed top-0 lg:left-72 left-0 right-0 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/15 z-40">
      <div className="h-16 w-full px-space-md lg:px-space-lg flex items-center justify-between gap-space-md">
        {/* Left Section: Mobile Menu + Search */}
        <div className="flex items-center gap-space-md flex-1 max-w-xl">
          <button
            className="lg:hidden p-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            onClick={onToggleSidebarMobile}
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              id="global-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-surface-container-low pl-10 pr-4 py-space-xs rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/10 transition-all"
              placeholder="Search analyses, emails, keywords... [⌘K]"
              type="text"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-[14px]"
                onClick={() => onSearchChange("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Telemetry + Actions */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          {/* Online Cluster Indicator */}
          <div className="hidden lg:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-low border border-outline-variant/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Local NLP Mode · Zero Latency
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            aria-label="Toggle Theme"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all border border-outline-variant/30 text-label-md font-medium"
            onClick={onToggleTheme}
            title={`Current theme: ${theme}. Click to switch.`}
          >
            <span>{theme === "dark" ? "🌙" : "☀️"}</span>
            <span className="hidden md:inline">{theme === "dark" ? "Dark" : "Light"}</span>
          </button>

          {/* New Analysis Button */}
          <button
            onClick={onNewAnalysis}
            className="hidden sm:flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-all shadow-[0_0_16px_-3px_rgba(6,182,212,0.35)]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Analysis</span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors relative"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface-container-high shadow-2xl p-space-md border border-outline-variant/30 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 mb-space-xs">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Inference Notifications
                  </span>
                  <span className="font-label-sm text-label-sm text-primary">2 Active</span>
                </div>
                <div className="space-y-space-xs text-body-sm">
                  <div className="p-space-xs rounded bg-surface-container hover:bg-surface-bright transition-colors">
                    <p className="font-medium text-on-surface">Local NLP Pipeline Active</p>
                    <p className="text-on-surface-variant text-[11px]">
                      Deterministic multi-factor analysis running with zero latency.
                    </p>
                  </div>
                  <div className="p-space-xs rounded bg-surface-container hover:bg-surface-bright transition-colors">
                    <p className="font-medium text-secondary">New Sentiment Log Ready</p>
                    <p className="text-on-surface-variant text-[11px]">
                      Email parser processed batch #NX-8941 with 92% confidence.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div
            className="flex items-center gap-space-xs cursor-pointer select-none"
            onClick={onOpenProfile}
            title="Profile Details"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/40"
              src={userProfile.avatarUrl}
            />
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              expand_more
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
