import React, { useState, useEffect, useRef } from 'react';

interface EntranceAnimationProps {
  onComplete: () => void;
}

// ─── Timing constants ─────────────────────────────────────────────────────
// Total non-reduced duration: 3 400 ms
const PHASE_TIMINGS = {
  timeline: 700,
  disrupt:  1600,
  rebuild:  2500,
  brand:    3100,
  complete: 3400,
};

// ─── Per-component timestamp origin ──────────────────────────────────────
const edbg = (label: string, extra?: Record<string, unknown>) => {
  // eslint-disable-next-line no-console
  console.log(
    `%c[ENTRANCE ${performance.now().toFixed(1)}ms] ${label}`,
    'color:#10b981;font-weight:bold',
    extra ?? ''
  );
};

export default function EntranceAnimation({ onComplete }: EntranceAnimationProps) {
  const [phase, setPhase] = useState<'point' | 'timeline' | 'disrupt' | 'rebuild' | 'brand'>('point');

  // Keep a stable ref to onComplete so the timer effect never needs to
  // re-run when the parent re-renders (fixes the "re-schedule all timers"
  // bug that caused the animation to restart mid-run).
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Single source of truth: all timers are created once and cleaned up on
  // unmount. isSkipped is handled inside the effect via a local flag.
  useEffect(() => {
    edbg('Entrance mounted — scheduling timers');

    // Respect prefers-reduced-motion: skip straight to onComplete
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      edbg('prefers-reduced-motion: skipping immediately');
      onCompleteRef.current();
      return;
    }

    let cancelled = false;

    const t1 = setTimeout(() => {
      if (!cancelled) { edbg('phase → timeline'); setPhase('timeline'); }
    }, PHASE_TIMINGS.timeline);

    const t2 = setTimeout(() => {
      if (!cancelled) { edbg('phase → disrupt'); setPhase('disrupt'); }
    }, PHASE_TIMINGS.disrupt);

    const t3 = setTimeout(() => {
      if (!cancelled) { edbg('phase → rebuild'); setPhase('rebuild'); }
    }, PHASE_TIMINGS.rebuild);

    const t4 = setTimeout(() => {
      if (!cancelled) { edbg('phase → brand'); setPhase('brand'); }
    }, PHASE_TIMINGS.brand);

    const t5 = setTimeout(() => {
      if (!cancelled) {
        edbg('Timer complete — calling onComplete()');
        onCompleteRef.current();
      }
    }, PHASE_TIMINGS.complete);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !cancelled) {
        edbg('Escape pressed — skipping intro');
        cancelled = true;
        onCompleteRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      edbg('Entrance unmounted — clearing timers', { cancelled });
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // ← empty array: timers are created exactly once, never restarted

  const handleSkip = () => {
    edbg('Skip button clicked — calling onComplete()');
    onCompleteRef.current();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060810] text-white select-none"
      role="dialog"
      aria-label="Kairos intro animation"
      aria-modal="true"
    >
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-1.5 rounded-full border border-white/10 hover:border-white/20 text-[11px] font-medium font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer bg-white/[0.02]"
        aria-label="Skip intro animation (Esc)"
        type="button"
      >
        Skip Intro <span className="text-slate-600 ml-1">Esc</span>
      </button>

      {/* Main Story Arena */}
      <div className="w-full max-w-lg px-8 flex flex-col items-center justify-center text-center h-[280px]">

        {/* Glow Blob Background */}
        <div
          className="absolute w-72 h-72 rounded-full pointer-events-none filter blur-[80px] transition-all duration-1000"
          style={{
            background:
              phase === 'disrupt'
                ? 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)'
                : phase === 'rebuild'
                ? 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Story Visualizer Stage */}
        <div className="relative w-full flex items-center justify-center h-16 mb-8">
          {/* Phase 1: Small Glowing Center Point */}
          {phase === 'point' && (
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-indigo-500 opacity-60" />
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_12px_#6366f1]" />
            </div>
          )}

          {/* Phase 2–5: Timeline */}
          {(phase === 'timeline' || phase === 'disrupt' || phase === 'rebuild' || phase === 'brand') && (
            <div className="w-full relative px-10">
              {/* Timeline Axis Line */}
              <div
                className={`h-0.5 w-full rounded transition-all duration-500 ${
                  phase === 'disrupt'
                    ? 'bg-rose-500 animate-timelineDisrupt'
                    : 'bg-indigo-500'
                }`}
                style={{
                  boxShadow:
                    phase === 'disrupt'
                      ? '0 0 10px rgba(239, 68, 68, 0.4)'
                      : '0 0 8px rgba(99, 102, 241, 0.3)',
                }}
              >
                {/* Rebuilding sweep indicator */}
                {phase === 'rebuild' && (
                  <div
                    className="absolute top-0 h-0.5 bg-emerald-400 rounded"
                    style={{ animation: 'timelineRebuild 0.8s ease-in-out forwards' }}
                  />
                )}
              </div>

              {/* Tick nodes */}
              <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 flex justify-between">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full border-2 border-[#060810] transition-all duration-300 ${
                      phase === 'disrupt'
                        ? 'bg-rose-500 scale-90'
                        : phase === 'rebuild' || phase === 'brand'
                        ? 'bg-emerald-500'
                        : 'bg-indigo-400 animate-[nodeTickAppear_0.3s_ease-out_both]'
                    }`}
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Narrative Captions */}
        <div className="h-24 flex items-center justify-center">
          {phase === 'point' && (
            <p className="text-slate-400 text-xs font-mono tracking-widest animate-fadeIn">
              INITIATING PLANNER
            </p>
          )}

          {phase === 'timeline' && (
            <p className="text-slate-200 text-sm font-semibold tracking-wide animate-fadeIn">
              Structuring primary commitment buffer...
            </p>
          )}

          {phase === 'disrupt' && (
            <div className="animate-fadeIn">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/30 border border-rose-900/30 px-2.5 py-0.5 rounded">
                ⚡ SURPRISE SICK DAY (+2 days)
              </span>
              <p className="text-slate-400 text-xs mt-2">
                Timeline collision detected. Original milestones compressed.
              </p>
            </div>
          )}

          {phase === 'rebuild' && (
            <div className="animate-fadeIn">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2.5 py-0.5 rounded">
                ✓ SECURING RECOVERY PLAN
              </span>
              <p className="text-slate-200 text-xs mt-2">
                Re-sequencing task priority. Stress buffers stabilized.
              </p>
            </div>
          )}

          {phase === 'brand' && (
            <div className="space-y-1.5 animate-fadeIn">
              <h1
                className="text-3xl font-extrabold tracking-[0.25em] text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                KAIROS
              </h1>
              <p className="text-xs font-medium text-indigo-400 tracking-widest uppercase">
                AI Execution Coach
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
