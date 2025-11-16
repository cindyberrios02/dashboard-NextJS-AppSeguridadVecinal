// lib/auth-storage.js
import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const REFRESH_KEY = 'auth_refresh';

const COOKIE_OPTIONS = {
  expires: 1,
  sameSite: 'lax',
  path: '/',
};

export const authStorage = {
  getToken: () => {
  if (typeof window === 'undefined') {
    console.log('🔍 getToken: window undefined');
    return null;
  }
  
  const token = Cookies.get(TOKEN_KEY);
  console.log('🔍 getToken:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? token.substring(0, 30) + '...' : 'NULL',
    cookieKey: TOKEN_KEY
  });
  
  return token || null;
},
  
  setToken: (token) => {
    if (typeof window === 'undefined') return;
    console.log('💾 Guardando token en cookie');
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
  },
  
  removeToken: () => {
    if (typeof window === 'undefined') return;
    Cookies.remove(TOKEN_KEY, { path: '/' });
  },
  
  getUser: () => {
  if (typeof window === 'undefined') {
    console.log('🔍 getUser: window undefined');
    return null;
  }
  
  const user = Cookies.get(USER_KEY);
  console.log('🔍 getUser:', {
    hasUser: !!user,
    userPreview: user ? user.substring(0, 50) + '...' : 'NULL'
  });
  
  return user || null;
},
  
  setUser: (userData) => {
    if (typeof window === 'undefined') return;
    const userString = typeof userData === 'string' ? userData : JSON.stringify(userData);
    console.log('💾 Guardando user en cookie');
    Cookies.set(USER_KEY, userString, COOKIE_OPTIONS);
  },
  
  removeUser: () => {
    if (typeof window === 'undefined') return;
    Cookies.remove(USER_KEY, { path: '/' });
  },
  
  getRefreshToken: () => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(REFRESH_KEY) || null;
  },
  
  setRefreshToken: (token) => {
    if (typeof window === 'undefined') return;
    Cookies.set(REFRESH_KEY, token, { ...COOKIE_OPTIONS, expires: 7 });
  },
  
  removeRefreshToken: () => {
    if (typeof window === 'undefined') return;
    Cookies.remove(REFRESH_KEY, { path: '/' });
  },
  
  clear: () => {
    if (typeof window === 'undefined') return;
    console.log('🗑️ Limpiando todas las cookies');
    Cookies.remove(TOKEN_KEY, { path: '/' });
    Cookies.remove(USER_KEY, { path: '/' });
    Cookies.remove(REFRESH_KEY, { path: '/' });
  }
};