import React from 'react';
import { Sparkles, Compass, Shield, Zap, Calendar, FileText, Clock } from 'lucide-react';
import { AgentAction } from '../types';

interface ActivityLogProps {
  logs: AgentAction[];
}

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

const TYPE_CONFIG: Record<
  string,
  { icon: any; label: string; iconColor: string; bgColor: string; borderGlow: string }
> = {
  extraction: {
    icon: Sparkles,
    label: 'Goal Understood',
    iconColor: 'text-indigo-650',
    bgColor: 'bg-indigo-50',
    borderGlow: 'border-indigo-100 hover:border-indigo-200 hover:shadow-brand-sm',
  },
  planning: {
    icon: Compass,
    label: 'Roadmap Structured',
    iconColor: 'text-violet-650',
    bgColor: 'bg-violet-50',
    borderGlow: 'border-violet-100 hover:border-violet-200 hover:shadow-brand-sm',
  },
  scheduling: {
    icon: Calendar,
    label: 'Focus Slot Reserved',
    iconColor: 'text-blue-650',
    bgColor: 'bg-blue-50',
    borderGlow: 'border-blue-100 hover:border-blue-200 hover:shadow-[0_4px_16px_rgba(59,130,246,0.04)]',
  },
  risk_evaluation: {
    icon: Shield,
    label: 'Buffer Re-evaluated',
    iconColor: 'text-amber-650',
    bgColor: 'bg-amber-50',
    borderGlow: 'border-amber-100 hover:border-amber-200 hover:shadow-[0_4px_16px_rgba(245,158,11,0.04)]',
  },
  recovery_intervention: {
    icon: Zap,
    label: 'Coach Intervention',
    iconColor: 'text-rose-650',
    bgColor: 'bg-rose-50',
    borderGlow: 'border-rose-100 hover:border-rose-200 hover:shadow-[0_4px_16px_rgba(244,63,94,0.04)]',
  },
  artifact_generation: {
    icon: FileText,
    label: 'Companion Draft Created',
    iconColor: 'text-emerald-650',
    bgColor: 'bg-emerald-50',
    borderGlow: 'border-emerald-100 hover:border-emerald-200 hover:shadow-[0_4px_16px_rgba(16,185,129,0.04)]',
  },
};

const STATUS_CONFIG: Record<
  string,
  { dot: string; badge: string; label: string }
> = {
  success: {
    dot: 'bg-emerald-500',
    badge: 'badge-success',
    label: 'Completed',
  },
  info: {
    dot: 'bg-indigo-500',
    badge: 'badge-brand',
    label: 'Analyzing',
  },
  warning: {
    dot: 'bg-amber-500',
    badge: 'badge-warning',
    label: 'Attention Needed',
  },
  critical: {
    dot: 'bg-rose-500',
    badge: 'badge-danger',
    label: 'Action Required',
  },
};

const clean = (text: string) =>
  text
    .replace(/^"|"$/g, '')
    .replace(/^User query: "?/, '')
    .replace(/"$/, '')
    .trim();

const truncate = (text: string, max = 95) =>
  text.length > max ? text.substring(0, max) + '…' : text;

const buildNarrative = (log: AgentAction): { headline: string; detail: string } => {
  const observed = truncate(clean(log.observedText));
  const outcome = log.resultOutcome.replace(/\.$/, '');

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
        headline: observed.length > 5 ? observed : 'I reviewed your progress and stress buffer.',
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

export default function ActivityLog({ logs }: ActivityLogProps) {
  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-display-sm text-slate-900">
              Coach's Journal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live traces of my scheduling interventions, buffer adjustments, and task structured plans.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600">
          {logs.length} {logs.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {/* Empty State */}
      {logs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center animate-fadeIn">
          <span className="text-4xl mb-4 select-none animate-floatSlow">📖</span>
          <p className="text-slate-700 text-sm font-semibold">My journal is currently silent.</p>
          <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed text-center">
            Once you commit to a new goal, I will record step-by-step coaching entries as I adjust schedules and de-risk your buffers.
          </p>
        </div>
      ) : (
        /* ── Timeline feed ──────────────────────────────────────── */
        <div className="relative pl-6 space-y-6">
          {/* Vertical timeline line */}
          <div className="absolute left-[9px] top-3 bottom-3 w-px bg-slate-200 pointer-events-none" />

          {logs.map((log, index) => {
            const config = TYPE_CONFIG[log.type] ?? TYPE_CONFIG['extraction'];
            const statusConf = STATUS_CONFIG[log.status] ?? STATUS_CONFIG['info'];
            const { headline, detail } = buildNarrative(log);
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className="relative group animate-fadeIn"
                style={{ animationDelay: `${Math.min(index * 45, 250)}ms` }}
              >
                {/* Timeline node */}
                <div className={`absolute -left-[23px] top-1 w-[13px] h-[13px] rounded-full border-2 border-white flex items-center justify-center ${statusConf.dot} shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-transform duration-300 group-hover:scale-125`} />

                <div 
                  className={`p-4 rounded-xl border transition-all duration-200 ${config.borderGlow}`}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* Top metadata info */}
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
                        <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">
                        {config.label}
                      </span>
                      <span className={`badge ${statusConf.badge}`}>
                        {statusConf.label}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {getRelativeTime(log.timestamp)}
                    </span>
                  </div>

                  {/* Headline & Detail */}
                  <div className="space-y-1 pl-0.5">
                    <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                      {headline}
                    </p>
                    {detail && detail.length > 0 && (
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {detail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
