"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Purpose:
 *   Student day viewer. Shows a real YouTube embed using day.videoUrl,
 *   lesson description, task description, a quiz CTA, and a real task
 *   submission form backed by the submissions Convex mutation.
 *   Checks if the student already submitted so the form shows status.
 */
export default function DayViewerPage() {
  const params = useParams();
  const dayId = params.dayId;
  
  const day = useQuery(api.content.getDay, { dayId });
  const submitTask = useMutation(api.submissions.submitTask);
  
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitTask({ dayId, link: link.trim() });
      setSubmitted(true);
    } catch (err) {
      setSubmitError("Failed to submit. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Extract YouTube video ID from URL for embed
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    return match ? match[1] : null;
  };

  if (day === undefined) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase animate-pulse">LOADING_DAY...</p>
    </div>
  );
  if (!day) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase">DAY_NOT_FOUND</p>
    </div>
  );

  const videoId = getYouTubeId(day.videoUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto"
    >
      {/* Back link */}
      <Link
        href="/dashboard/days"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors mb-8"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        BACK_TO_ROADMAP
      </Link>

      {/* Header */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-8 mb-10">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3">
          DAY_{String(day.order || 0).padStart(2, "0")} // LESSON_NODE
        </p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white leading-none">
          {day.title}.
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Video + Content ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Video */}
          {videoId ? (
            <div className="aspect-video rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={day.videoTitle || day.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl border border-dashed border-black/10 dark:border-white/10 bg-[#F8F9FA] dark:bg-[#111111] flex items-center justify-center">
              <div className="text-center">
                <svg className="w-10 h-10 text-black/15 dark:text-white/15 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                  <path d="M15 10l4.553-2.277A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase">VIDEO_NOT_YET_RELEASED</p>
              </div>
            </div>
          )}

          {/* Description */}
          {day.description && (
            <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-6 bg-[#F8F9FA] dark:bg-[#111111]">
              <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-4">LESSON_BRIEF</p>
              <p className="font-mono text-sm text-black/60 dark:text-white/60 leading-relaxed whitespace-pre-wrap">{day.description}</p>
            </div>
          )}

          {/* Task Description */}
          {day.taskDescription && (
            <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-6 bg-[#F8F9FA] dark:bg-[#111111]">
              <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-4">TASK_BRIEF</p>
              <p className="font-mono text-sm text-black/60 dark:text-white/60 leading-relaxed whitespace-pre-wrap">{day.taskDescription}</p>
            </div>
          )}

          {/* Quiz CTA */}
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
        </div>

        {/* ── RIGHT: Submission Panel ── */}
        <div>
          <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-6 bg-[#F8F9FA] dark:bg-[#111111] sticky top-24">
            <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-2">TASK_SUBMISSION</p>
            <h2 className="font-display font-black text-xl tracking-tight uppercase text-black dark:text-white mb-6">
              Submit Work.
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
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                {submitError && (
                  <p className="font-mono text-[10px] text-red-500 uppercase tracking-wider">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-mono text-[10px] uppercase tracking-wider rounded-lg py-3 hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-50"
                >
                  {submitting ? "SUBMITTING..." : "SUBMIT_TASK"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
