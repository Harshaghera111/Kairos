import React from 'react';
import { Shield, LogOut, Compass, Sparkles, Layers } from 'lucide-react';
import { signInWithGoogle, logOut, isUsingMock } from '../lib/firebase';
import { UserProfile } from '../types';

interface SidebarProps {
  user: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  {
    id: 'commitments',
    label: 'My Commitments',
    icon: Compass,
    desc: 'Roadmaps & stress buffers',
  },
  {
    id: 'activity_log',
    label: "Coach's Diary",
    icon: Sparkles,
    desc: 'Decisions explained simply',
  },
  {
    id: 'warp_simulator',
    label: 'Stress Test',
    icon: Layers,
    desc: 'Simulate blocks & adapt',
  },
];

export default function Sidebar({ user, onUserChange, activeTab, onTabChange }: SidebarProps) {
  const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (result && result.user) {
        onUserChange({
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await logOut();
    onUserChange(null);
  };

  return (
    <aside
      className="desktop-sidebar flex-col justify-between h-screen flex-shrink-0"
      style={{
        width: '252px',
        background: '#ffffff',
        borderRight: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* ── Top Section ───────────────────────────────────────────────── */}
      <div className="p-5 flex flex-col gap-8">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {/* Logo mark */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 2px 8px rgba(99,102,241,0.15)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" opacity="0.9"/>
                <path d="M12 12 L12 5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 12 L17 15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.8"/>
              </svg>
            </div>
            {/* Active indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{
                background: '#10b981',
                borderColor: '#ffffff',
                boxShadow: '0 0 4px rgba(16,185,129,0.3)',
              }}
            />
          </div>

          <div>
            <h1 className="kairos-wordmark">KAIROS</h1>
            <p className="text-[10px] text-indigo-500 font-medium tracking-wide mt-0.5">
              AI Executive Companion
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1" role="navigation" aria-label="Main navigation">
          <span className="text-label-xs text-slate-400 block px-2 mb-3">
            Workspace
          </span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left cursor-pointer group relative ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                style={isActive ? {
                  background: 'rgba(99,102,241,0.04)',
                  border: '1px solid rgba(99,102,241,0.12)',
                } : {
                  background: 'transparent',
                  border: '1px solid transparent',
                }}
              >
                {/* Active left indicator */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: '#6366f1' }}
                  />
                )}

                <div className={`p-1.5 rounded-lg flex-shrink-0 transition-all ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
                  style={isActive ? { background: 'rgba(99,102,241,0.06)' } : { background: 'rgba(0,0,0,0.03)' }}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <span className={`text-sm font-semibold block leading-tight ${
                    isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'
                  }`}>
                    {item.label}
                  </span>
                  <span className="text-[10.5px] text-slate-400 block mt-0.5 truncate">
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── AI Status Indicator ────────────────────────────────────────── */}
      <div className="px-5 py-3">
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
          style={{
            background: 'rgba(99,102,241,0.03)',
            border: '1px solid rgba(99,102,241,0.08)',
          }}
        >
          <div className="ping-dot flex-shrink-0">
            <span className="ping-dot-inner bg-indigo-500" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-800 block">Kairos is active</span>
            <span className="text-[10px] text-slate-400 truncate block">Monitoring your commitments</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Auth Section ────────────────────────────────────────── */}
      <div
        className="p-4"
        style={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}
      >
        {user ? (
          <div
            className="flex items-center justify-between gap-3 p-3 rounded-xl"
            style={{
              background: 'rgba(0, 0, 0, 0.02)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'}
                alt={user.displayName || 'User avatar'}
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{ boxShadow: '0 0 0 2px rgba(99,102,241,0.2)' }}
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-800 truncate block">
                  {user.displayName || 'Authorized User'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {user.email || 'user@agency.com'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-danger-ghost btn-icon flex-shrink-0"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="btn btn-primary w-full"
            aria-label="Connect your account with Google"
          >
            <Shield className="w-4 h-4" />
            Connect Account
          </button>
        )}

        <div className="mt-3 text-center">
          <span className="text-[9px] text-slate-400 select-none">
            {isUsingMock ? '● Sandbox Mode' : '● Cloud Sync Active'}
          </span>
        </div>
      </div>
    </aside>
  );
}
