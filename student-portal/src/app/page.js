'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/lib/auth';
import { GraduationCap, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import SplitScreenLayout from '@/components/auth/SplitScreenLayout';

import LoadingScreen from '@/components/ui/LoadingScreen';

export default function StudentLoginPage() {
  const [participantId, setParticipantId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'student') {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  const visibleError = error || (!authLoading && user && user.role !== 'student' ? 'Please use the Admin Portal.' : '');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!participantId || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const mappedEmail = `${participantId.toLowerCase().trim()}@circuitron.local`;
      const userData = await loginUser(mappedEmail, password);
      
      if (userData.role !== 'student') {
        setError('This portal is for students only. Please use the Admin Portal.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid Username or password');
      } else {
        setError('Something went wrong. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <SplitScreenLayout role="student">
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
          {/* Username / Participant ID Line-style Field */}
          <div className="space-y-2 relative">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider" htmlFor="participantId">
              Username
            </label>
            <Input
              id="participantId"
              type="text"
              placeholder="Username"
              className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-white/20 rounded-none focus-visible:ring-0 focus-visible:border-white focus-visible:ring-offset-0 px-0 h-10 text-white placeholder:text-white/20 transition-all font-sans text-sm"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              autoComplete="username"
              autoCapitalize="characters"
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

          {/* Error Message Display */}
          <AnimatePresence>
            {visibleError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-400 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20"
              >
                {visibleError}
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

          {/* Admin Switcher */}
          <div className="text-center mt-4 text-[11px] text-white/40">
            Admin or Volunteer? <a href="/admin-login" className="text-white/60 hover:text-white transition-all underline">Log in here</a>
          </div>
        </form>
      </motion.div>
    </SplitScreenLayout>
  );
}
