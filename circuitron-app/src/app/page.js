'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/lib/auth';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import SplitScreenLayout from '@/components/auth/SplitScreenLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function UnifiedLoginPage() {
  const [step, setStep] = useState(1); // 1 = ID, 2 = Password, 3 = Setup Password
  const [participantId, setParticipantId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('participant');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  const verifyParticipant = async (e) => {
    e.preventDefault();
    if (!participantId) {
      setError('Please enter your Participant ID or Admin Email');
      return;
    }

    setLoading(true);
    setError('');

    // If it's an email (admin login), skip verification
    if (participantId.includes('@')) {
      setEmail(participantId);
      setRole('admin');
      setStep(2);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: participantId.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Participant not found');
        return;
      }

      setEmail(data.email);
      setRole(data.role || 'participant');
      
      if (data.firstLogin) {
        setStep(3); // Setup Password
      } else {
        setStep(2); // Normal Login
      }
    } catch (err) {
      setError('Failed to verify participant');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await loginUser(email, password);
      if (userData.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in both fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: participantId.trim(), password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to setup account');
        setLoading(false);
        return;
      }

      // Automatically log them in
      const userData = await loginUser(data.email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to setup account');
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <SplitScreenLayout role={role === 'admin' ? 'admin' : 'student'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="w-full"
      >
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-2 font-sans">
            {step === 1 ? 'Circuitron' : step === 3 ? 'Welcome' : 'Welcome Back'}
          </h1>
          <p className="text-white/60 text-sm font-normal">
            {step === 1 ? 'Enter your Participant ID to continue' : step === 3 ? 'Create a password for your account' : 'Enter your password to login'}
          </p>
        </div>

        {/* Step 1: Participant ID */}
        {step === 1 && (
          <form onSubmit={verifyParticipant} className="space-y-6">
            <div className="space-y-2 relative">
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider" htmlFor="participantId">
                Participant ID / Email
              </label>
              <Input
                id="participantId"
                type="text"
                placeholder="CIRCUITRON-001"
                className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-white/20 rounded-none focus-visible:ring-0 focus-visible:border-white focus-visible:ring-offset-0 px-0 h-10 text-white placeholder:text-white/20 transition-all font-sans text-sm"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                autoComplete="username"
              />
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
              className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium rounded-xl transition-all shadow-md mt-6 border-none"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-black" /> : "Continue"}
            </Button>
          </form>
        )}

        {/* Step 2: Normal Login */}
        {step === 2 && (
          <form onSubmit={handleLogin} className="space-y-6">
            <button 
              type="button" 
              onClick={() => { setStep(1); setError(''); setPassword(''); }}
              className="flex items-center text-xs text-white/60 hover:text-white mb-4"
            >
              <ArrowLeft size={14} className="mr-1" /> Back
            </button>
            <div className="space-y-2 relative">
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider" htmlFor="password">
                Password
              </label>
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
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
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
              className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium rounded-xl transition-all shadow-md mt-6 border-none"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-black" /> : "Login"}
            </Button>
          </form>
        )}

        {/* Step 3: Setup Password */}
        {step === 3 && (
          <form onSubmit={handleSetupPassword} className="space-y-6">
            <button 
              type="button" 
              onClick={() => { setStep(1); setError(''); setPassword(''); setConfirmPassword(''); }}
              className="flex items-center text-xs text-white/60 hover:text-white mb-4"
            >
              <ArrowLeft size={14} className="mr-1" /> Back
            </button>
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider" htmlFor="new-password">
                  Create Password
                </label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-white/20 rounded-none focus-visible:ring-0 focus-visible:border-white focus-visible:ring-offset-0 px-0 pr-10 h-10 text-white placeholder:text-white/20 transition-all font-sans text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-1 text-white/60 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 relative">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-white/20 rounded-none focus-visible:ring-0 focus-visible:border-white focus-visible:ring-offset-0 px-0 h-10 text-white placeholder:text-white/20 transition-all font-sans text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium rounded-xl transition-all shadow-md mt-6 border-none"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-black" /> : "Create Account"}
            </Button>
          </form>
        )}
      </motion.div>
    </SplitScreenLayout>
  );
}
