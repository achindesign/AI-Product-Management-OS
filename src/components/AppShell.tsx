import { useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { NAV_ITEMS, NAV_GROUPS } from '../lib/nav';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuGroup,
} from '../components/ui/dropdown-menu';
import {
  Bot, ChevronLeft, ChevronRight, Sun, Moon, LogOut, Search, Bell,
  Command as CommandIcon, UserCircle, Settings,
} from 'lucide-react';
import type { UserRole } from '../lib/types';
import { getState } from '../lib/store';

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

interface ShellProps {
  activeView: string;
  onNavigate: (view: string) => void;
  children: ReactNode;
}

export function AppShell({ activeView, onNavigate, children }: ShellProps) {
  const { user, logout, switchRole } = useAuth();
  const { theme, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const state = getState();
  const unreadCount = state.notifications.filter(n => !n.read).length;
  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-border transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm">AI PM OS</span>
              <span className="text-[10px] text-muted-foreground">Enterprise Edition</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
          {NAV_GROUPS.map(group => (
            <div key={group} className="mb-4">
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                  {group}
                </p>
              )}
              {NAV_ITEMS.filter(item => item.group === group).map(item => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${
                      active
                        ? 'bg-sidebar-accent/15 text-sidebar-accent font-medium'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.id === 'notifications' && unreadCount > 0 && (
                      <Badge className="ml-auto h-5 px-1.5 text-[10px]">{unreadCount}</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse</>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold capitalize">
              {NAV_ITEMS.find(n => n.id === activeView)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Search shortcut */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('search')}
              className="text-muted-foreground gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline text-sm">Search</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-muted rounded border border-border">
                <CommandIcon className="w-2.5 h-2.5" />K
              </kbd>
            </Button>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" onClick={() => onNavigate('notifications')} className="h-8 w-8 relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition-colors">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback style={{ backgroundColor: user?.avatarColor }} className="text-white text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start leading-none">
                    <span className="text-xs font-medium">{user?.name}</span>
                    <span className="text-[10px] text-muted-foreground">{user ? ROLE_LABELS[user.role] : ''}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Switch Role</DropdownMenuLabel>
                  {ALL_ROLES.map(role => (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => switchRole(role)}
                      className={user?.role === role ? 'bg-accent' : ''}
                    >
                      <UserCircle className="w-3.5 h-3.5 mr-2" />
                      {ROLE_LABELS[role]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('settings')}>
                  <Settings className="w-3.5 h-3.5 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-hidden">
          <div key={activeView} className="h-full overflow-y-auto scrollbar-thin animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
