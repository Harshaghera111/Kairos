import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Calendar, Zap } from 'lucide-react';

interface KairosAnalysisPanelProps {
  title: string;
  urgency: 'low' | 'medium' | 'high';
  importance: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  extractedDeadline: string;
  reasoning: string;
  exiting: boolean;
}

const BADGE = {
  high: {
    bg: 'bg-rose-50',
    border: 'border-rose-150',
    dot: 'bg-rose-500',
    text: 'text-rose-600',
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-150',
    dot: 'bg-amber-500',
    text: 'text-amber-600',
  },
  low: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-150',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600',
  },
};

function MetricBadge({
  label,
  value,
  visible,
  delay,
}: {
  label: string;
  value: 'low' | 'medium' | 'high';
  visible: boolean;
  delay: number;
}) {
  const c = BADGE[value];
  if (!visible) return <div className="h-8 w-24 opacity-0" />;
  return (
    <div
      className={`animate-badgeReveal flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${c.bg} ${c.border}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className={`text-[10px] font-extrabold uppercase tracking-wide ${c.text}`}>
        {value}
      </span>
    </div>
  );
}

export default function KairosAnalysisPanel({
  title,
  urgency,
  importance,
  effort,
  extractedDeadline,
  reasoning,
  exiting,
}: KairosAnalysisPanelProps) {
  const [showTitle, setShowTitle] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showDeadline, setShowDeadline] = useState(false);
  const [showDivider, setShowDivider] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [typedReasoning, setTypedReasoning] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setShowTitle(true), 120));
    timers.push(setTimeout(() => setShowBadges(true), 320));
    timers.push(setTimeout(() => setShowDeadline(true), 750));
    timers.push(setTimeout(() => setShowDivider(true), 950));
    timers.push(setTimeout(() => setShowReasoning(true), 1150));

    // Typewriter
    timers.push(
      setTimeout(() => {
        let charIndex = 0;
        intervalRef.current = setInterval(() => {
          charIndex++;
          setTypedReasoning(reasoning.slice(0, charIndex));
          if (charIndex >= reasoning.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        }, 12);
      }, 1250)
    );

    return () => {
      timers.forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reasoning]);

  const deadlineDaysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(extractedDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );
  const deadlineFormatted = new Date(extractedDeadline).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const isCursorVisible =
    showReasoning && typedReasoning.length > 0 && typedReasoning.length < reasoning.length;

  const progressDuration = exiting ? '0.01s' : '3s';

  return (
    <div
      className={`card overflow-hidden ${
        exiting ? 'animate-slideOutPanel' : 'animate-slideUpPanel'
      }`}
      style={{
        border: '1px solid rgba(99, 102, 241, 0.25)',
        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.08)',
      }}
    >
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-3 h-3 text-indigo-600" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase font-mono">
              Kairos Analysis
            </span>
          </div>

          {/* Pulse */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Processing complete
            </span>
          </div>
        </div>

        {/* Goal Title */}
        <div
          className={`transition-all duration-400 ${
            showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Commitment Identified
          </p>
          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            "{title}"
          </h3>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap min-h-[34px]">
          <MetricBadge label="Urgency"    value={urgency}    visible={showBadges} delay={0}   />
          <MetricBadge label="Importance" value={importance} visible={showBadges} delay={100} />
          <MetricBadge label="Effort"     value={effort}     visible={showBadges} delay={200} />
        </div>

        {/* Deadline */}
        <div
          className={`flex items-center gap-2 transition-all duration-400 ${
            showDeadline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-500 leading-none">
            Due in{' '}
            <span className="text-slate-800 font-semibold">{deadlineDaysLeft} days</span>
            <span className="text-slate-300 mx-1.5">·</span>
            <span className="text-slate-400">{deadlineFormatted}</span>
          </span>
        </div>

        {/* Divider */}
        {showDivider && (
          <div className="h-px bg-gradient-to-r from-indigo-500/20 via-indigo-500/5 to-transparent" />
        )}

        {/* Reasoning */}
        <div
          className={`transition-all duration-400 ${
            showReasoning ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-indigo-500" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">
              AI Reasoning
            </p>
          </div>
          <p className="text-xs text-slate-650 leading-relaxed min-h-[38px] font-medium">
            {typedReasoning}
            {isCursorVisible && (
              <span className="inline-block w-[2px] h-[13px] bg-indigo-500 ml-[1px] align-middle animate-cursorBlink" />
            )}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="relative h-[3px] bg-slate-100 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-indigo-400 animate-analysisProgress"
          style={{ animationDuration: progressDuration }}
        />
      </div>
    </div>
  );
}
