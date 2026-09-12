import { useContext } from 'react';
import { AuthContext } from '../context/authContextBase';

/**
 * useAuth Hook
 *
 * Custom hook to consume the global AuthContext.
 * Provides user information, token, login, signup, and logout functions.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
