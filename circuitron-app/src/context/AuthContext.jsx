'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getIdToken as firebaseGetIdToken } from 'firebase/auth';
import { onAuthChange, logoutUser, getUserProfile } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        
        if (authUser.firstLogin && pathname !== '/setup-password') {
          router.push('/setup-password');
        } else if (!authUser.firstLogin && pathname === '/setup-password') {
          router.push('/dashboard');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const refreshUser = async () => {
    if (user?.uid) {
      const profile = await getUserProfile(user.uid);
      setUser(prev => ({ ...prev, ...profile }));
    }
  };

  const getIdToken = async () => {
    if (auth.currentUser) {
      return await firebaseGetIdToken(auth.currentUser);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      logout,
      refreshUser,
      isAdmin: user?.role === 'admin',
      getIdToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
