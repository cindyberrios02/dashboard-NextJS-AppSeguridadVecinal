// lib/auth-storage.js
import Cookies from 'js-cookie';

export const authStorage = {
  saveTokens: (accessToken, refreshToken) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    Cookies.set('refreshToken', refreshToken, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  },
  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  },
  getRefreshToken: () => {
    return Cookies.get('refreshToken');
  },
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    Cookies.remove('refreshToken');
  },
  saveUser: (user) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  },
  getUser: () => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
  isAuthenticated: () => {
    const accessToken = authStorage.getAccessToken();
    const refreshToken = authStorage.getRefreshToken();
    return !!(accessToken || refreshToken);
  },
};