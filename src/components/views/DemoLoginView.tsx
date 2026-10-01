import React, { useState } from "react";
import { UserProfile } from "../../types/nlp";
import { loginUser } from "../../services/storageService";

interface DemoLoginViewProps {
  onLoginSuccess: () => void;
  initialProfile: UserProfile;
}

export const DemoLoginView: React.FC<DemoLoginViewProps> = ({
  onLoginSuccess,
  initialProfile,
}) => {
  const [name, setName] = useState<string>(initialProfile.name || "Shashi");
  const [email, setEmail] = useState<string>(initialProfile.email || "shashi.research@nexmind.io");
  const [role, setRole] = useState<string>(initialProfile.role || "AI/ML Researcher");
  const [showFeatures, setShowFeatures] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(name, email, role);
    onLoginSuccess();
  };

  const handleInstantDemo = () => {
    loginUser("Shashi", "shashi.research@nexmind.io", "AI/ML Researcher");
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between text-on-surface antialiased relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Navbar */}
      <header className="h-16 px-space-md lg:px-space-xl flex items-center justify-between border-b border-outline-variant/15 backdrop-blur-xl bg-surface/80 z-20">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
          <div>
            <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
              NexMind
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <div className="hidden sm:inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high border border-outline-variant/20 text-primary font-label-sm text-label-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Local NLP Mode Active</span>
          </div>
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md px-space-sm py-1 rounded-lg hover:bg-surface-container transition-colors"
          >
            {showFeatures ? "Hide Features" : "Explore Features"}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-space-md py-space-xl z-10 max-w-4xl mx-auto w-full">
        {/* Hero Pitch */}
        <div className="text-center space-y-space-xs mb-space-lg max-w-2xl">
          <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-primary-container/15 text-primary border border-primary/30 font-label-sm text-label-sm uppercase tracking-widest font-semibold shadow-sm">
            <span>Deterministic Semantic Synthesizer</span>
            <span>·</span>
            <span>100% Offline / Local</span>
          </div>

          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">
            Understand Every Message.
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            NexMind is an AI-powered NLP intelligence platform that understands complete emails, reviews, messages, and customer feedback.
          </p>
        </div>

        {/* Feature Highlights Accordion */}
        {showFeatures && (
          <div className="w-full bg-surface-container-low rounded-2xl p-space-lg mb-space-lg border border-outline-variant/20 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-space-md animate-in fade-in slide-in-from-top-4">
            <div className="p-space-md rounded-xl bg-surface-container space-y-1 border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-[24px]">balance</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Context-Aware NLP</h3>
              <p className="text-body-sm text-on-surface-variant">Classifies complete sentences and resolution outcomes rather than single keywords.</p>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container space-y-1 border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary text-[24px]">mail</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Email &amp; Ticket Analyzer</h3>
              <p className="text-body-sm text-on-surface-variant">Extracts deadlines, explicit requested actions, entities, and one-click smart drafts.</p>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container space-y-1 border border-outline-variant/10">
              <span className="material-symbols-outlined text-tertiary text-[24px]">smart_toy</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Conversational Assistant</h3>
              <p className="text-body-sm text-on-surface-variant">Chat naturally or submit text for instant structured multi-vector semantic breakdown.</p>
            </div>
          </div>
        )}

        {/* Local Demo Login Card */}
        <div className="w-full max-w-md bg-surface-container-low rounded-2xl p-space-lg sm:p-space-xl shadow-2xl border border-outline-variant/20 space-y-space-md">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-surface-container-high mx-auto flex items-center justify-center text-primary mb-2 shadow-inner">
              <span className="material-symbols-outlined text-[26px]">lock_open</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
              Enter Local Demo Session
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              No API keys or cloud account required. Profile and data remain private in your browser.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-space-sm pt-space-xs">
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                Your Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shashi"
                  className="w-full bg-surface-container pl-10 pr-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/15"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. shashi.research@nexmind.io"
                  className="w-full bg-surface-container pl-10 pr-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/15"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                Role / Title (Optional)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  badge
                </span>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. AI/ML Researcher"
                  className="w-full bg-surface-container pl-10 pr-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/15"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-headline-sm hover:brightness-110 active:scale-[0.99] shadow-[0_0_20px_-3px_rgba(6,182,212,0.45)] transition-all font-semibold"
            >
              Launch NexMind Workspace
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-outline-variant/20"></div>
            <span className="flex-shrink mx-3 text-on-surface-variant font-label-sm text-label-sm uppercase">or</span>
            <div className="flex-grow border-t border-outline-variant/20"></div>
          </div>

          <button
            onClick={handleInstantDemo}
            className="w-full py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md transition-colors border border-outline-variant/20 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>Try Instant Demo with Default Profile</span>
          </button>

          <div className="p-space-xs rounded bg-surface-container text-center text-on-surface-variant text-[11px] border border-outline-variant/10">
            Local Demo Account · AI API integration can be connected anytime later.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 px-space-md flex items-center justify-between border-t border-outline-variant/15 text-body-sm text-on-surface-variant bg-surface/50">
        <span>NexMind © 2026 · Understand Every Message</span>
        <div className="flex items-center gap-space-md text-label-sm font-label-sm">
          <span className="text-primary font-semibold">Local NLP Mode</span>
          <span>Zero Server Footprint</span>
        </div>
      </footer>
    </div>
  );
};
