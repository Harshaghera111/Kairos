import React, { useState } from 'react';
import { Sparkles, Zap, Send, BookOpen, UserCheck } from 'lucide-react';

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
  },
  {
    label: 'Extracting deadline and workload...',
    sub: 'Structuring the ideal route to secure your due date.',
  },
  {
    label: 'Estimating effort and urgency...',
    sub: 'Factoring in extra breathing room for unexpected disruptions.',
  },
  {
    label: 'Building your execution plan...',
    sub: 'Carving out dedicated, high-impact focus milestones.',
  },
  {
    label: 'Finalizing your schedule...',
    sub: 'Polishing your plan of action so we start stress-free.',
  },
];

export default function CommitmentForm({
  onCommitmentAdd,
  loading,
  loadingMessage,
}: CommitmentFormProps) {
  const [inputText, setInputText] = useState('');

  // Derive which step we're on from the broadcasted message
  const stepIndex = Math.max(
    0,
    AI_STEPS.findIndex((s) => s.label === loadingMessage)
  );

  const suggestions = [
    {
      category: 'Study Goal',
      text: 'Submit my final Physics-201 lab report on Electromagnetism by Friday 5 PM, high difficulty.',
      icon: BookOpen,
    },
    {
      category: 'Client Delivery',
      text: 'Deliver the client-facing Figma prototype for Apex Corp dashboard before Monday noon.',
      icon: Zap,
    },
    {
      category: 'Career Milestone',
      text: 'Submit updated portfolio and resume to Senior design role at Stripe by Thursday midnight.',
      icon: UserCheck,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onCommitmentAdd(inputText);
    setInputText('');
  };

  return (
    <div className="bg-[#111625] border border-[#1e293b]/70 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 className="text-base font-display text-slate-100 font-semibold tracking-tight">
          What goal are we securing today?
        </h2>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed mb-5 font-sans">
        Tell me what you are working on, when it is due, and how much prep it requires. I will structure a clear roadmap with custom stress buffers.
      </p>

      {/* ── AI Processing State ─────────────────────────────── */}
      {loading ? (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-5 space-y-4 animate-fadeInScale">
          {/* Animated header */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-end h-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-thinking-1 block" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-thinking-2 block" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-thinking-3 block" />
            </div>
            <span className="text-sm font-semibold text-indigo-300 leading-tight">
              {loadingMessage || 'Reading your commitment...'}
            </span>
          </div>

          {/* Step progress list */}
          <div className="space-y-2.5 pl-1">
            {AI_STEPS.map((step, idx) => {
              const isDone = idx < stepIndex;
              const isCurrent = idx === stepIndex;
              const isPending = idx > stepIndex;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs transition-all duration-500 ${
                    isDone
                      ? 'text-emerald-400'
                      : isCurrent
                      ? 'text-slate-100'
                      : 'text-slate-600'
                  }`}
                >
                  {/* Step indicator bubble */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-500/20 border-emerald-500/60'
                        : isCurrent
                        ? 'border-indigo-400 bg-indigo-500/15'
                        : 'border-slate-700 bg-transparent'
                    }`}
                  >
                    {isDone && (
                      <svg
                        className="w-2.5 h-2.5 text-emerald-400"
                        fill="none"
                        viewBox="0 0 12 12"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse block" />
                    )}
                  </div>

                  <span className={`font-medium ${isPending ? 'opacity-40' : ''}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current step sub-label */}
          <p className="text-[11px] text-slate-500 italic font-sans pl-1">
            {AI_STEPS[stepIndex]?.sub}
          </p>
        </div>
      ) : (
        /* ── Input Form ──────────────────────────────────────── */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., I have a React architecture report due tomorrow at 11:30 PM. It's fairly complex and will need solid research..."
              className="w-full min-h-[110px] pr-12 p-4 text-sm bg-[#080c16]/50 border border-[#223049]/60 text-slate-100 placeholder-slate-500 focus:border-indigo-500 rounded-xl outline-none transition focus:ring-1 focus:ring-indigo-500/30 leading-relaxed font-sans resize-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute bottom-3 right-3 p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-indigo-950/20"
              title="Plan with Coach"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ── Quick Examples ──────────────────────────────────── */}
      {!loading && (
        <div className="mt-5 pt-5 border-t border-[#1e293b]/60">
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider block uppercase mb-3">
            Choose a starting path
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestions.map((suggestion, idx) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(suggestion.text)}
                  className="p-3 rounded-lg bg-[#080c16]/30 hover:bg-[#080c16]/70 border border-[#1e293b]/50 hover:border-indigo-500/30 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-indigo-300 transition-colors">
                      {suggestion.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 group-hover:text-slate-300 line-clamp-2 leading-snug font-sans transition-colors">
                    {suggestion.text}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
