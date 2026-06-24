import React from 'react';
import { Sparkles, Compass, Shield, Zap, Calendar, FileText, Clock } from 'lucide-react';
import { AgentAction } from '../types';

interface ActivityLogProps {
  logs: AgentAction[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const getRelativeTime = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return new Date(timestamp).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
};

// Per action-type: icon, friendly label, colors
const TYPE_CONFIG: Record<
  string,
  { icon: any; label: string; iconColor: string; bgColor: string }
> = {
  extraction: {
    icon: Sparkles,
    label: 'Goal Understood',
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
  },
  planning: {
    icon: Compass,
    label: 'Roadmap Structured',
    iconColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  scheduling: {
    icon: Calendar,
    label: 'Focus Slot Reserved',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  risk_evaluation: {
    icon: Shield,
    label: 'Buffer Re-evaluated',
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  recovery_intervention: {
    icon: Zap,
    label: 'Coach Intervention',
    iconColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
  },
  artifact_generation: {
    icon: FileText,
    label: 'Companion Draft Created',
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
};

// Per status: dot color, badge style, human label
const STATUS_CONFIG: Record<
  string,
  { dot: string; badge: string; label: string }
> = {
  success: {
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-950/30 text-emerald-300 border-emerald-900/30',
    label: 'Completed',
  },
  info: {
    dot: 'bg-indigo-400',
    badge: 'bg-indigo-950/30 text-indigo-300 border-indigo-900/30',
    label: 'Analyzing',
  },
  warning: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-950/30 text-amber-300 border-amber-900/30',
    label: 'Attention Needed',
  },
  critical: {
    dot: 'bg-rose-400',
    badge: 'bg-rose-950/30 text-rose-300 border-rose-900/30',
    label: 'Action Required',
  },
};

// ── Narrative builder ─────────────────────────────────────────────────────────
// Turns raw log fields into a human-readable headline + supporting detail.
// No more hardcoded "Deadline Health stabilized at 100%".

const clean = (text: string) =>
  text
    .replace(/^"|"$/g, '')
    .replace(/^User query: "?/, '')
    .replace(/"$/, '')
    .trim();

const truncate = (text: string, max = 90) =>
  text.length > max ? text.substring(0, max) + '…' : text;

const buildNarrative = (log: AgentAction): { headline: string; detail: string } => {
  const observed = truncate(clean(log.observedText));
  const outcome = log.resultOutcome.replace(/\.$/, '');
  const action = log.actionTaken.replace(/\.$/, '');

  switch (log.type) {
    case 'extraction':
      return {
        headline: `I understood your new goal: "${observed}"`,
        detail: `I mapped out the key details and prepared a proactive roadmap.`,
      };

    case 'planning':
      return {
        headline: 'I structured a custom roadmap for your goal.',
        detail: `I broke down the work into focused milestones and estimated effort constraints.`,
      };

    case 'risk_evaluation':
      return {
        headline:
          observed.length > 5
            ? observed
            : 'I reviewed your progress and stress buffer.',
        detail: `I recalculated your timelines to make sure you have enough breathing room.`,
      };

    case 'recovery_intervention':
      return {
        headline: 'I stepped in to secure your target deadline.',
        detail: `I drafted an emergency timeline extension email and optimized your remaining steps.`,
      };

    case 'scheduling':
      return {
        headline: 'I reserved focused work sessions to protect your momentum.',
        detail: `Each focus session is timed dynamically to give you maximum recovery.`,
      };

    case 'artifact_generation':
      return {
        headline: 'I created a helpful submission draft for you.',
        detail: `A companion draft is ready in your AI drafts tab to save you time when submitting.`,
      };

    default: {
      return {
        headline: observed.length > 5 ? observed : log.type,
        detail: outcome ? `${outcome}.` : '',
      };
    }
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ActivityLog({ logs }: ActivityLogProps) {
  return (
    <div className="bg-[#111625] border border-[#1e293b]/70 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.03] rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#1e293b]/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 tracking-tight">
              My Coach's Journal
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              A log of how I am actively structuring roadmaps, reserving focus slots, and protecting your stress buffer.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2.5 py-1 rounded">
          {logs.length} {logs.length === 1 ? 'log' : 'logs'}
        </span>
      </div>

      {/* Empty State */}
      {logs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#1e293b]/70 rounded-2xl bg-[#080c16]/10 flex flex-col items-center justify-center">
          <span className="text-3xl mb-3 select-none">🕊️</span>
          <p className="text-slate-300 text-sm font-semibold">My journal is empty.</p>
          <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed text-center font-sans">
            Once we plan a goal together, my coach notes will appear here to show you how I am protecting your timeline.
          </p>
        </div>
      ) : (
        /* ── Feed ──────────────────────────────────────────────── */
        <div className="space-y-3">
          {logs.map((log, index) => {
            const config = TYPE_CONFIG[log.type] ?? TYPE_CONFIG['extraction'];
            const statusConf = STATUS_CONFIG[log.status] ?? STATUS_CONFIG['info'];
            const { headline, detail } = buildNarrative(log);
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className="group flex gap-4 p-4 rounded-xl bg-[#0b0e17]/60 border border-[#1e293b]/50 hover:border-[#2a3a55]/70 transition-all duration-200 animate-fadeIn"
                style={{ animationDelay: `${Math.min(index * 35, 200)}ms` }}
              >
                {/* Left: type icon */}
                <div
                  className={`p-2 rounded-lg ${config.bgColor} h-fit flex-shrink-0 mt-0.5`}
                >
                  <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
                </div>

                {/* Right: content */}
                <div className="flex-1 min-w-0">
                  {/* Row: action label + status badge + timestamp */}
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-300 leading-snug">
                        {config.label}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border tracking-wide ${statusConf.badge}`}
                      >
                        {statusConf.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex-shrink-0 flex items-center gap-1 font-sans">
                      <Clock className="w-3 h-3" />
                      {getRelativeTime(log.timestamp)}
                    </span>
                  </div>

                  {/* Narrative headline — what happened */}
                  <p className="text-xs text-slate-200 font-medium leading-snug mb-1.5">
                    {headline}
                  </p>

                  {/* Supporting detail — why / outcome */}
                  {detail && detail.length > 3 && (
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      {detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
