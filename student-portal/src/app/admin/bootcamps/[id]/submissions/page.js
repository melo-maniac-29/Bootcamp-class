'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getBootcamp, subscribeToSubmissions, subscribeToStudents, subscribeToTasks, reviewSubmission } from '@/lib/db';
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
  AlertCircle,
  Inbox
} from 'lucide-react';

export default function SubmissionsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [bootcamp, setBootcamp] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const [customPoints, setCustomPoints] = useState({});
  const [rejectingId, setRejectingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBc = async () => {
      const bc = await getBootcamp(id);
      if (bc) setBootcamp(bc);
    };
    loadBc();

    const unsubSubs = subscribeToSubmissions(id, (allSubs) => {
      setSubmissions(allSubs);
      setLoading(false);
    });
    const unsubStudents = subscribeToStudents(id, (data) => setStudents(data));
    const unsubTasks = subscribeToTasks(id, (data) => setTasks(data));

    return () => {
      unsubSubs();
      unsubStudents();
      unsubTasks();
    };
  }, [id]);

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

      await reviewSubmission(id, sub.id, payload);
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
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  const filteredSubs = filter === 'all'
    ? submissions
    : submissions.filter(s => s.status === filter);

  // Group filtered submissions by student
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

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <span className="bg-secondary text-foreground border border-border px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Approved</span>;
      case 'rejected':
        return <span className="bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Rejected</span>;
      default:
        return <span className="bg-secondary text-muted-foreground border border-border px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Pending</span>;
    }
  };

  return (
    <div className="max-w-[80rem] mx-auto pb-16 pt-4 px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <button 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group w-fit"
            onClick={() => router.push(`/admin/bootcamps/${id}`)}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Inbox className="text-muted-foreground" size={28} />
            Submissions Manager
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Review all student submissions across {bootcamp.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-border pb-4">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 text-sm ${
              filter === f 
                ? 'bg-secondary text-foreground' 
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={`px-2 py-0.5 rounded text-xs ${
              filter === f ? 'bg-background border border-border' : 'bg-transparent'
            }`}>
              {f === 'all' ? submissions.length : submissions.filter(s => s.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
          </div>
        ) : groupedSubmissions.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground border border-border">
              <Inbox size={28} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">No {filter} submissions</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {filter === 'pending' ? 'All caught up! There are no submissions waiting for review.' : `There are no ${filter} submissions right now.`}
            </p>
          </div>
        ) : (
          groupedSubmissions.map((group, i) => (
            <motion.div
              key={group.studentId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
            >
              <div
                onClick={() => setExpandedStudentId(prev => prev === group.studentId ? null : group.studentId)}
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold text-sm border border-border shrink-0">
                    {group.initial}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      {group.studentName}
                    </h3>
                    <div className="text-sm text-muted-foreground font-medium">
                      {group.items.length} {group.items.length === 1 ? 'Submission' : 'Submissions'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ChevronDown 
                    size={20} 
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
                    className="overflow-hidden border-t border-border bg-secondary/10"
                  >
                    <div className="p-5 space-y-4">
                      {group.items.map(sub => (
                        <div key={sub.id} className="bg-background border border-border rounded-xl p-5 shadow-sm">
                          
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div>
                              <h4 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
                                {sub.subtaskId ? <FileQuestion size={16} className="text-muted-foreground" /> : <FileCheck size={16} className="text-muted-foreground" />}
                                {sub.subtaskId ? `Subtask: ${sub.subtaskTitle || sub.subtaskId}` : getTaskName(sub.taskId)}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <Clock size={12} /> 
                                {sub.submittedAt?.toDate?.()?.toLocaleString() || 'N/A'}
                              </div>
                            </div>
                            <div>
                              {getStatusBadge(sub.status)}
                            </div>
                          </div>
                          
                          <div className="bg-secondary/30 border border-border rounded-lg p-4 mb-4">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Student Submission</div>
                            {['link', 'video', 'image'].includes(sub.type) ? (
                              <div className="flex justify-center py-4">
                                <a 
                                  href={sub.content} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="flex items-center gap-2 bg-secondary border border-border text-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors text-sm"
                                >
                                  View Attached Resource <ExternalLink size={14} />
                                </a>
                              </div>
                            ) : sub.type === 'code' ? (
                              <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto font-mono text-sm border border-zinc-800">
                                <code>{sub.content}</code>
                              </pre>
                            ) : (
                              <p className="text-foreground whitespace-pre-wrap text-sm">
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
                            <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-4">
                              <div className="flex items-center gap-2 text-foreground font-semibold mb-1 text-sm">
                                <MessageSquare size={14} /> 
                                Your Review Feedback
                              </div>
                              <p className="text-muted-foreground text-sm">{sub.reviewerNote}</p>
                            </div>
                          )}

                          {sub.status === 'pending' && (
                            <div className="bg-secondary/20 border border-border rounded-lg p-4 mt-4">
                              <div className="mb-4">
                                <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                                  <MessageSquare size={14} />
                                  Feedback Note <span className="text-xs font-normal text-muted-foreground">(Visible to Student)</span>
                                </label>
                                <textarea
                                  className="w-full bg-background border border-border rounded-lg p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-muted-foreground min-h-[80px] resize-none"
                                  value={getDraftNote(sub)}
                                  onChange={(e) => setDraftNote(sub.id, e.target.value)}
                                  placeholder="Add constructive feedback..."
                                />
                              </div>

                              {rejectingId === sub.id ? (
                                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                                  <div className="flex items-center gap-2 text-destructive font-semibold mb-2 text-sm">
                                    <AlertCircle size={16} />
                                    Confirm Rejection
                                  </div>
                                  <p className="text-xs text-destructive/80 mb-4">Are you sure you want to reject this submission? Make sure you have provided a feedback note explaining why.</p>
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors border border-transparent hover:border-border" 
                                      onClick={() => setRejectingId(null)}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-destructive/90 transition-colors disabled:opacity-50"
                                      onClick={() => {
                                        handleStatusUpdate(sub, 'rejected', 0, getDraftNote(sub));
                                        setRejectingId(null);
                                      }}
                                      disabled={processingId === sub.id}
                                    >
                                      <X size={14} /> {processingId === sub.id ? 'Processing...' : 'Confirm'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border">
                                  <button
                                    className="text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                                    onClick={() => setRejectingId(sub.id)}
                                    disabled={processingId === sub.id}
                                  >
                                    <X size={14} /> Reject
                                  </button>

                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded-md">
                                      <span className="text-xs text-muted-foreground font-medium">Pts:</span>
                                      <input
                                        type="number"
                                        min="0"
                                        max={getMaxPoints(sub)}
                                        value={customPoints[sub.id] !== undefined ? customPoints[sub.id] : getMaxPoints(sub)}
                                        onChange={(e) => {
                                          const val = Math.min(Math.max(0, parseInt(e.target.value) || 0), getMaxPoints(sub));
                                          setCustomPoints(prev => ({ ...prev, [sub.id]: val }));
                                        }}
                                        className="w-12 bg-secondary text-foreground text-center rounded px-1 py-0.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-muted-foreground"
                                      />
                                      <span className="text-xs text-muted-foreground font-medium">/ {getMaxPoints(sub)}</span>
                                    </div>

                                    <button
                                      className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                                      onClick={() => {
                                        const pts = customPoints[sub.id] !== undefined ? customPoints[sub.id] : getMaxPoints(sub);
                                        handleStatusUpdate(sub, 'approved', pts, getDraftNote(sub));
                                      }}
                                      disabled={processingId === sub.id}
                                    >
                                      <Check size={14} /> {processingId === sub.id ? 'Saving...' : 'Approve'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {sub.status !== 'pending' && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                                <MessageSquare size={14} />
                                Update Feedback Note
                              </label>
                              <div className="flex gap-2">
                                <input
                                  className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-muted-foreground"
                                  value={getDraftNote(sub)}
                                  onChange={(e) => setDraftNote(sub.id, e.target.value)}
                                  placeholder="Update note without changing status..."
                                />
                                <button
                                  className="bg-secondary hover:bg-secondary/80 text-foreground border border-border px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
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