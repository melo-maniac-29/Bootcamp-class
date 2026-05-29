"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

/**
 * Purpose:
 *   Student day viewer page. Shows video lesson placeholder, description,
 *   a link to the quiz, and a task submission form.
 */
export default function DayViewerPage() {
  const params = useParams();
  const dayId = params.dayId;
  
  const day = useQuery(api.content.getDay, { dayId });
  const submitTask = useMutation(api.submissions.submitTask);
  
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link) return;
    setSubmitting(true);
    try {
      await submitTask({ dayId, link });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (day === undefined) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="font-mono text-[10px] tracking-widest text-black/25 uppercase animate-pulse">LOADING_DAY...</p>
    </div>
  );
  if (!day) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="font-mono text-[10px] tracking-widest text-black/25 uppercase">DAY_NOT_FOUND</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto"
    >
      {/* Back link */}
      <Link href="/dashboard/days" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-black/30 hover:text-black transition-colors mb-8">
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        BACK_TO_ROADMAP
      </Link>

      {/* Page header */}
      <div className="border-b border-black/[0.06] pb-8 mb-10">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 uppercase mb-3">
          DAY_{String(day.order || 0).padStart(2, "0")} // LESSON_NODE
        </p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black">{day.title}.</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── LEFT: Video + Description ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Video Player */}
          <div className="aspect-video bg-[#F0F0F0] border border-black/[0.06] rounded-xl overflow-hidden relative flex items-center justify-center group cursor-pointer hover:border-black/20 transition-colors">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8e8e8_1px,transparent_1px),linear-gradient(to_bottom,#e8e8e8_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full border border-black/[0.12] bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <svg className="w-5 h-5 text-black ml-0.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 3l10 5-10 5V3z"/>
                </svg>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-black/40">PLAY_LESSON</p>
            </div>
            <div className="absolute bottom-4 left-5">
              <p className="font-mono text-[9px] tracking-widest text-black/30 uppercase">VIDEO_NODE // {day.videoTitle || day.title}</p>
            </div>
          </div>

          {/* Description */}
          <div className="border border-black/[0.06] rounded-xl p-6 bg-[#F8F9FA]">
            <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 uppercase mb-4">LESSON_BRIEF</p>
            <p className="font-mono text-sm text-black/60 leading-relaxed whitespace-pre-wrap">
              {day.description || day.taskDescription || "No description provided for this day."}
            </p>
          </div>

          {/* Take quiz CTA */}
          <Link
            href={`/dashboard/days/${dayId}/quiz`}
            className="flex items-center justify-between p-5 border border-black/[0.08] rounded-xl bg-white hover:bg-black hover:text-white hover:border-black transition-all group"
          >
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-black/30 group-hover:text-white/50 uppercase mb-1 transition-colors">KNOWLEDGE_CHECK</p>
              <p className="font-mono text-sm font-bold uppercase tracking-wider text-black group-hover:text-white transition-colors">Take the Quiz</p>
            </div>
            <svg className="w-4 h-4 text-black/30 group-hover:text-white group-hover:translate-x-1 transition-all" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* ── RIGHT: Submission Panel ── */}
        <div>
          <div className="border border-black/[0.06] rounded-xl p-6 bg-[#F8F9FA] sticky top-24">
            <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 uppercase mb-2">TASK_SUBMISSION</p>
            <h2 className="font-display font-black text-xl tracking-tight uppercase text-black mb-6">Submit Work.</h2>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 border border-green-200 bg-green-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-600 shrink-0" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-green-700">SUBMITTED</p>
                    <p className="font-mono text-xs text-green-600 mt-0.5">Pending admin review.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="font-mono text-xs text-black/40">Paste your GitHub / project link below to submit this day's task.</p>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                  placeholder="https://github.com/your/repo"
                  className="w-full border border-black/[0.12] rounded-lg px-4 py-3 font-mono text-sm outline-none focus:border-black transition-colors bg-white placeholder:text-black/20 text-black"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white font-mono text-[10px] uppercase tracking-wider rounded-lg py-3 hover:bg-black/80 transition-colors disabled:opacity-50"
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
