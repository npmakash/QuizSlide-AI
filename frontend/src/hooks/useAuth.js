import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook to manage user authentication state and interactions with the Google APIs backend.
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Refreshes the auth status by calling the backend /status endpoint
   */
  const checkStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/auth/status');
      if (response.data && response.data.authenticated) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to authenticate session:', err);
      setError('Could not verify Google authentication status.');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Redirects the user to Google OAuth Concent screen
   */
  const login = async () => {
    try {
      // Get the authorization URL from backend
      const response = await api.get('/auth/google/url');
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Google OAuth initiation URL was not returned.');
      }
    } catch (err) {
      console.error('OAuth initiation failed:', err);
      setError('Failed to contact login server. Please try again.');
    }
  };

  /**
   * Ends the authenticated session
   */
  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Failed to log out:', err);
      setError('Logout request failed.');
    } finally {
      setLoading(false);
    }
  };

  // Check auth status on component mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkStatus
  };
};
