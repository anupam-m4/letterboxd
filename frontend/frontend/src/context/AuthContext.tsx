import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, LoginPayload, RegisterPayload } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthData {
  user: User | null;
}

interface AuthActions {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

interface AuthContextValue {
  state: AuthState;
  data: AuthData;
  actions: AuthActions;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({ isLoading: true, isAuthenticated: false });
  const [data, setData] = useState<AuthData>({ user: null });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState({ isLoading: false, isAuthenticated: false });
      return;
    }

    authService
      .getMe()
      .then((user) => {
        setData({ user });
        setState({ isLoading: false, isAuthenticated: true });
      })
      .catch(() => {
        localStorage.removeItem('token');
        setState({ isLoading: false, isAuthenticated: false });
      });
  }, []);

  const login = async (payload: LoginPayload) => {
    const result = await authService.login(payload);
    localStorage.setItem('token', result.token);
    setData({ user: result.user });
    setState({ isLoading: false, isAuthenticated: true });
  };

  const register = async (payload: RegisterPayload) => {
    const result = await authService.register(payload);
    localStorage.setItem('token', result.token);
    setData({ user: result.user });
    setState({ isLoading: false, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setData({ user: null });
    setState({ isLoading: false, isAuthenticated: false });
  };

  const actions: AuthActions = { login, register, logout };

  return (
    <AuthContext.Provider value={{ state, data, actions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
