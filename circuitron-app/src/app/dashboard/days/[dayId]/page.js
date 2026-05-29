'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Video, HelpCircle, FileUp, ExternalLink, Lock, CheckCircle2,
  AlertTriangle, Loader2, ArrowLeft, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { getDay, getUserProgress, getDayState, updateUserProgress } from '@/lib/db';
import YouTubePlayer from '@/components/learning/YouTubePlayer';
import QuizEngine from '@/components/learning/QuizEngine';
import TaskSubmission from '@/components/learning/TaskSubmission';

export default function DailyLearningWorkspace({ params }) {
  const resolvedParams = use(params);
  const { dayId } = resolvedParams;
  const { user } = useAuth();
  const router = useRouter();
  const [day, setDay] = useState(null);
  const [progress, setProgress] = useState(null);
  const [dayState, setDayState] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!dayId || !user?.uid) return;
      try {
        const [dayData, progressData] = await Promise.all([
          getDay(dayId),
          getUserProgress(user.uid, dayId),
        ]);

        if (!dayData) {
          router.push('/dashboard/days');
          return;
        }

        setDay(dayData);
        setProgress(progressData);
        setDayState(getDayState(dayData, progressData));
      } catch (err) {
        console.error('Failed to load day:', err);
      }
      setLoading(false);
    };
    load();
  }, [dayId, user?.uid]);

  const refreshProgress = async () => {
    if (!user?.uid || !dayId) return;
    const p = await getUserProgress(user.uid, dayId);
    setProgress(p);
    if (day) setDayState(getDayState(day, p));
  };

  const handleVideoComplete = () => {
    refreshProgress();
  };

  const handleQuizComplete = () => {
    refreshProgress();
  };

  const handleTaskComplete = () => {
    refreshProgress();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (!day) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/30 text-sm">Day not found.</p>
      </div>
    );
  }

  const isLocked = dayState === 'LOCKED';
  const isExpired = dayState === 'EXPIRED';
  const isCompleted = dayState === 'COMPLETED';

  // LOCKED STATE
  if (isLocked) {
    const unlockTime = (() => {
      if (!day.unlockAt) return 'soon';
      try {
        const d = day.unlockAt.toDate ? day.unlockAt.toDate() : new Date(day.unlockAt);
        return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch { return 'soon'; }
    })();

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Link href="/dashboard/days" className="text-white/40 hover:text-white transition-colors text-sm inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Roadmap
        </Link>
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-12 text-center">
            <Lock size={48} className="text-white/15 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">{day.title}</h2>
            <p className="text-sm text-white/40 mb-4">This day hasn&apos;t unlocked yet.</p>
            <p className="text-xs text-white/30">Unlocks: {unlockTime}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'video', label: 'Video', icon: Video, done: progress?.videoCompleted },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, done: progress?.quizCompleted },
    { id: 'task', label: 'Task', icon: FileUp, done: progress?.submissionCompleted },
    { id: 'references', label: 'References', icon: BookOpen, done: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/days" className="text-white/40 hover:text-white transition-colors text-sm inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{day.title}</h1>
          {day.description && <p className="text-sm text-white/40 mt-0.5">{day.description}</p>}
        </div>
        {isCompleted && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full">
            <CheckCircle2 size={14} /> Completed
          </span>
        )}
        {isExpired && (
          <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium bg-red-500/10 px-3 py-1.5 rounded-full">
            <AlertTriangle size={14} /> Deadline Passed
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {tabs.slice(0, 3).map(tab => (
          <div key={tab.id} className="flex-1">
            <div className={`h-1.5 rounded-full ${tab.done ? 'bg-emerald-500' : 'bg-white/10'}`} />
            <p className={`text-xs mt-1 ${tab.done ? 'text-emerald-400' : 'text-white/30'}`}>
              {tab.done ? '✓' : '○'} {tab.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#121214] p-1 rounded-lg border border-white/10 w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.done && <CheckCircle2 size={12} className="text-emerald-400" />}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="mt-4">
        {activeTab === 'video' && (
          <YouTubePlayer
            videoUrl={day.videoUrl}
            dayId={dayId}
            userId={user?.uid}
            onComplete={handleVideoComplete}
          />
        )}

        {activeTab === 'quiz' && (
          <>
            {isExpired && !progress?.quizCompleted ? (
              <Card className="bg-[#121214] border-white/10 text-white shadow-none">
                <CardContent className="p-8 text-center">
                  <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-white mb-1">Quiz Deadline Passed</h3>
                  <p className="text-sm text-white/40">The quiz is no longer available for this day.</p>
                </CardContent>
              </Card>
            ) : (
              <QuizEngine
                dayId={dayId}
                userId={user?.uid}
                onComplete={handleQuizComplete}
              />
            )}
          </>
        )}

        {activeTab === 'task' && (
          <TaskSubmission
            dayId={dayId}
            userId={user?.uid}
            taskDescription={day.taskDescription}
            taskRequirements={day.taskRequirements}
            isExpired={isExpired && !progress?.submissionCompleted}
            onComplete={handleTaskComplete}
          />
        )}

        {activeTab === 'references' && (
          <Card className="bg-[#121214] border-white/10 text-white shadow-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen size={18} /> Reference Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!day.references || day.references.length === 0) ? (
                <p className="text-sm text-white/30 text-center py-8">No references available for this day.</p>
              ) : (
                <ul className="space-y-3">
                  {day.references.map((ref, idx) => (
                    <li key={idx}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <ExternalLink size={16} className="text-blue-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white group-hover:text-blue-400 transition-colors">{ref.title || ref.url}</p>
                          <p className="text-xs text-white/30 truncate">{ref.url}</p>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
