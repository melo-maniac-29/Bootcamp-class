"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";

/**
 * Purpose:
 *   Interactive quiz page. Loads real questions from the Convex quizzes
 *   table. Tracks per-question selection, reveals correct/wrong answer
 *   after each pick, accumulates score, and at the end saves the result
 *   via saveQuizResult mutation then redirects back to the day page.
 */
export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const dayId = params.dayId;
  
  const quiz = useQuery(api.content.getQuiz, { dayId });
  const saveQuizResult = useMutation(api.content.saveQuizResult);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Loading ──
  if (quiz === undefined) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase animate-pulse">
        LOADING_QUIZ...
      </p>
    </div>
  );

  // ── No quiz ──
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase mb-8">
          NO_QUIZ_AVAILABLE // CHECK BACK LATER
        </p>
        <Link
          href={`/dashboard/days/${dayId}`}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider px-6 py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          BACK_TO_LESSON
        </Link>
      </div>
    );
  }

  const questions = quiz.questions;
  const total = questions.length;
  const current = questions[currentIndex];
  const isLast = currentIndex === total - 1;
  const progress = ((currentIndex) / total) * 100;

  const handleSelect = (optIdx) => {
    if (answered) return;
    setSelected(optIdx);
    setAnswered(true);
    if (optIdx === current.answerIndex) setScore((s) => s + 1);
  };

  const handleNext = async () => {
    if (isLast) {
      setSaving(true);
      const finalScore = selected === current.answerIndex ? score + 1 : score;
      try {
        await saveQuizResult({ dayId, score: finalScore, total });
      } catch (e) {
        console.error(e);
      }
      setFinished(true);
      setSaving(false);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  // ── Finished screen ──
  if (finished) {
    const finalScore = score;
    const pct = Math.round((finalScore / total) * 100);
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Link
          href={`/dashboard/days/${dayId}`}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors mb-10"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          BACK_TO_LESSON
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-10 bg-[#F8F9FA] dark:bg-[#111111] text-center"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-4">QUIZ_COMPLETE</p>
          
          {/* Score ring */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" className="stroke-gray-100 dark:stroke-white/10" strokeWidth="8"/>
              <motion.circle
                cx="60" cy="60" r="52" fill="none"
                stroke={pct >= 70 ? "#16a34a" : pct >= 40 ? "#ca8a04" : "#dc2626"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - pct / 100) }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-black text-3xl tracking-tighter text-black dark:text-white leading-none">{pct}%</span>
              <span className="font-mono text-[9px] text-black/30 dark:text-white/30 uppercase tracking-wider">{finalScore}/{total}</span>
            </div>
          </div>

          <h2 className="font-display font-black text-2xl tracking-tighter uppercase text-black dark:text-white mb-2">
            {pct >= 70 ? "Excellent Work." : pct >= 40 ? "Good Effort." : "Keep Studying."}
          </h2>
          <p className="font-mono text-sm text-black/40 dark:text-white/40 mb-8">
            You answered {finalScore} out of {total} questions correctly.
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              href={`/dashboard/days/${dayId}`}
              className="font-mono text-[10px] uppercase tracking-wider px-6 py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
            >
              BACK_TO_LESSON
            </Link>
            <button
              onClick={() => { setCurrentIndex(0); setSelected(null); setAnswered(false); setScore(0); setFinished(false); }}
              className="font-mono text-[10px] uppercase tracking-wider px-6 py-3 rounded-lg border border-black/[0.12] dark:border-white/[0.12] hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black dark:text-white"
            >
              RETRY_QUIZ
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Quiz in progress ──
  return (
    <div className="max-w-2xl mx-auto py-10">
      
      {/* Back */}
      <Link
        href={`/dashboard/days/${dayId}`}
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors mb-8"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        BACK_TO_LESSON
      </Link>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-mono text-[9px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase">
            QUESTION_{String(currentIndex + 1).padStart(2, "0")}_OF_{String(total).padStart(2, "0")}
          </span>
          <span className="font-display font-black text-lg text-black dark:text-white">{score} pts</span>
        </div>
        <div className="h-[2px] w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full bg-black dark:bg-white rounded-full"
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-8 bg-white dark:bg-[#0a0a0a]"
        >
          <p className="font-mono text-[9px] tracking-[0.3em] text-black/25 dark:text-white/25 uppercase mb-4">QUESTION</p>
          <h2 className="font-display font-black text-2xl tracking-tight text-black dark:text-white mb-8 leading-snug">
            {current.question}
          </h2>

          <div className="space-y-3">
            {current.options.map((opt, idx) => {
              const isCorrect = answered && idx === current.answerIndex;
              const isWrong = answered && selected === idx && idx !== current.answerIndex;
              const isSelected = selected === idx;

              let cls = "border-black/[0.08] dark:border-white/[0.08] bg-[#F8F9FA] dark:bg-[#111111] hover:border-black/20 dark:hover:border-white/20 hover:bg-white dark:hover:bg-[#151515] text-black/70 dark:text-white/70";
              if (isCorrect) cls = "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400";
              if (isWrong) cls = "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400";

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={answered}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between group ${cls} ${!answered ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`font-mono text-[9px] font-bold tracking-widest w-5 shrink-0 ${
                      isCorrect ? "text-green-600 dark:text-green-400" : isWrong ? "text-red-500 dark:text-red-400" : "text-black/25 dark:text-white/25"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-mono text-sm font-bold uppercase tracking-wider">{opt}</span>
                  </div>
                  {isCorrect && (
                    <svg className="w-5 h-5 text-green-600 shrink-0" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {isWrong && (
                    <svg className="w-5 h-5 text-red-500 shrink-0" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next button appears after answering */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 pt-6 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-end"
              >
                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="font-mono text-[10px] uppercase tracking-wider px-8 py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-50 flex items-center gap-3"
                >
                  {saving ? "SAVING..." : isLast ? "FINISH_QUIZ" : "NEXT_QUESTION"}
                  {!saving && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
