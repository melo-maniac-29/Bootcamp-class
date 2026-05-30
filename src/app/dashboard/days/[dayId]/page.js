"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function DayViewerPage() {
  const params = useParams();
  const dayId = params.dayId;
  
  const day = useQuery(api.content.getDay, { dayId });
  const quiz = useQuery(api.content.getQuiz, { dayId });
  const submitTask = useMutation(api.submissions.submitTask);
  
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasTask && !link.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitTask({ dayId, link: hasTask ? link.trim() : undefined });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    return match ? match[1] : null;
  };



  if (day === undefined || quiz === undefined) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase animate-pulse">LOADING_NODE...</p>
    </div>
  );
  if (!day) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase">NODE_NOT_FOUND</p>
    </div>
  );

  const now = Date.now();
  const isLockedBefore = day.unlockAt && now < day.unlockAt;
  const isLockedAfter = day.lateDeadlineAt && now > day.lateDeadlineAt;
  const isLateGrace = day.deadlineAt && day.lateDeadlineAt && now > day.deadlineAt && now <= day.lateDeadlineAt;
  
  const videoId = getYouTubeId(day.videoUrl);
  const hasQuiz = quiz && quiz.questions && quiz.questions.length > 0;
  const hasTask = !!day.taskDescription;

  if (isLockedBefore) {
    // REMOVED FULL PAGE LOCK: Allows students to view videos and descriptions early.
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto"
    >
      <Link
        href="/dashboard/days"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors mb-8"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        BACK_TO_ROADMAP
      </Link>

      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3">
            NODE_{String(day.order || 0).padStart(2, "0")} // ACTIVE
          </p>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white leading-none">
            {day.title}.
          </h1>
        </div>
        
        <div className="flex gap-2">
          {isLateGrace && (
            <span className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-orange-500/30 text-orange-600 bg-orange-500/10">LATE_SUBMISSION_PERIOD</span>
          )}
          {isLockedAfter && (
            <span className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-red-500/30 text-red-600 bg-red-500/10">SUBMISSIONS_CLOSED</span>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 ${hasTask ? 'lg:grid-cols-3' : ''} gap-8`}>
        <div className={`${hasTask ? 'lg:col-span-2' : ''} space-y-6`}>
          {videoId && (
            <div className="aspect-video rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={day.videoTitle || day.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}


          {day.description && (
            <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-6 bg-[#F8F9FA] dark:bg-[#111111]">
              <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-4">LESSON_BRIEF</p>
              <p className="font-mono text-sm text-black/60 dark:text-white/60 leading-relaxed whitespace-pre-wrap">{day.description}</p>
            </div>
          )}

          {day.taskDescription && (
            <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-6 bg-[#F8F9FA] dark:bg-[#111111]">
              <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-4">TASK_BRIEF</p>
              <p className="font-mono text-sm text-black/60 dark:text-white/60 leading-relaxed whitespace-pre-wrap">{day.taskDescription}</p>
            </div>
          )}

          {hasQuiz && !isLockedBefore && (
            <Link
              href={`/dashboard/days/${dayId}/quiz`}
              className="flex items-center justify-between p-5 border border-black/[0.08] dark:border-white/[0.08] rounded-xl bg-white dark:bg-[#0a0a0a] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all group"
            >
              <div>
                <p className="font-mono text-[9px] tracking-[0.3em] text-black/30 dark:text-white/30 group-hover:text-white/50 dark:group-hover:text-black/50 uppercase mb-1 transition-colors">
                  KNOWLEDGE_CHECK
                </p>
                <p className="font-mono text-sm font-bold uppercase tracking-wider text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">
                  Take the Quiz →
                </p>
              </div>
              <svg className="w-4 h-4 text-black/30 dark:text-white/30 group-hover:text-white dark:group-hover:text-black group-hover:translate-x-1 transition-all" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </div>

        <div>
          <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-6 bg-[#F8F9FA] dark:bg-[#111111] sticky top-24">
            <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-2">
              {hasTask ? "TASK_SUBMISSION" : "NODE_COMPLETION"}
            </p>
            <h2 className="font-display font-black text-xl tracking-tight uppercase text-black dark:text-white mb-6">
              {hasTask ? "Submit Work." : "Complete Node."}
            </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 border border-green-200 bg-green-50 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-green-600 shrink-0" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-green-700">SUBMITTED</p>
                  </div>
                  <p className="font-mono text-xs text-green-600">Your work is pending admin review.</p>
                </motion.div>
              ) : isLockedBefore ? (
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                  <p className="font-mono text-xs text-blue-600 font-bold uppercase mb-1">UPCOMING</p>
                  <p className="font-mono text-[10px] text-blue-600/80 uppercase">Submissions will unlock at {new Date(day.unlockAt).toLocaleString()}.</p>
                </div>
              ) : isLockedAfter ? (
                <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                  <p className="font-mono text-xs text-red-600 font-bold uppercase mb-1">LOCKED</p>
                  <p className="font-mono text-[10px] text-red-600/80 uppercase">Submissions are now closed for this node.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {hasTask ? (
                    <>
                      <p className="font-mono text-xs text-black/40 dark:text-white/40 leading-relaxed">
                        Paste your GitHub / live project link to submit today's task.
                      </p>
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        required
                        placeholder="https://github.com/your/repo"
                        className="w-full border border-black/[0.12] dark:border-white/[0.12] rounded-lg px-4 py-3 font-mono text-sm outline-none focus:border-black dark:focus:border-white transition-colors bg-white dark:bg-[#0a0a0a] placeholder:text-black/20 dark:placeholder:text-white/20 text-black dark:text-white"
                      />
                    </>
                  ) : (
                    <p className="font-mono text-xs text-black/40 dark:text-white/40 leading-relaxed">
                      Mark this node as complete to claim your points.
                    </p>
                  )}
                  {submitError && (
                    <p className="font-mono text-[10px] text-red-500 uppercase tracking-wider">{submitError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-black dark:bg-white text-white dark:text-black font-mono text-[10px] uppercase tracking-wider rounded-lg py-3 hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "PROCESSING..." : hasTask ? "SUBMIT_TASK" : "MARK_COMPLETE"}
                  </button>
                </form>
              )}
            </div>
          </div>
      </div>
    </motion.div>
  );
}
