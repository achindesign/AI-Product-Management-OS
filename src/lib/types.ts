// Core domain types for AI PM OS

export type UserRole =
  | 'Administrator'
  | 'ChiefProductOfficer'
  | 'ProductManager'
  | 'AssociateProductManager'
  | 'BusinessAnalyst'
  | 'UXDesigner'
  | 'EngineeringManager'
  | 'SoftwareEngineer'
  | 'QAEngineer'
  | 'Stakeholder';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  title: string;
  department: string;
  createdAt: string;
}

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type ItemStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Product {
  id: string;
  name: string;
  description: string;
  vision: string;
  status: 'active' | 'maintenance' | 'sunset' | 'beta';
  owner: string;
  team: string;
  startDate: string;
  targetDate: string;
  health: 'green' | 'yellow' | 'red';
  metrics: {
    mau: number;
    revenue: number;
    nps: number;
    churn: number;
    adoption: number;
    retention: number;
  };
  color: string;
}

export interface Epic {
  id: string;
  productId: string;
  title: string;
  description: string;
  status: ItemStatus;
  priority: Priority;
  owner: string;
  startDate: string;
  dueDate: string;
  progress: number;
  storyIds: string[];
}

export type StoryType = 'story' | 'task' | 'bug' | 'spike';

export interface Story {
  id: string;
  epicId: string;
  productId: string;
  title: string;
  description: string;
  type: StoryType;
  status: ItemStatus;
  priority: Priority;
  storyPoints: number;
  assignee: string;
  labels: string[];
  acceptanceCriteria: string[];
  dor: boolean; // definition of ready
  dod: boolean; // definition of done
  sprintId?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  storyId: string;
  title: string;
  status: ItemStatus;
  assignee: string;
  hours: number;
  done: boolean;
}

export interface Sprint {
  id: string;
  productId: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  status: 'planning' | 'active' | 'completed' | 'review';
  capacity: number;
  committed: number;
  completed: number;
}

export interface Roadmap {
  id: string;
  productId: string;
  title: string;
  quarter: string;
  items: RoadmapItem[];
}

export interface RoadmapItem {
  id: string;
  title: string;
  type: 'milestone' | 'feature' | 'release' | 'initiative';
  startDate: string;
  endDate: string;
  status: ItemStatus;
  progress: number;
  lane: 'now' | 'next' | 'later';
  dependencies: string[];
  owner: string;
}

export interface Release {
  id: string;
  productId: string;
  version: string;
  name: string;
  date: string;
  status: 'planned' | 'in_progress' | 'released' | 'rolled_back';
  features: string[];
  notes: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'new' | 'reviewing' | 'approved' | 'rejected' | 'converted';
  votes: number;
  businessValue: number;
  customerImpact: number;
  effort: number;
  priority: Priority;
  submittedBy: string;
  createdAt: string;
  tags: string[];
  duplicateOf?: string;
  featureId?: string;
}

export interface Feedback {
  id: string;
  productId: string;
  customer: string;
  company: string;
  segment: 'enterprise' | 'midmarket' | 'smb' | 'startup';
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  themes: string[];
  type: 'bug' | 'feature_request' | 'compliment' | 'complaint' | 'question';
  date: string;
  priority: Priority;
  status: 'new' | 'triaged' | 'addressed' | 'watching';
}

export interface Experiment {
  id: string;
  productId: string;
  name: string;
  hypothesis: string;
  successMetric: string;
  variantA: string;
  variantB: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
  traffic: number;
  results?: {
    variantAConv: number;
    variantBConv: number;
    lift: number;
    significance: number;
    winner: 'A' | 'B' | 'inconclusive';
  };
}

export interface Competitor {
  id: string;
  name: string;
  website: string;
  strengths: string[];
  weaknesses: string[];
  marketShare: number;
  pricing: string;
  features: string[];
  threat: 'low' | 'medium' | 'high';
  notes: string;
}

export interface Document {
  id: string;
  productId?: string;
  title: string;
  type: 'prd' | 'architecture' | 'research' | 'meeting_notes' | 'roadmap' | 'design' | 'contract';
  content: string;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  embedding?: number[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  notes: string;
  summary: string;
  actionItems: ActionItem[];
  decisions: string[];
  type: 'standup' | 'planning' | 'review' | 'discovery' | 'stakeholder' | 'retrospective';
  productId?: string;
}

export interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  dueDate: string;
  done: boolean;
}

export interface Report {
  id: string;
  title: string;
  type: 'executive' | 'roadmap' | 'sprint' | 'release' | 'feature_status' | 'stakeholder';
  productId?: string;
  date: string;
  author: string;
  content: string;
  format: 'pdf' | 'csv' | 'html';
}

export interface Notification {
  id: string;
  type: 'sprint_reminder' | 'roadmap_update' | 'experiment_completion' | 'feature_approval' | 'release_reminder' | 'stakeholder_update';
  title: string;
  message: string;
  read: boolean;
  date: string;
  productId?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  changes: string;
  timestamp: string;
}

export interface OKR {
  id: string;
  productId: string;
  objective: string;
  keyResults: { id: string; text: string; target: number; current: number; unit: string }[];
  quarter: string;
  owner: string;
}

export interface AnalyticsPoint {
  date: string;
  users: number;
  revenue: number;
  retention: number;
  engagement: number;
  conversion: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: string;
}

export interface AppState {
  users: User[];
  products: Product[];
  epics: Epic[];
  stories: Story[];
  tasks: Task[];
  sprints: Sprint[];
  roadmaps: Roadmap[];
  releases: Release[];
  ideas: Idea[];
  feedback: Feedback[];
  experiments: Experiment[];
  competitors: Competitor[];
  documents: Document[];
  meetings: Meeting[];
  reports: Report[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  okrs: OKR[];
  analytics: Record<string, AnalyticsPoint[]>;
}
