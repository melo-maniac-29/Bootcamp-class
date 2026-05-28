'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getBootcamp, subscribeToSubmissions, subscribeToStudents, subscribeToTasks, reviewSubmission } from '@/lib/db';
import SocietyBackground from '@/components/backgrounds/SocietyBackground';
import SubmissionAssistantPanel from '@/components/submissions/SubmissionAssistantPanel';
import {
  ArrowLeft,
  Check,
  X,
  FileCheck,
  Clock,
  ExternalLink,
  ChevronDown,
  MessageSquare,
  FileQuestion,
  User,
  AlertCircle,
  Inbox
} from 'lucide-react';
import Link from 'next/link';

export default function VolunteerSubmissions() {
  const { user } = useAuth();
  const [bootcamp, setBootcamp] = useState(null);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const [customPoints, setCustomPoints] = useState({});
  const [rejectingId, setRejectingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.bootcampId) return;

    const loadBc = async () => {
      const bc = await getBootcamp(user.bootcampId);
      if (bc) setBootcamp(bc);
    };
    loadBc();

    const unsubStudents = subscribeToStudents(user.bootcampId, (allStudents) => {
      setStudents(allStudents.filter(s => s.volunteerId === user.uid));
    });

    const unsubSubs = subscribeToSubmissions(user.bootcampId, (allSubs) => {
      setSubmissions(allSubs);
      setLoading(false);
    });

    const unsubTasks = subscribeToTasks(user.bootcampId, (data) => setTasks(data));

    return () => {
      unsubStudents();
      unsubSubs();
      unsubTasks();
    };
  }, [user]);

  const studentMap = {};
  students.forEach(s => { studentMap[s.uid || s.id] = s; });

  const taskMap = {};
  tasks.forEach(t => { taskMap[t.id] = t; });

  const getStudentName = (studentId) => {
    const student = studentMap[studentId];
    if (student) return student.name || student.displayName || student.email || 'Unknown Student';
    return 'Unknown Student';
  };

  const getStudentInitial = (studentId) => {
    const name = getStudentName(studentId);
    return name.charAt(0).toUpperCase();
  };

  const getTaskName = (taskId) => {
    const task = taskMap[taskId];
    if (task) return task.title || 'Untitled Task';
    return 'Unknown Task';
  };

  const getMaxPoints = (sub) => {
    return sub.points !== undefined ? sub.points : (taskMap[sub.taskId]?.points || 10);
  };

  const myStudentIds = students.map(s => s.uid || s.id);
  const mySubmissions = submissions.filter(s => myStudentIds.includes(s.studentId));

  const filteredSubs = filter === 'all'
    ? mySubmissions
    : mySubmissions.filter(s => s.status === filter);

  const groupedSubmissions = Object.values(filteredSubs.reduce((acc, sub) => {
    if (!acc[sub.studentId]) {
      acc[sub.studentId] = {
        studentId: sub.studentId,
        studentName: getStudentName(sub.studentId),
        initial: getStudentInitial(sub.studentId),
        items: []
      };
    }
    acc[sub.studentId].items.push(sub);
    return acc;
  }, {}));

  const handleStatusUpdate = async (sub, newStatus, awardedPoints = 0, reviewerNote = null) => {
    if (processingId) return;
    setProcessingId(sub.id);

    try {
      const payload = {
        status: newStatus,
        pointsAwarded: newStatus === 'approved' ? awardedPoints : 0
      };

      if (reviewerNote !== null) {
        payload.reviewerNote = reviewerNote;
      }

      await reviewSubmission(user.bootcampId, sub.id, payload);
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const setDraftNote = (submissionId, note) => {
    setReviewNotes(prev => ({ ...prev, [submissionId]: note }));
  };

  const getDraftNote = (sub) => reviewNotes[sub.id] ?? sub.reviewerNote ?? '';

  if (!bootcamp) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Approved</span>;
      case 'rejected':
        return <span className="bg-destructive/10 text-destructive border border-destructive/20 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Rejected</span>;
      default:
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Pending</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <Link 
            href="/volunteer"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group w-fit"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Inbox className="text-primary" size={32} />
            Submissions Review
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Evaluate and grade tasks submitted by your students</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-2 mb-8 flex flex-wrap gap-2 shadow-sm">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              filter === f 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === f ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
              {f === 'all' ? mySubmissions.length : mySubmissions.filter(s => s.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : groupedSubmissions.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <Inbox size={40} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No {filter} submissions</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {filter === 'pending' ? 'All caught up! There are no submissions waiting for your review.' : `You don't have any ${filter} submissions right now.`}
            </p>
          </div>
        ) : (
          groupedSubmissions.map((group, i) => (
            <motion.div
              key={group.studentId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
            >
              <div
                onClick={() => setExpandedStudentId(prev => prev === group.studentId ? null : group.studentId)}
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shrink-0">
                    {group.initial}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      {group.studentName}
                    </h3>
                    <div className="text-sm text-muted-foreground font-medium">
                      {group.items.length} {group.items.length === 1 ? 'Submission' : 'Submissions'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ChevronDown 
                    size={24} 
                    className={`text-muted-foreground transition-transform duration-300 ${expandedStudentId === group.studentId ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>

              <AnimatePresence>
                {expandedStudentId === group.studentId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border/50 bg-secondary/10"
                  >
                    <div className="p-5 space-y-6">
                      {group.items.map(sub => (
                        <div key={sub.id} className="bg-background border border-border rounded-2xl p-5 shadow-sm">
                          
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                                {sub.subtaskId ? <FileQuestion size={18} className="text-primary" /> : <FileCheck size={18} className="text-primary" />}
                                {sub.subtaskId ? `Subtask: ${sub.subtaskTitle || sub.subtaskId}` : getTaskName(sub.taskId)}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                <Clock size={14} /> 
                                {sub.submittedAt?.toDate?.()?.toLocaleString() || 'N/A'}
                              </div>
                            </div>
                            <div>
                              {getStatusBadge(sub.status)}
                            </div>
                          </div>
                          
                          <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-4">
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Student Submission</div>
                            {['link', 'video', 'image'].includes(sub.type) ? (
                              <div className="flex justify-center py-4">
                                <a 
                                  href={sub.content} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-105 active:scale-95"
                                >
                                  View Attached Resource <ExternalLink size={18} />
                                </a>
                              </div>
                            ) : sub.type === 'code' ? (
                              <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg overflow-x-auto font-mono text-sm border border-zinc-800">
                                <code>{sub.content}</code>
                              </pre>
                            ) : (
                              <p className="text-foreground whitespace-pre-wrap">
                                {Array.isArray(sub.content) ? sub.content.join(', ') : sub.content}
                              </p>
                            )}
                          </div>

                          <div className="mb-4">
                            <SubmissionAssistantPanel
                              submission={sub}
                              maxPoints={getMaxPoints(sub)}
                              onUseFeedback={(note) => setDraftNote(sub.id, note)}
                              onUsePoints={(points) => setCustomPoints(prev => ({ ...prev, [sub.id]: points }))}
                            />
                          </div>

                          {sub.reviewerNote && sub.status !== 'pending' && (
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                                <MessageSquare size={16} /> 
                                Your Review Feedback
                              </div>
                              <p className="text-foreground text-sm">{sub.reviewerNote}</p>
                            </div>
                          )}

                          {sub.status === 'pending' && (
                            <div className="bg-secondary/50 border border-border rounded-xl p-5 mt-6">
                              <div className="mb-4">
                                <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                                  <MessageSquare size={16} />
                                  Feedback Note (Visible to Student)
                                </label>
                                <textarea
                                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                                  value={getDraftNote(sub)}
                                  onChange={(e) => setDraftNote(sub.id, e.target.value)}
                                  placeholder="Add constructive feedback, great job notes, or reasons for rejection..."
                                />
                              </div>

                              {rejectingId === sub.id ? (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                                  <div className="flex items-center gap-2 text-destructive font-bold mb-2">
                                    <AlertCircle size={18} />
                                    Confirm Rejection
                                  </div>
                                  <p className="text-sm text-destructive/80 mb-4">Are you sure you want to reject this submission? Make sure you have provided a feedback note explaining why.</p>
                                  <div className="flex justify-end gap-3">
                                    <button 
                                      className="px-4 py-2 font-medium text-foreground hover:bg-secondary rounded-lg transition-colors" 
                                      onClick={() => setRejectingId(null)}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-destructive/90 transition-colors disabled:opacity-50"
                                      onClick={() => {
                                        handleStatusUpdate(sub, 'rejected', 0, getDraftNote(sub));
                                        setRejectingId(null);
                                      }}
                                      disabled={processingId === sub.id}
                                    >
                                      <X size={16} /> {processingId === sub.id ? 'Processing...' : 'Confirm Reject'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                  <button
                                    className="bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                                    onClick={() => setRejectingId(sub.id)}
                                    disabled={processingId === sub.id}
                                  >
                                    <X size={18} /> Reject
                                  </button>

                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-lg">
                                      <span className="text-sm text-muted-foreground font-medium">Points:</span>
                                      <input
                                        type="number"
                                        min="0"
                                        max={getMaxPoints(sub)}
                                        value={customPoints[sub.id] !== undefined ? customPoints[sub.id] : getMaxPoints(sub)}
                                        onChange={(e) => {
                                          const val = Math.min(Math.max(0, parseInt(e.target.value) || 0), getMaxPoints(sub));
                                          setCustomPoints(prev => ({ ...prev, [sub.id]: val }));
                                        }}
                                        className="w-16 bg-secondary text-foreground text-center rounded px-1 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                      />
                                      <span className="text-sm text-muted-foreground font-bold">/ {getMaxPoints(sub)}</span>
                                    </div>

                                    <button
                                      className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                      onClick={() => {
                                        const pts = customPoints[sub.id] !== undefined ? customPoints[sub.id] : getMaxPoints(sub);
                                        handleStatusUpdate(sub, 'approved', pts, getDraftNote(sub));
                                      }}
                                      disabled={processingId === sub.id}
                                    >
                                      <Check size={18} /> {processingId === sub.id ? 'Saving...' : 'Approve'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {sub.status !== 'pending' && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                                <MessageSquare size={16} />
                                Update Feedback Note
                              </label>
                              <div className="flex gap-2">
                                <input
                                  className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  value={getDraftNote(sub)}
                                  onChange={(e) => setDraftNote(sub.id, e.target.value)}
                                  placeholder="Update note without changing status..."
                                />
                                <button
                                  className="bg-secondary hover:bg-secondary/80 text-foreground border border-border px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
                                  onClick={() => handleStatusUpdate(sub, sub.status, sub.pointsAwarded || 0, getDraftNote(sub))}
                                  disabled={processingId === sub.id || !getDraftNote(sub).trim()}
                                >
                                  {processingId === sub.id ? 'Saving...' : 'Update Review'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}