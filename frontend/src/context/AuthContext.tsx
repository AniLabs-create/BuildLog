import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { mapUser } from '../services/users';
import type { RawUserResponse } from '../services/users';
import { AuthContext } from './authContextBase';
import type { User } from '../types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = mapUser(await apiRequest<RawUserResponse>('/auth/me'));
        setUser(currentUser);
        setToken(storedToken);
      } catch (err) {
        console.error('Session expired or invalid token:', err);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (identifier: string, password: string): Promise<User> => {
    const data = await apiRequest<{ access_token: string; user: RawUserResponse }>('/auth/login', {
      method: 'POST',
      data: { identifier, password },
    });

    const mappedUser = mapUser(data.user);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(mappedUser);
    return mappedUser;
  };

  const signup = async (username: string, email: string, password: string): Promise<User> => {
    const data = await apiRequest<{ access_token: string; user: RawUserResponse }>('/auth/signup', {
      method: 'POST',
      data: { username, email, password },
    });

    const mappedUser = mapUser(data.user);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(mappedUser);
    return mappedUser;
  };

  /**
   * Re-fetches the current user from the backend. Used after profile
   * updates (e.g. completing /setup) so the whole app sees fresh data.
   */
  const refreshUser = async (): Promise<void> => {
    const currentUser = mapUser(await apiRequest<RawUserResponse>('/auth/me'));
    setUser(currentUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
