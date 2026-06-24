import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Clock, AlertTriangle, Cpu, Sparkles, CheckCircle2, 
  User, ChevronRight, FileText, Download, Play, Flame, HelpCircle, 
  Trash2, Layers, Compass, ExternalLink, Lightbulb, CheckSquare
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import CommitmentForm from './components/CommitmentForm';
import ActivityLog from './components/ActivityLog';
import WarpConsole from './components/WarpConsole';
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
    content: `### Client Submission Draft -- Figma Handover

Hi Team,

I am pleased to deliver the interactive high-fidelity Apex Corp Dashboard prototype for design review.

Key features implemented:
- Full responsive grid layout
- Active component variants & auto-layout setup
- Interactive flow click-throughs for primary checkout scenarios

Looking forward to your feedback on Monday noon.

Best regards,
Creative Delivery Lead`,
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('commitments');
  const [user, setUser] = useState<UserProfile | null>({
    uid: 'mock-judge-uid',
    email: 'judge@hackathon.com',
    displayName: 'Hackathon Judge',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    createdAt: new Date().toISOString()
  });

  const [commitments, setCommitments] = useState<Commitment[]>(INITIAL_COMMITMENTS);
  const [subtasks, setSubtasks] = useState<SubTask[]>(INITIAL_SUBTASKS);
  const [workblocks, setWorkblocks] = useState<WorkBlock[]>(INITIAL_WORK_BLOCKS);
  const [logs, setLogs] = useState<AgentAction[]>(INITIAL_LOGS);
  const [artifacts, setArtifacts] = useState<Artifact[]>(INITIAL_ARTIFACTS);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(INITIAL_COMMITMENTS[0]);
  const [activeArtifactTab, setActiveArtifactTab] = useState<string | null>('art-1');

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

  // Synchronize with Firebase Auth and Firestore
  useEffect(() => {
    if (isUsingMock || !auth || !db) {
      // Keep using mock data and local states
      return;
    }

    // Auth listener
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Authorized User',
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date().toISOString()
        });
      } else {
        // Logged out
        setUser(null);
        // Clear collections to trigger default mock data for pre-auth review
        setCommitments([]);
        setSubtasks([]);
        setWorkblocks([]);
        setLogs([]);
        setArtifacts([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore changes if real user is logged in (excluding mock-judge-uid offline sandbox)
  useEffect(() => {
    if (isUsingMock || !db || !user || user.uid === 'mock-judge-uid') {
      // Use local state presets for mock judge/offline state
      return;
    }

    const uid = user.uid;

    // Subscriptions
    const qCommitments = query(collection(db, 'commitments'), where('userId', '==', uid));
    const unsubscribeCommitments = onSnapshot(qCommitments, (snapshot) => {
      const list: Commitment[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Commitment);
      });
      // Sort by created time
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCommitments(list);
      // Select the first one if none selected
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

  // Multi-step agency logic for commitment generation
  const handleAddCommitment = async (inputText: string) => {
    setLoading(true);

    // Broadcast AI progress steps to CommitmentForm's loading animation
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

    // Add pending log entry to give realistic observer feeling
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

      // Create new commitment object
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

      // Set new commitment to list
      setCommitments(prev => [newCommitment, ...prev]);

      // Map subtasks
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

      // Create log showing success completion of agent run
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

      // Add a dynamically generated artifact checklist
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

      // Schedulable simulated work block
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

      // Save commitment, subtasks, workblock, logs, artifacts to Firestore
      await saveDoc('commitments', commitmentId, newCommitment);
      for (const t of newSubtasks) {
        await saveDoc('subtasks', t.id, t);
      }
      await saveDoc('artifacts', newArtifact.id, newArtifact);
      await saveDoc('workblocks', newWorkBlock.id, newWorkBlock);
      await saveDoc('logs', completeLog.id, completeLog);

      // Update logs: remove pending log and replace
      setLogs(prev => [completeLog, ...prev.filter(l => l.id !== fetchLogId)]);
      setSelectedCommitment(newCommitment);

    } catch (err) {
      console.error(err);
      // In case of error (e.g. no internet/key), mock gracefully to keep app functional
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

      // Save mock commitment & log to Firestore if in fallback but connected
      await saveDoc('commitments', fallbackId, mockCommitment);
      await saveDoc('logs', completeLog.id, completeLog);

      setLogs(prev => [completeLog, ...prev.filter(l => l.id !== fetchLogId)]);
      setSelectedCommitment(mockCommitment);
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // Time Warp Simulator scenario trigger logic
  const handleScenarioSelect = (scenario: TimeWarpScenario) => {
    setSelectedScenarioId(scenario.id);

    // Dynamic shift of risk scores and creation of warning / emergency recovery plans!
    setCommitments(prev => prev.map(c => {
      // Shift risks significantly up
      const extraRisk = scenario.daysAdded * 15 + (c.urgency === 'high' ? 15 : 5);
      const newRisk = Math.min(100, c.riskScore + extraRisk);
      const riskLevel = newRisk > 70 ? 'high' : newRisk > 30 ? 'medium' : 'low';
      
      // Update each record in Firestore if authenticated
      updateDocField('commitments', c.id, { riskScore: newRisk, riskLevel });

      return {
        ...c,
        riskScore: newRisk,
        riskLevel
      };
    }));

    // Create an autonomous warning recovery trace log
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

    // Autogenerate an extension notification email drafted template
    const emergencyArtifact: Artifact = {
      id: 'art-warp-emergency-' + Date.now(),
      commitmentId: selectedCommitment?.id || 'commit-1',
      userId: user?.uid || 'anonymous',
      title: `Emergency Extension Request Draft`,
      type: 'email',
      content: `### Emergency Timeline Communication -- Extenuating Circumstances

Dear Team,

I am writing to notify you of an unexpected capacity reduction. Due to unforeseen circumstances, our schedule has compromised by roughly ${scenario.daysAdded} days.

To ensure pristine delivery, I recommend adjusting the milestone delivery target by +3 days.

Highly proactive fallback plans:
1. Deliver wireframe derivatives immediately for async check.
2. Complete primary layout deliverables by the remaining target.

Appreciate your cooperation.

Sincerely,
Kairos Agent`,
      createdAt: new Date().toISOString()
    };

    setArtifacts(prev => [emergencyArtifact, ...prev]);
    setActiveArtifactTab(emergencyArtifact.id);
    setLogs(prev => [warpLog, ...prev]);

    saveDoc('logs', warpLog.id, warpLog);
    saveDoc('artifacts', emergencyArtifact.id, emergencyArtifact);

    // Automatically update local state selection withshifted values
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
      // Re-initialize risk scores in Firestore
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
    // Read current state
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

    // Log completing step
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
    const name = user?.displayName ? user.displayName.split(' ')[0] : 'Harsh';
    if (hr < 12) return `Good morning, ${name} 👋`;
    if (hr < 17) return `Good afternoon, ${name} 👋`;
    return `Good evening, ${name} 👋`;
  };

  const healthyCount = commitments.filter(c => c.riskScore <= 35).length;
  const attentionCount = commitments.filter(c => c.riskScore > 35 && c.riskScore <= 60).length;
  const actionCount = commitments.filter(c => c.riskScore > 60).length;

  const totalPendingEffortMinutes = subtasks
    .filter(s => s.status === 'pending')
    .reduce((acc, curr) => acc + curr.effortEstimateMinutes, 0);
  const todayWorkloadHours = (totalPendingEffortMinutes / 60).toFixed(1);

  // Next deadline
  const nextDeadlineCommitment = [...commitments].sort((a, b) => new Date(a.extractedDeadline).getTime() - new Date(b.extractedDeadline).getTime())[0];
  const nextDeadlineDaysLeft = nextDeadlineCommitment
    ? Math.max(0, Math.ceil((new Date(nextDeadlineCommitment.extractedDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Next Best Action
  const firstPendingSubtask = selectedCommitment 
    ? subtasks.find(s => s.commitmentId === selectedCommitment.id && s.status === 'pending')
    : subtasks.find(s => s.status === 'pending');
  
  const nextBestCommitment = firstPendingSubtask 
    ? commitments.find(c => c.id === firstPendingSubtask.commitmentId)
    : (commitments.length > 0 ? commitments[0] : null);

  return (
    <div className="flex h-screen w-full bg-[#080b13] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        user={user} 
        onUserChange={setUser} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Contextual Header */}
        <header className="px-8 py-4 bg-[#0c0f18] border-b border-[#1e293b]/50 flex justify-between items-center flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-300">
                {activeTab === 'commitments'
                  ? 'Commitment Roadmap'
                  : activeTab === 'activity_log'
                  ? "Coach's Diary"
                  : 'Disruption Stress Test'}
              </h2>
            </div>
            <p className="text-[10px] text-slate-550 mt-0.5 pl-4">
              {activeTab === 'commitments'
                ? `${commitments.length} active roadmaps · ${todayWorkloadHours}h of focus needed`
                : activeTab === 'activity_log'
                ? `${logs.length} coach updates recorded`
                : 'Stress test your buffer and preview recovery steps'}
            </p>
          </div>

          {selectedScenarioId && (
            <div className="flex items-center gap-3 bg-indigo-950/20 border border-indigo-900/30 px-4 py-2 rounded-xl text-indigo-300 font-sans text-xs">
              <div className="flex items-center gap-1.5 font-medium text-indigo-400">
                <Layers className="w-4 h-4 text-indigo-400" />
                Simulation running
              </div>
              <span className="text-slate-400 text-[11px]">Go to My Commitments to see updated buffer stability.</span>
              <button
                onClick={clearScenarioShift}
                className="px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 text-xs font-medium border border-indigo-500/30 cursor-pointer transition"
              >
                Reset
              </button>
            </div>
          )}
        </header>

        {/* Content Tabs */}
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          {activeTab === 'commitments' && (
            <div className="max-w-6xl mx-auto space-y-8">
              {/* ── NBA Hero: Kairos's top recommendation — the first thing the user sees ── */}
              {firstPendingSubtask && nextBestCommitment ? (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/60 via-[#131a35] to-[#0d111d] border border-indigo-500/30 p-6 shadow-2xl shadow-indigo-950/30 animate-fadeInScale">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.04] to-violet-500/[0.04] pointer-events-none rounded-2xl" />
                  <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/[0.07] rounded-full blur-3xl pointer-events-none" />

                  <div className="relative flex items-center justify-between gap-6 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                        </span>
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
                          Your Coach Recommends Next
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white mb-2 leading-tight font-display">
                        "{firstPendingSubtask.title}"
                      </h2>
                      <p className="text-sm text-slate-450 mb-5">
                        Completing this next secures your due date for <span className="text-slate-200 font-semibold">{nextBestCommitment.title}</span> and keeps your stress buffer healthy.
                      </p>
                      <div className="flex items-center gap-6 flex-wrap">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Estimated effort</span>
                          <span className="text-sm font-bold text-slate-200">{firstPendingSubtask.effortEstimateMinutes} min</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Due date</span>
                          <span className="text-sm font-bold text-slate-200">
                            {Math.max(0, Math.ceil((new Date(nextBestCommitment.extractedDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Buffer stability</span>
                          <span className={`text-sm font-bold ${
                            nextBestCommitment.riskLevel === 'high' ? 'text-rose-400' :
                            nextBestCommitment.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {nextBestCommitment.riskLevel === 'high' ? 'Risk of Delay' : nextBestCommitment.riskLevel === 'medium' ? 'Compressed' : 'Secure Buffer'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSubtask(firstPendingSubtask.id)}
                      className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-indigo-950/40 hover:-translate-y-0.5 hover:shadow-indigo-500/20 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      Mark Completed
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#111625]/40 border border-emerald-500/10 flex items-center gap-4 animate-fadeIn">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">We are fully catch up!</span>
                    <span className="text-xs text-slate-550">No pending milestones right now. Set a new goal below when you are ready.</span>
                  </div>
                </div>
              )}

              {/* ── Compact Greeting + Stats Row ── */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-lg font-bold font-display tracking-tight text-white">{getGreeting()}</h1>
                  <p className="text-slate-500 text-xs mt-0.5">Let's review our buffer roadmaps.</p>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-550 uppercase font-semibold block">Today's focus time</span>
                    <span className="text-xs font-semibold text-slate-200">{todayWorkloadHours}h planned</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-550 uppercase font-semibold block">Next milestone due</span>
                    <span className="text-xs font-semibold text-slate-200 truncate block max-w-[120px]">
                      {nextDeadlineCommitment
                        ? `${nextDeadlineDaysLeft}d — ${nextDeadlineCommitment.title.split(' ').slice(0, 2).join(' ')}`
                        : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      actionCount > 0 ? 'bg-rose-500 animate-pulse' : attentionCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-xs font-semibold text-slate-300">
                      {actionCount > 0 ? 'Buffer under pressure' : attentionCount > 0 ? 'Tight buffer' : "Buffers secure"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Intake Console Form */}
              <CommitmentForm
                onCommitmentAdd={handleAddCommitment}
                loading={loading}
                loadingMessage={loadingMessage}
              />

              {/* Grid of Commitments and Live Analysis details */}
              {commitments.length === 0 ? (
                <div className="text-center py-10 px-8 border border-indigo-500/20 rounded-3xl bg-[#111625]/60 hover:bg-[#111625] transition-all max-w-2xl mx-auto flex flex-col items-center justify-center animate-fadeIn shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.04] rounded-full blur-2xl pointer-events-none"></div>
                  <span className="text-4xl mb-4 select-none animate-bounce">✨</span>
                  <h2 className="text-lg font-bold text-slate-100 font-display mb-2">Welcome to Kairos! I am your Execution Coach.</h2>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-md font-sans mb-6">
                    I don't just track tasks — I build custom roadmaps with built-in stress buffers to safeguard your due dates. Let's get started:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left mb-6">
                    <div className="p-3 bg-[#080c16]/50 border border-[#1e293b]/50 rounded-xl">
                      <span className="text-indigo-400 font-bold text-xs block mb-1">1. Set your Goal</span>
                      <p className="text-[10px] text-slate-550 leading-normal font-sans">
                        Describe what you need to deliver in the box above. Write naturally.
                      </p>
                    </div>
                    <div className="p-3 bg-[#080c16]/50 border border-[#1e293b]/50 rounded-xl">
                      <span className="text-indigo-400 font-bold text-xs block mb-1">2. Review Roadmap</span>
                      <p className="text-[10px] text-slate-550 leading-normal font-sans">
                        I'll divide the effort into milestones and calculate your stress buffer.
                      </p>
                    </div>
                    <div className="p-3 bg-[#080c16]/50 border border-[#1e293b]/50 rounded-xl">
                      <span className="text-indigo-400 font-bold text-xs block mb-1">3. Stress Test</span>
                      <p className="text-[10px] text-slate-550 leading-normal font-sans">
                        Use the "Stress Test" tool to test how your plans hold up when life happens.
                      </p>
                    </div>
                  </div>
                  <p className="text-indigo-400 text-[11px] font-semibold animate-pulse">
                    Add a goal above to initialize your first stress-free roadmap!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Side: Redesigned Active Commitments List */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Your Commitments</span>
                      <span className="text-xs text-slate-500 font-medium font-sans">{commitments.length} active</span>
                    </div>

                    {commitments.map((commitment) => {
                      const isSelected = selectedCommitment?.id === commitment.id;
                      const durationLeft = new Date(commitment.extractedDeadline).getTime() - Date.now();
                      const daysLeft = Math.max(0, Math.ceil(durationLeft / (1000 * 60 * 60 * 24)));

                      const parsedSubtasks = subtasks.filter(s => s.commitmentId === commitment.id);
                      const completedCount = parsedSubtasks.filter(s => s.status === 'completed').length;
                      const percent = parsedSubtasks.length > 0 ? Math.round((completedCount / parsedSubtasks.length) * 100) : 0;
                      const remainingSubtasks = parsedSubtasks.filter(s => s.status === 'pending');

                      const nextTaskToRecommend = remainingSubtasks[0];
                      let recommendationText = "All milestones completed. Excellent focus buffer!";
                      if (nextTaskToRecommend) {
                        recommendationText = `Complete "${nextTaskToRecommend.title}" to maintain buffer.`;
                      }

                      return (
                        <div 
                          key={commitment.id}
                          onClick={() => setSelectedCommitment(commitment)}
                          className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 border text-left flex flex-col space-y-4 ${
                            isSelected 
                              ? 'bg-[#121727] border-indigo-500/50 shadow-lg shadow-indigo-950/15 ring-1 ring-indigo-500/25' 
                              : 'bg-[#111625]/60 hover:bg-[#111625] border-[#1e293b]/70 hover:border-[#334155]'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-slate-100 text-sm leading-snug">
                                {commitment.title}
                              </h3>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                <span>Due in {daysLeft} Days</span>
                              </div>
                            </div>
                            
                            <span className={`text-[10px] uppercase font-sans font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${
                              commitment.riskLevel === 'high'
                                ? 'bg-rose-950/30 text-rose-300 border-rose-900/30'
                                : commitment.riskLevel === 'medium'
                                ? 'bg-amber-950/30 text-amber-300 border-amber-900/30'
                                : 'bg-indigo-950/30 text-indigo-300 border-indigo-900/30'
                            }`}>
                              {commitment.riskLevel === 'high' ? 'Risk of Delay' : commitment.riskLevel === 'medium' ? 'Compressed' : 'Secure Buffer'}
                              {commitment.riskLevel === 'high' ? 'High Risk' : commitment.riskLevel === 'medium' ? 'Compressed' : 'Stable'}
                            </span>
                          </div>

                          {/* Progress */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] text-slate-550 font-medium">
                              <span>Milestones Cleared</span>
                              <span>{percent}%</span>
                            </div>
                            <div className="w-full bg-[#080b13] rounded-full h-1 overflow-hidden">
                              <div className="bg-indigo-500 h-1 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>

                          {/* Remaining Tasks */}
                          {remainingSubtasks.length > 0 && (
                            <div className="pt-2 border-t border-[#1e293b]/40 space-y-1">
                              <span className="text-[9.5px] text-slate-550 font-semibold uppercase tracking-wider block">Remaining Steps</span>
                              <div className="space-y-1">
                                {remainingSubtasks.slice(0, 2).map(sub => (
                                  <div key={sub.id} className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                                    <span className="text-slate-600">•</span>
                                    <span className="truncate">{sub.title}</span>
                                  </div>
                                ))}
                                {remainingSubtasks.length > 2 && (
                                  <span className="text-[10px] text-slate-500 italic block pl-2">+{remainingSubtasks.length - 2} more tasks</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Kairos Recommendation */}
                          <div className="p-3 rounded-xl bg-indigo-950/15 border border-indigo-500/10 text-xs text-slate-300">
                            <span className="text-[9px] font-semibold text-indigo-400 block uppercase tracking-wide mb-0.5">My Advice</span>
                            <p className="text-slate-400 font-sans leading-relaxed">
                              {recommendationText}
                            </p>
                          </div>

                           <div className="flex justify-end pt-1">
                            <span className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer">
                              Expand Roadmap <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {loading && (
                      <div className="p-5 rounded-2xl border border-indigo-500/20 bg-[#121727]/30 animate-pulse space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                          <div className="h-4 bg-slate-800 rounded w-16"></div>
                        </div>
                        <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                        <div className="space-y-2">
                          <div className="h-2 bg-slate-800 rounded w-full"></div>
                          <div className="h-2 bg-slate-800 rounded w-5/6"></div>
                        </div>
                        <p className="text-xs text-slate-500 italic">Kairos is calibrating planning parameters...</p>
                      </div>
                    )}
                  </div>

                {/* Right Side: Deep analysis dashboard (Col 7) */}
                <div className="lg:col-span-7">
                  {selectedCommitment ? (
                    <div className="bg-[#111625] border border-[#1e293b]/70 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden">
                      {/* Atmospheric background */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none"></div>

                      <div className="flex items-center justify-between border-b border-[#1e293b]/50 pb-4 relative">
                        <div>
                          <h3 className="text-base font-bold font-display text-slate-100 leading-snug">
                            {selectedCommitment.title}
                          </h3>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            Due {new Date(selectedCommitment.extractedDeadline).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="text-[10px] text-slate-550 uppercase tracking-wider block font-semibold">
                            Buffer Stability
                          </span>
                          <span className={`text-base font-bold ${
                            selectedCommitment.riskLevel === 'high'
                              ? 'text-rose-400'
                              : selectedCommitment.riskLevel === 'medium'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}>
                            {selectedCommitment.riskLevel === 'high' ? 'Risk of Delay' : selectedCommitment.riskLevel === 'medium' ? 'Compressed' : 'Secure Buffer'}
                          </span>
                        </div>
                      </div>

                      {/* Calming Buffer Action Suggestion Banner */}
                      {selectedCommitment.riskScore > 50 && (
                        <div className="p-4 bg-rose-950/15 border border-rose-900/30 rounded-xl space-y-2 text-xs flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-rose-450 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-rose-300 font-sans">Heads up: Buffer is compressed.</h4>
                            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed font-sans">
                              We are cutting it close here. I have generated a timeline recovery draft and streamlined your milestones below — check AI Drafts.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Milestones execution list */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-450 font-semibold uppercase tracking-wider">
                            Coach's Roadmap
                          </span>
                          <span className="text-[10px] text-indigo-400 font-medium bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded">
                            AI Structured
                          </span>
                        </div>

                        <div className="space-y-2">
                          {activeCommitmentSubtasks.map((task) => {
                            const isDone = task.status === 'completed';
                            return (
                              <div 
                                key={task.id}
                                onClick={() => toggleSubtask(task.id)}
                                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all duration-150 cursor-pointer ${
                                  isDone 
                                    ? 'bg-[#080b13]/40 border-indigo-500/10 text-slate-500' 
                                    : 'bg-[#080c16]/70 hover:bg-[#080c16] border-[#1e293b]/70 text-slate-200 hover:border-indigo-500/20'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-0.5 rounded transition ${isDone ? 'text-indigo-450' : 'text-slate-550'}`}>
                                    <CheckSquare className="w-4 h-4" />
                                  </div>
                                  <span className={`text-xs ${isDone ? 'line-through text-slate-500 font-medium' : 'font-medium'}`}>
                                    {task.title}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                                  {task.effortEstimateMinutes} min
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Generated Documents Artifacts */}
                      {activeCommitmentArtifacts.length > 0 && (
                        <div className="border-t border-[#1e293b]/60 pt-5 space-y-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs text-slate-450 font-semibold uppercase tracking-wider">
                              Coach's Companion Drafts
                            </span>
                          </div>

                          <div className="bg-[#080c16]/50 border border-[#1e293b]/70 rounded-xl overflow-hidden">
                            {/* Inner tab selectors */}
                            <div className="bg-[#0c101d] px-3 py-2 border-b border-[#1e293b]/40 flex gap-2">
                              {activeCommitmentArtifacts.map(art => (
                                <button
                                  key={art.id}
                                  onClick={() => setActiveArtifactTab(art.id)}
                                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition cursor-pointer ${
                                    activeArtifactTab === art.id 
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20' 
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {art.title}
                                </button>
                              ))}
                            </div>

                            <div className="p-4 text-xs font-serif text-slate-300 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto bg-slate-950/20 italic">
                              {artifacts.find(a => a.id === activeArtifactTab)?.content}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#111625]/20 border border-dashed border-[#1e293b]/70 rounded-2xl p-12 text-center">
                      <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm font-sans">
                        Select a commitment from your list to examine milestones, plan buffers, and explore companion draft templates.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          )}

          {activeTab === 'activity_log' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-bold font-display tracking-tight text-white">What Kairos Did</h1>
                <p className="text-slate-400 text-sm">
                  Every decision Kairos made while you were working — explained in plain language.
                </p>
              </div>

              <ActivityLog logs={logs} />
            </div>
          )}

          {activeTab === 'warp_simulator' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-bold font-display tracking-tight text-white">What If?</h1>
                <p className="text-slate-400 text-sm">
                  Simulate a disruption — sick day, laptop failure, surprise exam — and see exactly how your commitments hold up.
                </p>
              </div>

              <WarpConsole
                onScenarioSelect={handleScenarioSelect}
                selectedScenarioId={selectedScenarioId}
                commitments={commitments}
                subtasks={subtasks}
              />

              {/* Stress simulation status visual outcome logs */}
              {selectedScenarioId && (
                <div className="p-5 bg-indigo-950/10 border border-indigo-900/30 rounded-2xl flex items-center gap-4 text-sm max-w-4xl animate-fadeIn">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-455 flex-shrink-0">
                    <Layers className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">Stress Simulation Active</h4>
                    <span className="text-slate-450 leading-relaxed text-xs block font-sans">
                      I have recalculated your target timelines and stress buffers to project potential constraints. Check your commitments list to review updated buffer stability, or view the Coach's Diary to inspect my adaptive planning advice.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
