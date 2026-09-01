import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../lib/types';
import { getState } from '../lib/store';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  avatarColor: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthed: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_PASSWORDS: Record<string, string> = {
  'admin@aipmos.com': 'admin123',
  'cpo@aipmos.com': 'cpo123',
  'pm@aipmos.com': 'pm123',
  'apm@aipmos.com': 'apm123',
  'analyst@aipmos.com': 'analyst123',
  'ux@aipmos.com': 'ux123',
  'em@aipmos.com': 'em123',
  'eng@aipmos.com': 'eng123',
  'qa@aipmos.com': 'qa123',
  'stakeholder@aipmos.com': 'stake123',
};

const ROLE_EMAILS: Record<UserRole, string> = {
  Administrator: 'admin@aipmos.com',
  ChiefProductOfficer: 'cpo@aipmos.com',
  ProductManager: 'pm@aipmos.com',
  AssociateProductManager: 'apm@aipmos.com',
  BusinessAnalyst: 'analyst@aipmos.com',
  UXDesigner: 'ux@aipmos.com',
  EngineeringManager: 'em@aipmos.com',
  SoftwareEngineer: 'eng@aipmos.com',
  QAEngineer: 'qa@aipmos.com',
  Stakeholder: 'stakeholder@aipmos.com',
};

function makeToken(userId: string, role: UserRole): string {
  const payload = { sub: userId, role, iat: Date.now(), exp: Date.now() + 7 * 86400000 };
  return btoa(JSON.stringify(payload));
}

function userToAuthUser(user: User, role?: UserRole): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: role || user.role,
    title: user.title,
    department: user.department,
    avatarColor: user.avatarColor,
    token: makeToken(user.id, role || user.role),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('aipmos_auth');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  function persist(u: AuthUser | null) {
    if (u) {
      sessionStorage.setItem('aipmos_auth', JSON.stringify(u));
    } else {
      sessionStorage.removeItem('aipmos_auth');
    }
    setUser(u);
  }

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(r => setTimeout(r, 400));
    const normalizedEmail = email.toLowerCase().trim();
    const expectedPassword = DEMO_PASSWORDS[normalizedEmail];
    if (!expectedPassword) {
      return { success: false, error: 'No account found with that email. Try a demo account.' };
    }
    if (password !== expectedPassword) {
      return { success: false, error: 'Incorrect password. Check the demo credentials.' };
    }
    const state = getState();
    const dbUser = state.users.find(u => u.email === normalizedEmail);
    if (!dbUser) {
      return { success: false, error: 'User not found in database.' };
    }
    persist(userToAuthUser(dbUser));
    return { success: true };
  }

  function loginDemo(role: UserRole) {
    const state = getState();
    const dbUser = state.users.find(u => u.role === role) || state.users[0];
    persist(userToAuthUser(dbUser, role));
  }

  function switchRole(role: UserRole) {
    if (!user) return;
    const state = getState();
    const dbUser = state.users.find(u => u.role === role) || state.users.find(u => u.id === user.id);
    if (dbUser) {
      persist(userToAuthUser(dbUser, role));
    }
  }

  function logout() {
    persist(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthed: !!user, login, loginDemo, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const DEMO_CREDENTIALS: { role: UserRole; email: string; password: string; label: string }[] = [
  { role: 'Administrator', email: 'admin@aipmos.com', password: 'admin123', label: 'Administrator' },
  { role: 'ChiefProductOfficer', email: 'cpo@aipmos.com', password: 'cpo123', label: 'Chief Product Officer' },
  { role: 'ProductManager', email: 'pm@aipmos.com', password: 'pm123', label: 'Product Manager' },
  { role: 'AssociateProductManager', email: 'apm@aipmos.com', password: 'apm123', label: 'Associate PM' },
  { role: 'BusinessAnalyst', email: 'analyst@aipmos.com', password: 'analyst123', label: 'Business Analyst' },
  { role: 'UXDesigner', email: 'ux@aipmos.com', password: 'ux123', label: 'UX Designer' },
  { role: 'EngineeringManager', email: 'em@aipmos.com', password: 'em123', label: 'Engineering Manager' },
  { role: 'SoftwareEngineer', email: 'eng@aipmos.com', password: 'eng123', label: 'Software Engineer' },
  { role: 'QAEngineer', email: 'qa@aipmos.com', password: 'qa123', label: 'QA Engineer' },
  { role: 'Stakeholder', email: 'stakeholder@aipmos.com', password: 'stake123', label: 'Stakeholder' },
];
