'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getBootcamp, subscribeToSubmissions, subscribeToStudents, subscribeToTasks } from '@/lib/db';
import { 
  Users, 
  FileCheck, 
  Clock, 
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [bootcamp, setBootcamp] = useState(null);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
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
    return student ? (student.name || student.displayName || student.email) : 'Unknown Student';
  };

  const getTaskName = (taskId) => {
    const task = taskMap[taskId];
    return task ? task.title : 'Unknown Task';
  };

  const myStudentIds = students.map(s => s.uid || s.id);
  const mySubmissions = submissions.filter(s => myStudentIds.includes(s.studentId));
  const pendingSubmissions = mySubmissions.filter(s => s.status === 'pending');

  if (!bootcamp) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 shadow-lg flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-foreground shrink-0 border border-border">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
                Welcome, <span className="text-primary">{user?.displayName?.split(' ')[0]}</span>
              </h1>
              <p className="text-lg text-muted-foreground">Volunteer Dashboard • {bootcamp.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20 shrink-0">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">My Students</p>
              <h3 className="text-3xl font-bold text-foreground">{students.length}</h3>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center ring-1 ring-amber-500/20 shrink-0">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Pending Reviews</p>
              <h3 className="text-3xl font-bold text-foreground">{pendingSubmissions.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="text-primary" size={24} />
              Action Required
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : pendingSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
              <CheckCircle2 size={48} className="text-emerald-500 mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">You have no pending submissions to review. Great job staying on top of things!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.slice(0, 5).map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-secondary/30 border border-border rounded-2xl hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 border border-primary/20">
                      {getStudentName(sub.studentId).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-lg mb-1">{getStudentName(sub.studentId)}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-background border border-border px-2 py-1 rounded-md">
                          {sub.subtaskId ? <FileQuestion size={14} /> : <FileCheck size={14} />}
                          {sub.subtaskId ? `Subtask: ${sub.subtaskTitle || sub.subtaskId}` : getTaskName(sub.taskId)}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                          <Clock size={14} /> 
                          {sub.submittedAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href="/volunteer/submissions" 
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/20 shrink-0 group-hover:bg-primary/90"
                  >
                    Review <ArrowRight size={16} />
                  </Link>
                </motion.div>
              ))}

              {pendingSubmissions.length > 5 && (
                <div className="pt-4 text-center">
                  <Link 
                    href="/volunteer/submissions" 
                    className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg"
                  >
                    View all {pendingSubmissions.length} pending submissions <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
