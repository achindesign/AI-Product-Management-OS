import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollText, Search, User, Plus, Edit, Trash2, Move, CheckCircle2, XCircle, MessageSquare, Clock } from 'lucide-react';
import { getState } from '../lib/store';

const ACTION_ICONS: Record<string, typeof Plus> = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  moved: Move,
  approved: CheckCircle2,
  rejected: XCircle,
  assigned: User,
  commented: MessageSquare,
  completed: CheckCircle2,
};

const ACTION_COLORS: Record<string, string> = {
  created: 'text-green-500 bg-green-500/10',
  updated: 'text-blue-500 bg-blue-500/10',
  deleted: 'text-red-500 bg-red-500/10',
  moved: 'text-amber-500 bg-amber-500/10',
  approved: 'text-green-500 bg-green-500/10',
  rejected: 'text-red-500 bg-red-500/10',
  assigned: 'text-purple-500 bg-purple-500/10',
  commented: 'text-cyan-500 bg-cyan-500/10',
  completed: 'text-green-500 bg-green-500/10',
};

export function AuditLogPage() {
  const state = getState();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const actions = ['created', 'updated', 'deleted', 'moved', 'approved', 'rejected', 'assigned', 'commented', 'completed'];
  const entities = ['Story', 'Epic', 'Product', 'Roadmap', 'Idea', 'Release', 'Document', 'Experiment'];

  const filtered = useMemo(() => {
    return state.auditLogs.filter(l =>
      (search === '' || l.userName.toLowerCase().includes(search.toLowerCase()) || l.entity.toLowerCase().includes(search.toLowerCase()) || l.changes.toLowerCase().includes(search.toLowerCase())) &&
      (actionFilter === 'all' || l.action === actionFilter) &&
      (entityFilter === 'all' || l.entity === entityFilter)
    );
  }, [state.auditLogs, search, actionFilter, entityFilter]);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader title="Audit Log" description="Track all user actions, changes, and system events" />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search audit logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Entity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entities.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Events</p><p className="text-2xl font-bold">{state.auditLogs.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Active Users</p><p className="text-2xl font-bold">{new Set(state.auditLogs.map(l => l.userId)).size}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Last 24h</p><p className="text-2xl font-bold">{state.auditLogs.filter(l => Date.now() - new Date(l.timestamp).getTime() < 86400000).length}</p></CardContent></Card>
      </div>

      {/* Log entries */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.slice(0, 50).map(log => {
              const Icon = ACTION_ICONS[log.action] || Plus;
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ACTION_COLORS[log.action] || 'bg-muted'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{log.userName}</span>
                      <Badge variant="outline" className="text-[9px]">{log.action}</Badge>
                      <span className="text-xs text-muted-foreground">{log.entity}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{log.entityId}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.changes}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <ScrollText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No audit entries match your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
