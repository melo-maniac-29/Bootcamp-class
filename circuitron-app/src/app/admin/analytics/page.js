'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart3, TrendingUp, Users, Zap, Target, AlertTriangle,
  CheckCircle2, XCircle, Clock, Award, Loader2
} from 'lucide-react';
import {
  subscribeToUsers, subscribeToSubmissions, subscribeToAllDays,
  subscribeToUserProgress
} from '@/lib/db';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub1 = subscribeToUsers((data) => {
      setUsers(data.filter(u => !u.deleted));
      setLoading(false);
    });
    const unsub2 = subscribeToSubmissions({}, (data) => setSubmissions(data));
    const unsub3 = subscribeToAllDays((data) => setDays(data));
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const students = users.filter(u => u.role === 'student');

  // Per-day completion data
  const dayCompletionData = days.map(day => {
    const daySubs = submissions.filter(s => s.dayId === day.id);
    const approved = daySubs.filter(s => s.status === 'Approved' || s.status === 'approved').length;
    const pending = daySubs.filter(s => s.status === 'Pending Review' || s.status === 'pending_review' || s.status === 'submitted').length;
    const revision = daySubs.filter(s => s.status === 'Needs Revision' || s.status === 'needs_revision').length;
    return {
      title: day.title || day.id,
      total: daySubs.length,
      approved,
      pending,
      revision,
      rate: students.length > 0 ? Math.round((approved / students.length) * 100) : 0,
    };
  });

  // Top participants by streak
  const topStreaks = [...students]
    .sort((a, b) => (b.streakCount || 0) - (a.streakCount || 0))
    .slice(0, 10);

  // Inactive participants (no lastActiveDate or more than 2 days ago)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
  const inactiveStudents = students.filter(u => !u.lastActiveDate || u.lastActiveDate < twoDaysAgoStr);

  // Students who haven't submitted anything
  const submittedUserIds = new Set(submissions.map(s => s.userId));
  const noSubmissions = students.filter(u => !submittedUserIds.has(u.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Analytics</h1>
        <p className="text-white/60">View detailed participant progress and platform metrics.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Users size={14} className="text-blue-400" /><span className="text-xs text-white/40">Total Students</span></div>
            <p className="text-2xl font-bold">{students.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Target size={14} className="text-emerald-400" /><span className="text-xs text-white/40">Total Submissions</span></div>
            <p className="text-2xl font-bold">{submissions.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle size={14} className="text-yellow-400" /><span className="text-xs text-white/40">Inactive Students</span></div>
            <p className="text-2xl font-bold">{inactiveStudents.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><XCircle size={14} className="text-red-400" /><span className="text-xs text-white/40">No Submissions</span></div>
            <p className="text-2xl font-bold">{noSubmissions.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Day Completion Rates */}
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 size={16} /> Day Completion Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dayCompletionData.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-8">No days created yet.</p>
            ) : (
              dayCompletionData.map((day, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70 truncate max-w-[200px]">{day.title}</span>
                    <span className="text-white/40 text-xs">{day.rate}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${day.rate}%` }}
                    />
                  </div>
                  <div className="flex gap-3 text-xs text-white/30">
                    <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-400" /> {day.approved}</span>
                    <span className="flex items-center gap-1"><Clock size={10} className="text-yellow-400" /> {day.pending}</span>
                    <span className="flex items-center gap-1"><XCircle size={10} className="text-red-400" /> {day.revision}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Streaks Leaderboard */}
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award size={16} /> Top Streaks</CardTitle>
          </CardHeader>
          <CardContent>
            {topStreaks.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-8">No streaks yet.</p>
            ) : (
              <div className="space-y-2">
                {topStreaks.map((s, idx) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                        idx === 2 ? 'bg-amber-700/20 text-amber-600' :
                        'bg-white/5 text-white/30'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm text-white">{s.name || s.participantId}</p>
                        <p className="text-xs text-white/30 font-mono">{s.participantId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Zap size={14} className="text-yellow-400" />
                      <span className="font-bold">{s.streakCount || 0}</span>
                      <span className="text-xs text-white/30">days</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inactive Students List */}
      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-400" /> Inactive Participants (2+ days)</CardTitle>
        </CardHeader>
        <CardContent>
          {inactiveStudents.length === 0 ? (
            <p className="text-sm text-emerald-400/60 text-center py-4">All participants are active!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {inactiveStudents.map((s) => (
                <div key={s.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div>
                    <p className="text-xs text-white/70">{s.name || s.participantId}</p>
                    <p className="text-xs text-white/30">{s.lastActiveDate || 'Never active'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
