import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search as SearchIcon, FileText, Lightbulb, ListTodo, Map, MessageSquareQuote, FlaskConical, FolderOpen, CalendarClock, Users } from 'lucide-react';
import { getState } from '../lib/store';

interface SearchResult {
  type: string;
  title: string;
  description: string;
  icon: typeof FileText;
  id: string;
}

export function SearchPage() {
  const state = getState();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [savedSearches] = useState([
    { id: '1', name: 'Active P0 bugs', query: 'bug P0' },
    { id: '2', name: 'AI feature ideas', query: 'AI' },
    { id: '3', name: 'Enterprise feedback', query: 'enterprise' },
  ]);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    state.products.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
        results.push({ type: 'Product', title: p.name, description: p.description, icon: Users, id: p.id });
    });
    state.epics.forEach(e => {
      if (e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
        results.push({ type: 'Epic', title: e.title, description: e.description, icon: Map, id: e.id });
    });
    state.stories.forEach(s => {
      if (s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
        results.push({ type: 'Story', title: s.title, description: s.description, icon: ListTodo, id: s.id });
    });
    state.ideas.forEach(i => {
      if (i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
        results.push({ type: 'Idea', title: i.title, description: i.description, icon: Lightbulb, id: i.id });
    });
    state.feedback.forEach(f => {
      if (f.text.toLowerCase().includes(q) || f.customer.toLowerCase().includes(q))
        results.push({ type: 'Feedback', title: f.customer, description: f.text, icon: MessageSquareQuote, id: f.id });
    });
    state.experiments.forEach(e => {
      if (e.name.toLowerCase().includes(q) || e.hypothesis.toLowerCase().includes(q))
        results.push({ type: 'Experiment', title: e.name, description: e.hypothesis, icon: FlaskConical, id: e.id });
    });
    state.documents.forEach(d => {
      if (d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q))
        results.push({ type: 'Document', title: d.title, description: d.content.slice(0, 100), icon: FolderOpen, id: d.id });
    });
    state.meetings.forEach(m => {
      if (m.title.toLowerCase().includes(q) || m.notes.toLowerCase().includes(q))
        results.push({ type: 'Meeting', title: m.title, description: m.summary, icon: CalendarClock, id: m.id });
    });

    return activeFilter === 'all' ? results : results.filter(r => r.type === activeFilter);
  }, [query, activeFilter, state]);

  const filters = ['all', 'Product', 'Epic', 'Story', 'Idea', 'Feedback', 'Experiment', 'Document', 'Meeting'];
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
    return counts;
  }, [results]);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader title="Global Search" description="Search across all products, stories, ideas, feedback, and documents" />

      {/* Search bar */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search everything..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-10 h-12 text-base"
          autoFocus
        />
      </div>

      {/* Saved searches */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">Saved:</span>
        {savedSearches.map(s => (
          <Button key={s.id} variant="outline" size="sm" className="text-xs h-7" onClick={() => setQuery(s.query)}>
            {s.name}
          </Button>
        ))}
      </div>

      {/* Filters */}
      {query && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {f === 'all' ? 'All' : f}
              {f !== 'all' && typeCounts[f] ? ` (${typeCounts[f]})` : f === 'all' ? ` (${results.length})` : ''}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="space-y-2">
        {results.map((r, i) => {
          const Icon = r.icon;
          return (
            <Card key={`${r.id}-${i}`} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="outline" className="text-[9px]">{r.type}</Badge>
                      <p className="text-sm font-medium truncate">{r.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {query && results.length === 0 && (
          <div className="text-center py-20">
            <SearchIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
          </div>
        )}
        {!query && (
          <div className="text-center py-20">
            <SearchIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Start typing to search across everything</p>
            <p className="text-xs text-muted-foreground mt-1">Products, epics, stories, ideas, feedback, experiments, documents, meetings</p>
          </div>
        )}
      </div>
    </div>
  );
}
