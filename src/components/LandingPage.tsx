import React, { useState } from 'react';
import { 
  Sparkles, Compass, ShieldAlert, Zap, Layers, Cpu, Database, 
  Key, Globe, ArrowRight, BookOpen, Clock, Heart, Award,
  CheckCircle2, RefreshCw
} from 'lucide-react';
import InteractiveWorkflow from './InteractiveWorkflow';
import { UserProfile } from '../types';
import { signInWithGoogle, isUsingMock, auth } from '../lib/firebase';

interface LandingPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onEnterSandbox: () => void;
}

export default function LandingPage({ onLoginSuccess, onEnterSandbox }: LandingPageProps) {
  
  // Interactive Live Demo states for the landing page showcase widgets
  const [demoScenario, setDemoScenario] = useState<'sick' | 'crash' | 'exam' | 'none'>('none');
  const [demoStability, setDemoStability] = useState(85);
  const [diaryTab, setDiaryTab] = useState<'plan' | 'disrupt' | 'rebuild'>('plan');

  const handleScenarioChange = (scenario: 'sick' | 'crash' | 'exam') => {
    setDemoScenario(scenario);
    if (scenario === 'sick')  setDemoStability(55);
    if (scenario === 'crash') setDemoStability(40);
    if (scenario === 'exam')  setDemoStability(70);
  };

  const resetScenario = () => {
    setDemoScenario('none');
    setDemoStability(85);
  };

  /**
   * Smooth-scroll helper for programmatic navigation.
   * Falls back gracefully if the target section doesn't exist.
   */
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /**
   * "Start Executing" — checks current Firebase auth state first.
   * • If already signed-in → go straight to dashboard.
   * • If not signed-in   → open Google sign-in popup.
   * • Mock/demo mode     → open Google sign-in (which returns a mock user).
   */
  const handleStartExecuting = async () => {
    try {
      // Check if Firebase auth already has a current user (skip popup)
      if (!isUsingMock && auth && auth.currentUser) {
        const u = auth.currentUser;
        onLoginSuccess({
          uid: u.uid,
          email: u.email || '',
          displayName: u.displayName,
          photoURL: u.photoURL,
          createdAt: new Date().toISOString(),
        });
        return;
      }
      // No current user — trigger Google sign-in flow
      const result = await signInWithGoogle();
      if (result && result.user) {
        onLoginSuccess({
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Google sign-in error:', e);
    }
  };

  return (
    <div className="theme-light min-h-screen bg-canvas text-text-primary selection:bg-indigo-100 relative overflow-hidden font-sans">
      
      {/* ── Background Grid & Design Details ────────────────────────────── */}
      <div className="absolute inset-0 bg-grid-dots pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none"
           style={{
             background: 'radial-gradient(circle at top, rgba(99,102,241,0.03) 0%, transparent 60%)'
           }} />

      {/* ── Floating Header ───────────────────────────────────────────────── */}
      <header className="fixed top-5 inset-x-4 z-40 max-w-5xl mx-auto" role="banner">
        <div className="glass border border-border-default shadow-sm px-6 py-3 rounded-full flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.15)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" opacity="0.9"/>
                <path d="M12 12 L12 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 12 L16 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-extrabold text-sm tracking-widest text-[#111827]">
              KAIROS
            </span>
          </div>

          {/* Navigation Links — each maps to a real section id */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Page sections">
            <a
              href="#why"
              className="text-xs font-semibold text-text-secondary hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
            >
              Why Kairos
            </a>
            <a
              href="#how"
              className="text-xs font-semibold text-text-secondary hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
            >
              How It Works
            </a>
            <a
              href="#showcase"
              className="text-xs font-semibold text-text-secondary hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
            >
              Core Features
            </a>
            <a
              href="#cloud"
              className="text-xs font-semibold text-text-secondary hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
            >
              Architecture
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {/* Demo Sandbox — calls onEnterSandbox directly (no dead link) */}
            <button
              type="button"
              onClick={onEnterSandbox}
              className="hidden sm:inline-flex text-xs font-semibold text-text-secondary hover:text-indigo-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded px-1"
              aria-label="Enter Demo Sandbox"
            >
              Demo Sandbox
            </button>
            <button
              type="button"
              onClick={handleStartExecuting}
              className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
              aria-label="Start Executing — Sign in with Google"
            >
              Start Executing <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section
        className="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center"
        aria-labelledby="hero-heading"
      >
        {/* Accent Tag */}
        <div className="badge badge-brand mb-6 animate-fadeIn" aria-hidden="true">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Google AI Hackathon Submission</span>
        </div>

        <h1
          id="hero-heading"
          className="text-display-xl tracking-tight leading-tight max-w-4xl mb-6 animate-fadeIn"
        >
          Don't manage tasks. <br />
          <span className="text-gradient-brand">Execute them.</span>
        </h1>

        <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-2xl mb-8 animate-fadeIn delay-100">
          Kairos continuously adapts your plans when life doesn't. Build resilient schedules with active stress-testing buffers powered by Gemini AI.
        </p>

        {/* Hero CTAs */}
        <div className="flex items-center gap-4 flex-wrap justify-center mb-20 animate-fadeIn delay-150">
          <button
            type="button"
            onClick={handleStartExecuting}
            className="btn btn-primary cursor-pointer"
            aria-label="Start Executing — Sign in with Google"
          >
            Start Executing <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
          {/*
            "Watch AI in Action" — scrolls to #how (the section that wraps
            InteractiveWorkflow). Using both href and onClick for maximum
            compatibility: href gives native keyboard activation + tab focus,
            onClick triggers smooth scroll explicitly for browsers that may
            ignore CSS scroll-behavior on hash change.
          */}
          <a
            href="#how"
            role="button"
            onClick={(e) => { e.preventDefault(); scrollToSection('how'); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToSection('how');
              }
            }}
            className="btn btn-secondary cursor-pointer"
            aria-label="Watch AI in Action — scroll to interactive demo"
            tabIndex={0}
          >
            Watch AI in Action
          </a>
        </div>

        {/* ── Interactive Workflow Preview — anchored as #how ─────────────── */}
        {/*
          This section is the target for both the "How It Works" nav link and
          the "Watch AI in Action" hero button.  It carries id="how" so the
          anchor resolves correctly.
        */}
        <div
          id="how"
          className="w-full max-w-xl mx-auto animate-fadeInScale delay-200"
          aria-label="Interactive AI workflow preview"
        >
          <div className="mb-4 text-center">
            <span className="text-label-sm text-indigo-600 font-bold">How It Works</span>
            <p className="text-xs text-text-secondary mt-1">Watch Kairos plan, detect disruption, and recover — automatically.</p>
          </div>
          <InteractiveWorkflow />
        </div>
      </section>

      {/* ── Why Kairos Exists Section ─────────────────────────────────────── */}
      <section
        id="why"
        className="landing-section bg-[#F6F8FA] border-y border-border-default px-6 relative z-10"
        aria-labelledby="why-heading"
      >
        <div className="max-w-5xl mx-auto space-y-14">
          
          <div className="text-center space-y-3">
            <span className="text-label-sm text-indigo-600 font-bold">The Execution Gap</span>
            <h2 id="why-heading" className="text-display-lg">Why traditional productivity tools fail</h2>
            <p className="text-text-secondary text-xs md:text-sm max-w-2xl mx-auto">
              Lists record tasks. Calendars block time. Neither adapts when schedule clashes hit. Kairos introduces resilient buffer metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Traditional Todos */}
            <div className="p-6 bg-white border border-border-default rounded-xl space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700" aria-hidden="true">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-[#111827]">Traditional Todo Apps</h3>
              <p className="text-text-secondary text-[11.5px] leading-relaxed">
                Task logs stack list entries without structural timeline bounds. No effort weights, buffers, or adaptive recovery suggestions when milestones slip.
              </p>
            </div>

            {/* Traditional Calendars */}
            <div className="p-6 bg-white border border-border-default rounded-xl space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700" aria-hidden="true">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-[#111827]">Traditional Calendars</h3>
              <p className="text-text-secondary text-[11.5px] leading-relaxed">
                Reserve static blocks, locking your schedule. When surprise events hit, focus blocks collide and manually rearranging priorities becomes tedious.
              </p>
            </div>

            {/* Kairos */}
            <div className="p-6 bg-white border border-indigo-200/80 rounded-xl space-y-4 shadow-[0_4px_24px_rgba(99,102,241,0.05)]">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600" aria-hidden="true">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-indigo-600">Kairos Execution Companion</h3>
              <p className="text-text-secondary text-[11.5px] leading-relaxed">
                Combines intent analysis, dynamic workload buffering, real-time stress testing, and auto-generated templates inside a unified de-risking loop.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Interactive Live Demos Showcase Section ─────────────────────────── */}
      <section
        id="showcase"
        className="landing-section px-6 relative z-10"
        aria-labelledby="showcase-heading"
      >
        <div className="max-w-5xl mx-auto space-y-16">
          
          <div className="text-center space-y-3">
            <span className="text-label-sm text-indigo-600 font-bold">Core Features</span>
            <h2 id="showcase-heading" className="text-display-lg">Test Kairos directly in the browser</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Live Stress Tester Showcase Widget */}
            <div className="lg:col-span-6 card p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-500" aria-hidden="true">
                  <Layers className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Live Stress Simulator Demo</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">How would a sickness or crash affect your plans?</h3>
                <p className="text-[11.5px] text-text-secondary leading-relaxed">
                  Select a simulated warp scenario below to see how our de-risk index automatically shifts task constraints.
                </p>
              </div>

              {/* Live interactive arena */}
              <div className="p-4 rounded-xl bg-[#F6F8FA] border border-border-default space-y-4" role="group" aria-label="Stress scenario simulator">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500">APEX FIGMA ROADMAP</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      demoStability < 50 ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      demoStability < 80 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}
                    aria-live="polite"
                    aria-label={`Stability at ${demoStability} percent`}
                  >
                    {demoStability}% Stability
                  </span>
                </div>

                <div className="progress-track" role="progressbar" aria-valuenow={demoStability} aria-valuemin={0} aria-valuemax={100} aria-label="Roadmap buffer stability">
                  <div 
                    className={`progress-fill ${
                      demoStability < 50 ? 'progress-fill-danger' :
                      demoStability < 80 ? 'progress-fill-warning' :
                      'progress-fill-brand'
                    }`} 
                    style={{ width: `${demoStability}%` }}
                  />
                </div>

                {/* Scenario buttons */}
                <div className="grid grid-cols-3 gap-2 text-center" role="group" aria-label="Select a disruption scenario">
                  {[
                    { id: 'sick',  label: '😷 Sick (+2d)',   ariaLabel: 'Simulate 2-day sickness' },
                    { id: 'crash', label: '💻 Crash (+3d)',  ariaLabel: 'Simulate 3-day laptop crash' },
                    { id: 'exam',  label: '📚 Exam (+1d)',   ariaLabel: 'Simulate 1-day exam delay' },
                  ].map(btn => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => handleScenarioChange(btn.id as any)}
                      aria-pressed={demoScenario === btn.id}
                      aria-label={btn.ariaLabel}
                      className={`py-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                        demoScenario === btn.id 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {demoScenario !== 'none' && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 animate-fadeIn">
                    <span className="text-[10px] text-slate-500 font-mono" aria-live="polite">Simulated adaptive buffer shift</span>
                    <button
                      type="button"
                      onClick={resetScenario}
                      className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      aria-label="Reset stress scenario to baseline"
                    >
                      <RefreshCw className="w-3 h-3" aria-hidden="true" /> Reset
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Live Diary Viewer Demo Widget */}
            <div className="lg:col-span-6 card p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-500" aria-hidden="true">
                  <Compass className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Live Coach's Diary Trace</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Check what the coach thinks in real time</h3>
                <p className="text-[11.5px] text-text-secondary leading-relaxed">
                  Kairos doesn't hide planning steps. Choose a scenario stage tab to read my supportive trace advice.
                </p>
              </div>

              {/* Interactive tab container */}
              <div className="space-y-3">
                <div
                  className="flex border-b border-slate-200 text-[10.5px]"
                  role="tablist"
                  aria-label="Coach's diary stages"
                >
                  {[
                    { id: 'plan',    label: 'Goal Planned'  },
                    { id: 'disrupt', label: 'Timeline Warp' },
                    { id: 'rebuild', label: 'Stabilization' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`diary-tab-${tab.id}`}
                      aria-selected={diaryTab === tab.id}
                      aria-controls={`diary-panel-${tab.id}`}
                      onClick={() => setDiaryTab(tab.id as any)}
                      onKeyDown={(e) => {
                        // Arrow key navigation between tabs
                        const tabs: Array<'plan' | 'disrupt' | 'rebuild'> = ['plan', 'disrupt', 'rebuild'];
                        const idx = tabs.indexOf(tab.id as any);
                        if (e.key === 'ArrowRight') setDiaryTab(tabs[(idx + 1) % tabs.length]);
                        if (e.key === 'ArrowLeft')  setDiaryTab(tabs[(idx + 2) % tabs.length]);
                      }}
                      className={`flex-1 pb-2 font-bold transition-colors cursor-pointer border-b-2 text-center ${
                        diaryTab === tab.id 
                          ? 'border-indigo-500 text-indigo-600' 
                          : 'border-transparent text-slate-400 hover:text-slate-650'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Text preview */}
                <div
                  role="tabpanel"
                  id={`diary-panel-${diaryTab}`}
                  aria-labelledby={`diary-tab-${diaryTab}`}
                  className="p-4 rounded-xl bg-[#F6F8FA] border border-border-default min-h-[92px] flex flex-col justify-center animate-fadeIn text-xs leading-relaxed text-slate-650 font-medium"
                >
                  {diaryTab === 'plan' && (
                    <p className="animate-fadeIn">
                      💡 "Calculated timeline weights for Figma project delivery. Estimated effort stands at 360m. Structuring 3 buffer blocks to absorb slippages."
                    </p>
                  )}
                  {diaryTab === 'disrupt' && (
                    <p className="animate-fadeIn text-rose-700">
                      ⚠️ "Timeline compression event (laptop crash). De-risk parameters dropped below secure ratios. Immediate negotiation extension guidelines prepared."
                    </p>
                  )}
                  {diaryTab === 'rebuild' && (
                    <p className="animate-fadeIn text-emerald-700">
                      ✓ "Focus slot scheduling updated. Critical path milestones secured. Delivery stability recalculated back to stable ratios."
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Google Cloud & Gemini Credibility Section ──────────────────────── */}
      <section
        id="cloud"
        className="landing-section bg-[#F6F8FA] border-y border-border-default px-6 relative z-10"
        aria-labelledby="cloud-heading"
      >
        <div className="max-w-5xl mx-auto space-y-14">
          
          <div className="text-center space-y-3">
            <span className="text-label-sm text-indigo-600 font-bold">Architecture</span>
            <h2 id="cloud-heading" className="text-display-lg">Built with state-of-the-art architectures</h2>
            <p className="text-text-secondary text-xs md:text-sm max-w-xl mx-auto">
              Designed to illustrate technical excellence by leveraging Google Cloud Platform frameworks and Gemini APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Gemini */}
            <div className="p-5 bg-white border border-border-default rounded-xl md:col-span-3 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600" aria-hidden="true">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Orchestration Model</span>
                <h4 className="font-semibold text-xs text-[#111827]">Gemini 3.5 API structure</h4>
                <p className="text-text-secondary text-[11.5px] leading-relaxed">
                  Powers intent extraction, tasks mapping, estimated deadlines, and de-risking advice metrics utilizing clean JSON schemas.
                </p>
              </div>
            </div>

            {/* Cloud Run */}
            <div className="p-5 bg-white border border-border-default rounded-xl md:col-span-2 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-slate-800" aria-hidden="true">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Serverless Hosting</span>
                <h4 className="font-semibold text-xs text-[#111827]">Google Cloud Run</h4>
                <p className="text-text-secondary text-[11.5px] leading-relaxed">
                  Handles serverless container deployment for production backend Express modules safely.
                </p>
              </div>
            </div>

            {/* Firestore */}
            <div className="p-5 bg-white border border-border-default rounded-xl md:col-span-2 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-slate-800" aria-hidden="true">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">NoSQL Database</span>
                <h4 className="font-semibold text-xs text-[#111827]">Google Firestore</h4>
                <p className="text-text-secondary text-[11.5px] leading-relaxed">
                  Secures instant synchronization for roadmap commitments, timeline actions, and checklist guides.
                </p>
              </div>
            </div>

            {/* Firebase Auth */}
            <div className="p-5 bg-white border border-border-default rounded-xl md:col-span-3 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-slate-800" aria-hidden="true">
                <Key className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identity Sync</span>
                <h4 className="font-semibold text-xs text-[#111827]">Firebase Authentication & Secret Manager</h4>
                <p className="text-text-secondary text-[11.5px] leading-relaxed">
                  Coordinates client logins, session keys, and database rules securely without storing raw credentials on client machines.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Final Call to Action ─────────────────────────────────────────── */}
      <section
        className="landing-section px-6 relative z-10 text-center"
        aria-labelledby="cta-heading"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 id="cta-heading" className="text-display-lg text-[#111827]">Ready to achieve stress-free delivery?</h2>
          <p className="text-text-secondary text-sm max-w-lg mx-auto">
            Connect your Google account to secure your target deadlines, or interact in our sandbox dashboard offline.
          </p>
          <div className="flex items-center gap-4 justify-center flex-wrap">
            <button
              type="button"
              onClick={handleStartExecuting}
              className="btn btn-primary cursor-pointer"
              aria-label="Start Executing — Sign in with Google"
            >
              Start Executing <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onEnterSandbox}
              className="btn btn-secondary cursor-pointer"
              aria-label="Enter Demo Sandbox without signing in"
            >
              Enter Demo Sandbox
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-8 text-center text-slate-400 border-t border-border-default text-xs relative z-10" role="contentinfo">
        <p className="flex items-center justify-center gap-1.5">
          Made for Google AI Hackathon 2026 with <Heart className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" aria-label="love" /> & <Award className="w-3.5 h-3.5 text-indigo-500" aria-label="excellence" />
        </p>
      </footer>

    </div>
  );
}
