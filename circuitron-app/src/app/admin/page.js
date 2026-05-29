'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import {
  Users, CheckCircle, Clock, BarChart3, Zap, 
  ArrowRight, Bell, CalendarDays, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { subscribeToUsers, subscribeToSubmissions, subscribeToAllDays, subscribeToAnnouncements } from '@/lib/db';

export default function AdminOverview() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [days, setDays] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub1 = subscribeToUsers((data) => {
      setUsers(data.filter(u => !u.deleted));
      setLoading(false);
    });
    const unsub2 = subscribeToSubmissions({}, (data) => setSubmissions(data));
    const unsub3 = subscribeToAllDays((data) => setDays(data));
    const unsub4 = subscribeToAnnouncements((data) => setAnnouncements(data));
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, []);

  const studentCount = users.filter(u => u.role === 'student').length;
  const activeToday = users.filter(u => {
    if (!u.lastActiveDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return u.lastActiveDate === today;
  }).length;
  const pendingReviews = submissions.filter(s =>
    s.status === 'Pending Review' || s.status === 'pending_review' || s.status === 'submitted'
  ).length;
  const approvedSubmissions = submissions.filter(s =>
    s.status === 'Approved' || s.status === 'approved'
  ).length;
  const completionRate = submissions.length > 0
    ? Math.round((approvedSubmissions / submissions.length) * 100)
    : 0;

  // Recent submissions (last 5)
  const recentSubmissions = submissions.slice(0, 5);

  const getUserName = (userId) => {
    const u = users.find(u => u.id === userId);
    return u?.name || u?.participantId || 'Unknown';
  };

  const getDayTitle = (dayId) => {
    const d = days.find(d => d.id === dayId);
    return d?.title || dayId;
  };

  const stats = [
    { name: 'Total Participants', value: studentCount.toString(), icon: Users, color: 'text-blue-400', href: '/admin/users' },
    { name: 'Active Today', value: activeToday.toString(), icon: Zap, color: 'text-emerald-400', href: '/admin/analytics' },
    { name: 'Pending Reviews', value: pendingReviews.toString(), icon: Clock, color: 'text-yellow-400', href: '/admin/submissions' },
    { name: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle, color: 'text-purple-400', href: '/admin/analytics' },
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
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Overview</h1>
        <p className="text-white/60">Welcome to the Circuitron admin command center.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="bg-[#121214] border-white/10 text-white shadow-none hover:bg-[#1A1A1D] transition-colors cursor-pointer">
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
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Submissions</CardTitle>
            <Link href="/admin/submissions" className="text-xs text-white/40 hover:text-white flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <div className="text-sm text-white/30 flex h-32 items-center justify-center border border-dashed border-white/10 rounded-lg">
                No submissions yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm text-white">{getUserName(sub.userId)}</p>
                      <p className="text-xs text-white/40">{getDayTitle(sub.dayId)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      sub.status === 'Approved' || sub.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : sub.status === 'Needs Revision' || sub.status === 'needs_revision'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardHeader>
            <CardTitle>Platform Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <CalendarDays size={14} /> Total Days
              </div>
              <span className="text-sm font-medium text-white">{days.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <BarChart3 size={14} /> Total Submissions
              </div>
              <span className="text-sm font-medium text-white">{submissions.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Bell size={14} /> Announcements
              </div>
              <span className="text-sm font-medium text-white">{announcements.length}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Users size={14} /> Pending Setup
              </div>
              <span className="text-sm font-medium text-white">
                {users.filter(u => u.firstLogin).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
