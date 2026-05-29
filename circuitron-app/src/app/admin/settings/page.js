'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { updateUser } from '@/lib/db';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { User, Lock, LogOut, Check, AlertCircle, Loader2, Save, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/auth';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      await updateUser(user.uid, { displayName: displayName.trim() });
      if (refreshUser) await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPasswordMsg({ type: 'error', text: 'Current password is incorrect.' });
      } else {
        setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password' });
      }
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await logoutUser();
    router.push('/');
  };

  const participantId = user?.participantId || 'ADMIN';
  const roleDisplay = user?.role === 'admin' ? 'Administrator' : (user?.role || 'Unknown');

  return (
    <div className="max-w-3xl mx-auto pb-16 pt-4 space-y-8">
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
          <p className="text-sm text-white/60 mt-1">Manage your administrator account and preferences.</p>
        </div>

        <div className="flex gap-2 border-b border-white/10 pb-px">
          {[
            { id: 'profile', label: 'Profile', icon: <User size={16} /> },
            { id: 'security', label: 'Security', icon: <Lock size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Profile Information</CardTitle>
                    <p className="text-sm text-white/60">Update your display name and account details.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Email Address</label>
                      <Input
                        className="bg-[#0A0A0A] border-white/10 text-white/50 cursor-not-allowed"
                        type="email"
                        value={user?.email || ''}
                        disabled
                      />
                      <p className="text-xs text-white/40 mt-1">Admin email cannot be changed here.</p>
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
                        className="bg-[#0A0A0A] border-white/10 text-white focus:border-white/30"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Role</label>
                      <Input
                        className="bg-[#0A0A0A] border-white/10 text-white/50 cursor-not-allowed"
                        type="text"
                        value={roleDisplay}
                        disabled
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
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                    <Shield size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Change Password</CardTitle>
                    <p className="text-sm text-white/60">Reauthenticate and set a new password.</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Current Password</label>
                    <Input
                      className="bg-[#0A0A0A] border-white/10 text-white focus:border-white/30 max-w-md"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">New Password</label>
                    <Input
                      className="bg-[#0A0A0A] border-white/10 text-white focus:border-white/30 max-w-md"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Confirm New Password</label>
                    <Input
                      className="bg-[#0A0A0A] border-white/10 text-white focus:border-white/30 max-w-md"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {passwordMsg && (
                    <div className={`flex items-center gap-2 p-3 rounded-md text-sm font-medium border max-w-md ${
                      passwordMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {passwordMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end border-t border-white/10 mt-6 pt-6">
                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="bg-white text-black hover:bg-white/90"
                    >
                      {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
