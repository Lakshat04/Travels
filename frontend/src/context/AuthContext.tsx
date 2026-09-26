import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/authApi';

interface AuthUser {
  username: string;
  fullName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('nt_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await authApi.login(usernameOrEmail, password);
    const authUser = { username: res.username, fullName: res.fullName };
    localStorage.setItem('nt_token', res.token);
    localStorage.setItem('nt_user', JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem('nt_token');
    localStorage.removeItem('nt_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
