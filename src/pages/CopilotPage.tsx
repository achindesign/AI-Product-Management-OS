import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Bot, Send, Sparkles, Copy, Check, User } from 'lucide-react';
import { generateAIResponse, AI_SUGGESTIONS } from '../lib/ai';
import { useAuth } from '../lib/auth';
import { getState } from '../lib/store';
import type { ChatMessage } from '../lib/types';

export function CopilotPage() {
  const { user } = useAuth();
  const state = getState();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your AI Product Management Copilot. I can help you write PRDs, generate user stories, create epics, analyze competitors, identify risks, plan sprints, and much more.\n\nWhat would you like to work on today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function send(prompt?: string) {
    const text = prompt || input;
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const response = generateAIResponse(text, productId === 'all' ? undefined : productId);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        context: response.context,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setLoading(false);
    }, 600 + Math.random() * 400);
  }

  function copyMessage(id: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <div className="p-6 pb-3 max-w-[1200px] mx-auto w-full">
        <PageHeader
          title="AI Product Copilot"
          description="Your AI assistant for the entire product lifecycle"
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
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden px-6 pb-6 max-w-[1200px] mx-auto w-full">
        <Card className="h-full flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'assistant' ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`group relative max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.context && (
                      <div className="text-[10px] text-muted-foreground mb-1">
                        <Sparkles className="w-2.5 h-2.5 inline mr-1" />Context: {msg.context}
                      </div>
                    )}
                    <div className={`rounded-lg px-4 py-3 text-sm ${
                      msg.role === 'assistant'
                        ? 'bg-muted/50 border border-border'
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      <div className="whitespace-pre-wrap text-left">{msg.content}</div>
                    </div>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => copyMessage(msg.id, msg.content)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                      >
                        {copied === msg.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="rounded-lg px-4 py-3 bg-muted/50 border border-border">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Try these</p>
              <div className="flex flex-wrap gap-2">
                {AI_SUGGESTIONS.slice(0, 8).map(s => (
                  <Button
                    key={s.label}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => send(s.prompt)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask me to write a PRD, generate user stories, analyze competitors..."
                className="flex-1 px-4 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={loading}
              />
              <Button onClick={() => send()} disabled={loading || !input.trim()} size="icon" className="h-10 w-10">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
