'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import {
  UserPlus, Search, Trash2, KeyRound, Loader2, X,
  Users, Shield, GraduationCap, MoreHorizontal, AlertCircle
} from 'lucide-react';
import { subscribeToUsers } from '@/lib/db';

export default function AdminUsers() {
  const { user, getIdToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New participant form
  const [newParticipantId, setNewParticipantId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Bulk import
  const [bulkInput, setBulkInput] = useState('');

  // Subscribe to users
  useEffect(() => {
    const unsub = subscribeToUsers((data) => {
      // Filter out deleted users and sort
      const activeUsers = data.filter(u => !u.deleted);
      setUsers(activeUsers);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Filter users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(users.filter(u =>
        u.participantId?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, users]);

  const getAuthHeaders = async () => {
    const token = await getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  // Create single participant
  const handleCreateParticipant = async () => {
    if (!newParticipantId.trim()) {
      setError('Participant ID is required');
      return;
    }
    setError('');
    setActionLoading('create');

    try {
      const email = newEmail.trim() || `${newParticipantId.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@circuitron.local`;
      const headers = await getAuthHeaders();

      const res = await fetch('/api/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          participantId: newParticipantId.trim(),
          name: newName.trim() || newParticipantId.trim(),
          role: 'student',
          password: `${newParticipantId.trim()}@123`, // Default password
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create participant');

      setSuccess(`Created participant ${newParticipantId.trim()} with default password: ${newParticipantId.trim()}@123`);
      setNewParticipantId('');
      setNewName('');
      setNewEmail('');
      setShowAddModal(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    }
    setActionLoading(null);
  };

  // Bulk create participants
  const handleBulkCreate = async () => {
    const lines = bulkInput.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) {
      setError('Enter at least one participant ID');
      return;
    }
    setError('');
    setActionLoading('bulk');

    let created = 0;
    let failed = 0;
    const headers = await getAuthHeaders();

    for (const line of lines) {
      const parts = line.trim().split(',').map(s => s.trim());
      const participantId = parts[0];
      const name = parts[1] || participantId;
      const email = parts[2] || `${participantId.toLowerCase().replace(/[^a-z0-9]/g, '')}@circuitron.local`;

      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email,
            participantId,
            name,
            role: 'student',
            password: `${participantId}@123`,
          }),
        });
        if (res.ok) created++;
        else failed++;
      } catch {
        failed++;
      }
    }

    setSuccess(`Created ${created} participants${failed > 0 ? `, ${failed} failed` : ''}`);
    setBulkInput('');
    setShowBulkModal(false);
    setActionLoading(null);
    setTimeout(() => setSuccess(''), 5000);
  };

  // Reset password
  const handleResetPassword = async (targetUser) => {
    if (!confirm(`Reset password for ${targetUser.participantId || targetUser.email}?`)) return;
    setActionLoading(targetUser.id);

    try {
      const headers = await getAuthHeaders();
      const newPassword = `${targetUser.participantId || 'user'}@123`;

      const res = await fetch('/api/users/password', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          uid: targetUser.id,
          newPassword,
        }),
      });

      if (!res.ok) throw new Error('Failed to reset password');
      setSuccess(`Password reset to: ${newPassword}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    }
    setActionLoading(null);
  };

  // Delete user (soft delete)
  const handleDeleteUser = async (targetUser) => {
    if (!confirm(`Remove ${targetUser.participantId || targetUser.email}? This action can be undone.`)) return;
    setActionLoading(targetUser.id);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/users?uid=${targetUser.id}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) throw new Error('Failed to delete user');
      setSuccess(`Removed ${targetUser.participantId || targetUser.email}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
    setActionLoading(null);
  };

  const studentCount = users.filter(u => u.role === 'student').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">User Management</h1>
          <p className="text-white/60">Create and manage participants.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkModal(true)} variant="outline" className="border-white/10 text-white hover:bg-white/10">
            Bulk Import
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-white text-black hover:bg-white/90">
            <UserPlus className="mr-2 h-4 w-4" /> Add Participant
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <Users size={20} className="text-white/40" />
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-white/40">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <GraduationCap size={20} className="text-blue-400/60" />
            <div>
              <p className="text-2xl font-bold">{studentCount}</p>
              <p className="text-xs text-white/40">Participants</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield size={20} className="text-amber-400/60" />
            <div>
              <p className="text-2xl font-bold">{adminCount}</p>
              <p className="text-xs text-white/40">Admins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ID, name, or email..."
          className="bg-[#121214] border-white/10 text-white pl-10"
        />
      </div>

      {/* Users Table */}
      <Card className="bg-[#121214] border-white/10 text-white shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider p-4">Participant ID</th>
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider p-4">Name</th>
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider p-4">Email</th>
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider p-4">Role</th>
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider p-4">Status</th>
                <th className="text-right text-xs font-semibold text-white/40 uppercase tracking-wider p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-white/30 mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/30 text-sm">
                    {searchQuery ? 'No matching users found.' : 'No participants yet. Click "Add Participant" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm font-mono text-white">{u.participantId || '—'}</td>
                    <td className="p-4 text-sm text-white/80">{u.name || u.displayName || '—'}</td>
                    <td className="p-4 text-sm text-white/50">{u.email}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.firstLogin ? 'bg-yellow-500/10 text-yellow-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {u.firstLogin ? 'Pending Setup' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleResetPassword(u)}
                          disabled={actionLoading === u.id}
                          className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                          title="Reset Password"
                        >
                          {actionLoading === u.id ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={actionLoading === u.id}
                            className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                            title="Remove User"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#121214] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add Participant</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Participant ID *</label>
                <Input
                  value={newParticipantId}
                  onChange={(e) => setNewParticipantId(e.target.value)}
                  placeholder="e.g. CIRCUITRON-001"
                  className="bg-[#0A0A0A] border-white/10 text-white"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Full Name</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Student Name"
                  className="bg-[#0A0A0A] border-white/10 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Email (optional)</label>
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Auto-generated if blank"
                  className="bg-[#0A0A0A] border-white/10 text-white"
                />
              </div>
              <p className="text-xs text-white/30">Default password: [ParticipantID]@123</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setShowAddModal(false)} variant="ghost" className="text-white/60 hover:text-white flex-1">Cancel</Button>
              <Button
                onClick={handleCreateParticipant}
                disabled={actionLoading === 'create'}
                className="bg-white text-black hover:bg-white/90 flex-1"
              >
                {actionLoading === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBulkModal(false)}>
          <div className="bg-[#121214] border border-white/10 rounded-xl p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Bulk Import Participants</h2>
              <button onClick={() => setShowBulkModal(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>
            <p className="text-xs text-white/40">Enter one participant per line. Format: ParticipantID, Name (optional), Email (optional)</p>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={`CIRCUITRON-001, John Doe\nCIRCUITRON-002, Jane Smith\nCIRCUITRON-003`}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-md px-3 py-2 text-white text-sm min-h-[200px] focus:outline-none focus:border-white/30 transition-colors resize-none font-mono"
            />
            <p className="text-xs text-white/30">Default password for each: [ParticipantID]@123</p>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setShowBulkModal(false)} variant="ghost" className="text-white/60 hover:text-white flex-1">Cancel</Button>
              <Button
                onClick={handleBulkCreate}
                disabled={actionLoading === 'bulk'}
                className="bg-white text-black hover:bg-white/90 flex-1"
              >
                {actionLoading === 'bulk' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Import {bulkInput.trim().split('\n').filter(l => l.trim()).length} Participants
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
