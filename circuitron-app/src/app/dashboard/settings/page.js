'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { updateUser } from '@/lib/db';
import { User, LogOut, Check, AlertCircle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

export default function StudentSettingsPage() {
  const { user, refreshUser, logout } = useAuth();
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
    } catch (err) {
      console.error(err);
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const currentLevel = user?.level ? `Student - ${user.level}` : 'Student';

  return (
    <div className="max-w-3xl mx-auto pb-16 pt-4 space-y-8">
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Settings</h1>
          <p className="text-lg text-muted-foreground font-medium mt-1">Manage your student account.</p>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-6 md:p-8 border-b border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
                <p className="text-sm text-muted-foreground">Update the name shown on submissions and leaderboards</p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Email Address</label>
                <input 
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-muted-foreground cursor-not-allowed focus:outline-none" 
                  type="email" 
                  value={user?.email || ''} 
                  disabled 
                />
                <p className="text-xs text-muted-foreground mt-1">Contact an admin to change your email or password.</p>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Display Name</label>
                <input 
                  className="w-full bg-background border border-border focus:border-primary rounded-lg px-4 py-2.5 text-foreground focus:outline-none transition-colors" 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Role / Level</label>
                <input 
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-muted-foreground cursor-not-allowed focus:outline-none" 
                  type="text" 
                  value={currentLevel} 
                  disabled 
                />
              </div>

              {profileMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
                  profileMsg.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {profileMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={profileLoading || !displayName.trim() || displayName === user?.displayName}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-lg font-medium transition-colors border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profileLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="p-6 md:p-8 bg-secondary/30">
            <button 
              type="button" 
              onClick={logout} 
              className="flex items-center justify-center gap-2 w-full md:w-auto bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}