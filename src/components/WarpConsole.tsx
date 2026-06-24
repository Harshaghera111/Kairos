import React from 'react';
import { Layers, TrendingDown } from 'lucide-react';
import { TimeWarpScenario, Commitment, SubTask } from '../types';

interface WarpConsoleProps {
  onScenarioSelect: (scenario: TimeWarpScenario) => void;
  selectedScenarioId: string | null;
  commitments: Commitment[];
  subtasks: SubTask[];
}

// Mirrors the risk calculation in App.tsx handleScenarioSelect — no backend changes
const computeProjectedRisk = (
  commitment: Commitment,
  daysAdded: number
): number => {
  const extra = Math.round(
    daysAdded * 15 + (commitment.urgency === 'high' ? 15 : 5)
  );
  return Math.min(100, commitment.riskScore + extra);
};

const getBufferPct = (riskScore: number) => Math.max(0, 100 - riskScore);

const getBufferLabel = (buffer: number) =>
  buffer > 65 ? 'Secure Buffer' : buffer > 35 ? 'Compressed' : 'Risk of Delay';

const getBufferBarColor = (buffer: number) =>
  buffer > 65 ? 'bg-emerald-500' : buffer > 35 ? 'bg-amber-400' : 'bg-rose-500';

const getBufferTextColor = (buffer: number) =>
  buffer > 65 ? 'text-emerald-400' : buffer > 35 ? 'text-amber-400' : 'text-rose-400';

export default function WarpConsole({
  onScenarioSelect,
  selectedScenarioId,
  commitments,
}: WarpConsoleProps) {
  const scenarios: (TimeWarpScenario & {
    problem: string;
    impact: string;
    recoveryPlan: string;
  })[] = [
    {
      id: 'sick_days',
      title: 'Sick for 2 Days',
      description: 'Flu symptoms restrict cognitive energy and screen time for 48 hours.',
      daysAdded: 2,
      icon: '😷',
      problem: 'Sudden high fever and fatigue — no screen time possible.',
      impact: 'Focus capacity drops to zero. Schedule compressed by 2 days.',
      recoveryPlan:
        'I will re-sequence your milestones, deprioritize non-critical tasks, and help you draft an updates thread.',
    },
    {
      id: 'laptop_failure',
      title: 'Laptop Failure',
      description: 'Unexpected hardware crash blocks access to your dev environment.',
      daysAdded: 3,
      icon: '💻',
      problem: 'Full system crash — hardware replacement required.',
      impact: 'Primary workspace unavailable for up to 36 hours.',
      recoveryPlan:
        'I will isolate what you can review offline, map a high-efficiency recovery sprint, and build a focus path.',
    },
    {
      id: 'surprise_exam',
      title: 'Surprise Exam',
      description: 'Unplanned mid-semester quiz announced with urgent study requirements.',
      daysAdded: 1,
      icon: '📚',
      problem: 'Exam prep requires 6–8 hours of focused academic work.',
      impact: 'Planned work blocks collide directly with study time.',
      recoveryPlan:
        'I will shift your milestone work slots, compress secondary objectives, and protect your core goals.',
    },
    {
      id: 'interview_round',
      title: 'Extra Interview',
      description: 'Surprise final-round interview with a 24-hour prep window.',
      daysAdded: 1.5,
      icon: '👨‍💼',
      problem: 'High-stakes interview requires portfolio prep and slides.',
      impact: 'Primary afternoon work window is gone.',
      recoveryPlan:
        'I will preserve your primary milestone focus, defer extra polish, and compile prep sheets to save time.',
    },
  ];

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId);

  return (
    <div className="bg-[#111625] border border-[#1e293b]/70 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-[#1e293b]/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 tracking-tight">
              Disruption Stress Test
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate a life disruption and see exactly how our plan holds up.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded border border-indigo-900/30">
          Stress Simulator
        </span>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
        Select a real-world scenario. I will project the impact on each of your roadmaps and structure a proactive recovery path.
      </p>

      {/* ── Scenario Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {scenarios.map((scenario) => {
          const isSelected = selectedScenarioId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onScenarioSelect(scenario)}
              className={`p-4 rounded-xl text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between border ${
                isSelected
                  ? 'bg-indigo-950/25 border-indigo-500/60 text-slate-100 shadow-lg shadow-indigo-950/20'
                  : 'bg-[#080c16]/50 hover:bg-[#080c16]/80 border-[#1e293b]/70 hover:border-indigo-500/30 text-slate-300'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span
                    className="text-2xl select-none"
                    role="img"
                    aria-label={scenario.title}
                  >
                    {scenario.icon}
                  </span>
                  <span
                    className={`text-[9px] font-semibold font-sans px-2 py-0.5 rounded border ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/25'
                        : 'bg-slate-950 text-slate-500 border-[#1e293b]/55'
                    }`}
                  >
                    +{scenario.daysAdded}d
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-200 mb-1">
                  {scenario.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {scenario.description}
                </p>
              </div>
              {isSelected && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Active
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Recovery Plan + Before/After Impact ─────────────────────────── */}
      {activeScenario && (
        <div className="space-y-4 animate-fadeIn">
          {/* Recovery overview */}
          <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-950/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                🛡️ Kairos's Response
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  What happened
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeScenario.problem}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Impact
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeScenario.impact}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Recovery plan
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeScenario.recoveryPlan}
                </p>
              </div>
            </div>
          </div>

          {/* Before / After — computed from actual commitments, not hardcoded */}
          {commitments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Roadmap stress analysis
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commitments.map((commitment) => {
                  const projectedRisk = computeProjectedRisk(
                    commitment,
                    activeScenario.daysAdded
                  );
                  const beforeHealth = getBufferPct(commitment.riskScore);
                  const afterHealth = getBufferPct(projectedRisk);
                  const riskDelta = projectedRisk - commitment.riskScore;

                  return (
                    <div
                      key={commitment.id}
                      className="p-4 rounded-xl bg-[#080c16]/60 border border-[#1e293b]/50"
                    >
                      {/* Commitment name + risk badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <span className="text-xs font-semibold text-slate-200 leading-snug flex-1">
                          {commitment.title}
                        </span>
                        <span className="text-[10px] text-rose-450 font-bold flex-shrink-0 bg-rose-950/20 border border-rose-900/20 px-1.5 py-0.5 rounded">
                          -{riskDelta}% stability
                        </span>
                      </div>

                      {/* Before / After bars */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Before */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">
                            Current Buffer
                          </span>
                          <div className="w-full bg-[#080b13] rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 ${getBufferBarColor(
                                beforeHealth
                              )}`}
                              style={{ width: `${beforeHealth}%` }}
                            />
                          </div>
                          <span
                            className={`text-[10px] font-semibold ${getBufferTextColor(
                              beforeHealth
                            )}`}
                          >
                            {getBufferLabel(beforeHealth)} · {beforeHealth}%
                          </span>
                        </div>

                        {/* After */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-rose-450 uppercase font-semibold">
                            Projected Buffer
                          </span>
                          <div className="w-full bg-[#080b13] rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 delay-300 ${getBufferBarColor(
                                afterHealth
                              )}`}
                              style={{ width: `${afterHealth}%` }}
                            />
                          </div>
                          <span
                            className={`text-[10px] font-semibold ${getBufferTextColor(
                              afterHealth
                            )}`}
                          >
                            {getBufferLabel(afterHealth)} · {afterHealth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
