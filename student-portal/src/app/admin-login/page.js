'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { loginUser, loginWithGoogle } from '@/lib/auth';
import { Zap, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

import SplitScreenLayout from '@/components/auth/SplitScreenLayout';

import LoadingScreen from '@/components/ui/LoadingScreen';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        {/* Charcoal Panel Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-2 font-sans">Login</h1>
          <p className="text-white/60 text-sm font-normal">Enter your account details</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Line-style Field */}
          <div className="space-y-2 relative">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider" htmlFor="email">
              Username
            </label>
            <Input
              id="email"
              type="text"
              placeholder="Username"
              className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-white/20 rounded-none focus-visible:ring-0 focus-visible:border-white focus-visible:ring-offset-0 px-0 h-10 text-white placeholder:text-white/20 transition-all font-sans text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          {/* Password Line-style Field with Visibility Toggle */}
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-white/20 rounded-none focus-visible:ring-0 focus-visible:border-white focus-visible:ring-offset-0 px-0 pr-10 h-10 text-white placeholder:text-white/20 transition-all font-sans text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-1 text-white/60 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2} className="text-white" />
                ) : (
                  <Eye size={18} strokeWidth={2} className="text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-start text-xs pt-1">
            <a href="#" className="text-white/60 hover:text-white transition-colors font-medium">
              Forgot Password?
            </a>
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

          {/* Solid Lavender Login Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-[#9162F5] hover:bg-[#8152e5] text-white font-medium rounded-xl transition-all shadow-md mt-6 border-none"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              "Login"
            )}
          </Button>

          {/* Footer inside Left Panel: Don't have an account & Sign Up */}
          <div className="flex items-center justify-between text-xs text-white/60 mt-10 border-t border-white/10 pt-6">
            <span>Don't have an account?</span>
            <button
              type="button"
              className="bg-[#27272A] border border-white/5 hover:bg-[#3F3F46] text-white text-xs px-4 py-2 rounded-lg font-medium transition-all"
            >
              Sign up
            </button>
          </div>
        </form>
      </motion.div>
    </SplitScreenLayout>
  );
}
