import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FlaskConical, Plus, Play, Pause, CheckCircle2, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { getState } from '../lib/store';

const STATUS_ICONS: Record<string, typeof Play> = {
  draft: Plus,
  running: Play,
  completed: CheckCircle2,
  paused: Pause,
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  running: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  paused: 'bg-amber-500/10 text-amber-500',
};

export function ExperimentsPage() {
  const state = getState();
  const [productId, setProductId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const experiments = useMemo(() => {
    return state.experiments.filter(e =>
      (productId === 'all' || e.productId === productId) &&
      (statusFilter === 'all' || e.status === statusFilter)
    );
  }, [state.experiments, productId, statusFilter]);

  const completedExperiments = experiments.filter(e => e.results);
  const chartData = completedExperiments.map(e => ({
    name: e.name.slice(0, 12),
    variantA: e.results!.variantAConv,
    variantB: e.results!.variantBConv,
    winner: e.results!.winner,
  }));

  const stats = {
    total: experiments.length,
    running: experiments.filter(e => e.status === 'running').length,
    completed: completedExperiments.length,
    winners: completedExperiments.filter(e => e.results!.winner !== 'inconclusive').length,
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Experimentation"
        description="A/B testing with hypothesis tracking and AI recommendations"
        actions={
          <div className="flex gap-2">
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Products" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {state.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Experiment</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Experiments', value: stats.total, icon: FlaskConical, color: 'text-blue-500' },
          { label: 'Running', value: stats.running, icon: Play, color: 'text-amber-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Significant Winners', value: stats.winners, icon: TrendingUp, color: 'text-purple-500' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Results chart */}
      {chartData.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversion Rate Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="variantA" name="Variant A (Control)" fill="#6b7280" radius={[4, 4, 0, 0]} />
                <Bar dataKey="variantB" name="Variant B (Test)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="mb-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Experiment cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {experiments.map(exp => {
          const StatusIcon = STATUS_ICONS[exp.status] || Play;
          return (
            <Card key={exp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FlaskConical className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{exp.name}</p>
                      <p className="text-[10px] text-muted-foreground">{state.products.find(p => p.id === exp.productId)?.name}</p>
                    </div>
                  </div>
                  <Badge className={`${STATUS_COLORS[exp.status]} text-[10px]`}>
                    <StatusIcon className="w-2.5 h-2.5 mr-1" /> {exp.status}
                  </Badge>
                </div>

                <div className="space-y-2 mt-3">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Hypothesis</p>
                    <p className="text-xs text-muted-foreground">{exp.hypothesis}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Success Metric</p>
                    <p className="text-xs">{exp.successMetric}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-[9px] text-muted-foreground">Variant A</p>
                    <p className="text-xs font-medium truncate">{exp.variantA}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-[9px] text-muted-foreground">Variant B</p>
                    <p className="text-xs font-medium truncate">{exp.variantB}</p>
                  </div>
                </div>

                {exp.results && (
                  <div className="mt-3 p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Results</p>
                      <Badge className={`text-[9px] ${exp.results.winner === 'B' ? 'bg-green-500/10 text-green-500' : exp.results.winner === 'A' ? 'bg-muted text-muted-foreground' : 'bg-amber-500/10 text-amber-500'}`}>
                        {exp.results.winner === 'B' ? 'Variant B Won' : exp.results.winner === 'A' ? 'No Improvement' : 'Inconclusive'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-[9px] text-muted-foreground">Conv A</p>
                        <p className="text-xs font-bold">{exp.results.variantAConv}%</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground">Conv B</p>
                        <p className="text-xs font-bold">{exp.results.variantBConv}%</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground">Lift</p>
                        <p className={`text-xs font-bold ${exp.results.lift > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {exp.results.lift > 0 ? '+' : ''}{exp.results.lift}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground">Sig.</p>
                        <p className="text-xs font-bold">{exp.results.significance}%</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                  <span>Traffic: {exp.traffic}%</span>
                  <span>{new Date(exp.startDate).toLocaleDateString()} - {new Date(exp.endDate).toLocaleDateString()}</span>
                </div>

                {exp.status === 'completed' && exp.results && (
                  <div className="flex items-start gap-2 mt-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground">
                      {exp.results.winner === 'B'
                        ? `AI recommends shipping Variant B. Expected ${exp.results.lift}% improvement in ${exp.successMetric}.`
                        : 'AI recommends iterating on the hypothesis or testing a new variant.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
