import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { ListTodo, Plus, Search, GitBranch, Bug, Zap, FileText, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { getState, setState } from '../lib/store';
import type { Story, ItemStatus } from '../lib/types';

const COLUMNS: { id: ItemStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'bg-muted' },
  { id: 'todo', label: 'To Do', color: 'bg-blue-500/10' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-500/10' },
  { id: 'in_review', label: 'In Review', color: 'bg-purple-500/10' },
  { id: 'done', label: 'Done', color: 'bg-green-500/10' },
  { id: 'blocked', label: 'Blocked', color: 'bg-red-500/10' },
];

const TYPE_ICONS: Record<string, typeof Zap> = {
  story: FileText,
  task: CheckCircle2,
  bug: Bug,
  spike: Zap,
};

const PRIORITY_COLORS: Record<string, string> = {
  P0: 'bg-red-500/10 text-red-500 border-red-500/20',
  P1: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  P2: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  P3: 'bg-muted text-muted-foreground',
};

export function BacklogPage() {
  const state = getState();
  const [view, setView] = useState('kanban');
  const [productId, setProductId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const stories = useMemo(() => {
    return state.stories.filter(s =>
      (productId === 'all' || s.productId === productId) &&
      (search === '' || s.title.toLowerCase().includes(search.toLowerCase())) &&
      (typeFilter === 'all' || s.type === typeFilter)
    );
  }, [state.stories, productId, search, typeFilter]);

  const epics = state.epics.filter(e => productId === 'all' || e.productId === productId);

  function moveStory(id: string, newStatus: ItemStatus) {
    setState(s => {
      const story = s.stories.find(st => st.id === id);
      if (story) {
        story.status = newStatus;
        if (newStatus === 'done') story.dod = true;
      }
    });
  }

  function handleDrop(status: ItemStatus) {
    if (draggedId) {
      moveStory(draggedId, status);
      setDraggedId(null);
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Backlog Management"
        description="Epics, stories, tasks, and bugs with drag-and-drop Kanban"
        actions={
          <div className="flex gap-2">
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Products" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {state.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Story</Button>
          </div>
        }
      />

      <Tabs value={view} onValueChange={setView}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="epics">Epics</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-[200px]" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="story">Stories</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="bug">Bugs</SelectItem>
                <SelectItem value="spike">Spikes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Kanban */}
        <TabsContent value="kanban">
          <div className="grid grid-cols-6 gap-3 overflow-x-auto">
            {COLUMNS.map(col => {
              const colStories = stories.filter(s => s.status === col.id);
              return (
                <div
                  key={col.id}
                  className={`rounded-lg ${col.color} p-2 min-h-[500px]`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(col.id)}
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-semibold">{col.label}</span>
                    <Badge variant="outline" className="text-[10px]">{colStories.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {colStories.map(story => {
                      const Icon = TYPE_ICONS[story.type] || FileText;
                      return (
                        <div
                          key={story.id}
                          draggable
                          onDragStart={() => setDraggedId(story.id)}
                          onClick={() => setDraggedId(story.id)}
                          className="p-2.5 rounded-md bg-card border border-border hover:shadow-sm cursor-grab active:cursor-grabbing transition-shadow group"
                        >
                          <div className="flex items-start gap-2 mb-1.5">
                            <Icon className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <p className="text-xs font-medium line-clamp-2 flex-1">{story.title}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              <Badge className={`${PRIORITY_COLORS[story.priority]} text-[9px] px-1.5`}>{story.priority}</Badge>
                              <Badge variant="outline" className="text-[9px] px-1.5">{story.storyPoints}pt</Badge>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium">
                              {story.assignee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          </div>
                          {story.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {story.labels.slice(0, 2).map(l => (
                                <span key={l} className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{l}</span>
                              ))}
                            </div>
                          )}
                          {story.dor && <div className="mt-1.5 flex items-center gap-1 text-[9px] text-green-500"><CheckCircle2 className="w-2.5 h-2.5" /> Ready</div>}
                        </div>
                      );
                    })}
                    {colStories.length === 0 && (
                      <p className="text-[10px] text-muted-foreground text-center py-4">Drop items here</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Title</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Priority</th>
                    <th className="text-left p-3 font-medium">Points</th>
                    <th className="text-left p-3 font-medium">Assignee</th>
                    <th className="text-left p-3 font-medium">Labels</th>
                    <th className="text-left p-3 font-medium">DoR/DoD</th>
                  </tr>
                </thead>
                <tbody>
                  {stories.slice(0, 50).map(story => {
                    const Icon = TYPE_ICONS[story.type] || FileText;
                    return (
                      <tr key={story.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-3"><Icon className="w-4 h-4 text-muted-foreground" /></td>
                        <td className="p-3 max-w-[300px] truncate">{story.title}</td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{story.status.replace('_', ' ')}</Badge></td>
                        <td className="p-3"><Badge className={`${PRIORITY_COLORS[story.priority]} text-[10px]`}>{story.priority}</Badge></td>
                        <td className="p-3">{story.storyPoints}</td>
                        <td className="p-3 text-xs">{story.assignee}</td>
                        <td className="p-3"><div className="flex flex-wrap gap-1">{story.labels.slice(0, 2).map(l => <span key={l} className="text-[9px] bg-muted px-1.5 py-0.5 rounded">{l}</span>)}</div></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {story.dor ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Circle className="w-3.5 h-3.5 text-muted-foreground/30" />}
                            {story.dod ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Circle className="w-3.5 h-3.5 text-muted-foreground/30" />}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Epics View */}
        <TabsContent value="epics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {epics.map(epic => {
              const epicStories = state.stories.filter(s => s.epicId === epic.id);
              const doneCount = epicStories.filter(s => s.status === 'done').length;
              return (
                <Card key={epic.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`${PRIORITY_COLORS[epic.priority]} text-[10px]`}>{epic.priority}</Badge>
                      <Badge variant="outline" className="text-[10px]">{epic.status.replace('_', ' ')}</Badge>
                    </div>
                    <h3 className="text-sm font-semibold mb-1">{epic.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{epic.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">{doneCount}/{epicStories.length} stories</span>
                        <span className="font-medium">{epic.progress}%</span>
                      </div>
                      <Progress value={epic.progress} className="h-1.5" />
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                        <span>{epic.owner}</span>
                        <span>Due {new Date(epic.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
