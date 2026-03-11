import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function saveToken(token: string) {
  localStorage.setItem('auth_token', token);
}

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function removeToken() {
  localStorage.removeItem('auth_token');
}

// Clear cart from localStorage on logout
function clearCartOnLogout() {
  try {
    localStorage.removeItem('cart');
  } catch (error) {
    console.error('Error clearing cart on logout:', error);
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: validate any existing token
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => removeToken())
      .finally(() => setLoading(false));
  }, []);

  // ── Sign Up ────────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) return { error: new Error(data.error || 'Sign up failed') };

      saveToken(data.token);
      setUser(data.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // ── Sign In ────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) return { error: new Error(data.error || 'Sign in failed') };

      saveToken(data.token);
      setUser(data.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // ── Sign Out ───────────────────────────────────────────────────────────────
  const signOut = async (): Promise<void> => {
    removeToken();
    clearCartOnLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
