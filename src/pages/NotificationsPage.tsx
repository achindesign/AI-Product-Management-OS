import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Bell, CheckCheck, Clock, GitBranch, FlaskConical, CheckCircle2, Calendar, Mail } from 'lucide-react';
import { getState, setState } from '../lib/store';
import type { Notification } from '../lib/types';

const TYPE_ICONS: Record<string, typeof Bell> = {
  sprint_reminder: Clock,
  roadmap_update: GitBranch,
  experiment_completion: FlaskConical,
  feature_approval: CheckCircle2,
  release_reminder: Calendar,
  stakeholder_update: Mail,
};

const TYPE_COLORS: Record<string, string> = {
  sprint_reminder: 'bg-amber-500/10 text-amber-500',
  roadmap_update: 'bg-blue-500/10 text-blue-500',
  experiment_completion: 'bg-purple-500/10 text-purple-500',
  feature_approval: 'bg-green-500/10 text-green-500',
  release_reminder: 'bg-cyan-500/10 text-cyan-500',
  stakeholder_update: 'bg-pink-500/10 text-pink-500',
};

export function NotificationsPage() {
  const state = getState();
  const [notifications, setNotifications] = useState<Notification[]>(state.notifications);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter);

  function markAllRead() {
    setState(s => { s.notifications.forEach(n => n.read = true); });
    setNotifications(getState().notifications);
  }

  function markRead(id: string) {
    setState(s => {
      const n = s.notifications.find(n => n.id === id);
      if (n) n.read = true;
    });
    setNotifications(getState().notifications);
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread of ${notifications.length} total`}
        actions={
          <Button size="sm" variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'unread', 'sprint_reminder', 'roadmap_update', 'experiment_completion', 'feature_approval', 'release_reminder', 'stakeholder_update'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        {filtered.map(n => {
          const Icon = TYPE_ICONS[n.type] || Bell;
          return (
            <Card key={n.id} className={`hover:shadow-sm transition-shadow ${!n.read ? 'border-primary/30 bg-primary/5' : ''}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[n.type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.date).toLocaleDateString()} · {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {!n.read && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => markRead(n.id)}>
                      Mark read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
