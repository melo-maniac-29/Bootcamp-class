'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, PlayCircle, CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { subscribeToWeeks, subscribeToAllDays, subscribeToUserProgress, getDayState } from '@/lib/db';

export default function RoadmapPage() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState([]);
  const [days, setDays] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub1 = subscribeToWeeks((data) => setWeeks(data.filter(w => !w.deleted)));
    const unsub2 = subscribeToAllDays((data) => { setDays(data); setLoading(false); });
    const unsub3 = subscribeToUserProgress(user.uid, (data) => setProgress(data));
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user?.uid]);

  const getProgressForDay = (dayId) => progress.find(p => p.dayId === dayId);

  const formatDeadline = (deadlineAt) => {
    if (!deadlineAt) return '';
    try {
      const d = deadlineAt.toDate ? deadlineAt.toDate() : new Date(deadlineAt);
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const formatUnlock = (unlockAt) => {
    if (!unlockAt) return '';
    try {
      const d = unlockAt.toDate ? unlockAt.toDate() : new Date(unlockAt);
      const now = new Date();
      const diff = d - now;
      if (diff <= 0) return 'Available now';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours > 24) return `Unlocks in ${Math.floor(hours / 24)}d ${hours % 24}h`;
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `Unlocks in ${hours}h ${minutes}m`;
    } catch { return ''; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    );
  }

  // Group days by weekId
  const daysByWeek = {};
  days.forEach(day => {
    const wid = day.weekId || 'ungrouped';
    if (!daysByWeek[wid]) daysByWeek[wid] = [];
    daysByWeek[wid].push(day);
  });

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Learning Roadmap</h1>
        <p className="text-white/60">Follow the path to master embedded systems.</p>
      </div>

      {days.length === 0 ? (
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-12 text-center">
            <p className="text-white/30 text-sm">No learning days available yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {weeks.map((week) => {
            const weekDays = daysByWeek[week.id] || [];
            if (weekDays.length === 0) return null;

            return (
              <div key={week.id}>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  {week.title}
                </h2>

                <div className="relative border-l border-white/10 ml-3 pl-8 space-y-6">
                  {weekDays.map((day) => {
                    const p = getProgressForDay(day.id);
                    const state = getDayState(day, p);
                    const isLocked = state === 'LOCKED';
                    const isCompleted = state === 'COMPLETED';
                    const isActive = state === 'ACTIVE';
                    const isExpired = state === 'EXPIRED';

                    return (
                      <div key={day.id} className="relative">
                        {/* Timeline Node */}
                        <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-[#0A0A0A] flex items-center justify-center
                          ${isCompleted ? 'bg-emerald-500' :
                            isActive ? 'bg-blue-500' :
                            isExpired ? 'bg-red-500' : 'bg-[#27272A]'}
                        `}>
                          <div className="w-1.5 h-1.5 bg-[#0A0A0A] rounded-full" />
                        </div>

                        <Card className={`bg-[#121214] border-white/10 transition-colors shadow-none
                          ${isActive ? 'ring-1 ring-blue-500/50' : ''}
                          ${isLocked ? 'opacity-50' : 'hover:bg-[#1A1A1D]'}
                        `}>
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-base font-medium text-white mb-1">{day.title}</h3>
                                {day.description && (
                                  <p className="text-sm text-white/40 mb-2 line-clamp-1">{day.description}</p>
                                )}
                                <p className="text-xs text-white/30">
                                  {isCompleted ? '✓ Completed' :
                                   isActive ? `Deadline: ${formatDeadline(day.deadlineAt)}` :
                                   isExpired ? 'Deadline passed — Video still available' :
                                   formatUnlock(day.unlockAt)}
                                </p>
                              </div>

                              <div className="ml-4 shrink-0">
                                {isCompleted && <CheckCircle2 className="text-emerald-500" size={24} />}
                                {isLocked && <Lock className="text-white/30" size={24} />}
                                {isExpired && (
                                  <Link
                                    href={`/dashboard/days/${day.id}`}
                                    className="bg-white/10 text-white/60 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/20 transition-colors inline-flex items-center gap-1.5"
                                  >
                                    <AlertTriangle size={14} /> Review
                                  </Link>
                                )}
                                {isActive && (
                                  <Link
                                    href={`/dashboard/days/${day.id}`}
                                    className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                                  >
                                    <PlayCircle size={16} /> {p ? 'Resume' : 'Start'}
                                  </Link>
                                )}
                              </div>
                            </div>

                            {/* Progress indicators for active/completed days */}
                            {(isActive || isCompleted || isExpired) && p && (
                              <div className="flex gap-3 mt-3 pt-3 border-t border-white/5">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${p.videoCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                                  Video {p.videoCompleted ? '✓' : '○'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${p.quizCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                                  Quiz {p.quizCompleted ? '✓' : '○'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${p.submissionCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                                  Task {p.submissionCompleted ? '✓' : '○'}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
