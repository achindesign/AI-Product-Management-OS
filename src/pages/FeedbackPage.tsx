import { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MessageSquareQuote, Search, Smile, Frown, Meh, TrendingUp, Sparkles, Tag } from 'lucide-react';
import { getState } from '../lib/store';

const SENTIMENT_COLORS = { positive: '#10b981', neutral: '#f59e0b', negative: '#ef4444' };
const SENTIMENT_ICONS = { positive: Smile, neutral: Meh, negative: Frown };

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug Report',
  feature_request: 'Feature Request',
  compliment: 'Compliment',
  complaint: 'Complaint',
  question: 'Question',
};

export function FeedbackPage() {
  const state = getState();
  const [productId, setProductId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const feedback = useMemo(() => {
    return state.feedback.filter(f =>
      (productId === 'all' || f.productId === productId) &&
      (search === '' || f.text.toLowerCase().includes(search.toLowerCase()) || f.customer.toLowerCase().includes(search.toLowerCase())) &&
      (sentimentFilter === 'all' || f.sentiment === sentimentFilter) &&
      (typeFilter === 'all' || f.type === typeFilter)
    );
  }, [state.feedback, productId, search, sentimentFilter, typeFilter]);

  const sentimentData = useMemo(() => {
    const positive = feedback.filter(f => f.sentiment === 'positive').length;
    const neutral = feedback.filter(f => f.sentiment === 'neutral').length;
    const negative = feedback.filter(f => f.sentiment === 'negative').length;
    return [
      { name: 'Positive', value: positive, fill: SENTIMENT_COLORS.positive },
      { name: 'Neutral', value: neutral, fill: SENTIMENT_COLORS.neutral },
      { name: 'Negative', value: negative, fill: SENTIMENT_COLORS.negative },
    ];
  }, [feedback]);

  const themeData = useMemo(() => {
    const themes: Record<string, number> = {};
    feedback.forEach(f => f.themes.forEach(t => { themes[t] = (themes[t] || 0) + 1; }));
    return Object.entries(themes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [feedback]);

  const typeData = useMemo(() => {
    const types: Record<string, number> = {};
    feedback.forEach(f => { types[f.type] = (types[f.type] || 0) + 1; });
    return Object.entries(types).map(([name, count]) => ({ name: TYPE_LABELS[name] || name, count }));
  }, [feedback]);

  const positivePct = feedback.length > 0 ? Math.round((sentimentData[0].value / feedback.length) * 100) : 0;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Customer Feedback"
        description="AI-powered sentiment analysis, theme clustering, and trend detection"
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquareQuote className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">Total Feedback</p>
            </div>
            <p className="text-2xl font-bold">{feedback.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Smile className="w-4 h-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Positive</p>
            </div>
            <p className="text-2xl font-bold text-green-500">{positivePct}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Frown className="w-4 h-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Negative</p>
            </div>
            <p className="text-2xl font-bold text-red-500">{sentimentData[2].value}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Themes</p>
            </div>
            <p className="text-2xl font-bold">{themeData.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                  {sentimentData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Top Themes (AI Clustered)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={themeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={70} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Feedback Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" angle={-15} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight */}
      <Card className="mb-4 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">AI Pain Point Extraction</p>
              <p className="text-xs text-muted-foreground">
                {negativePct(feedback) > 30
                  ? `High negative sentiment detected (${negativePct(feedback)}%). Top pain points: ${themeData.slice(0, 3).map(t => t.name).join(', ')}. Recommend urgent review of ${typeData.find(t => t.name === 'Bug Report')?.count || 0} bug reports.`
                  : `Overall sentiment is ${positivePct > 60 ? 'positive' : 'mixed'}. Key themes: ${themeData.slice(0, 3).map(t => t.name).join(', ')}. Most requested: ${typeData.find(t => t.name === 'Feature Request')?.count || 0} feature requests.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search feedback..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Sentiment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiment</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature_request">Feature Request</SelectItem>
            <SelectItem value="compliment">Compliment</SelectItem>
            <SelectItem value="complaint">Complaint</SelectItem>
            <SelectItem value="question">Question</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback list */}
      <div className="space-y-2">
        {feedback.slice(0, 30).map(f => {
          const SentimentIcon = SENTIMENT_ICONS[f.sentiment];
          return (
            <Card key={f.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`} style={{ backgroundColor: SENTIMENT_COLORS[f.sentiment] + '20' }}>
                    <SentimentIcon className="w-4 h-4" style={{ color: SENTIMENT_COLORS[f.sentiment] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{f.customer}</span>
                      <span className="text-[10px] text-muted-foreground">{f.company}</span>
                      <Badge variant="outline" className="text-[9px]">{f.segment}</Badge>
                      <Badge variant="outline" className="text-[9px]">{TYPE_LABELS[f.type]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{f.text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {f.themes.map(t => (
                        <span key={t} className="text-[9px] bg-muted px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-auto">{new Date(f.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">Score</span>
                      <span className="text-xs font-bold" style={{ color: SENTIMENT_COLORS[f.sentiment] }}>{f.sentimentScore > 0 ? '+' : ''}{f.sentimentScore}</span>
                    </div>
                    <Badge className="text-[9px]" style={{ backgroundColor: SENTIMENT_COLORS[f.sentiment] + '20', color: SENTIMENT_COLORS[f.sentiment] }}>
                      {f.sentiment}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function negativePct(feedback: any[]) {
  if (feedback.length === 0) return 0;
  return Math.round((feedback.filter(f => f.sentiment === 'negative').length / feedback.length) * 100);
}
