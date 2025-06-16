import { createContext, useContext, useEffect, useState } from 'react';
import { isAuthenticated, getCurrentUser, logout, checkAuthExpiration } from '../lib/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 인증 상태 확인
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
    setLoading(false);

    // 5분마다 인증 상태 확인
    const interval = setInterval(() => {
      checkAuthExpiration();
      if (!isAuthenticated()) {
        setUser(null);
      }
    }, 5 * 60 * 1000); // 5분

    return () => clearInterval(interval);
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login: loginUser,
    logout: logoutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}