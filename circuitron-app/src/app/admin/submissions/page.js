'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  CheckCircle2, XCircle, RotateCcw, Eye, ExternalLink,
  Loader2, Search, Filter, Image as ImageIcon, Video, Link as LinkIcon,
  ChevronDown, MessageSquare, X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { subscribeToSubmissions, subscribeToAllDays, subscribeToUsers, reviewSubmission } from '@/lib/db';

export default function AdminSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [days, setDays] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const unsub1 = subscribeToSubmissions({}, (data) => {
      setSubmissions(data);
      setLoading(false);
    });
    const unsub2 = subscribeToAllDays((data) => setDays(data));
    const unsub3 = subscribeToUsers((data) => setUsers(data));
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const getUserName = (userId) => {
    const u = users.find(u => u.id === userId);
    return u?.name || u?.participantId || userId;
  };

  const getParticipantId = (userId) => {
    const u = users.find(u => u.id === userId);
    return u?.participantId || '—';
  };

  const getDayTitle = (dayId) => {
    const d = days.find(d => d.id === dayId);
    return d?.title || dayId;
  };

  const handleReview = async (submissionId, status) => {
    setActionLoading(submissionId);
    try {
      await reviewSubmission(submissionId, {
        status,
        feedback: reviewFeedback,
        reviewedBy: user.uid,
      });
      setExpandedId(null);
      setReviewFeedback('');
    } catch (err) {
      console.error('Failed to review:', err);
    }
    setActionLoading(null);
  };

  // Filter submissions
  const filtered = submissions.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (dayFilter !== 'all' && s.dayId !== dayFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const userName = getUserName(s.userId).toLowerCase();
      const participantId = getParticipantId(s.userId).toLowerCase();
      if (!userName.includes(q) && !participantId.includes(q)) return false;
    }
    return true;
  });

  const pendingCount = submissions.filter(s => s.status === 'Pending Review' || s.status === 'pending_review' || s.status === 'submitted').length;
  const approvedCount = submissions.filter(s => s.status === 'Approved' || s.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'Needs Revision' || s.status === 'needs_revision' || s.status === 'rejected').length;

  const statusColors = {
    'Pending Review': 'bg-yellow-500/10 text-yellow-400',
    'pending_review': 'bg-yellow-500/10 text-yellow-400',
    'submitted': 'bg-yellow-500/10 text-yellow-400',
    'Approved': 'bg-emerald-500/10 text-emerald-400',
    'approved': 'bg-emerald-500/10 text-emerald-400',
    'Needs Revision': 'bg-red-500/10 text-red-400',
    'needs_revision': 'bg-red-500/10 text-red-400',
    'rejected': 'bg-red-500/10 text-red-400',
    'draft': 'bg-white/10 text-white/40',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Submissions & Reviews</h1>
        <p className="text-white/60">Review participant tasks and provide feedback.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
              <p className="text-xs text-white/40">Pending Review</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Loader2 size={18} className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-emerald-400">{approvedCount}</p>
              <p className="text-xs text-white/40">Approved</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
              <p className="text-xs text-white/40">Needs Revision</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <RotateCcw size={18} className="text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by participant name or ID..."
            className="bg-[#121214] border-white/10 text-white pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#121214] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="Pending Review">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Needs Revision">Needs Revision</option>
        </select>
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          className="bg-[#121214] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none"
        >
          <option value="all">All Days</option>
          {days.map(d => (
            <option key={d.id} value={d.id}>{d.title}</option>
          ))}
        </select>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-white/20" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-12 text-center">
            <p className="text-white/30 text-sm">No submissions found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <Card key={sub.id} className="bg-[#121214] border-white/10 text-white shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{getUserName(sub.userId)}</p>
                      <p className="text-xs text-white/40 font-mono">{getParticipantId(sub.userId)}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-white/50">{getDayTitle(sub.dayId)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[sub.status] || 'bg-white/10 text-white/40'}`}>
                      {sub.status}
                    </span>
                    <button
                      onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                      className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                    >
                      {expandedId === sub.id ? <X size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === sub.id && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                    {/* Files */}
                    {sub.files && sub.files.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-white/60 uppercase">Uploaded Files</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {sub.files.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              {file.type?.startsWith('image') ? <ImageIcon size={14} className="text-blue-400" /> :
                               file.type?.startsWith('video') ? <Video size={14} className="text-purple-400" /> :
                               <ExternalLink size={14} className="text-white/40" />}
                              <span className="text-xs text-white/70 truncate">{file.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {sub.links && Object.keys(sub.links).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-white/60 uppercase">External Links</p>
                        <div className="space-y-1">
                          {Object.entries(sub.links).map(([key, val]) => val && (
                            <a key={key} href={val} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300">
                              <LinkIcon size={12} /> {key}: {val}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {sub.notes && (
                      <div>
                        <p className="text-xs font-semibold text-white/60 uppercase mb-1">Notes</p>
                        <p className="text-sm text-white/70">{sub.notes}</p>
                      </div>
                    )}

                    {/* Review Actions */}
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/60 uppercase">Feedback</label>
                        <textarea
                          value={reviewFeedback}
                          onChange={(e) => setReviewFeedback(e.target.value)}
                          placeholder="Write feedback for the participant..."
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-md px-3 py-2 text-white text-sm min-h-[80px] focus:outline-none focus:border-white/30 resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReview(sub.id, 'Approved')}
                          disabled={actionLoading === sub.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                        >
                          {actionLoading === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={14} className="mr-1" />}
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReview(sub.id, 'Needs Revision')}
                          disabled={actionLoading === sub.id}
                          className="bg-red-600 hover:bg-red-700 text-white flex-1"
                        >
                          <RotateCcw size={14} className="mr-1" /> Request Revision
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
