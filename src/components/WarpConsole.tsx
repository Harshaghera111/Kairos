import React from 'react';
import { Layers, TrendingDown, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { TimeWarpScenario, Commitment, SubTask } from '../types';

interface WarpConsoleProps {
  onScenarioSelect: (scenario: TimeWarpScenario) => void;
  selectedScenarioId: string | null;
  commitments: Commitment[];
  subtasks: SubTask[];
}

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
  buffer > 65 ? 'text-emerald-600' : buffer > 35 ? 'text-amber-600' : 'text-rose-600';

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
    <div className="card p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100">
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-display-sm text-slate-900">
              Disruption Stress Test
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate real-world disruptions to stress test commitment stability.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600">
          Stress Simulator
        </span>
      </div>

      <p className="text-slate-500 text-xs leading-relaxed mb-6">
        Select a real-world scenario. I will project the impact on each of your roadmaps and structure an immediate adaptive recovery plan.
      </p>

      {/* ── Scenario Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {scenarios.map((scenario) => {
          const isSelected = selectedScenarioId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onScenarioSelect(scenario)}
              className={`p-4 rounded-xl text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between border ${
                isSelected
                  ? 'bg-indigo-50/30 border-indigo-500/40 text-slate-900 shadow-[0_4px_16px_rgba(99,102,241,0.06)]'
                  : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80 hover:border-slate-350 text-slate-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl select-none" role="img" aria-label={scenario.title}>
                    {scenario.icon}
                  </span>
                  <span
                    className={`text-[9px] font-semibold font-sans px-2 py-0.5 rounded border ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    +{scenario.daysAdded}d
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 mb-1 animate-fadeIn">
                  {scenario.title}
                </h3>
                <p className="text-[11px] text-slate-500 leading-normal line-clamp-3">
                  {scenario.description}
                </p>
              </div>
              {isSelected && (
                <div className="mt-3 flex items-center gap-1.5 text-[9px] font-bold text-indigo-650 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulseSoft" />
                  Active Shift
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Recovery Plan + Before/After Impact ─────────────────────────── */}
      {activeScenario && (
        <div className="space-y-5 animate-fadeIn">
          {/* Recovery details */}
          <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/30">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <span className="text-label-xs text-indigo-600 font-bold">
                Kairos Intelligence Analysis
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
                  What Happened
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {activeScenario.problem}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
                  Impact Scope
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {activeScenario.impact}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
                  Recovery Protocols
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {activeScenario.recoveryPlan}
                </p>
              </div>
            </div>
          </div>

          {/* Before / After comparisons */}
          {commitments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <span className="text-label-sm text-slate-500">
                  Roadmap stress analysis
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="p-4 rounded-xl border border-slate-100 bg-[#ffffff]"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <span className="text-xs font-semibold text-slate-800 leading-snug truncate">
                          {commitment.title}
                        </span>
                        <span className="badge badge-danger flex-shrink-0">
                          -{riskDelta}% stability
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Before */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
                            Standard Buffer
                          </span>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-700 ${getBufferBarColor(
                                beforeHealth
                              )}`}
                              style={{ width: `${beforeHealth}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-semibold ${getBufferTextColor(beforeHealth)}`}>
                            {beforeHealth}% ({getBufferLabel(beforeHealth)})
                          </span>
                        </div>

                        {/* After */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-rose-550 uppercase font-bold tracking-wider block">
                            Projected Buffer
                          </span>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-700 delay-100 ${getBufferBarColor(
                                afterHealth
                              )}`}
                              style={{ width: `${afterHealth}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-semibold ${getBufferTextColor(afterHealth)}`}>
                            {afterHealth}% ({getBufferLabel(afterHealth)})
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
