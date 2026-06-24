import React from 'react';
import { Shield, LogOut, Compass, Sparkles, Layers, Moon } from 'lucide-react';
import { auth, isUsingMock, signInWithGoogle, logOut } from '../lib/firebase';
import { UserProfile } from '../types';

interface SidebarProps {
  user: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

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

  // Humanized nav — hierarchy: home → transparency → power feature
  const menuItems = [
    {
      id: 'commitments',
      label: 'My Commitments',
      icon: Compass,
      desc: 'Roadmaps & stress buffers',
    },
    {
      id: 'activity_log',
      label: 'Coach\'s Diary',
      icon: Sparkles,
      desc: 'Decisions explained simply',
    },
    {
      id: 'warp_simulator',
      label: 'Disruption Stress Test',
      icon: Layers,
      desc: 'Simulate blocks & adapt plan',
    },
  ];

  return (
    <div className="w-64 bg-[#0c1020] border-r border-[#1e293b]/70 flex flex-col justify-between h-screen text-slate-300 flex-shrink-0">
      {/* Top Section */}
      <div className="p-5">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-950/30 flex-shrink-0">
            <Moon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight text-white">
              KAIROS
            </h1>
            <p className="text-[10px] tracking-wide text-indigo-400/80 font-medium">
              Your AI Execution Coach
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider block uppercase mb-2.5 px-2">
            Workspace
          </span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-start gap-3.5 p-3 rounded-xl transition-all duration-150 text-left cursor-pointer group ${
                  isActive
                    ? 'bg-[#181f38] border border-indigo-500/20 text-white'
                    : 'hover:bg-[#13192e]/65 border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg flex-shrink-0 transition-transform group-hover:scale-105 ${
                    isActive
                      ? 'bg-indigo-950/50 text-indigo-400'
                      : 'bg-slate-900/50 text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-medium block leading-tight truncate">
                    {item.label}
                  </span>
                  <span className="text-[10.5px] text-slate-550 block font-sans tracking-wide mt-0.5 truncate">
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Auth Section */}
      <div className="p-5 border-t border-[#1e293b]/70">
        {user ? (
          <div className="flex items-center justify-between gap-3 bg-[#13192e]/40 p-3 rounded-xl border border-[#1e293b]/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  user.photoURL ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'
                }
                alt="Avatar"
                className="w-8 h-8 rounded-full ring-2 ring-indigo-500/20 flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate block">
                  {user.displayName || 'Authorized User'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {user.email || 'user@agency.com'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-950/20 font-sans cursor-pointer hover:-translate-y-px"
          >
            <Shield className="w-4 h-4" />
            Connect Account
          </button>
        )}

        <div className="mt-3 text-center">
          <span className="text-[9px] text-slate-600 font-sans select-none">
            {isUsingMock ? 'Sandbox Mode' : 'Cloud Sync Active'}
          </span>
        </div>
      </div>
    </div>
  );
}
