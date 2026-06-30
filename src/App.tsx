import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Clock, AlertTriangle, Cpu, Sparkles, CheckCircle2, 
  User, ChevronRight, FileText, Download, Play, Flame, HelpCircle, 
  Trash2, Layers, Compass, ExternalLink, Lightbulb, CheckSquare,
  Menu, X
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import CommitmentForm from './components/CommitmentForm';
import ActivityLog from './components/ActivityLog';
import WarpConsole from './components/WarpConsole';
import KairosAnalysisPanel from './components/KairosAnalysisPanel';
import EntranceAnimation from './components/EntranceAnimation';
import LandingPage from './components/LandingPage';
import { Commitment, SubTask, WorkBlock, AgentAction, Artifact, TimeWarpScenario, UserProfile } from './types';
import { isUsingMock, OperationType, handleFirestoreError, db, auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc
} from 'firebase/firestore';

// Pre-seeded high-fidelity data to give judges instant context
const INITIAL_COMMITMENTS: Commitment[] = [
  {
    id: 'commit-1',
    userId: 'mock-judge-uid',
    title: 'Apex Corp Dashboard Design Delivery',
    description: 'Deliver high-fidelity interactive Figma designs with client authorization guidelines.',
    extractedDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days out
    rawDeadlineText: 'Next Monday noon',
    urgency: 'high',
    importance: 'high',
    effort: 'high',
    status: 'in_progress',
    riskScore: 35,
    riskLevel: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'commit-2',
    userId: 'mock-judge-uid',
    title: 'Physics-201 Lab Report',
    description: 'Submit lab analysis on electromagnetism, including formulas and schematic layout.',
    extractedDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days out
    rawDeadlineText: 'Friday 5 PM',
    urgency: 'medium',
    importance: 'medium',
    effort: 'medium',
    status: 'pending',
    riskScore: 20,
    riskLevel: 'low',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_SUBTASKS: SubTask[] = [
  { id: 'sub-1', commitmentId: 'commit-1', userId: 'mock-judge-uid', title: 'Complete wireframe approval review', order: 1, status: 'completed', effortEstimateMinutes: 90 },
  { id: 'sub-2', commitmentId: 'commit-1', userId: 'mock-judge-uid', title: 'Design components and auto-layout system', order: 2, status: 'pending', effortEstimateMinutes: 180 },
  { id: 'sub-3', commitmentId: 'commit-1', userId: 'mock-judge-uid', title: 'Construct prototype click-through interactions', order: 3, status: 'pending', effortEstimateMinutes: 120 },
  { id: 'sub-4', commitmentId: 'commit-1', userId: 'mock-judge-uid', title: 'Draft visual design assets documentation', order: 4, status: 'pending', effortEstimateMinutes: 60 },
  
  { id: 'sub-5', commitmentId: 'commit-2', userId: 'mock-judge-uid', title: 'Collate experimental sensor readings data', order: 1, status: 'pending', effortEstimateMinutes: 45 },
  { id: 'sub-6', commitmentId: 'commit-2', userId: 'mock-judge-uid', title: 'Write mathematical derivation section', order: 2, status: 'pending', effortEstimateMinutes: 75 },
  { id: 'sub-7', commitmentId: 'commit-2', userId: 'mock-judge-uid', title: 'Export lab notebook PDF diagrams', order: 3, status: 'pending', effortEstimateMinutes: 30 }
];

const INITIAL_WORK_BLOCKS: WorkBlock[] = [
  { id: 'work-1', commitmentId: 'commit-1', userId: 'mock-judge-uid', title: 'Design Session Block 1', start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), end: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), status: 'scheduled' },
  { id: 'work-2', commitmentId: 'commit-2', userId: 'mock-judge-uid', title: 'Lab Writing Session', start: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(), end: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), status: 'scheduled' }
];

const INITIAL_LOGS: AgentAction[] = [
  {
    id: 'log-1',
    commitmentId: 'commit-1',
    userId: 'mock-judge-uid',
    type: 'extraction',
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
    observedText: '"Deliver the interactive dashboard high-fidelity Figma files next Monday noon."',
    reasoning: 'Calculated Monday Noon target at UTC timezone. Target falls on high-impact freelancer delivery timeline. Extracted effort weight as high.',
    actionTaken: 'Parsed intent, generated commitment, extracted target properties.',
    resultOutcome: 'Commitment created with high urgency and high importance classifications.',
    status: 'success'
  },
  {
    id: 'log-2',
    commitmentId: 'commit-1',
    userId: 'mock-judge-uid',
    type: 'planning',
    timestamp: new Date(Date.now() - 3550 * 1000).toISOString(),
    observedText: 'Target duration detected as 4 days. Total effort estimated at 450 minutes.',
    reasoning: 'Constructing robust execution roadmap distributed symmetrically. Subtasks are ordered sequentially with effort assignments.',
    actionTaken: 'Mapped out 4 milestone subtasks based on Figma deliverables timeline.',
    resultOutcome: '4 execution roadmaps committed to database registry.',
    status: 'success'
  }
];

const INITIAL_ARTIFACTS: Artifact[] = [
  {
    id: 'art-1',
    commitmentId: 'commit-1',
    userId: 'mock-judge-uid',
    title: 'Client Communication & Submission Draft',
    type: 'email',
    content: `### Client Submission Draft -- Figma Handover\n\nHi Team,\n\nI am pleased to deliver the interactive high-fidelity Apex Corp Dashboard prototype for design review.\n\nKey features implemented:\n- Full responsive grid layout\n- Active component variants & auto-layout setup\n- Interactive flow click-throughs for primary checkout scenarios\n\nLooking forward to your feedback on Monday noon.\n\nBest regards,\nCreative Delivery Lead`,
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [view, setView] = useState<'intro' | 'landing' | 'entering' | 'dashboard'>('intro');
  const [activeTab, setActiveTab] = useState('commitments');
  const [user, setUser] = useState<UserProfile | null>(null);

  const [commitments, setCommitments] = useState<Commitment[]>(INITIAL_COMMITMENTS);
  const [subtasks, setSubtasks] = useState<SubTask[]>(INITIAL_SUBTASKS);
  const [workblocks, setWorkblocks] = useState<WorkBlock[]>(INITIAL_WORK_BLOCKS);
  const [logs, setLogs] = useState<AgentAction[]>(INITIAL_LOGS);
  const [artifacts, setArtifacts] = useState<Artifact[]>(INITIAL_ARTIFACTS);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(INITIAL_COMMITMENTS[0]);

  // AI Reasoning Reveal state
  const [analysisData, setAnalysisData] = useState<{
    title: string;
    urgency: 'low' | 'medium' | 'high';
    importance: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    extractedDeadline: string;
    reasoning: string;
  } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisExiting, setAnalysisExiting] = useState(false);
  const [activeArtifactTab, setActiveArtifactTab] = useState<string | null>('art-1');

  // Skip intro animation if completed before in this browser session
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('kairos-intro-completed');
    if (hasSeenIntro === 'true') {
      setView('landing');
    }
  }, []);

  // Sync Firebase authentication rules
  useEffect(() => {
    if (isUsingMock || !auth || !db) {
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Authorized User',
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date().toISOString()
        };
        setUser(profile);
        handleLoginSuccessTransition(profile);
      } else {
        setUser(null);
        setView('landing');
        setCommitments([]);
        setSubtasks([]);
        setWorkblocks([]);
        setLogs([]);
        setArtifacts([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync firestore collections
  useEffect(() => {
    if (isUsingMock || !db || !user || user.uid === 'mock-judge-uid') {
      return;
    }

    const uid = user.uid;

    const qCommitments = query(collection(db, 'commitments'), where('userId', '==', uid));
    const unsubscribeCommitments = onSnapshot(qCommitments, (snapshot) => {
      const list: Commitment[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Commitment);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCommitments(list);
      if (list.length > 0) {
        setSelectedCommitment(prev => {
          if (!prev) return list[0];
          const found = list.find(c => c.id === prev.id);
          return found || list[0];
        });
      } else {
        setSelectedCommitment(null);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'commitments'));

    const qSubtasks = query(collection(db, 'subtasks'), where('userId', '==', uid));
    const unsubscribeSubtasks = onSnapshot(qSubtasks, (snapshot) => {
      const list: SubTask[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as SubTask);
      });
      list.sort((a, b) => a.order - b.order);
      setSubtasks(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'subtasks'));

    const qWorkblocks = query(collection(db, 'workblocks'), where('userId', '==', uid));
    const unsubscribeWorkblocks = onSnapshot(qWorkblocks, (snapshot) => {
      const list: WorkBlock[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as WorkBlock);
      });
      setWorkblocks(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'workblocks'));

    const qLogs = query(collection(db, 'logs'), where('userId', '==', uid));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      const list: AgentAction[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as AgentAction);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'logs'));

    const qArtifacts = query(collection(db, 'artifacts'), where('userId', '==', uid));
    const unsubscribeArtifacts = onSnapshot(qArtifacts, (snapshot) => {
      const list: Artifact[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Artifact);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setArtifacts(list);
      if (list.length > 0) {
        setActiveArtifactTab(prev => {
          if (!prev) return list[0].id;
          const found = list.find(a => a.id === prev);
          return found ? prev : list[0].id;
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'artifacts'));

    return () => {
      unsubscribeCommitments();
      unsubscribeSubtasks();
      unsubscribeWorkblocks();
      unsubscribeLogs();
      unsubscribeArtifacts();
    };
  }, [user]);

  const handleLoginSuccessTransition = (profile: UserProfile) => {
    setUser(profile);
    setView('entering');
    setTimeout(() => {
      setView('dashboard');
    }, 1500);
  };

  const handleEnterSandbox = () => {
    const sandboxProfile: UserProfile = {
      uid: 'mock-judge-uid',
      email: 'judge@hackathon.com',
      displayName: 'Hackathon Judge',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      createdAt: new Date().toISOString()
    };
    handleLoginSuccessTransition(sandboxProfile);
  };

  const handleIntroComplete = () => {
    sessionStorage.setItem('kairos-intro-completed', 'true');
    setView('landing');
  };

  // Helper Firestore writers
  const saveDoc = async (collName: string, docId: string, data: any) => {
    if (isUsingMock || !db || !user || user.uid === 'mock-judge-uid') {
      return;
    }
    try {
      await setDoc(doc(db, collName, docId), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${collName}/${docId}`);
    }
  };

  const updateDocField = async (collName: string, docId: string, data: any) => {
    if (isUsingMock || !db || !user || user.uid === 'mock-judge-uid') {
      return;
    }
    try {
      await updateDoc(doc(db, collName, docId), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${collName}/${docId}`);
    }
  };

  // Multi-step agency logic for commitment generation
  const handleAddCommitment = async (inputText: string) => {
    setLoading(true);

    const steps = [
      'Reading your commitment...',
      'Extracting deadline and workload...',
      'Estimating effort and urgency...',
      'Building your execution plan...',
      'Finalizing your schedule...',
    ];
    setLoadingMessage(steps[0]);
    const timers = [
      setTimeout(() => setLoadingMessage(steps[1]), 700),
      setTimeout(() => setLoadingMessage(steps[2]), 1500),
      setTimeout(() => setLoadingMessage(steps[3]), 2400),
      setTimeout(() => setLoadingMessage(steps[4]), 3400),
    ];

    const fetchLogId = 'log-fetch-' + Date.now();
    const pendingLog: AgentAction = {
      id: fetchLogId,
      commitmentId: 'pending-id',
      userId: user?.uid || 'anonymous',
      type: 'extraction',
      timestamp: new Date().toISOString(),
      observedText: `User query: "${inputText}"`,
      reasoning: 'Active request triggered. Transporting payload safely via API endpoint and loading response schema parser parameters.',
      actionTaken: 'Interrogating server-side Gemini 3.5 API models...',
      resultOutcome: 'Operation running, awaiting JSON token stream.',
      status: 'info'
    };
    setLogs(prev => [pendingLog, ...prev]);

    try {
      const response = await fetch('/api/agent/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(`API extraction failed: ${response.statusText}`);
      }

      const extracted = await response.json();

      // ── AI REASONING REVEAL PHASE ────────────────────────────────────────
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingMessage('');

      setAnalysisData({
        title:             extracted.title             || 'Dynamic Task',
        urgency:           extracted.urgency           || 'medium',
        importance:        extracted.importance        || 'high',
        effort:            extracted.effort            || 'medium',
        extractedDeadline: extracted.extractedDeadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        reasoning:         extracted.reasoning         || 'I structured a roadmap based on the deadline, effort complexity, and optimal buffer distribution for your goal.',
      });
      setShowAnalysis(true);

      await new Promise<void>(resolve => setTimeout(resolve, 2600));

      setAnalysisExiting(true);
      await new Promise<void>(resolve => setTimeout(resolve, 380));

      setShowAnalysis(false);
      setAnalysisExiting(false);
      setAnalysisData(null);
      // ── END REVEAL PHASE ─────────────────────────────────────────────────

      const commitmentId = 'commit-' + Date.now();
      const newCommitment: Commitment = {
        id: commitmentId,
        userId: user?.uid || 'anonymous',
        title: extracted.title || 'Dynamic Task',
        description: inputText,
        extractedDeadline: extracted.extractedDeadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        rawDeadlineText: extracted.rawDeadlineText || 'Extracted Timeline',
        urgency: extracted.urgency as any || 'medium',
        importance: extracted.importance as any || 'high',
        effort: extracted.effort as any || 'medium',
        status: 'in_progress',
        riskScore: 15,
        riskLevel: 'low',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCommitments(prev => [newCommitment, ...prev]);

      const newSubtasks: SubTask[] = (extracted.plan || []).map((step: any, idx: number) => ({
        id: `sub-${commitmentId}-${idx}`,
        commitmentId,
        userId: user?.uid || 'anonymous',
        title: step.title,
        order: idx + 1,
        status: 'pending',
        effortEstimateMinutes: step.effortEstimateMinutes || 60
      }));
      setSubtasks(prev => [...newSubtasks, ...prev]);

      const completeLog: AgentAction = {
        id: 'log-complete-' + Date.now(),
        commitmentId,
        userId: user?.uid || 'anonymous',
        type: 'planning',
        timestamp: new Date().toISOString(),
        observedText: `AI Payload response parsed successfully. Title: "${extracted.title}"`,
        reasoning: extracted.reasoning || `Drafted ${newSubtasks.length} optimized milestone steps symmetrically. Distribution is complete.`,
        actionTaken: 'Calculated user intent, registered structured commitment, mapped sub-elements.',
        resultOutcome: `Commitment initialized with status 'in_progress'. Task list verified green.`,
        status: 'success'
      };

      const newArtifact: Artifact = {
        id: `art-${commitmentId}`,
        commitmentId,
        userId: user?.uid || 'anonymous',
        title: `AI Action Guidelines for ${extracted.title}`,
        type: 'checklist',
        content: `### Execution Study Checklist - ${extracted.title}\n\nThis outline was generated autonomously to ensure you deliver before the due date:\n\n` + 
          newSubtasks.map(t => `- [ ] **${t.title}** (Estimate: ${t.effortEstimateMinutes} min)`).join('\n') + 
          `\n\n*Target Deadline: ${new Date(newCommitment.extractedDeadline).toLocaleString()}*`,
        createdAt: new Date().toISOString()
      };

      setArtifacts(prev => [newArtifact, ...prev]);
      setActiveArtifactTab(newArtifact.id);

      const newWorkBlock: WorkBlock = {
        id: `work-${commitmentId}`,
        commitmentId,
        userId: user?.uid || 'anonymous',
        title: `Focus session: ${extracted.title}`,
        start: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled'
      };
      setWorkblocks(prev => [newWorkBlock, ...prev]);

      await saveDoc('commitments', commitmentId, newCommitment);
      for (const t of newSubtasks) {
        await saveDoc('subtasks', t.id, t);
      }
      await saveDoc('artifacts', newArtifact.id, newArtifact);
      await saveDoc('workblocks', newWorkBlock.id, newWorkBlock);
      await saveDoc('logs', completeLog.id, completeLog);

      setLogs(prev => [completeLog, ...prev.filter(l => l.id !== fetchLogId)]);
      setSelectedCommitment(newCommitment);

    } catch (err) {
      console.error(err);
      const fallbackId = 'commit-fallback-' + Date.now();
      const mockCommitment: Commitment = {
        id: fallbackId,
        userId: user?.uid || 'anonymous',
        title: 'Draft Project Milestone',
        description: inputText,
        extractedDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        rawDeadlineText: 'Next 48 Hours',
        urgency: 'high',
        importance: 'high',
        effort: 'medium',
        status: 'in_progress',
        riskScore: 25,
        riskLevel: 'low',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCommitments(prev => [mockCommitment, ...prev]);
      
      const completeLog: AgentAction = {
        id: 'log-err-fallback-' + Date.now(),
        commitmentId: fallbackId,
        userId: user?.uid || 'anonymous',
        type: 'extraction',
        timestamp: new Date().toISOString(),
        observedText: `Network timeout or missing credential payload. Entering resilient mock sandbox mode.`,
        reasoning: 'API keys were bypassed safely. Fallback to offline timeline simulation algorithm.',
        actionTaken: 'Rendered emergency fallback scheduler components, registered offline checklist.',
        resultOutcome: 'Commitment loaded safely to client state with 48h active tracking.',
        status: 'warning'
      };

      await saveDoc('commitments', fallbackId, mockCommitment);
      await saveDoc('logs', completeLog.id, completeLog);

      setLogs(prev => [completeLog, ...prev.filter(l => l.id !== fetchLogId)]);
      setSelectedCommitment(mockCommitment);
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingMessage('');
      setShowAnalysis(false);
      setAnalysisExiting(false);
      setAnalysisData(null);
    }
  };

  // Time Warp Simulator scenario trigger logic
  const handleScenarioSelect = (scenario: TimeWarpScenario) => {
    setSelectedScenarioId(scenario.id);

    setCommitments(prev => prev.map(c => {
      const extraRisk = scenario.daysAdded * 15 + (c.urgency === 'high' ? 15 : 5);
      const newRisk = Math.min(100, c.riskScore + extraRisk);
      const riskLevel = newRisk > 70 ? 'high' : newRisk > 30 ? 'medium' : 'low';
      
      updateDocField('commitments', c.id, { riskScore: newRisk, riskLevel });

      return {
        ...c,
        riskScore: newRisk,
        riskLevel
      };
    }));

    const warpLog: AgentAction = {
      id: 'log-warp-' + Date.now(),
      commitmentId: selectedCommitment?.id || 'all',
      userId: user?.uid || 'anonymous',
      type: 'recovery_intervention',
      timestamp: new Date().toISOString(),
      observedText: `Time Shift Event: "${scenario.title}" (+${scenario.daysAdded} Days simulated constraint).`,
      reasoning: `Timeline shift compresses duration metrics to absolute margin of error. De-risked buffer capacity dropped to 0. Absolute completion threat level detected as critical!`,
      actionTaken: 'Compiling immediate recovery checklist. Drafted Client Notification template to negotiate extension.',
      resultOutcome: `Active risk ratios spiked above critical threshold. Autonomous mitigation artifact generated.`,
      status: 'critical'
    };

    const emergencyArtifact: Artifact = {
      id: 'art-warp-emergency-' + Date.now(),
      commitmentId: selectedCommitment?.id || 'commit-1',
      userId: user?.uid || 'anonymous',
      title: `Emergency Extension Request Draft`,
      type: 'email',
      content: `### Emergency Timeline Communication -- Extenuating Circumstances\n\nDear Team,\n\nI am writing to notify you of an unexpected capacity reduction. Due to unforeseen circumstances, our schedule has compromised by roughly ${scenario.daysAdded} days.\n\nTo ensure pristine delivery, I recommend adjusting the milestone delivery target by +3 days.\n\nHighly proactive fallback plans:\n1. Deliver wireframe derivatives immediately for async check.\n2. Complete primary layout deliverables by the remaining target.\n\nAppreciate your cooperation.\n\nSincerely,\nKairos Agent`,
      createdAt: new Date().toISOString()
    };

    setArtifacts(prev => [emergencyArtifact, ...prev]);
    setActiveArtifactTab(emergencyArtifact.id);
    setLogs(prev => [warpLog, ...prev]);

    saveDoc('logs', warpLog.id, warpLog);
    saveDoc('artifacts', emergencyArtifact.id, emergencyArtifact);

    setTimeout(() => {
      if (selectedCommitment) {
        setSelectedCommitment(prev => {
          if (!prev) return null;
          const extraRisk = scenario.daysAdded * 15 + (prev.urgency === 'high' ? 15 : 5);
          const newRisk = Math.min(100, prev.riskScore + extraRisk);
          return {
            ...prev,
            riskScore: newRisk,
            riskLevel: newRisk > 70 ? 'high' : newRisk > 30 ? 'medium' : 'low'
          };
        });
      }
    }, 100);
  };

  const clearScenarioShift = () => {
    setSelectedScenarioId(null);
    if (isUsingMock || !user || user.uid === 'mock-judge-uid') {
      setCommitments(INITIAL_COMMITMENTS);
    } else {
      commitments.forEach(c => {
        updateDocField('commitments', c.id, { riskScore: 15, riskLevel: 'low' });
      });
    }

    const resetLog: AgentAction = {
      id: 'log-reset-' + Date.now(),
      commitmentId: 'all',
      userId: user?.uid || 'anonymous',
      type: 'risk_evaluation',
      timestamp: new Date().toISOString(),
      observedText: 'Time Warp stress-simulator environment reset in full.',
      reasoning: 'Reverted stress factors to standard clock tracking. Ratios restored to normal pre-seed.',
      actionTaken: 'Recalculated active buffer metrics.',
      resultOutcome: 'De-risk parameters returned to normal active ratios.',
      status: 'success'
    };

    setLogs(prev => [resetLog, ...prev]);
    saveDoc('logs', resetLog.id, resetLog);
  };

  const toggleSubtask = (id: string) => {
    const currentTask = subtasks.find(s => s.id === id);
    if (!currentTask) return;

    const nextStatus = currentTask.status === 'pending' ? 'completed' : 'pending';
    const completedAt = nextStatus === 'completed' ? new Date().toISOString() : undefined;

    setSubtasks(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: nextStatus as any,
          completedAt
        };
      }
      return s;
    }));

    updateDocField('subtasks', id, { status: nextStatus, completedAt: completedAt || null });

    const isFinishing = nextStatus === 'completed';
    const stepLog: AgentAction = {
      id: 'log-step-' + Date.now(),
      commitmentId: currentTask.commitmentId,
      userId: user?.uid || 'anonymous',
      type: 'risk_evaluation',
      timestamp: new Date().toISOString(),
      observedText: `Subtask marked as ${isFinishing ? 'completed' : 'incomplete'}: "${currentTask.title}"`,
      reasoning: isFinishing 
        ? `Decreasing active liability metrics by subtracting ${currentTask.effortEstimateMinutes} workload minutes. De-risk state optimized.` 
        : `Increasing active liability again. Risk parameters recalculated.`,
      actionTaken: 'Recalculating overall completion risk index.',
      resultOutcome: `Active risk score adjusted safely.`,
      status: isFinishing ? 'success' : 'warning'
    };
    setLogs(prev => [stepLog, ...prev]);
    saveDoc('logs', stepLog.id, stepLog);
  };

  // Helper selectors
  const activeCommitmentSubtasks = subtasks.filter(s => s.commitmentId === selectedCommitment?.id);
  const activeCommitmentArtifacts = artifacts.filter(a => a.commitmentId === selectedCommitment?.id);

  const getGreeting = () => {
    const hr = new Date().getHours();
    const name = user?.displayName ? user.displayName.split(' ')[0] : 'there';
    if (hr < 12) return `Good morning, ${name}`;
    if (hr < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const healthyCount = commitments.filter(c => c.riskScore <= 35).length;
  const attentionCount = commitments.filter(c => c.riskScore > 35 && c.riskScore <= 60).length;
  const actionCount = commitments.filter(c => c.riskScore > 60).length;

  const totalPendingEffortMinutes = subtasks
    .filter(s => s.status === 'pending')
    .reduce((acc, curr) => acc + curr.effortEstimateMinutes, 0);
  const todayWorkloadHours = (totalPendingEffortMinutes / 60).toFixed(1);

  const nextDeadlineCommitment = [...commitments].sort((a, b) => new Date(a.extractedDeadline).getTime() - new Date(b.extractedDeadline).getTime())[0];
  const nextDeadlineDaysLeft = nextDeadlineCommitment
    ? Math.max(0, Math.ceil((new Date(nextDeadlineCommitment.extractedDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const firstPendingSubtask = selectedCommitment 
    ? subtasks.find(s => s.commitmentId === selectedCommitment.id && s.status === 'pending')
    : subtasks.find(s => s.status === 'pending');
  
  const nextBestCommitment = firstPendingSubtask 
    ? commitments.find(c => c.id === firstPendingSubtask.commitmentId)
    : (commitments.length > 0 ? commitments[0] : null);

  const tabLabel = activeTab === 'commitments'
    ? 'Commitment Roadmap'
    : activeTab === 'activity_log'
    ? "Coach's Diary"
    : 'Disruption Stress Test';

  const tabDescription = activeTab === 'commitments'
    ? `${commitments.length} active roadmaps · ${todayWorkloadHours}h of focus needed`
    : activeTab === 'activity_log'
    ? `${logs.length} coach updates recorded`
    : 'Stress test your buffer and preview recovery steps';

  // Story Intro
  if (view === 'intro') {
    return <EntranceAnimation onComplete={handleIntroComplete} />;
  }

  // Light Landing Page
  if (view === 'landing') {
    return (
      <LandingPage 
        onLoginSuccess={handleLoginSuccessTransition}
        onEnterSandbox={handleEnterSandbox}
      />
    );
  }

  // Entering execution overlay
  if (view === 'entering') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060810] text-white">
        <div className="space-y-4 text-center">
          <div className="relative w-16 h-16 mx-auto">
            <span className="animate-ping absolute inset-0 rounded-full bg-indigo-500 opacity-60" />
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" opacity="0.9"/>
                <path d="M12 12 L12 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 12 L16 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-wider font-display animate-pulseSoft">
            ENTERING EXECUTION MODE
          </h2>
          <p className="text-xs text-slate-500 max-w-xs font-mono">
            Calibrating timeline stress indicators...
          </p>
        </div>
      </div>
    );
  }

  // Execution Dashboard (Serves bright light theme variables)
  return (
    <div className="theme-light app-shell">
      {/* Sidebar navigation */}
      <div className="desktop-sidebar">
        <Sidebar 
          user={user} 
          onUserChange={setUser} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>

      {/* Main content arena */}
      <div className="main-content">

        {/* Sticky Header */}
        <header className="app-header px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex md:hidden items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" opacity="0.9"/>
                  <path d="M12 12 L12 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 12 L16 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="kairos-wordmark text-sm">Kairos</span>
            </div>

            <div className="hidden md:flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulseSoft" />
              <h2 className="text-[13px] font-semibold text-[#111827] tracking-tight">
                {tabLabel}
              </h2>
              <span className="text-slate-350">·</span>
              <p className="text-[11px] text-slate-500 font-medium">
                {tabDescription}
              </p>
            </div>
          </div>

          {selectedScenarioId && (
            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full text-xs">
              <div className="flex items-center gap-1.5 font-medium text-indigo-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulseSoft" />
                Simulation active
              </div>
              <button
                onClick={clearScenarioShift}
                className="text-indigo-650 hover:text-indigo-800 font-bold transition-colors cursor-pointer underline underline-offset-2"
              >
                Reset
              </button>
            </div>
          )}
        </header>

        <main className="main-scroll">
          <div className="page-container space-y-8">

            {activeTab === 'commitments' && (
              <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">

                {/* Next Best Action Hero Card */}
                {firstPendingSubtask && nextBestCommitment ? (
                  <div className="relative overflow-hidden rounded-2xl border border-indigo-100 p-6 shadow-sm animate-fadeInScale"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.02) 0%, #ffffff 100%)' }}>
                    
                    <div className="relative flex items-start justify-between gap-6 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="ping-dot">
                            <span className="ping-dot-inner bg-indigo-500" />
                          </div>
                          <span className="text-label-xs text-indigo-600 tracking-[0.12em] font-extrabold">
                            Kairos Recommends Next
                          </span>
                        </div>

                        <h2 className="text-display-sm text-slate-900 mb-2 leading-snug">
                          "{firstPendingSubtask.title}"
                        </h2>
                        <p className="text-sm text-slate-550 mb-5 leading-relaxed">
                          Completing this secures your deadline for{' '}
                          <span className="text-slate-900 font-semibold">{nextBestCommitment.title}</span>{' '}
                          and keeps your buffer healthy.
                        </p>

                        <div className="flex items-center gap-6 flex-wrap">
                          <div>
                            <span className="text-label-xs text-slate-400 block mb-1">Estimated effort</span>
                            <span className="text-xs font-bold text-slate-800">{firstPendingSubtask.effortEstimateMinutes} min</span>
                          </div>
                          <div>
                            <span className="text-label-xs text-slate-400 block mb-1">Days remaining</span>
                            <span className="text-xs font-bold text-slate-800">
                              {Math.max(0, Math.ceil((new Date(nextBestCommitment.extractedDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                            </span>
                          </div>
                          <div>
                            <span className="text-label-xs text-slate-400 block mb-1">Buffer stability</span>
                            <span className={`text-xs font-bold ${
                              nextBestCommitment.riskLevel === 'high' ? 'text-red-650' :
                              nextBestCommitment.riskLevel === 'medium' ? 'text-amber-650' : 'text-emerald-650'
                            }`}>
                              {nextBestCommitment.riskLevel === 'high' ? 'Risk of Delay' 
                                : nextBestCommitment.riskLevel === 'medium' ? 'Compressed' 
                                : 'Secure Buffer'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSubtask(firstPendingSubtask.id)}
                        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-emerald-150 flex items-center gap-4 animate-fadeIn"
                    style={{ background: 'rgba(16,185,129,0.03)' }}>
                    <div className="p-2.5 rounded-xl bg-emerald-50 flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">All caught up!</span>
                      <span className="text-xs text-slate-500">No pending milestones right now. Set a new goal below when you're ready.</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-display-sm text-slate-900 font-display">{getGreeting()} 👋</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Here's your execution overview.</p>
                  </div>
                  <div className="flex items-center gap-5 flex-wrap">
                    <div className="text-right">
                      <span className="text-label-xs text-slate-400 block mb-0.5">Focus needed today</span>
                      <span className="text-xs font-bold text-slate-800">{todayWorkloadHours}h planned</span>
                    </div>
                    <div className="text-right">
                      <span className="text-label-xs text-slate-400 block mb-0.5">Next deadline</span>
                      <span className="text-xs font-bold text-slate-800 truncate block max-w-[130px]">
                        {nextDeadlineCommitment
                          ? `${nextDeadlineDaysLeft}d — ${nextDeadlineCommitment.title.split(' ').slice(0, 2).join(' ')}`
                          : 'None'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`status-dot ${
                        actionCount > 0 ? 'status-dot-danger' 
                        : attentionCount > 0 ? 'status-dot-warning' 
                        : 'status-dot-success'
                      }`} />
                      <span className="text-xs font-semibold text-slate-700">
                        {actionCount > 0 ? 'Buffer under pressure' 
                          : attentionCount > 0 ? 'Tight buffer' 
                          : 'Buffers secure'}
                      </span>
                    </div>
                  </div>
                </div>

                {showAnalysis && analysisData ? (
                  <KairosAnalysisPanel
                    title={analysisData.title}
                    urgency={analysisData.urgency}
                    importance={analysisData.importance}
                    effort={analysisData.effort}
                    extractedDeadline={analysisData.extractedDeadline}
                    reasoning={analysisData.reasoning}
                    exiting={analysisExiting}
                  />
                ) : (
                  <CommitmentForm
                    onCommitmentAdd={handleAddCommitment}
                    loading={loading}
                    loadingMessage={loadingMessage}
                  />
                )}

                {commitments.length === 0 ? (
                  <div className="text-center py-14 px-8 card max-w-2xl mx-auto flex flex-col items-center justify-center animate-fadeIn relative overflow-hidden">
                    <span className="text-4xl mb-5 select-none animate-float">✨</span>
                    <h2 className="text-display-sm text-slate-900 mb-2">Welcome to Kairos</h2>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-7">
                      I build custom roadmaps with stress buffers to safeguard your due dates.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left mb-6">
                      {[
                        { num: '01', title: 'Set your Goal', desc: 'Describe what you need to deliver. Write naturally.' },
                        { num: '02', title: 'Review Roadmap', desc: "I'll divide the effort and calculate your stress buffer." },
                        { num: '03', title: 'Stress Test', desc: 'See how your plans hold up when life happens.' },
                      ].map(step => (
                        <div key={step.num} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-indigo-600 font-bold text-xs block mb-1 font-mono">{step.num}</span>
                          <span className="text-slate-800 font-bold text-xs block mb-0.5">{step.title}</span>
                          <p className="text-[11px] text-slate-550 leading-relaxed">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-label-sm text-slate-400 font-extrabold">Your Commitments</span>
                        <span className="badge badge-brand">{commitments.length} active</span>
                      </div>

                      {commitments.map((commitment) => {
                        const isSelected = selectedCommitment?.id === commitment.id;
                        const daysLeft = Math.max(0, Math.ceil((new Date(commitment.extractedDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                        const parsedSubtasks = subtasks.filter(s => s.commitmentId === commitment.id);
                        const completedCount = parsedSubtasks.filter(s => s.status === 'completed').length;
                        const percent = parsedSubtasks.length > 0 ? Math.round((completedCount / parsedSubtasks.length) * 100) : 0;
                        const remainingSubtasks = parsedSubtasks.filter(s => s.status === 'pending');
                        const nextTaskToRecommend = remainingSubtasks[0];
                        const recommendationText = nextTaskToRecommend
                          ? `Complete "${nextTaskToRecommend.title}" to maintain buffer.`
                          : 'All milestones completed. Excellent focus buffer!';

                        return (
                          <div
                            key={commitment.id}
                            onClick={() => setSelectedCommitment(commitment)}
                            className={`p-5 rounded-xl cursor-pointer border flex flex-col space-y-4 transition-all duration-200 ${
                              isSelected 
                                ? 'card-active' 
                                : 'card card-interactive'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="space-y-1 min-w-0">
                                <h3 className="font-bold text-slate-800 text-sm leading-snug truncate">
                                  {commitment.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                              <span className={`badge flex-shrink-0 ${
                                commitment.riskLevel === 'high' ? 'badge-danger'
                                  : commitment.riskLevel === 'medium' ? 'badge-warning'
                                  : 'badge-success'
                              }`}>
                                {commitment.riskLevel === 'high' ? 'High Risk' 
                                  : commitment.riskLevel === 'medium' ? 'Compressed' 
                                  : 'Stable'}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                <span>Milestones cleared</span>
                                <span>{percent}%</span>
                              </div>
                              <div className="progress-track">
                                <div 
                                  className={`progress-fill ${
                                    commitment.riskLevel === 'high' ? 'progress-fill-danger'
                                    : commitment.riskLevel === 'medium' ? 'progress-fill-warning'
                                    : 'progress-fill-brand'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>

                            {remainingSubtasks.length > 0 && (
                              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                <span className="text-label-xs text-slate-400 block">Remaining steps</span>
                                <div className="space-y-1">
                                  {remainingSubtasks.slice(0, 2).map(sub => (
                                    <div key={sub.id} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                      <span className="text-slate-400 flex-shrink-0">›</span>
                                      <span className="truncate">{sub.title}</span>
                                    </div>
                                  ))}
                                  {remainingSubtasks.length > 2 && (
                                    <span className="text-[10px] text-slate-400 block pl-3">+{remainingSubtasks.length - 2} more</span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="p-3 rounded-lg ai-surface text-xs">
                              <span className="text-label-xs text-indigo-500 block mb-1">My Advice</span>
                              <p className="text-slate-500 leading-relaxed font-medium">{recommendationText}</p>
                            </div>

                            <div className="flex justify-end">
                              <span className="text-[11px] font-bold text-indigo-650 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer">
                                View roadmap <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="lg:col-span-7">
                      {selectedCommitment ? (
                        <div className="card p-6 space-y-6 relative overflow-hidden">
                          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-display-sm text-slate-900 leading-snug mb-1">
                                {selectedCommitment.title}
                              </h3>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span>
                                  Due {new Date(selectedCommitment.extractedDeadline).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <span className="text-label-xs text-slate-400 block mb-1 font-bold">Buffer Stability</span>
                              <span className={`text-sm font-extrabold ${
                                selectedCommitment.riskLevel === 'high' ? 'text-red-650'
                                  : selectedCommitment.riskLevel === 'medium' ? 'text-amber-650'
                                  : 'text-emerald-650'
                              }`}>
                                {selectedCommitment.riskLevel === 'high' ? 'Risk of Delay' 
                                  : selectedCommitment.riskLevel === 'medium' ? 'Compressed' 
                                  : 'Secure Buffer'}
                              </span>
                            </div>
                          </div>

                          {selectedCommitment.riskScore > 50 && (
                            <div className="p-4 rounded-xl border border-red-150 flex items-start gap-3 text-xs"
                              style={{ background: 'rgba(239,68,68,0.03)' }}>
                              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-red-600 mb-0.5">Buffer is compressed</h4>
                                <p className="text-slate-500 leading-relaxed">
                                  Cutting it close. I've generated a timeline recovery draft — check AI Drafts below.
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-label-sm text-slate-400 font-bold">Coach's Roadmap</span>
                              <span className="badge badge-brand">AI Structured</span>
                            </div>

                            <div className="space-y-2">
                              {activeCommitmentSubtasks.map((task) => {
                                const isDone = task.status === 'completed';
                                return (
                                  <div
                                    key={task.id}
                                    onClick={() => toggleSubtask(task.id)}
                                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer group ${
                                      isDone
                                        ? 'border-slate-100 opacity-60'
                                        : 'border-slate-200/60 hover:border-indigo-100 hover:bg-slate-50'
                                    }`}
                                    style={{ background: isDone ? 'rgba(0,0,0,0.01)' : '#ffffff' }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                                        isDone 
                                          ? 'bg-indigo-600 border-indigo-500' 
                                          : 'border-slate-300 group-hover:border-indigo-500'
                                      }`}>
                                        {isDone && (
                                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        )}
                                      </div>
                                      <span className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                        {task.title}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                                      {task.effortEstimateMinutes}m
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {activeCommitmentArtifacts.length > 0 && (
                            <div className="border-t border-slate-100 pt-5 space-y-3">
                              <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="text-label-sm text-slate-400">Coach's Companion Drafts</span>
                              </div>

                              <div className="rounded-xl border border-slate-200 overflow-hidden"
                                style={{ background: '#F6F8FA' }}>
                                <div className="px-3 py-2 border-b border-slate-200 flex gap-1.5 overflow-x-auto"
                                  style={{ background: '#ffffff' }}>
                                  {activeCommitmentArtifacts.map(art => (
                                    <button
                                      key={art.id}
                                      onClick={() => setActiveArtifactTab(art.id)}
                                      className={`px-3 py-1.5 text-xs rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                                        activeArtifactTab === art.id
                                          ? 'bg-[#111827] text-white shadow-sm'
                                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                      }`}
                                    >
                                      {art.title}
                                    </button>
                                  ))}
                                </div>

                                <div className="p-4 text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-line max-h-52 overflow-y-auto bg-white/50">
                                  {artifacts.find(a => a.id === activeArtifactTab)?.content}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="card border-dashed p-14 text-center flex flex-col items-center justify-center">
                          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm">
                            Select a commitment to examine milestones and explore companion drafts.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity_log' && (
              <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
                <div>
                  <h1 className="text-display-md text-slate-900 font-display">What Kairos Did</h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Every decision I made while you were working — explained in plain language.
                  </p>
                </div>
                <ActivityLog logs={logs} />
              </div>
            )}

            {activeTab === 'warp_simulator' && (
              <div className="max-w-4xl mx-auto space-y-7 animate-fadeIn">
                <div>
                  <h1 className="text-display-md text-slate-900 font-display">What If?</h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Simulate a disruption — sick day, laptop failure, surprise exam — and see exactly how your commitments hold up.
                  </p>
                </div>

                <WarpConsole
                  onScenarioSelect={handleScenarioSelect}
                  selectedScenarioId={selectedScenarioId}
                  commitments={commitments}
                  subtasks={subtasks}
                />

                {selectedScenarioId && (
                  <div className="p-5 rounded-2xl border border-indigo-150 flex items-center gap-4 text-sm animate-fadeIn"
                    style={{ background: 'rgba(99,102,241,0.03)' }}>
                    <div className="p-2.5 rounded-xl bg-indigo-50 flex-shrink-0">
                      <Layers className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-0.5">Stress Simulation Active</h4>
                      <span className="text-slate-500 text-xs leading-relaxed">
                        Timelines and stress buffers have been recalculated. Check your commitments list to review updated buffer stability.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <nav className="mobile-nav">
        {[
          { id: 'commitments', icon: Compass, label: 'Roadmaps' },
          { id: 'activity_log', icon: Sparkles, label: "Diary" },
          { id: 'warp_simulator', icon: Layers, label: 'Stress Test' },
        ].map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-indigo-50' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
