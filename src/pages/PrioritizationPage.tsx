import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { BarChart3, Sparkles, TrendingUp, Star, Target } from 'lucide-react';
import { getState } from '../lib/store';
import type { Epic } from '../lib/types';

const MOSCOW_COLORS: Record<string, string> = {
  Must: '#ef4444',
  Should: '#f59e0b',
  Could: '#3b82f6',
  Wont: '#6b7280',
};

const KANO_COLORS: Record<string, string> = {
  Delighters: '#10b981',
  Performance: '#3b82f6',
  Basic: '#f59e0b',
  Indifferent: '#6b7280',
};

export function PrioritizationPage() {
  const state = getState();
  const [productId, setProductId] = useState<string>('all');
  const [method, setMethod] = useState('rice');

  const epics = useMemo(() => {
    const filtered = productId === 'all' ? state.epics : state.epics.filter(e => e.productId === productId);
    return filtered.map((e, i) => {
      const reach = Math.floor(Math.random() * 5) + 3;
      const impact = Math.floor(Math.random() * 3) + 2;
      const confidence = Math.floor(Math.random() * 3) + 6;
      const effort = Math.floor(Math.random() * 3) + 3;
      const rice = Math.round((reach * impact * confidence) / effort);
      const moscow = ['Must', 'Should', 'Could', 'Wont'][i % 4];
      const kano = ['Delighters', 'Performance', 'Basic', 'Indifferent'][i % 4];
      const value = Math.floor(Math.random() * 5) + 5;
      const eff = Math.floor(Math.random() * 5) + 3;
      return { ...e, reach, impact, confidence, effort, rice, moscow, kano, value, effScore: eff };
    });
  }, [state.epics, productId]);

  const sortedRice = [...epics].sort((a, b) => b.rice - a.rice);
  const riceData = sortedRice.slice(0, 10).map(e => ({ name: e.title.slice(0, 15), score: e.rice, priority: e.priority }));

  const matrixData = epics.map(e => ({
    x: e.effScore,
    y: e.value,
    name: e.title,
    z: e.rice,
    priority: e.priority,
  }));

  const moscowData = ['Must', 'Should', 'Could', 'Wont'].map(cat => ({
    name: cat,
    count: epics.filter(e => e.moscow === cat).length,
    fill: MOSCOW_COLORS[cat],
  }));

  const kanoData = ['Delighters', 'Performance', 'Basic', 'Indifferent'].map(cat => ({
    name: cat,
    count: epics.filter(e => e.kano === cat).length,
    fill: KANO_COLORS[cat],
  }));

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Prioritization"
        description="Prioritize features using RICE, MoSCoW, Kano, and Value vs Effort"
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

      <Tabs value={method} onValueChange={setMethod}>
        <TabsList>
          <TabsTrigger value="rice">RICE</TabsTrigger>
          <TabsTrigger value="moscow">MoSCoW</TabsTrigger>
          <TabsTrigger value="kano">Kano</TabsTrigger>
          <TabsTrigger value="matrix">Value vs Effort</TabsTrigger>
        </TabsList>

        {/* RICE */}
        <TabsContent value="rice">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> RICE Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={riceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={100} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">RICE Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin">
                  {sortedRice.slice(0, 10).map((e, i) => (
                    <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{e.title}</p>
                        <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                          <span>R: {e.reach}</span>
                          <span>I: {e.impact}</span>
                          <span>C: {e.confidence}</span>
                          <span>E: {e.effort}</span>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary text-xs">{e.rice}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MoSCoW */}
        <TabsContent value="moscow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">MoSCoW Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moscowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {moscowData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {['Must', 'Should', 'Could', 'Wont'].map(cat => (
                <Card key={cat}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MOSCOW_COLORS[cat] }} />
                        {cat} Have
                      </CardTitle>
                      <Badge variant="outline">{epics.filter(e => e.moscow === cat).length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {epics.filter(e => e.moscow === cat).slice(0, 4).map(e => (
                        <div key={e.id} className="flex items-center gap-2 py-1 text-xs">
                          <span className="truncate flex-1">{e.title}</span>
                          <Badge variant="outline" className="text-[9px]">{e.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Kano */}
        <TabsContent value="kano">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Kano Model Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={kanoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {kanoData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {[
                { name: 'Delighters', desc: 'Features that exceed expectations and create excitement', icon: Star },
                { name: 'Performance', desc: 'Features where more is better — directly drives satisfaction', icon: TrendingUp },
                { name: 'Basic', desc: 'Must-have features — their absence causes dissatisfaction', icon: Target },
                { name: 'Indifferent', desc: 'Features that don\'t significantly impact satisfaction', icon: BarChart3 },
              ].map(cat => {
                const Icon = cat.icon;
                return (
                  <Card key={cat.name}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: KANO_COLORS[cat.name] + '20' }}>
                          <Icon className="w-4 h-4" style={{ color: KANO_COLORS[cat.name] }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{cat.name}</p>
                            <Badge variant="outline" className="text-[10px]">{epics.filter(e => e.kano === cat.name).length}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Value vs Effort Matrix */}
        <TabsContent value="matrix">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Value vs Effort Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={450}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" dataKey="x" name="Effort" domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'Effort →', position: 'bottom', fontSize: 12 }} />
                  <YAxis type="number" dataKey="y" name="Value" domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'Value →', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                  <ZAxis type="number" dataKey="z" range={[60, 200]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const d = payload[0].payload as any;
                        return (
                          <div className="p-2 rounded-lg bg-card border border-border text-xs">
                            <p className="font-medium">{d.name}</p>
                            <p className="text-muted-foreground">Value: {d.y} · Effort: {d.x} · RICE: {d.z}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={matrixData} fill="#3b82f6">
                    {matrixData.map((d, i) => {
                      const color = d.y > 6 && d.x < 5 ? '#10b981' : d.y > 6 && d.x > 5 ? '#f59e0b' : d.y < 5 && d.x < 5 ? '#3b82f6' : '#ef4444';
                      return <Cell key={i} fill={color} fillOpacity={0.7} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-3 text-xs">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Quick Wins</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Major Projects</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Fill-ins</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Time Sinks</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Recommendation */}
      <Card className="mt-4 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">AI Prioritization Recommendation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Based on the {method.toUpperCase()} analysis, here are the AI-recommended priorities:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <p className="text-xs font-semibold text-green-500 mb-1">Ship Now</p>
              {sortedRice.slice(0, 2).map(e => <p key={e.id} className="text-xs text-muted-foreground truncate">• {e.title}</p>)}
            </div>
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs font-semibold text-amber-500 mb-1">Plan Next</p>
              {sortedRice.slice(2, 4).map(e => <p key={e.id} className="text-xs text-muted-foreground truncate">• {e.title}</p>)}
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs font-semibold text-blue-500 mb-1">Consider Later</p>
              {sortedRice.slice(4, 6).map(e => <p key={e.id} className="text-xs text-muted-foreground truncate">• {e.title}</p>)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
