import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import { LoginPage } from './pages/LoginPage';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { CopilotPage } from './pages/CopilotPage';
import { IdeasPage } from './pages/IdeasPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { BacklogPage } from './pages/BacklogPage';
import { RequirementsPage } from './pages/RequirementsPage';
import { PrioritizationPage } from './pages/PrioritizationPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SearchPage } from './pages/SearchPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { isAuthed, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  // Keyboard shortcut for search
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isAuthed) setActiveView('search');
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAuthed]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthed) {
    return <LoginPage />;
  }

  function renderView() {
    switch (activeView) {
      case 'dashboard': return <DashboardPage />;
      case 'copilot': return <CopilotPage />;
      case 'search': return <SearchPage />;
      case 'ideas': return <IdeasPage />;
      case 'roadmap': return <RoadmapPage />;
      case 'backlog': return <BacklogPage />;
      case 'requirements': return <RequirementsPage />;
      case 'prioritization': return <PrioritizationPage />;
      case 'feedback': return <FeedbackPage />;
      case 'experiments': return <ExperimentsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'meetings': return <MeetingsPage />;
      case 'documents': return <DocumentsPage />;
      case 'reports': return <ReportsPage />;
      case 'notifications': return <NotificationsPage />;
      case 'audit': return <AuditLogPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  }

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView}>
      {renderView()}
    </AppShell>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
