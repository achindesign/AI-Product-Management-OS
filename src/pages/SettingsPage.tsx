import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Settings as SettingsIcon, User, Shield, Database, Bell, Palette, RefreshCw, Users } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { getState } from '../lib/store';
import { resetState } from '../lib/store';
import type { UserRole } from '../lib/types';

const ROLE_LABELS: Record<UserRole, string> = {
  Administrator: 'Administrator',
  ChiefProductOfficer: 'Chief Product Officer',
  ProductManager: 'Product Manager',
  AssociateProductManager: 'Associate PM',
  BusinessAnalyst: 'Business Analyst',
  UXDesigner: 'UX Designer',
  EngineeringManager: 'Engineering Manager',
  SoftwareEngineer: 'Software Engineer',
  QAEngineer: 'QA Engineer',
  Stakeholder: 'Stakeholder',
};

const ALL_ROLES: UserRole[] = [
  'Administrator', 'ChiefProductOfficer', 'ProductManager', 'AssociateProductManager',
  'BusinessAnalyst', 'UXDesigner', 'EngineeringManager', 'SoftwareEngineer', 'QAEngineer', 'Stakeholder',
];

export function SettingsPage() {
  const { user, switchRole, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const state = getState();
  const [resetting, setResetting] = useState(false);

  function handleReset() {
    setResetting(true);
    setTimeout(() => {
      resetState();
      window.location.reload();
    }, 500);
  }

  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <PageHeader title="Settings" description="Manage your account, preferences, and system configuration" />

      <div className="space-y-4">
        {/* Profile */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback style={{ backgroundColor: user?.avatarColor }} className="text-white text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{user?.title}</Badge>
                  <Badge variant="secondary">{user?.department}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Access Control */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Role-Based Access Control (RBAC)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Current role: <span className="font-medium text-foreground">{user ? ROLE_LABELS[user.role] : ''}</span></p>
              <p className="text-xs text-muted-foreground mb-3">Switch role to experience different access levels and perspectives:</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {ALL_ROLES.map(role => (
                  <Button
                    key={role}
                    variant={user?.role === role ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs justify-start"
                    onClick={() => switchRole(role)}
                  >
                    {ROLE_LABELS[role]}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
              </div>
              <Button variant="outline" size="sm" onClick={toggle}>
                {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Team Members ({state.users.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto scrollbar-thin">
              {state.users.slice(0, 20).map(u => (
                <div key={u.id} className="flex items-center gap-2 p-2 rounded-lg border border-border">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback style={{ backgroundColor: u.avatarColor }} className="text-white text-xs">
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground">{ROLE_LABELS[u.role]}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Data Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-lg font-bold">{state.products.length}</p>
                <p className="text-[10px] text-muted-foreground">Products</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-lg font-bold">{state.epics.length}</p>
                <p className="text-[10px] text-muted-foreground">Epics</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-lg font-bold">{state.stories.length}</p>
                <p className="text-[10px] text-muted-foreground">Stories</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-lg font-bold">{state.feedback.length}</p>
                <p className="text-[10px] text-muted-foreground">Feedback</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-medium">Reset Demo Data</p>
                <p className="text-xs text-muted-foreground">Regenerate all seed data from scratch</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset} disabled={resetting}>
                {resetting ? <><RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Resetting...</> : <><RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Data</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign out */}
        <Card>
          <CardContent className="pt-4">
            <Button variant="destructive" onClick={logout} className="w-full">
              Sign out of AI PM OS
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
