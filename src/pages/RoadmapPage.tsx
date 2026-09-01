import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Map, Calendar, Flag, GitBranch, Sparkles, Plus } from 'lucide-react';
import { getState } from '../lib/store';
import type { RoadmapItem } from '../lib/types';

const LANE_COLORS = {
  now: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
  next: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
  later: 'bg-purple-500/10 border-purple-500/30 text-purple-500',
};

const TYPE_ICONS: Record<string, typeof Flag> = {
  milestone: Flag,
  feature: Sparkles,
  release: GitBranch,
  initiative: Map,
};

const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-muted text-muted-foreground',
  todo: 'bg-blue-500/10 text-blue-500',
  in_progress: 'bg-amber-500/10 text-amber-500',
  done: 'bg-green-500/10 text-green-500',
};

export function RoadmapPage() {
  const state = getState();
  const [productId, setProductId] = useState<string>('all');
  const [view, setView] = useState('timeline');

  const roadmaps = useMemo(() => {
    if (productId === 'all') return state.roadmaps;
    return state.roadmaps.filter(r => r.productId === productId);
  }, [state.roadmaps, productId]);

  const allItems = useMemo(() => {
    return roadmaps.flatMap(r => r.items.map(item => ({ ...item, roadmapTitle: r.title, productId: r.productId })));
  }, [roadmaps]);

  const nowItems = allItems.filter(i => i.lane === 'now');
  const nextItems = allItems.filter(i => i.lane === 'next');
  const laterItems = allItems.filter(i => i.lane === 'later');

  // Gantt chart data
  const ganttItems = useMemo(() => {
    const items = allItems.slice(0, 15);
    const minDate = new Date(Math.min(...items.map(i => new Date(i.startDate).getTime())));
    const maxDate = new Date(Math.max(...items.map(i => new Date(i.endDate).getTime())));
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / 86400000);
    return items.map(item => {
      const startOffset = Math.ceil((new Date(item.startDate).getTime() - minDate.getTime()) / 86400000);
      const duration = Math.ceil((new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / 86400000);
      const leftPct = (startOffset / totalDays) * 100;
      const widthPct = (duration / totalDays) * 100;
      return { ...item, leftPct, widthPct, duration };
    });
  }, [allItems]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Product Roadmap"
        description="Plan and visualize your product roadmap across quarters"
        actions={
          <div className="flex gap-2">
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Products" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {state.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
          </div>
        }
      />

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="now-next-later">Now / Next / Later</TabsTrigger>
          <TabsTrigger value="gantt">Gantt View</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline">
          <div className="space-y-4">
            {roadmaps.map(rm => (
              <Card key={rm.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{rm.title}</CardTitle>
                    <Badge variant="outline">{rm.quarter}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Timeline bar */}
                    <div className="relative h-2 bg-muted rounded-full mb-4">
                      <div className="absolute inset-0 flex justify-between px-2">
                        {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                          <div key={q} className="w-px h-full bg-border" />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-4 px-1">
                      <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {rm.items.map((item: RoadmapItem) => {
                        const Icon = TYPE_ICONS[item.type] || Sparkles;
                        const startMonth = new Date(item.startDate).getMonth();
                        const endMonth = new Date(item.endDate).getMonth();
                        const leftPct = (startMonth / 12) * 100;
                        const widthPct = Math.max(((endMonth - startMonth + 1) / 12) * 100, 8);
                        return (
                          <div key={item.id} className="flex items-center gap-2 group">
                            <div className="w-32 flex-shrink-0 text-xs truncate">{item.title}</div>
                            <div className="flex-1 relative h-7">
                              <div
                                className={`absolute h-7 rounded-md flex items-center px-2 gap-1.5 text-[10px] font-medium cursor-pointer hover:opacity-90 transition-opacity ${STATUS_COLORS[item.status]}`}
                                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                              >
                                <Icon className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{item.title}</span>
                                {item.dependencies.length > 0 && (
                                  <GitBranch className="w-2.5 h-2.5 flex-shrink-0 opacity-60" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Now / Next / Later */}
        <TabsContent value="now-next-later">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { title: 'Now', subtitle: 'In Progress', items: nowItems, color: LANE_COLORS.now },
              { title: 'Next', subtitle: '1-2 Months', items: nextItems, color: LANE_COLORS.next },
              { title: 'Later', subtitle: '3-6 Months', items: laterItems, color: LANE_COLORS.later },
            ].map(lane => (
              <Card key={lane.title}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium">{lane.title}</CardTitle>
                      <p className="text-[10px] text-muted-foreground">{lane.subtitle}</p>
                    </div>
                    <Badge className={lane.color}>{lane.items.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {lane.items.map(item => {
                    const Icon = TYPE_ICONS[item.type] || Sparkles;
                    return (
                      <div key={item.id} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-2 mb-2">
                          <Icon className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(item.startDate).toLocaleDateString('en', { month: 'short' })} - {new Date(item.endDate).toLocaleDateString('en', { month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className={`${STATUS_COLORS[item.status]} text-[9px]`}>{item.status.replace('_', ' ')}</Badge>
                          <span className="text-[10px] text-muted-foreground">{item.progress}%</span>
                        </div>
                      </div>
                    );
                  })}
                  {lane.items.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">No items in this lane</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Gantt View */}
        <TabsContent value="gantt">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Gantt Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {/* Month headers */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-32 flex-shrink-0" />
                  <div className="flex-1 flex justify-between text-[10px] text-muted-foreground px-1">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                  </div>
                </div>
                {ganttItems.map(item => {
                  const Icon = TYPE_ICONS[item.type] || Sparkles;
                  return (
                    <div key={item.id} className="flex items-center gap-2 group hover:bg-muted/30 rounded p-0.5">
                      <div className="w-32 flex-shrink-0 text-xs truncate">{item.title}</div>
                      <div className="flex-1 relative h-6">
                        <div
                          className={`absolute h-6 rounded flex items-center px-2 gap-1 text-[10px] font-medium cursor-pointer ${STATUS_COLORS[item.status]}`}
                          style={{ left: `${item.leftPct}%`, width: `${Math.max(item.widthPct, 3)}%` }}
                        >
                          <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                          {item.widthPct > 8 && <span className="truncate">{item.duration}d</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
