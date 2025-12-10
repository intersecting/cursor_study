import React, { createContext, useContext, useEffect, useState } from 'react';

export type Role = 'admin' | 'teacher' | 'frontdesk' | 'student';
export type User = { id: string; name: string; role: Role } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: add refresh-token flow or localStorage retrieval
    setLoading(false);
  }, []);

  const login = (_token: string, u: User) => setUser(u);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

