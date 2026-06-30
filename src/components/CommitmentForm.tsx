import React, { useState } from 'react';
import { Sparkles, Zap, Send, BookOpen, UserCheck, ArrowRight } from 'lucide-react';

interface CommitmentFormProps {
  onCommitmentAdd: (input: string) => Promise<void>;
  loading: boolean;
  loadingMessage?: string;
}

// Empathetic, coach-focused progression steps
const AI_STEPS = [
  {
    label: 'Reading your commitment...',
    sub: 'Parsing details, context, and potential challenges.',
    icon: '🔍',
  },
  {
    label: 'Extracting deadline and workload...',
    sub: 'Structuring the ideal route to secure your due date.',
    icon: '📅',
  },
  {
    label: 'Estimating effort and urgency...',
    sub: 'Factoring in extra breathing room for unexpected disruptions.',
    icon: '⚡',
  },
  {
    label: 'Building your execution plan...',
    sub: 'Carving out dedicated, high-impact focus milestones.',
    icon: '🗺️',
  },
  {
    label: 'Finalizing your schedule...',
    sub: 'Polishing your plan of action so we start stress-free.',
    icon: '✅',
  },
];

const SUGGESTIONS = [
  {
    category: 'Study Goal',
    text: 'Submit my final Physics-201 lab report on Electromagnetism by Friday 5 PM, high difficulty.',
    icon: BookOpen,
    color: 'text-violet-600',
    bg: 'rgba(139,92,246,0.04)',
    border: 'rgba(139,92,246,0.12)',
  },
  {
    category: 'Client Delivery',
    text: 'Deliver the client-facing Figma prototype for Apex Corp dashboard before Monday noon.',
    icon: Zap,
    color: 'text-amber-600',
    bg: 'rgba(217,119,6,0.04)',
    border: 'rgba(217,119,6,0.12)',
  },
  {
    category: 'Career Milestone',
    text: 'Submit updated portfolio and resume to Senior design role at Stripe by Thursday midnight.',
    icon: UserCheck,
    color: 'text-cyan-600',
    bg: 'rgba(8,145,178,0.04)',
    border: 'rgba(8,145,178,0.12)',
  },
];

export default function CommitmentForm({
  onCommitmentAdd,
  loading,
  loadingMessage,
}: CommitmentFormProps) {
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const stepIndex = Math.max(
    0,
    AI_STEPS.findIndex((s) => s.label === loadingMessage)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onCommitmentAdd(inputText);
    setInputText('');
  };

  const charCount = inputText.length;
  const maxChars = 500;

  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Subtle radial layout lighting */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </div>
        <h2 className="text-display-sm text-slate-900">
          What goal are we securing today?
        </h2>
      </div>

      <p className="text-slate-500 text-xs leading-relaxed mb-5 pl-11">
        Describe it naturally — deadline, scope, complexity. I'll build the roadmap.
      </p>

      {/* ── AI Processing State ─────────────────────────────────────── */}
      {loading ? (
        <div
          className="rounded-xl p-5 space-y-5 animate-fadeInScale"
          style={{
            background: 'rgba(99,102,241,0.03)',
            border: '1px solid rgba(99,102,241,0.1)',
          }}
        >
          {/* Thinking header */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-end h-5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-thinking-1 block" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-thinking-2 block" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-thinking-3 block" />
            </div>
            <span className="text-sm font-semibold text-indigo-600">
              {loadingMessage || 'Reading your commitment...'}
            </span>
          </div>

          {/* Progress steps */}
          <div className="space-y-2.5">
            {AI_STEPS.map((step, idx) => {
              const isDone = idx < stepIndex;
              const isCurrent = idx === stepIndex;
              const isPending = idx > stepIndex;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 transition-all duration-550 ${
                    isDone ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-25'
                  }`}
                >
                  {/* Step bubble */}
                  <div
                    className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={
                      isDone
                        ? { background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }
                        : isCurrent
                        ? { background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' }
                        : { background: 'transparent', borderColor: 'rgba(0,0,0,0.06)' }
                    }
                  >
                    {isDone ? (
                      <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulseSoft block" />
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-semibold block ${
                      isDone ? 'text-emerald-600' : isCurrent ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-slate-500 block mt-0.5 animate-fadeIn">
                        {step.sub}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shimmer sweep line */}
          <div
            className="h-1 w-full rounded-full overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.03)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
                animation: 'shimmerSlide 1.8s ease-in-out infinite',
                width: '45%',
              }}
            />
          </div>
        </div>
      ) : (
        /* ── Input Form ──────────────────────────────────────────── */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, maxChars))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="e.g., I have a React architecture report due tomorrow at 11:30 PM. It's complex and needs solid research..."
              className="input"
              style={{
                minHeight: '112px',
                paddingBottom: '48px',
                border: isFocused ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: isFocused ? '0 0 0 3px rgba(99,102,241,0.06)' : 'none',
              }}
              aria-label="Describe your goal or commitment"
            />

            {/* Bottom bar controls */}
            <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between">
              <span className={`text-[10px] font-mono transition-colors ${
                charCount > maxChars * 0.85 ? 'text-amber-600' : 'text-slate-400'
              }`}>
                {charCount > 0 ? `${charCount}/${maxChars}` : ''}
              </span>

              <button
                type="submit"
                disabled={!inputText.trim()}
                aria-label="Submit goal to Kairos"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: inputText.trim() ? '#6366f1' : 'rgba(99,102,241,0.2)',
                  color: 'white',
                  boxShadow: inputText.trim() ? '0 2px 8px rgba(99,102,241,0.2)' : 'none',
                }}
              >
                <Send className="w-3.5 h-3.5" />
                Plan with Kairos
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Suggestions ───────────────────────────────────────────── */}
      {!loading && (
        <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <span className="text-label-xs text-slate-400 block mb-3">
            Try a starting path
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SUGGESTIONS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(s.text)}
                  aria-label={`Use template: ${s.category}`}
                  className="p-3.5 rounded-xl text-left cursor-pointer group transition-all duration-200"
                  style={{
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-3.5 h-3.5 ${s.color}`} aria-hidden="true" />
                    <span className={`text-[10px] font-bold ${s.color} uppercase tracking-wide`}>
                      {s.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-650 group-hover:text-slate-800 line-clamp-2 leading-relaxed transition-colors">
                    {s.text}
                  </p>
                  <div className={`flex items-center gap-1 mt-2 ${s.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <span className="text-[10px] font-semibold">Use template</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
