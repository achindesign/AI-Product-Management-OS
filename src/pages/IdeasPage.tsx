import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Lightbulb, Plus, ThumbsUp, Search, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { getState, setState } from '../lib/store';
import type { Idea, Priority } from '../lib/types';

const CATEGORIES = ['Growth', 'Retention', 'Efficiency', 'Integration', 'AI/ML', 'Mobile', 'Security', 'UX', 'Performance', 'Compliance'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  reviewing: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  converted: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

export function IdeasPage() {
  const state = getState();
  const [ideas, setIdeas] = useState<Idea[]>(state.ideas);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '', category: 'Growth' });

  const filtered = useMemo(() => {
    let result = ideas.filter(i =>
      (search === '' || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())) &&
      (categoryFilter === 'all' || i.category === categoryFilter) &&
      (statusFilter === 'all' || i.status === statusFilter)
    );
    if (sortBy === 'priority') {
      const order: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
      result = result.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sortBy === 'votes') {
      result = result.sort((a, b) => b.votes - a.votes);
    } else if (sortBy === 'value') {
      result = result.sort((a, b) => (b.businessValue * b.customerImpact / b.effort) - (a.businessValue * a.customerImpact / a.effort));
    }
    return result;
  }, [ideas, search, categoryFilter, statusFilter, sortBy]);

  function vote(id: string) {
    setState(s => {
      const idea = s.ideas.find(i => i.id === id);
      if (idea) idea.votes++;
    });
    setIdeas(getState().ideas);
  }

  function createIdea() {
    if (!newIdea.title.trim()) return;
    const bv = Math.floor(Math.random() * 5) + 5;
    const ci = Math.floor(Math.random() * 5) + 5;
    const eff = Math.floor(Math.random() * 5) + 3;
    const score = (bv * ci) / eff;
    const idea: Idea = {
      id: `idea-${Date.now()}`,
      title: newIdea.title,
      description: newIdea.description || `Proposal for ${newIdea.title}`,
      category: newIdea.category,
      status: 'new',
      votes: 0,
      businessValue: bv,
      customerImpact: ci,
      effort: eff,
      priority: score > 5 ? 'P1' : score > 3 ? 'P2' : 'P3',
      submittedBy: 'You',
      createdAt: new Date().toISOString(),
      tags: [newIdea.category],
    };
    setState(s => { s.ideas.unshift(idea); });
    setIdeas(getState().ideas);
    setNewIdea({ title: '', description: '', category: 'Growth' });
    setDialogOpen(false);
  }

  function convertToFeature(id: string) {
    setState(s => {
      const idea = s.ideas.find(i => i.id === id);
      if (idea) {
        idea.status = 'converted';
        idea.featureId = `feat-${Date.now()}`;
      }
    });
    setIdeas(getState().ideas);
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Idea Management"
        description="Capture, evaluate, and prioritize product ideas with AI scoring"
        actions={
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" /> New Idea
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="votes">Most Voted</SelectItem>
            <SelectItem value="value">Highest Value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ideas grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(idea => {
          const score = ((idea.businessValue * idea.customerImpact) / idea.effort).toFixed(1);
          return (
            <Card key={idea.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={`${STATUS_COLORS[idea.status]} text-[10px]`}>{idea.status}</Badge>
                  <Badge variant="outline" className="text-[10px]">{idea.priority}</Badge>
                </div>
                <h3 className="text-sm font-semibold mb-1 line-clamp-2">{idea.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{idea.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-[10px]">{idea.category}</Badge>
                  <span className="text-[10px] text-muted-foreground">by {idea.submittedBy}</span>
                </div>

                {/* AI Score */}
                <div className="grid grid-cols-4 gap-1 mb-3 p-2 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <p className="text-[9px] text-muted-foreground">Value</p>
                    <p className="text-xs font-bold">{idea.businessValue}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-muted-foreground">Impact</p>
                    <p className="text-xs font-bold">{idea.customerImpact}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-muted-foreground">Effort</p>
                    <p className="text-xs font-bold">{idea.effort}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-muted-foreground">Score</p>
                    <p className="text-xs font-bold text-primary">{score}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => vote(idea.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> {idea.votes}
                  </button>
                  {idea.status === 'approved' || idea.status === 'reviewing' ? (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => convertToFeature(idea.id)}>
                      Convert <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  ) : idea.status === 'converted' ? (
                    <Badge className="text-[10px] bg-purple-500/10 text-purple-500">Converted</Badge>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">No ideas match your filters</p>
        </div>
      )}

      {/* New Idea Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit New Idea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={newIdea.title} onChange={e => setNewIdea({ ...newIdea, title: e.target.value })} placeholder="e.g., Add AI-powered search" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={newIdea.description} onChange={e => setNewIdea({ ...newIdea, description: e.target.value })} placeholder="Describe the idea and its value..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newIdea.category} onValueChange={v => setNewIdea({ ...newIdea, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">AI will automatically score this idea for business value, customer impact, and effort.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={createIdea}>Submit Idea</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
