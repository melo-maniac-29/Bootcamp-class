'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { updateUserPassword, updateUserProfile } from '@/lib/auth';
import { Lock, Key, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function SetupPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !user.firstLogin)) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoadingState(true);
    setError('');

    try {
      // 1. Update password in Firebase Auth
      await updateUserPassword(newPassword);
      
      // 2. Update firstLogin flag in Firestore
      await updateUserProfile(user.uid, { firstLogin: false });
      
      // 3. Refresh user state in context (this will trigger redirect to dashboard)
      await refreshUser();
      
      // Force redirect just in case
      router.push('/dashboard');
    } catch (err) {
      console.error('Password setup error:', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Session expired. Please log out and log in again.');
      } else {
        setError('Failed to update password. Please try again.');
      }
    } finally {
      setLoadingState(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background overflow-hidden selection:bg-primary/30">
      
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 w-full max-w-md px-4"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4 ring-1 ring-accent/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Key size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome, {user.participantId || user.displayName}!</h1>
          <p className="text-muted-foreground mt-2">Please set up your new password to continue.</p>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="At least 6 characters"
                    className="pl-10 bg-white/5 border-white/10 focus-visible:ring-primary h-11"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-type new password"
                    className="pl-10 bg-white/5 border-white/10 focus-visible:ring-primary h-11"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md border border-destructive/20"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            
            <CardFooter>
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium transition-all"
                disabled={loadingState}
              >
                {loadingState ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Save & Continue <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
