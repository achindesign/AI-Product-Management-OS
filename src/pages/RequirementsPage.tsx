import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { FileText, Sparkles, Copy, Check, Download, Loader2 } from 'lucide-react';
import { generateAIResponse } from '../lib/ai';
import { getState } from '../lib/store';

const SECTIONS = [
  { id: 'business', label: 'Business Requirements', icon: 'briefcase' },
  { id: 'functional', label: 'Functional Requirements', icon: 'list' },
  { id: 'nonfunctional', label: 'Non-Functional Requirements', icon: 'shield' },
  { id: 'api', label: 'API Requirements', icon: 'code' },
  { id: 'ui', label: 'UI Requirements', icon: 'layout' },
  { id: 'security', label: 'Security Requirements', icon: 'lock' },
  { id: 'acceptance', label: 'Acceptance Criteria', icon: 'check' },
  { id: 'test', label: 'Test Scenarios', icon: 'flask' },
  { id: 'edge', label: 'Edge Cases', icon: 'alert' },
  { id: 'validation', label: 'Validation Rules', icon: 'validate' },
];

export function RequirementsPage() {
  const state = getState();
  const [featureName, setFeatureName] = useState('');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState(state.products[0]?.id || '');
  const [selectedSections, setSelectedSections] = useState<string[]>(SECTIONS.map(s => s.id));
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function toggleSection(id: string) {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  function generate() {
    setLoading(true);
    setOutput('');
    setTimeout(() => {
      const prompt = `Generate a full requirements specification${featureName ? ` for ${featureName}` : ''}${description ? `. Context: ${description}` : ''}`;
      const response = generateAIResponse(prompt, productId);
      setOutput(response.content);
      setLoading(false);
    }, 800);
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requirements-${featureName || 'feature'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="AI Requirements Generator"
        description="Generate comprehensive requirements specifications with AI"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {state.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feature">Feature Name</Label>
              <Input id="feature" value={featureName} onChange={e => setFeatureName(e.target.value)} placeholder="e.g., Real-time Dashboard" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the feature..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Requirement Sections</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {SECTIONS.map(section => {
                  const selected = selectedSections.includes(section.id);
                  return (
                    <button
                      key={section.id}
                      onClick={() => toggleSection(section.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors border ${
                        selected
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded border ${selected ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                        {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Requirements</>}
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" /> Generated Specification
              </CardTitle>
              {output && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyOutput}>
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadOutput}>
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Generating requirements specification...</p>
                <p className="text-xs text-muted-foreground mt-1">Analyzing context and producing detailed requirements</p>
              </div>
            ) : output ? (
              <ScrollArea className="h-[600px]">
                <div className="text-sm whitespace-pre-wrap font-mono leading-relaxed pr-4">{output}</div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Configure your requirements and click "Generate"</p>
                <p className="text-xs text-muted-foreground mt-1">AI will produce a comprehensive specification</p>
                <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-md">
                  {SECTIONS.slice(0, 5).map(s => (
                    <Badge key={s.id} variant="outline" className="text-[10px]">{s.label}</Badge>
                  ))}
                  <Badge variant="outline" className="text-[10px]">+5 more</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
