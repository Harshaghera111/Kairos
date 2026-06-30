import React, { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, FileText, CheckCircle2, AlertTriangle, Play } from 'lucide-react';

export default function InteractiveWorkflow() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [typedText, setTypedText] = useState('');

  const fullPrompt = 'Deliver Apex Dashboard prototype before Monday noon.';

  useEffect(() => {
    let active = true;

    // Phase loops:
    // Step 1: Typewriter goal input (0-2.2s)
    // Step 2: Gemini parsing intent (2.2s-4.0s)
    // Step 3: Roadmap generated (4.0s-6.5s)
    // Step 4: Laptop crash disruption shifts timeline (6.5s-9.5s)
    // Step 5: Adaptive recovery plans emerge (9.5s-12.5s)
    // Step 6: Success state reached (12.5s-15.5s)
    
    if (step === 1) {
      let currentLength = 0;
      const interval = setInterval(() => {
        if (!active) return;
        currentLength++;
        setTypedText(fullPrompt.slice(0, currentLength));
        if (currentLength >= fullPrompt.length) {
          clearInterval(interval);
          setTimeout(() => {
            if (active) setStep(2);
          }, 600);
        }
      }, 35);
      return () => {
        clearInterval(interval);
      };
    }

    let timer: ReturnType<typeof setTimeout>;

    if (step === 2) {
      timer = setTimeout(() => {
        if (active) setStep(3);
      }, 1800);
    } else if (step === 3) {
      timer = setTimeout(() => {
        if (active) setStep(4);
      }, 2500);
    } else if (step === 4) {
      timer = setTimeout(() => {
        if (active) setStep(5);
      }, 3000);
    } else if (step === 5) {
      timer = setTimeout(() => {
        if (active) setStep(6);
      }, 3000);
    } else if (step === 6) {
      timer = setTimeout(() => {
        if (active) {
          setTypedText('');
          setStep(1);
        }
      }, 4000);
    }

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [step]);

  return (
    <div
      className="w-full card relative p-5 max-w-lg mx-auto select-none"
      style={{
        background: '#0d1117',
        borderColor: 'rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Visual Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-[11px] font-mono text-slate-400">Interactive Pipeline Preview</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
          </span>
          <span className="text-[10px] font-mono text-slate-500">Live Simulation</span>
        </div>
      </div>

      {/* Stage Arena */}
      <div className="space-y-4 min-h-[220px]">
        {/* Goal Box */}
        <div className="p-3 bg-[#060810] border border-white/[0.05] rounded-xl">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            Goal Intent
          </span>
          <p className="text-xs text-slate-200 font-medium">
            {typedText}
            {step === 1 && (
              <span className="inline-block w-[1px] h-3.5 bg-indigo-400 ml-[1px] align-middle cursor-blink" />
            )}
          </p>
        </div>

        {/* Dynamic Inner State */}
        <div className="space-y-2">
          {/* Step 2: Gemini Parsing Intent */}
          {step === 2 && (
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/10 animate-fadeIn flex items-center gap-3">
              <div className="flex gap-1 items-end h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-thinking-1 block" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-thinking-2 block" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-thinking-3 block" />
              </div>
              <span className="text-xs font-semibold text-indigo-300">
                Gemini is parsing timeline & effort constraints...
              </span>
            </div>
          )}

          {/* Step 3+: Tasks list populates */}
          {(step === 3 || step === 4 || step === 5 || step === 6) && (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Coach Roadmap
                </span>
                <span className={`text-[10px] font-bold ${
                  step === 4 ? 'text-red-400' : step === 5 || step === 6 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {step === 3 && 'Secure Buffer (4.5 Days)'}
                  {step === 4 && 'Disruption Detected'}
                  {(step === 5 || step === 6) && 'Recalibrated Buffer'}
                </span>
              </div>

              {/* Task Items */}
              <div className="space-y-1.5">
                {[
                  { id: 1, title: 'Complete high-fidelity Figma layouts', time: '180m' },
                  { id: 2, title: 'Build interactive prototypes review flow', time: '120m' },
                  { id: 3, title: 'Write design handover deliverables guides', time: '60m' },
                ].map((item, idx) => {
                  const isChecked = step === 6;
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-emerald-600 border-emerald-500' : 'border-slate-600'
                        }`}>
                          {isChecked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs ${
                          isChecked ? 'line-through text-slate-600' : 'text-slate-350'
                        }`}>
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-600">{item.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Laptop Crash Disruption warning */}
          {step === 4 && (
            <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/10 flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-red-300 block">WARP ANOMALY DETECTED</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Laptop hardware crash simulated. Schedule compressed by 3 days.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Coach Adaptive Recalibration and Recovery Draft */}
          {step === 5 && (
            <div className="space-y-2 animate-fadeIn">
              <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-950/10 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-amber-300 block">ADAPTIVE RECALIBRATION</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Postponing secondary documentation; recovery draft created.
                  </p>
                </div>
              </div>

              {/* Mini email artifact mockup */}
              <div className="p-3 rounded-lg bg-[#060810] border border-white/[0.04] text-[10px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 pb-1 border-b border-white/[0.05] text-[9px] text-slate-500">
                  <FileText className="w-3 h-3" />
                  <span>Extension Draft Request</span>
                </div>
                <p className="text-slate-300 leading-snug">
                  "Hi Team, unexpected laptop crash is delaying our submission. Delivering layouts on Monday at 12 PM as proposed..."
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Goals checked off */}
          {step === 6 && (
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-center gap-2.5 animate-fadeIn justify-center text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">
                Commitment Delivered on Time! Buffer protected.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
