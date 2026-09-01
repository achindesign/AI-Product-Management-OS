import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { CalendarClock, Plus, Users, CheckCircle2, Circle, Sparkles, FileText, ListChecks } from 'lucide-react';
import { getState, setState } from '../lib/store';
import { generateAIResponse } from '../lib/ai';
import type { Meeting, ActionItem } from '../lib/types';

const TYPE_COLORS: Record<string, string> = {
  standup: 'bg-blue-500/10 text-blue-500',
  planning: 'bg-amber-500/10 text-amber-500',
  review: 'bg-purple-500/10 text-purple-500',
  discovery: 'bg-green-500/10 text-green-500',
  stakeholder: 'bg-cyan-500/10 text-cyan-500',
  retrospective: 'bg-pink-500/10 text-pink-500',
};

export function MeetingsPage() {
  const state = getState();
  const [meetings, setMeetings] = useState<Meeting[]>(state.meetings);
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  function analyzeMeeting() {
    setAnalyzing(true);
    setTimeout(() => {
      const response = generateAIResponse('Summarize the last meeting');
      setAiSummary(response.content);
      setAnalyzing(false);
    }, 800);
  }

  function toggleActionItem(meetingId: string, itemId: string) {
    setState(s => {
      const meeting = s.meetings.find(m => m.id === meetingId);
      if (meeting) {
        const item = meeting.actionItems.find(a => a.id === itemId);
        if (item) item.done = !item.done;
      }
    });
    setMeetings(getState().meetings);
    if (selected) setSelected(getState().meetings.find(m => m.id === selected.id) || null);
  }

  function createMeeting() {
    if (!newTitle.trim() || !newNotes.trim()) return;
    const meeting: Meeting = {
      id: `mtg-${Date.now()}`,
      title: newTitle,
      date: new Date().toISOString(),
      attendees: ['You'],
      notes: newNotes,
      summary: 'AI summary will be generated on analyze.',
      actionItems: [],
      decisions: [],
      type: 'review',
    };
    setState(s => { s.meetings.unshift(meeting); });
    setMeetings(getState().meetings);
    setNewNotes('');
    setNewTitle('');
    setDialogOpen(false);
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Meeting Assistant"
        description="Upload notes, get AI summaries, action items, and decision tracking"
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Meeting
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Meeting list */}
        <div className="space-y-2">
          {meetings.map(m => (
            <Card
              key={m.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${selected?.id === m.id ? 'border-primary' : ''}`}
              onClick={() => { setSelected(m); setAiSummary(''); }}
            >
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-medium truncate">{m.title}</p>
                  </div>
                  <Badge className={`${TYPE_COLORS[m.type]} text-[9px]`}>{m.type}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(m.date).toLocaleDateString()} · {m.attendees.length} attendees · {m.actionItems.length} actions
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Meeting detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{selected.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(selected.date).toLocaleDateString('en', { dateStyle: 'full' })} · {selected.attendees.join(', ')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={analyzeMeeting} disabled={analyzing}>
                      {analyzing ? 'Analyzing...' : <><Sparkles className="w-3.5 h-3.5 mr-1" /> AI Analyze</>}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Meeting Notes</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.notes}</p>
                  </div>

                  {aiSummary && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 animate-fade-in">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <p className="text-xs font-semibold">AI Summary</p>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">{aiSummary}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-sm font-medium">Action Items ({selected.actionItems.filter(a => !a.done).length} open)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selected.actionItems.map(item => (
                    <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <button onClick={() => toggleActionItem(selected.id, item.id)} className="mt-0.5">
                        {item.done ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-xs ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.text}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.assignee} · Due {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {selected.actionItems.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No action items</p>}
                </CardContent>
              </Card>

              {/* Decisions */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <CardTitle className="text-sm font-medium">Decisions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selected.decisions.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                        <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-[10px] font-bold text-purple-500 flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-xs">{d}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <CalendarClock className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Select a meeting to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Meeting Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Meeting Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="mtitle">Meeting Title</Label>
              <input id="mtitle" className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g., Sprint Planning" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mnotes">Notes</Label>
              <Textarea id="mnotes" value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Paste your meeting notes here..." rows={6} />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">AI will automatically extract action items, decisions, and a summary.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={createMeeting}>Save & Analyze</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
