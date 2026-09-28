/**
 * Auth Context Provider
 * React context for managing authentication state across the application.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as authService from '../../services/authService';
import { buildAuthContext, type AuthContext } from '../../lib/authorization';
import { logger } from '../../lib/logger';
import type { User } from '../../db/schema';

interface AuthState {
  user: User | null;
  session: { id: string; token: string } | null;
  authContext: AuthContext;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_STORAGE_KEY = 'cybervault_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    authContext: { userId: null, roles: [], permissions: [] },
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (!stored) {
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const { sessionId } = JSON.parse(stored);
        const user = authService.validateSession(sessionId);

        if (user) {
          const authCtx = buildAuthContext(user.id);
          setState({
            user,
            session: { id: sessionId, token: '' },
            authContext: authCtx,
            isLoading: false,
            isAuthenticated: true,
          });
          logger.auth.info('Session restored', { userId: user.id });
        } else {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        logger.auth.error('Failed to restore session', { error: (error as Error).message });
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    const authCtx = buildAuthContext(result.user.id);

    // Store session
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      sessionId: result.session.id,
    }));

    setState({
      user: result.user,
      session: { id: result.session.id, token: result.session.token },
      authContext: authCtx,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const register = async (email: string, password: string, displayName: string) => {
    const result = await authService.register(email, password, displayName);
    const authCtx = buildAuthContext(result.user.id);

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      sessionId: result.session.id,
    }));

    setState({
      user: result.user,
      session: { id: result.session.id, token: result.session.token },
      authContext: authCtx,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = async () => {
    if (state.session) {
      authService.logout(state.session.id, state.user?.id || '');
    }

    sessionStorage.removeItem(SESSION_STORAGE_KEY);

    setState({
      user: null,
      session: null,
      authContext: { userId: null, roles: [], permissions: [] },
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const refreshSession = async (): Promise<boolean> => {
    if (!state.session) return false;
    const success = authService.refreshSession(state.session.id);
    if (!success) {
      await logout();
    }
    return success;
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
