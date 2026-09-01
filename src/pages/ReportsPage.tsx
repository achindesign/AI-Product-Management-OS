import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FileBarChart, Download, FileText, FileSpreadsheet, Globe, Sparkles } from 'lucide-react';
import { getState } from '../lib/store';

const REPORT_TYPES = [
  { id: 'executive', label: 'Executive Report', icon: FileBarChart, desc: 'High-level portfolio summary for leadership' },
  { id: 'roadmap', label: 'Roadmap Report', icon: FileText, desc: 'Product roadmap with timeline and milestones' },
  { id: 'sprint', label: 'Sprint Report', icon: FileText, desc: 'Sprint progress, velocity, and burndown' },
  { id: 'release', label: 'Release Report', icon: FileText, desc: 'Release status and feature breakdown' },
  { id: 'feature_status', label: 'Feature Status', icon: FileText, desc: 'Detailed status of all features' },
  { id: 'stakeholder', label: 'Stakeholder Update', icon: FileText, desc: 'Weekly summary for stakeholders' },
];

export function ReportsPage() {
  const state = getState();
  const [productId, setProductId] = useState<string>('all');
  const [generating, setGenerating] = useState<string | null>(null);

  function generateReport(type: string, format: string) {
    setGenerating(`${type}-${format}`);
    setTimeout(() => {
      setGenerating(null);
    }, 1000);
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Reports"
        description="Generate executive reports, sprint summaries, and stakeholder updates"
        actions={
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Products" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {state.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      {/* Report types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {REPORT_TYPES.map(rt => {
          const Icon = rt.icon;
          return (
            <Card key={rt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{rt.label}</p>
                    <p className="text-xs text-muted-foreground">{rt.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => generateReport(rt.id, 'pdf')} disabled={generating === `${rt.id}-pdf`}>
                    {generating === `${rt.id}-pdf` ? 'Generating...' : <><Download className="w-3 h-3 mr-1" /> PDF</>}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => generateReport(rt.id, 'csv')} disabled={generating === `${rt.id}-csv`}>
                    {generating === `${rt.id}-csv` ? 'Generating...' : <><FileSpreadsheet className="w-3 h-3 mr-1" /> CSV</>}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => generateReport(rt.id, 'html')} disabled={generating === `${rt.id}-html`}>
                    {generating === `${rt.id}-html` ? 'Generating...' : <><Globe className="w-3 h-3 mr-1" /> HTML</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Executive Summary */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">AI-Generated Executive Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h3 className="text-base font-semibold">Portfolio Overview — {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}</h3>
            <p className="text-sm text-muted-foreground">
              The product portfolio consists of {state.products.length} active products serving a combined {state.products.reduce((a, p) => a + p.metrics.mau, 0).toLocaleString()} monthly active users
              with ${(state.products.reduce((a, p) => a + p.metrics.revenue, 0) / 1000000).toFixed(1)}M in annual revenue. Average NPS is {Math.round(state.products.reduce((a, p) => a + p.metrics.nps, 0) / state.products.length)}
              with {state.products.reduce((a, p) => a + p.metrics.adoption, 0) / state.products.length | 0}% average feature adoption.
            </p>
            <h4 className="text-sm font-semibold mt-3">Key Highlights</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>{state.epics.filter(e => e.status === 'in_progress').length} epics in active development across {state.products.length} products</li>
              <li>{state.stories.filter(s => s.status === 'done').length} stories completed out of {state.stories.length} total</li>
              <li>{state.sprints.filter(s => s.status === 'active').length} active sprints with {state.sprints.filter(s => s.status === 'active').reduce((a, s) => a + s.committed, 0)} committed items</li>
              <li>{state.experiments.filter(e => e.status === 'running').length} experiments currently running</li>
              <li>{state.feedback.length} customer feedback items collected with {Math.round(state.feedback.filter(f => f.sentiment === 'positive').length / state.feedback.length * 100)}% positive sentiment</li>
            </ul>
            <h4 className="text-sm font-semibold mt-3">Risks & Recommendations</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>{state.stories.filter(s => s.status === 'blocked').length} stories are currently blocked — recommend escalation</li>
              <li>{state.epics.filter(e => e.dueDate < new Date().toISOString() && e.status !== 'done').length} epics are past due — consider re-scoping</li>
              <li>Customer sentiment trending positive — capitalize on momentum with feature releases</li>
              <li>Recommend dedicating 20% of next sprint to technical debt reduction</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recent reports */}
      <h3 className="text-sm font-semibold mt-6 mb-3">Recent Reports</h3>
      <div className="space-y-2">
        {state.reports.map(r => (
          <Card key={r.id}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileBarChart className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground">{r.author} · {new Date(r.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase">{r.format}</Badge>
                  <Button size="sm" variant="ghost" className="h-7"><Download className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
