export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high';
export type ImportanceLevel = 'low' | 'medium' | 'high';
export type EffortLevel = 'low' | 'medium' | 'high';

export type CommitmentStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Commitment {
  id: string;
  userId: string;
  title: string;
  description: string;
  extractedDeadline: string; // ISO string
  rawDeadlineText: string;
  urgency: UrgencyLevel;
  importance: ImportanceLevel;
  effort: EffortLevel;
  status: CommitmentStatus;
  riskScore: number; // 0 to 100
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  commitmentId: string;
  userId: string;
  title: string;
  order: number;
  status: 'pending' | 'completed';
  effortEstimateMinutes: number;
  completedAt?: string;
}

export type WorkBlockStatus = 'scheduled' | 'missed' | 'completed';

export interface WorkBlock {
  id: string;
  commitmentId: string;
  userId: string;
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  status: WorkBlockStatus;
}

export type AgentActionType =
  | 'extraction'
  | 'planning'
  | 'scheduling'
  | 'risk_evaluation'
  | 'recovery_intervention'
  | 'artifact_generation';

export interface AgentAction {
  id: string;
  commitmentId: string;
  userId: string;
  type: AgentActionType;
  timestamp: string; // ISO string
  observedText: string;
  reasoning: string;
  actionTaken: string;
  resultOutcome: string;
  status: 'info' | 'warning' | 'success' | 'critical';
}

export type ArtifactType = 'email' | 'study_plan' | 'checklist' | 'project_plan';

export interface Artifact {
  id: string;
  commitmentId: string;
  userId: string;
  title: string;
  type: ArtifactType;
  content: string; // Markdown representation
  createdAt: string;
}

export interface TimeWarpScenario {
  id: string;
  title: string;
  description: string;
  daysAdded: number; // Simulated days shift forward
  icon: string;
}
