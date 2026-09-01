import { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Bot, ArrowRight, Shield, Zap, Brain } from 'lucide-react';
import type { UserRole } from '../lib/types';

export function LoginPage() {
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  }

  function handleDemo(role: UserRole) {
    setLoading(true);
    loginDemo(role);
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px, 60px 60px',
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">AI PM OS</span>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              The AI-Native<br />Product Management<br />Operating System
            </h1>
            <p className="text-lg text-blue-100 max-w-md">
              Manage the complete product lifecycle with AI — from idea generation to roadmap planning,
              requirements, prioritization, analytics, and executive reporting.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md pt-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"><Brain className="w-5 h-5" /></div>
                <p className="text-sm font-medium">AI Copilot</p>
                <p className="text-xs text-blue-200">PRDs, stories, epics</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"><Zap className="w-5 h-5" /></div>
                <p className="text-sm font-medium">16 Modules</p>
                <p className="text-xs text-blue-200">Full lifecycle</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"><Shield className="w-5 h-5" /></div>
                <p className="text-sm font-medium">RBAC</p>
                <p className="text-xs text-blue-200">10 roles</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-blue-200">Enterprise-grade product management, powered by AI.</p>
        </div>
      </div>

      {/* Right panel — login */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AI PM OS</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your product workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@aipmos.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">One-click demo mode</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_CREDENTIALS.map(cred => (
              <Button
                key={cred.role}
                variant="outline"
                size="sm"
                onClick={() => handleDemo(cred.role)}
                disabled={loading}
                className="justify-start text-xs"
              >
                {cred.label}
              </Button>
            ))}
          </div>

          <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-4 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Demo credentials:</p>
              <p>PM: pm@aipmos.com / pm123</p>
              <p>CPO: cpo@aipmos.com / cpo123</p>
              <p>Analyst: analyst@aipmos.com / analyst123</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
