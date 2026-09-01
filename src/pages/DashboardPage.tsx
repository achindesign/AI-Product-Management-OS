import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Activity, Target,
  AlertTriangle, CheckCircle2, Clock, Brain, ArrowRight,
} from 'lucide-react';
import { getState } from '../lib/store';
import { useAuth } from '../lib/auth';
import { generateAIResponse } from '../lib/ai';

const STATUS_COLORS: Record<string, string> = {
  green: '#10b981', yellow: '#f59e0b', red: '#ef4444',
};
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

export function DashboardPage() {
  const { user } = useAuth();
  const state = getState();
  const [productId, setProductId] = useState<string>('all');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  const products = state.products;
  const filtered = useMemo(() => {
    if (productId === 'all') return state;
    return {
      ...state,
      products: state.products.filter(p => p.id === productId),
      epics: state.epics.filter(e => e.productId === productId),
      stories: state.stories.filter(s => s.productId === productId),
      sprints: state.sprints.filter(s => s.productId === productId),
      feedback: state.feedback.filter(f => f.productId === productId),
      experiments: state.experiments.filter(e => e.productId === productId),
      okrs: state.okrs.filter(o => o.productId === productId),
      analytics: { [productId]: state.analytics[productId] || [] },
    };
  }, [state, productId]);

  // KPI calculations
  const totalMAU = filtered.products.reduce((a, p) => a + p.metrics.mau, 0);
  const totalRevenue = filtered.products.reduce((a, p) => a + p.metrics.revenue, 0);
  const avgNps = Math.round(filtered.products.reduce((a, p) => a + p.metrics.nps, 0) / Math.max(filtered.products.length, 1));
  const avgAdoption = Math.round(filtered.products.reduce((a, p) => a + p.metrics.adoption, 0) / Math.max(filtered.products.length, 1));
  const activeSprints = filtered.sprints.filter(s => s.status === 'active').length;
  const totalStories = filtered.stories.length;
  const doneStories = filtered.stories.filter(s => s.status === 'done').length;
  const completionRate = Math.round((doneStories / Math.max(totalStories, 1)) * 100);
  const inProgressEpics = filtered.epics.filter(e => e.status === 'in_progress').length;
  const blockedItems = filtered.stories.filter(s => s.status === 'blocked').length;
  const positiveFeedback = filtered.feedback.filter(f => f.sentiment === 'positive').length;
  const negativeFeedback = filtered.feedback.filter(f => f.sentiment === 'negative').length;
  const sentimentScore = Math.round((positiveFeedback / Math.max(filtered.feedback.length, 1)) * 100);

  // Sprint health
  const sprintHealth = filtered.sprints.map(s => ({
    name: s.name,
    completed: s.completed,
    committed: s.committed,
    remaining: s.committed - s.completed,
  })).slice(0, 6);

  // Feature adoption pie
  const featureAdoption = filtered.products.map(p => ({
    name: p.name.split(' ')[0],
    value: p.metrics.adoption,
  }));

  // Release status
  const releases = filtered.releases.slice(0, 6).map(r => ({
    name: r.version,
    date: new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    status: r.status,
  }));

  // OKR progress
  const okrProgress = filtered.okrs.map(o => ({
    name: o.objective.slice(0, 30) + '...',
    progress: Math.round(o.keyResults.reduce((a, kr) => a + (kr.current / kr.target) * 100, 0) / o.keyResults.length),
  })).slice(0, 5);

  // Analytics time series
  const analyticsData = useMemo(() => {
    const allPoints: { date: string; users: number; revenue: number }[] = [];
    Object.values(filtered.analytics).forEach(points => {
      points.forEach(p => {
        const existing = allPoints.find(a => a.date === p.date);
        if (existing) {
          existing.users += p.users;
          existing.revenue += p.revenue;
        } else {
          allPoints.push({ date: p.date, users: p.users, revenue: p.revenue });
        }
      });
    });
    return allPoints.sort((a, b) => a.date.localeCompare(b.date)).slice(-30).map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    }));
  }, [filtered.analytics]);

  // Recent decisions
  const recentDecisions = state.auditLogs
    .filter(l => l.action === 'approved' || l.action === 'updated' || l.action === 'moved')
    .slice(0, 5);

  // Upcoming risks
  const risks = filtered.epics
    .filter(e => e.dueDate < new Date().toISOString() && e.status !== 'done')
    .slice(0, 4)
    .map(e => ({ title: e.title, due: new Date(e.dueDate).toLocaleDateString(), progress: e.progress }));

  function generateInsight() {
    setGenerating(true);
    setTimeout(() => {
      const product = productId === 'all' ? products[0] : products.find(p => p.id === productId)!;
      const response = generateAIResponse('Identify risks for the current product and give me executive insights', productId === 'all' ? undefined : productId);
      setAiInsight(response.content);
      setGenerating(false);
    }, 800);
  }

  const kpis = [
    { label: 'Monthly Active Users', value: totalMAU.toLocaleString(), change: '+12.5%', up: true, icon: Users, color: 'text-blue-500' },
    { label: 'Total Revenue', value: `$${(totalRevenue / 1000000).toFixed(1)}M`, change: '+8.2%', up: true, icon: DollarSign, color: 'text-green-500' },
    { label: 'Avg NPS Score', value: String(avgNps), change: '+3 pts', up: true, icon: Target, color: 'text-amber-500' },
    { label: 'Feature Adoption', value: `${avgAdoption}%`, change: '+5.1%', up: true, icon: Activity, color: 'text-purple-500' },
    { label: 'Active Sprints', value: String(activeSprints), change: `${completionRate}% done`, up: true, icon: Clock, color: 'text-cyan-500' },
    { label: 'Sentiment Score', value: `${sentimentScore}%`, change: negativeFeedback > positiveFeedback ? 'Down' : 'Good', up: negativeFeedback <= positiveFeedback, icon: TrendingUp, color: 'text-pink-500' },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Executive Dashboard"
        description={`Welcome back, ${user?.name}. Here's your product portfolio overview.`}
        actions={
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Products" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                  <span className={`text-[10px] font-medium ${kpi.up ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.up ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                    {' '}{kpi.change}
                  </span>
                </div>
                <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">User Growth & Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#colorUsers)" strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Feature Adoption</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={featureAdoption} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {featureAdoption.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sprint Health</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sprintHealth} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={70} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="completed" stackId="a" fill="#10b981" />
                <Bar dataKey="remaining" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">OKR Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {okrProgress.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No OKRs found</p>}
            {okrProgress.map((okr, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="truncate pr-2">{okr.name}</span>
                  <span className="font-medium">{okr.progress}%</span>
                </div>
                <Progress value={okr.progress} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Release Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {releases.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No releases found</p>}
            {releases.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div>
                  <span className="text-sm font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{r.date}</span>
                </div>
                <Badge variant={r.status === 'released' ? 'default' : r.status === 'in_progress' ? 'secondary' : 'outline'}>
                  {r.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights + Risks + Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">AI Executive Insights</CardTitle>
              </div>
              <Button size="sm" variant="outline" onClick={generateInsight} disabled={generating}>
                {generating ? 'Analyzing...' : 'Generate Insights'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {aiInsight ? (
              <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto scrollbar-thin animate-fade-in">
                {aiInsight}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Click "Generate Insights" to get AI-powered analysis of your product portfolio.</p>
                <p className="text-xs mt-1">Includes risk assessment, performance trends, and recommendations.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <CardTitle className="text-sm font-medium">Upcoming Risks</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-1">
              {risks.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No active risks</p>}
              {risks.map((r, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground">Due {r.due} · {r.progress}% done</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <CardTitle className="text-sm font-medium">Recent Decisions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-1">
              {recentDecisions.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No recent decisions</p>}
              {recentDecisions.map((d, i) => (
                <div key={i} className="py-1.5 border-b border-border last:border-0">
                  <p className="text-xs font-medium truncate">{d.action} {d.entity}</p>
                  <p className="text-[10px] text-muted-foreground">{d.userName} · {new Date(d.timestamp).toLocaleDateString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Health */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Product Portfolio Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {filtered.products.map(p => (
              <div key={p.id} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[p.health] }} />
                </div>
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground mb-2">{p.team}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">MAU</span>
                    <span className="font-medium">{p.metrics.mau.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">NPS</span>
                    <span className="font-medium">{p.metrics.nps}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Adoption</span>
                    <span className="font-medium">{p.metrics.adoption}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
