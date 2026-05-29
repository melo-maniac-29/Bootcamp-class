'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { updateUser } from '@/lib/db';
import { User, LogOut, Check, AlertCircle, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/auth';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

export default function StudentSettingsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      await updateUser(user.uid, { displayName: displayName.trim() });
      if (refreshUser) await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await logoutUser();
    router.push('/');
  };

  const currentLevel = user?.level ? `Student - ${user.level}` : 'Student';
  const participantId = user?.participantId || 'N/A';

  return (
    <div className="max-w-3xl mx-auto pb-16 pt-4 space-y-8">
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
          <p className="text-sm text-white/60 mt-1">Manage your student account and profile.</p>
        </div>

        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardHeader className="border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                <User size={24} />
              </div>
              <div>
                <CardTitle className="text-xl">Profile Information</CardTitle>
                <p className="text-sm text-white/60">Update the name shown on submissions and leaderboards.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Email Address</label>
                  <Input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-[#0A0A0A] border-white/10 text-white/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-white/40 mt-1">Contact an admin to change your email or password.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Participant ID</label>
                  <Input 
                    type="text" 
                    value={participantId} 
                    disabled 
                    className="bg-[#0A0A0A] border-white/10 text-white/50 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Display Name</label>
                  <Input 
                    type="text" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    required 
                    className="bg-[#0A0A0A] border-white/10 text-white focus:border-white/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Role / Level</label>
                  <Input 
                    type="text" 
                    value={currentLevel} 
                    disabled 
                    className="bg-[#0A0A0A] border-white/10 text-white/50 cursor-not-allowed"
                  />
                </div>
              </div>

              {profileMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-md text-sm font-medium border ${
                  profileMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {profileMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center border-t border-white/10 mt-6 pt-6">
                <Button 
                  type="button" 
                  onClick={handleSignOut} 
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>

                <Button 
                  type="submit" 
                  disabled={profileLoading || !displayName.trim() || displayName === user?.displayName}
                  className="bg-white text-black hover:bg-white/90"
                >
                  {profileLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}