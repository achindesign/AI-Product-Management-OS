import {
  LayoutDashboard, Bot, Lightbulb, Map, ListTodo, FileText, BarChart3,
  MessageSquareQuote, FlaskConical, TrendingUp, CalendarClock, FolderOpen,
  Search, FileBarChart, Bell, ScrollText, Settings,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  group: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { id: 'copilot', label: 'AI Copilot', icon: Bot, group: 'Overview' },
  { id: 'search', label: 'Search', icon: Search, group: 'Overview' },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, group: 'Plan' },
  { id: 'roadmap', label: 'Roadmap', icon: Map, group: 'Plan' },
  { id: 'backlog', label: 'Backlog', icon: ListTodo, group: 'Plan' },
  { id: 'requirements', label: 'AI Requirements', icon: FileText, group: 'Plan' },
  { id: 'prioritization', label: 'Prioritization', icon: BarChart3, group: 'Plan' },
  { id: 'feedback', label: 'Customer Feedback', icon: MessageSquareQuote, group: 'Discover' },
  { id: 'experiments', label: 'Experiments', icon: FlaskConical, group: 'Discover' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, group: 'Discover' },
  { id: 'meetings', label: 'Meetings', icon: CalendarClock, group: 'Discover' },
  { id: 'documents', label: 'Documents', icon: FolderOpen, group: 'Create' },
  { id: 'reports', label: 'Reports', icon: FileBarChart, group: 'Create' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'Create' },
  { id: 'audit', label: 'Audit Log', icon: ScrollText, group: 'Admin' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'Admin' },
];

export const NAV_GROUPS = ['Overview', 'Plan', 'Discover', 'Create', 'Admin'];
