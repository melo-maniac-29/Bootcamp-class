'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Zap, Target, Clock, CheckCircle2, PlayCircle, Bell,
  Calendar, ArrowRight, Loader2, Lock
} from 'lucide-react';
import Link from 'next/link';
import {
  subscribeToAllDays, subscribeToUserProgress, subscribeToAnnouncements,
  getDayState
} from '@/lib/db';

export default function DashboardOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const [days, setDays] = useState([]);
  const [progress, setProgress] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const unsub1 = subscribeToAllDays((data) => {
      setDays(data);
      setLoading(false);
    });
    const unsub2 = subscribeToUserProgress(user.uid, (data) => setProgress(data));
    const unsub3 = subscribeToAnnouncements((data) => setAnnouncements(data));

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user?.uid]);

  // Calculate stats
  const getProgressForDay = (dayId) => progress.find(p => p.dayId === dayId);

  const completedDays = days.filter(day => {
    const p = getProgressForDay(day.id);
    return p?.overallCompleted;
  }).length;

  const totalDays = days.length;

  const overallProgress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const streakCount = user?.streakCount || 0;

  // Find active day (first unlocked, not completed day)
  const activeDay = days.find(day => {
    const p = getProgressForDay(day.id);
    const state = getDayState(day, p);
    return state === 'ACTIVE';
  });

  // Find next locked day with unlock time
  const nextLockedDay = days.find(day => {
    const p = getProgressForDay(day.id);
    const state = getDayState(day, p);
    return state === 'LOCKED';
  });

  const formatUnlockTime = (unlockAt) => {
    if (!unlockAt) return 'TBD';
    try {
      const date = unlockAt.toDate ? unlockAt.toDate() : new Date(unlockAt);
      const now = new Date();
      const diff = date - now;
      if (diff <= 0) return 'Now';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    } catch { return 'TBD'; }
  };

  // Pending reviews (submissions that need revision)
  const pendingReviewDays = days.filter(day => {
    const p = getProgressForDay(day.id);
    return p && !p.overallCompleted && p.submissionCompleted;
  });

  const stats = [
    { name: 'Active Streak', value: `${streakCount} Days`, icon: Zap, color: 'text-yellow-400' },
    { name: 'Completed Days', value: completedDays.toString(), icon: CheckCircle2, color: 'text-emerald-400' },
    { name: 'Next Unlock', value: nextLockedDay ? formatUnlockTime(nextLockedDay.unlockAt) : 'None', icon: Clock, color: 'text-blue-400' },
    { name: 'Overall Progress', value: `${overallProgress}%`, icon: Target, color: 'text-purple-400' },
  ];

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
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
          Welcome Back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-white/60">Here is your learning summary and upcoming tasks.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-[#121214] border-white/10 text-white shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/60">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Bar */}
      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Overall Progress</span>
            <span className="text-sm font-medium text-white">{completedDays}/{totalDays} days</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Day Card */}
          {activeDay ? (
            <Card className="bg-[#121214] border-white/10 text-white shadow-none ring-1 ring-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle size={18} className="text-blue-400" />
                  Up Next: {activeDay.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/60 text-sm mb-4">{activeDay.description || 'Continue your learning journey.'}</p>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/days/${activeDay.id}`}
                    className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                  >
                    <PlayCircle size={16} /> Start Learning
                  </Link>
                  {activeDay.deadlineAt && (
                    <span className="text-xs text-white/30 flex items-center gap-1">
                      <Clock size={12} /> Deadline: {(() => {
                        try {
                          const d = activeDay.deadlineAt.toDate ? activeDay.deadlineAt.toDate() : new Date(activeDay.deadlineAt);
                          return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                        } catch { return 'TBD'; }
                      })()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#121214] border-white/10 text-white shadow-none">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                <p className="text-white/60 text-sm">
                  {totalDays === 0 ? 'No learning days available yet. Check back soon!' : 'All available days completed! Great work!'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Roadmap Quick View */}
          <Card className="bg-[#121214] border-white/10 text-white shadow-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Roadmap</CardTitle>
              <Link href="/dashboard/days" className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {days.slice(0, 5).map((day) => {
                  const p = getProgressForDay(day.id);
                  const state = getDayState(day, p);
                  return (
                    <div key={day.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          state === 'COMPLETED' ? 'bg-emerald-500' :
                          state === 'ACTIVE' ? 'bg-blue-500' :
                          state === 'EXPIRED' ? 'bg-red-500' :
                          'bg-white/20'
                        }`} />
                        <span className={`text-sm ${state === 'LOCKED' ? 'text-white/30' : 'text-white/70'}`}>
                          {day.title}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        state === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        state === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400' :
                        state === 'EXPIRED' ? 'bg-red-500/10 text-red-400' :
                        'bg-white/5 text-white/30'
                      }`}>
                        {state === 'LOCKED' && <Lock size={10} className="inline mr-1" />}
                        {state.charAt(0) + state.slice(1).toLowerCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Announcements */}
          <Card className="bg-[#121214] border-white/10 text-white shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={16} /> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <div className="text-sm text-white/30 flex h-24 items-center justify-center border border-dashed border-white/10 rounded-lg">
                  No new announcements
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((ann) => (
                    <div key={ann.id} className="p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-white font-medium">{ann.title}</p>
                      <p className="text-xs text-white/40 mt-1">{ann.message}</p>
                      {ann.createdAt && (
                        <p className="text-xs text-white/20 mt-2">
                          {(() => {
                            try {
                              const d = ann.createdAt.toDate ? ann.createdAt.toDate() : new Date(ann.createdAt);
                              return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                            } catch { return ''; }
                          })()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
