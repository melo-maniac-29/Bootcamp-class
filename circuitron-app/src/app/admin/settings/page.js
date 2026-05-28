'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { updateUser } from '@/lib/db';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { User, Lock, LogOut, Check, AlertCircle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
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
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setPasswordMsg({ type: 'error', text: 'Current password is incorrect.' });
      } else {
        setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password' });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 pt-4 space-y-8">
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Settings</h1>
          <p className="text-lg text-muted-foreground font-medium mt-1">Manage your account and preferences.</p>
        </div>

        <div className="flex gap-2 border-b border-border pb-px">
          {[
            { id: 'profile', label: 'Profile', icon: <User size={18} /> },
            { id: 'security', label: 'Security', icon: <Lock size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors relative ${
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 md:p-8 border-b border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
                    <p className="text-sm text-muted-foreground">Update your display name and account details</p>
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
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Display Name</label>
                    <input
                      className="w-full bg-background border border-border focus:border-primary rounded-lg px-4 py-2.5 text-foreground focus:outline-none transition-colors"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Role</label>
                    <input
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-muted-foreground cursor-not-allowed focus:outline-none capitalize"
                      type="text"
                      value={user?.role === 'admin' ? 'Administrator' : user?.role || 'Unknown'}
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
                <div className="mb-4">
                  <h3 className="text-base font-bold text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center justify-center gap-2 w-full md:w-auto bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 px-5 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                  <Lock size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Change Password</h2>
                  <p className="text-sm text-muted-foreground">Reauthenticate and set a new password</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Current Password</label>
                  <input
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-4 py-2.5 text-foreground focus:outline-none transition-colors"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">New Password</label>
                  <input
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-4 py-2.5 text-foreground focus:outline-none transition-colors"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Confirm New Password</label>
                  <input
                    className="w-full bg-background border border-border focus:border-primary rounded-lg px-4 py-2.5 text-foreground focus:outline-none transition-colors"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {passwordMsg && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
                    passwordMsg.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {passwordMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-lg font-medium transition-colors border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <Lock size={18} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
