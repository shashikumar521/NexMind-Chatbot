import React, { useState } from "react";
import { UserProfile } from "../types/nlp";

interface ProfileModalProps {
  isOpen: boolean;
  userProfile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  userProfile,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState<string>(userProfile.name);
  const [role, setRole] = useState<string>(userProfile.role);
  const [email, setEmail] = useState<string>(userProfile.email);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...userProfile,
      name: name.trim() || userProfile.name,
      role: role.trim() || userProfile.role,
      email: email.trim() || userProfile.email,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-lg bg-surface-container rounded-2xl p-space-lg shadow-2xl border border-outline-variant/30 space-y-space-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/15">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[22px]">account_circle</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Researcher Profile
            </h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-space-md">
          <div className="flex items-center gap-space-md">
            <img
              src={userProfile.avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/50"
            />
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface font-medium">{userProfile.name}</p>
              <p className="text-body-sm text-on-surface-variant">{userProfile.role}</p>
              <span className="inline-block mt-1 font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
                NexMind Cluster Access Granted
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-high px-space-md py-space-xs rounded-lg font-body-sm text-body-sm text-on-surface outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/20"
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Role / Title</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-surface-container-high px-space-md py-space-xs rounded-lg font-body-sm text-body-sm text-on-surface outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/20"
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-high px-space-md py-space-xs rounded-lg font-body-sm text-body-sm text-on-surface outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/20"
            />
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md font-semibold transition-all shadow-sm"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
