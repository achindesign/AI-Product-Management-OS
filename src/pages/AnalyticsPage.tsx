import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Users, Activity, DollarSign, Repeat, Target, Zap } from 'lucide-react';
import { getState } from '../lib/store';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

export function AnalyticsPage() {
  const state = getState();
  const [productId, setProductId] = useState<string>(state.products[0]?.id || '');
  const [metric, setMetric] = useState('users');

  const product = state.products.find(p => p.id === productId) || state.products[0];
  const analytics = state.analytics[productId] || [];

  const chartData = useMemo(() => {
    return analytics.map(a => ({
      date: new Date(a.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      users: a.users,
      revenue: a.revenue,
      retention: a.retention,
      engagement: a.engagement,
      conversion: a.conversion,
    }));
  }, [analytics]);

  // Funnel data
  const funnelData = [
    { stage: 'Visitors', value: 10000, pct: 100 },
    { stage: 'Signups', value: 3500, pct: 35 },
    { stage: 'Activated', value: 2100, pct: 21 },
    { stage: 'Engaged', value: 1450, pct: 14.5 },
    { stage: 'Paid', value: 580, pct: 5.8 },
  ];

  // Cohort data
  const cohortData = [
    { cohort: 'Week 1', size: 1200, w1: 100, w2: 72, w3: 58, w4: 45, w5: 38, w6: 32 },
    { cohort: 'Week 2', size: 980, w1: 100, w2: 68, w3: 55, w4: 42, w5: 35, w6: 28 },
    { cohort: 'Week 3', size: 1100, w1: 100, w2: 75, w3: 62, w4: 48, w5: 40, w6: 33 },
    { cohort: 'Week 4', size: 850, w1: 100, w2: 70, w3: 58, w4: 45, w5: 38, w6: 31 },
  ];

  // Revenue by product
  const revenueData = state.products.map(p => ({
    name: p.name.split(' ')[0],
    revenue: p.metrics.revenue / 1000000,
  }));

  const kpis = product ? [
    { label: 'Monthly Active Users', value: product.metrics.mau.toLocaleString(), change: '+12.5%', icon: Users, color: 'text-blue-500' },
    { label: 'Revenue', value: `$${(product.metrics.revenue / 1000).toFixed(0)}K`, change: '+8.2%', icon: DollarSign, color: 'text-green-500' },
    { label: 'Retention', value: `${product.metrics.retention}%`, change: '+3.1%', icon: Repeat, color: 'text-purple-500' },
    { label: 'NPS', value: String(product.metrics.nps), change: '+5 pts', icon: Target, color: 'text-amber-500' },
    { label: 'Engagement', value: `${chartData[chartData.length - 1]?.engagement || 0}%`, change: '+2.4%', icon: Activity, color: 'text-cyan-500' },
    { label: 'Conversion', value: `${chartData[chartData.length - 1]?.conversion || 0}%`, change: '+1.8%', icon: Zap, color: 'text-pink-500' },
  ] : [];

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Product Analytics"
        description="Feature adoption, user growth, retention, funnels, and revenue impact"
        actions={
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Product" /></SelectTrigger>
            <SelectContent>
              {state.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-green-500">{kpi.change}</span>
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="growth">
        <TabsList>
          <TabsTrigger value="growth">Growth & Revenue</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="funnel">Funnels</TabsTrigger>
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Impact</TabsTrigger>
        </TabsList>

        {/* Growth */}
        <TabsContent value="growth">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorUsers2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#colorUsers2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Retention */}
        <TabsContent value="retention">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Retention Rate Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="retention" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="engagement" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="engagement" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funnels */}
        <TabsContent value="funnel">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {funnelData.map((stage, i) => (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                        <span className="text-sm font-medium">{stage.stage}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{stage.value.toLocaleString()}</span>
                        <span className="text-sm font-bold" style={{ color: CHART_COLORS[i] }}>{stage.pct}%</span>
                      </div>
                    </div>
                    <div className="h-8 rounded-lg bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-lg flex items-center px-3 text-xs text-white font-medium transition-all"
                        style={{ width: `${stage.pct}%`, backgroundColor: CHART_COLORS[i] }}
                      >
                        {stage.pct}%
                      </div>
                    </div>
                    {i < funnelData.length - 1 && (
                      <p className="text-[10px] text-muted-foreground mt-1 ml-8">
                        Drop-off: {funnelData[i].pct - funnelData[i + 1].pct}% → {funnelData[i + 1].pct}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  <strong>Overall Conversion Rate:</strong> 5.8% (Visitor to Paid). Biggest drop-off is between Activated and Engaged (30% loss). AI recommends optimizing the activation flow.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cohort */}
        <TabsContent value="cohort">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Cohort Retention Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left p-2 font-medium">Cohort</th>
                    <th className="text-left p-2 font-medium">Size</th>
                    <th className="text-center p-2 font-medium">Week 1</th>
                    <th className="text-center p-2 font-medium">Week 2</th>
                    <th className="text-center p-2 font-medium">Week 3</th>
                    <th className="text-center p-2 font-medium">Week 4</th>
                    <th className="text-center p-2 font-medium">Week 5</th>
                    <th className="text-center p-2 font-medium">Week 6</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map(c => (
                    <tr key={c.cohort} className="border-b border-border">
                      <td className="p-2 font-medium text-xs">{c.cohort}</td>
                      <td className="p-2 text-xs text-muted-foreground">{c.size}</td>
                      {[c.w1, c.w2, c.w3, c.w4, c.w5, c.w6].map((val, i) => {
                        const opacity = val / 100;
                        return (
                          <td key={i} className="p-2 text-center">
                            <div
                              className="w-full h-8 rounded flex items-center justify-center text-xs font-medium"
                              style={{
                                backgroundColor: `hsl(217 91% 60% / ${opacity * 0.7})`,
                                color: opacity > 0.5 ? 'white' : 'hsl(var(--foreground))',
                              }}
                            >
                              {val}%
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-3">
                Week-over-week retention averages 68% in Week 2, declining to ~31% by Week 6. Recommend improving onboarding to boost early retention.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Revenue by Product</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={revenueData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {revenueData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
