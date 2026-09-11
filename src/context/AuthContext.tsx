import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAgent: boolean;
  isClient: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'activate' | 'forgot' | 'reset';
  authModalRole: UserRole;
  authModalTokenParam: string;
  openAuthModal: (options?: {
    tab?: 'login' | 'register' | 'activate' | 'forgot' | 'reset';
    role?: UserRole;
    token?: string;
  }) => void;
  closeAuthModal: () => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  activate: (token: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; demoResetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'blueprint_auth_token';
const USER_STORAGE_KEY = 'blueprint_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth modal control
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'activate' | 'forgot' | 'reset'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('CLIENT');
  const [authModalTokenParam, setAuthModalTokenParam] = useState<string>('');

  // Validate session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
          } catch {}
        } else {
          // Token expired or invalid
          setToken(null);
          setUser(null);
          try {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
          } catch {}
        }
      } catch (err) {
        console.warn('Session verification fallback to cached profile', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [token]);

  // Check URL parameters for activation or password reset links (e.g., ?action=activate&token=xxx)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const paramToken = params.get('token');

      if (action === 'activate' && paramToken) {
        openAuthModal({ tab: 'activate', token: paramToken });
      } else if (action === 'reset' && paramToken) {
        openAuthModal({ tab: 'reset', token: paramToken });
      }
    } catch {}
  }, []);

  const openAuthModal = (options?: {
    tab?: 'login' | 'register' | 'activate' | 'forgot' | 'reset';
    role?: UserRole;
    token?: string;
  }) => {
    if (options?.tab) setAuthModalTab(options.tab);
    if (options?.role) setAuthModalRole(options.role);
    if (options?.token) setAuthModalTokenParam(options.token);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalTokenParam('');
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      setToken(data.token);
      setUser(data.user);
      try {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      } catch {}

      closeAuthModal();
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred. Please try again.' };
    }
  };

  const register = async (regData: { email: string; password: string; fullName: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setToken(data.token);
      setUser(data.user);
      try {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      } catch {}

      closeAuthModal();
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred. Please try again.' };
    }
  };

  const activate = async (actToken: string, password: string) => {
    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: actToken, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Activation failed' };
      }

      setToken(data.token);
      setUser(data.user);
      try {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      } catch {}

      closeAuthModal();
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred.' };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      return { success: true, demoResetToken: data.demoResetToken };
    } catch (err: any) {
      return { success: false, error: err.message || 'Request failed' };
    }
  };

  const resetPassword = async (rstToken: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: rstToken, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Password reset failed' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}

    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {}
  };

  const isAuthenticated = !!user && !!token;
  const isAgent = isAuthenticated && user?.role === 'AGENT';
  const isClient = isAuthenticated && user?.role === 'CLIENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAgent,
        isClient,
        isLoading,
        authModalOpen,
        authModalTab,
        authModalRole,
        authModalTokenParam,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        activate,
        forgotPassword,
        resetPassword,
        logout,
        getAuthHeaders
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
