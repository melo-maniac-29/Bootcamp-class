'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { loginUser, loginWithGoogle } from '@/lib/auth';
import { Zap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

import SplitScreenLayout from '@/components/auth/SplitScreenLayout';

import LoadingScreen from '@/components/ui/LoadingScreen';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'volunteer') {
        router.push('/volunteer');
      }
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await loginUser(email, password);
      
      if (userData.role === 'student') {
        setError('Students should use the Student Portal to log in');
        setLoading(false);
        return;
      }

      if (userData.role === 'admin') {
        router.push('/admin');
      } else if (userData.role === 'volunteer') {
        router.push('/volunteer');
      } else {
        setError('Unauthorized access');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later');
      } else {
        setError('Something went wrong. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const userData = await loginWithGoogle();

      if (userData.role === 'student') {
        setError('Students should use the Student Portal to log in');
        setLoading(false);
        return;
      }

      if (userData.role === 'admin') {
        router.push('/admin');
      } else if (userData.role === 'volunteer') {
        router.push('/volunteer');
      } else {
        setError('Unauthorized access');
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err.message) {
        setError(err.message);
      } else {
        setError('Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <SplitScreenLayout role="admin">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="w-full"
      >
        <div className="mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white mb-6 border border-white/10 shadow-sm">
            <Zap size={24} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Access</h1>
          <p className="text-slate-400 font-medium text-sm">Sign in to manage bootcamps and users.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-white transition-colors" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="admin@ieee.org"
                className="pl-10 bg-[#0B0F19] border-white/10 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 h-12 text-white placeholder:text-slate-600 rounded-xl transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-white transition-colors" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10 bg-[#0B0F19] border-white/10 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 h-12 text-white placeholder:text-slate-600 rounded-xl transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-400 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            className="w-full h-12 bg-white hover:bg-slate-200 hover:opacity-90 text-black font-medium rounded-xl transition-all shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-black" />
            ) : (
              <span className="flex items-center gap-2">
                Sign In <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="flex items-center gap-4 py-2 opacity-50">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-400 font-medium uppercase">Or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Button
            type="button"
            className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 rounded-xl transition-all"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-3">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-500">
              Students? Use the <strong className="text-white">Student Portal</strong> to log in.
            </p>
          </div>
        </form>
      </motion.div>
    </SplitScreenLayout>
  );
}
