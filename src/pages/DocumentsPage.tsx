import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { FolderOpen, Search, FileText, Building2, BookOpen, Calendar, Map, Palette, Scroll, Sparkles } from 'lucide-react';
import { getState } from '../lib/store';
import type { Document } from '../lib/types';

const TYPE_ICONS: Record<string, typeof FileText> = {
  prd: FileText,
  architecture: Building2,
  research: BookOpen,
  meeting_notes: Calendar,
  roadmap: Map,
  design: Palette,
  contract: Scroll,
};

const TYPE_LABELS: Record<string, string> = {
  prd: 'PRD',
  architecture: 'Architecture',
  research: 'Research',
  meeting_notes: 'Meeting Notes',
  roadmap: 'Roadmap',
  design: 'Design',
  contract: 'Contract',
};

// Simple semantic search simulation — scores by keyword overlap
function semanticSearch(docs: Document[], query: string): { doc: Document; score: number }[] {
  if (!query.trim()) return docs.map(doc => ({ doc, score: 0 }));
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  return docs.map(doc => {
    const text = (doc.title + ' ' + doc.content + ' ' + doc.tags.join(' ')).toLowerCase();
    let score = 0;
    queryWords.forEach(w => {
      if (text.includes(w)) score += 1;
      if (doc.tags.some(t => t.includes(w))) score += 2;
      if (doc.title.toLowerCase().includes(w)) score += 3;
    });
    return { doc, score };
  }).sort((a, b) => b.score - a.score);
}

export function DocumentsPage() {
  const state = getState();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Document | null>(state.documents[0] || null);

  const filtered = useMemo(() => {
    let docs = state.documents.filter(d => typeFilter === 'all' || d.type === typeFilter);
    const scored = semanticSearch(docs, search);
    return scored.map(s => s.doc);
  }, [state.documents, search, typeFilter]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Documents"
        description="Store and semantically search PRDs, architecture docs, research, and more"
      />

      {/* Semantic search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <Input
            placeholder="Semantic search across all documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Document list */}
        <div className="space-y-2">
          {filtered.map(doc => {
            const Icon = TYPE_ICONS[doc.type] || FileText;
            return (
              <Card
                key={doc.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${selected?.id === doc.id ? 'border-primary' : ''}`}
                onClick={() => setSelected(doc)}
              >
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.author} · {new Date(doc.updatedAt).toLocaleDateString()}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doc.tags.slice(0, 2).map(t => <span key={t} className="text-[9px] bg-muted px-1.5 py-0.5 rounded">{t}</span>)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No documents found</p>
          )}
        </div>

        {/* Document viewer */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{TYPE_LABELS[selected.type]}</Badge>
                    {selected.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Updated {new Date(selected.updatedAt).toLocaleDateString()}</span>
                </div>
                <ScrollArea className="h-[600px]">
                  <div className="text-sm whitespace-pre-wrap font-mono leading-relaxed pr-4">{selected.content}</div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Select a document to view</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
