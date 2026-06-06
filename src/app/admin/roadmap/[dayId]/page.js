"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LinkifiedText from "@/components/LinkifiedText";

function StarRating({ rating, onRate }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          className={`focus:outline-none transition-colors ${
            star <= (rating || 0)
              ? "text-yellow-500 dark:text-yellow-400"
              : "text-black/10 dark:text-white/20 hover:text-yellow-500/50 dark:hover:text-yellow-400/50"
          }`}
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function DayViewerPage() {
  const params = useParams();
  const dayId = params.dayId;
  
  const currentUser = useQuery(api.users.current);
  const day = useQuery(api.content.getDay, { dayId });
  const quiz = useQuery(api.content.getQuiz, { dayId });
  const progress = useQuery(api.content.getDayProgress, { dayId });
  const submission = useQuery(api.submissions.getSubmission, { dayId });
  const submitTask = useMutation(api.submissions.submitTask);
  
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState("");
  const [studentRating, setStudentRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasTask && !link.trim()) return;
    
    if (day.feedbackEnabled) {
      setShowFeedback(true);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitTask({ dayId, link: hasTask ? link.trim() : undefined });
      setShowFeedback(false);
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



  if (day === undefined || quiz === undefined || submission === undefined) return (
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
        href="/admin/roadmap"
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

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Video */}
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

            {/* 3. Lesson Brief */}
            {day.description && (
              <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-6 bg-[#F8F9FA] dark:bg-[#111111]">
                <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-4">LESSON_BRIEF</p>
                <p className="font-mono text-sm text-black/60 dark:text-white/60 leading-relaxed whitespace-pre-wrap">
                  <LinkifiedText>{day.description}</LinkifiedText>
                </p>
              </div>
            )}

            {/* 4. References */}
            {day.references && day.references.length > 0 && (
              <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-6 bg-[#F8F9FA] dark:bg-[#111111]">
                <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-4">REFERENCES</p>
                <ul className="space-y-2">
                  {day.references.map((ref, idx) => (
                    <li key={idx}>
                      <a href={ref} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-blue-600 hover:underline break-all">
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. Quiz */}
            {hasQuiz && !isLockedBefore && (
              progress?.quizCompleted ? (
                <div className="flex items-center justify-between p-5 border border-black/[0.08] dark:border-white/[0.08] rounded-xl bg-[#F8F9FA] dark:bg-[#111111] opacity-70">
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-1">
                      KNOWLEDGE_CHECK
                    </p>
                    <p className="font-mono text-sm font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
                      Quiz Completed
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-black/40 dark:text-white/40 block mb-0.5">SCORE</span>
                    <span className="font-display font-black text-xl text-black dark:text-white leading-none">{progress.quizScore || 0}/{progress.quizTotal || quiz.questions.length}</span>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/admin/roadmap/${dayId}/quiz`}
                  className="flex items-center justify-between p-5 border border-black/[0.08] dark:border-white/[0.08] rounded-xl bg-white dark:bg-[#0a0a0a] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all group"
                >
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.3em] text-black/30 dark:text-white/30 group-hover:text-white/50 dark:group-hover:text-black/50 uppercase mb-1 transition-colors">
                      KNOWLEDGE_CHECK
                    </p>
                    <p className="font-mono text-sm font-bold uppercase tracking-wider text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">
                      {currentUser?.role === "volunteer" ? "Preview Quiz →" : "Take the Quiz →"}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-black/30 dark:text-white/30 group-hover:text-white dark:group-hover:text-black group-hover:translate-x-1 transition-all" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )
            )}

            {/* 6. Task Brief */}
            {day.taskDescription && (
              <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-6 bg-[#F8F9FA] dark:bg-[#111111]">
                <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-4">TASK_BRIEF</p>
                <p className="font-mono text-sm text-black/60 dark:text-white/60 leading-relaxed whitespace-pre-wrap">
                  <LinkifiedText>{day.taskDescription}</LinkifiedText>
                </p>
              </div>
            )}
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1 lg:sticky lg:top-8 space-y-8">
            
            {/* 2. Task Submission */}
            <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-6 bg-[#F8F9FA] dark:bg-[#111111]">
              <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-2">
                {hasTask ? "TASK_SUBMISSION" : "NODE_COMPLETION"}
              </p>
              <h2 className="font-display font-black text-xl tracking-tight uppercase text-black dark:text-white mb-6">
                {hasTask ? "Submit Work." : "Complete Node."}
              </h2>

              {currentUser?.role === "volunteer" || currentUser?.role === "admin" ? (
                <div className="p-4 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded-xl">
                  <p className="font-mono text-xs text-black/60 dark:text-white/60 font-bold uppercase mb-1">STAFF_VIEW</p>
                  <p className="font-mono text-[10px] text-black/40 dark:text-white/40 uppercase">Submissions are disabled for staff accounts.</p>
                </div>
              ) : submission && submission.status !== "Needs Revision" && (!hasTask || submission.link) ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 border rounded-xl ${
                      submission.status === "Approved" ? "border-green-200 bg-green-50" : 
                      "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {submission.status === "Approved" ? (
                        <svg className="w-5 h-5 text-green-600 shrink-0" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      )}
                      <p className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                        submission.status === "Approved" ? "text-green-700" : "text-blue-700"
                      }`}>
                        {submission.status === "Approved" ? "APPROVED" : "SUBMITTED"}
                      </p>
                    </div>
                    <p className={`font-mono text-xs ${
                      submission.status === "Approved" ? "text-green-600" : "text-blue-600"
                    }`}>
                      {submission.status === "Approved" 
                        ? `Your work was approved! You earned ${submission.awardedScore ?? (submission.isLate ? (day.taskPointsLate || 0) : (day.taskPointsOnTime || 0))} points.` 
                        : "Your work is pending admin review."}
                    </p>
                  </motion.div>
                ) : isLockedBefore ? (
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                    <p className="font-mono text-xs text-blue-600 font-bold uppercase mb-1">UPCOMING</p>
                    <p className="font-mono text-[10px] text-blue-600/80 uppercase">Submissions will unlock at {new Date(day.unlockAt).toLocaleString('en-GB')}.</p>
                  </div>
                ) : isLockedAfter ? (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                    <p className="font-mono text-xs text-red-600 font-bold uppercase mb-1">LOCKED</p>
                    <p className="font-mono text-[10px] text-red-600/80 uppercase">Submissions are now closed for this node.</p>
                  </div>
                ) : showFeedback ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!feedbackResponse.trim()) return;
                    setSubmitting(true);
                    setSubmitError("");
                    try {
                      await submitTask({ 
                        dayId, 
                        link: hasTask ? link.trim() : undefined, 
                        feedbackResponse,
                        ...(day.starRatingEnabled && studentRating > 0 ? { studentRating } : {})
                      });
                      setShowFeedback(false);
                    } catch (err) {
                      setSubmitError(err.message || "Failed to submit. Please try again.");
                    } finally {
                      setSubmitting(false);
                    }
                  }} className="space-y-4">
                    <p className="font-mono text-[10px] text-black/50 dark:text-white/50 uppercase">
                      {day.feedbackQuestion || "What did you think of today's session?"}
                    </p>
                    <textarea
                      value={feedbackResponse}
                      onChange={(e) => setFeedbackResponse(e.target.value)}
                      required
                      rows={4}
                      placeholder="Type your response here..."
                      className="w-full border border-black/[0.12] dark:border-white/[0.12] rounded-lg px-4 py-3 font-mono text-sm outline-none focus:border-black dark:focus:border-white transition-colors bg-white dark:bg-[#0a0a0a] placeholder:text-black/20 dark:placeholder:text-white/20 text-black dark:text-white resize-none"
                    />
                    {day.starRatingEnabled && (
                      <div className="pt-2 flex flex-col items-center gap-2">
                        <span className="font-mono text-[10px] text-black/50 dark:text-white/50 uppercase">RATE_THIS_SESSION</span>
                        <StarRating rating={studentRating} onRate={setStudentRating} />
                      </div>
                    )}
                    {submitError && (
                      <p className="font-mono text-[10px] text-red-500 uppercase tracking-wider">{submitError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting || !feedbackResponse.trim()}
                      className="w-full bg-black dark:bg-white text-white dark:text-black font-mono text-[10px] uppercase tracking-wider rounded-lg py-3 hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-50"
                    >
                      {submitting ? "SUBMITTING..." : "CONFIRM_SUBMISSION"}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {submission?.status === "Needs Revision" && (
                      <div className="p-4 border border-orange-200 bg-orange-50 rounded-xl mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-5 h-5 text-orange-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-orange-700">NEEDS_REVISION</p>
                        </div>
                        <p className="font-mono text-xs text-orange-600">Your submission requires updates. Please revise and resubmit your work.</p>
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {hasTask ? (
                        <>
                          <p className="font-mono text-xs text-black/40 dark:text-white/40 leading-relaxed">
                            Paste your GitHub / Drive / live project link to submit today's task.
                          </p>
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            required
                            placeholder="(drive link or github link)"
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
                  </div>
                )}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
