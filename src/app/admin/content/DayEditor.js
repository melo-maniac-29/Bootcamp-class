"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const toDatetimeLocal = (timestamp) => {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const toTimestamp = (datetimeLocal) => {
  if (!datetimeLocal) return undefined;
  return new Date(datetimeLocal).getTime();
};

/**
 * Purpose:
 *   Editor panel for a single bootcamp day. Allows updating title,
 *   description, videoUrl, taskDescription and managing quiz questions.
 *   Saves via updateDay and upsertQuiz mutations.
 *
 * Args:
 *   dayId   string   The Convex ID of the day to edit.
 *   onClose function Callback to dismiss the editor panel.
 */
export default function DayEditor({ dayId, onClose }) {
  const day = useQuery(api.content.getDay, { dayId });
  const quiz = useQuery(api.content.getQuiz, { dayId });
  
  const updateDay = useMutation(api.content.updateDay);
  const deleteDay = useMutation(api.content.deleteDay);
  const upsertQuiz = useMutation(api.content.upsertQuiz);
  const resetAllQuizAttempts = useMutation(api.content.resetAllQuizAttempts);

  const [formData, setFormData] = useState({ 
    title: "", description: "", videoUrl: "", taskDescription: "",
    unlockAtStr: "", deadlineAtStr: "", lateDeadlineAtStr: "",
    quizPointsOnTime: 0, taskPointsOnTime: 0, taskPointsLate: 0, order: 0
  });
  const [questions, setQuestions] = useState([]);
  const [references, setReferences] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [timeLimit, setTimeLimit] = useState(15);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [starRatingEnabled, setStarRatingEnabled] = useState(false);
  const [feedbackQuestion, setFeedbackQuestion] = useState("What did you think of today's session?");

  useEffect(() => {
    if (day) {
      setFormData({ 
        title: day.title || "", 
        description: day.description || "", 
        videoUrl: day.videoUrl || "",
        taskDescription: day.taskDescription || "",
        unlockAtStr: toDatetimeLocal(day.unlockAt),
        deadlineAtStr: toDatetimeLocal(day.deadlineAt),
        lateDeadlineAtStr: toDatetimeLocal(day.lateDeadlineAt),
        quizPointsOnTime: day.quizPointsOnTime || 0,
        taskPointsOnTime: day.taskPointsOnTime || 0,
        taskPointsLate: day.taskPointsLate || 0,
        order: day.order || 0
      });
      setReferences(day.references || []);
      setFeedbackEnabled(day.feedbackEnabled || false);
      setStarRatingEnabled(day.starRatingEnabled || false);
      setFeedbackQuestion(day.feedbackQuestion || "What did you think of today's session?");
    }
  }, [day]);

  useEffect(() => {
    if (quiz) {
      setQuestions(quiz.questions || []);
      setTimeLimit(quiz.timeLimit !== undefined ? quiz.timeLimit : 15);
    }
    else if (quiz === null) {
      setQuestions([]);
      setTimeLimit(15);
    }
  }, [quiz]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl,
        taskDescription: formData.taskDescription,
        unlockAt: toTimestamp(formData.unlockAtStr),
        deadlineAt: toTimestamp(formData.deadlineAtStr),
        lateDeadlineAt: toTimestamp(formData.lateDeadlineAtStr),
        quizPointsOnTime: parseInt(formData.quizPointsOnTime) || 0,
        taskPointsOnTime: parseInt(formData.taskPointsOnTime) || 0,
        taskPointsLate: parseInt(formData.taskPointsLate) || 0,
        order: parseInt(formData.order) || 0,
        references: references.filter(r => r.trim() !== ""),
        feedbackEnabled,
        starRatingEnabled,
        feedbackQuestion: feedbackEnabled ? feedbackQuestion : undefined,
      };
      await updateDay({ dayId, ...payload });
      await upsertQuiz({ 
        dayId, 
        questions, 
        timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this day permanently?")) {
      await deleteDay({ dayId });
      onClose();
    }
  };

  const addQuestion = () =>
    setQuestions([...questions, { question: "New Question", options: ["Option A", "Option B"], answerIndex: 0 }]);

  if (!day) return (
    <div className="py-10 text-center">
      <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase">LOADING_DAY_EDITOR...</p>
    </div>
  );

  const fieldClass = "w-full border border-black/[0.12] dark:border-white/[0.12] rounded-lg px-4 py-2.5 font-mono text-sm outline-none focus:border-black dark:focus:border-white transition-colors bg-white dark:bg-[#111111] text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-6 bg-white dark:bg-[#0a0a0a] relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-[9px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-1">EDITING_DAY</p>
          <h3 className="font-display font-black text-xl tracking-tight uppercase text-black dark:text-white">{day.title}</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Form fields */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">TITLE</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={fieldClass} />
          </div>
          <div>
            <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">DAY_ORDER</label>
            <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} className={fieldClass} />
          </div>
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">DESCRIPTION</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the day's topic..." rows={3} className={fieldClass} />
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">VIDEO_URL</label>
          <input type="text" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} placeholder="https://youtube.com/watch?v=..." className={fieldClass} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase">REFERENCES / LINKS</label>
            <button onClick={() => setReferences([...references, ""])} className="font-mono text-[8px] uppercase px-2 py-0.5 border border-black/10 dark:border-white/10 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors">+ ADD</button>
          </div>
          <div className="space-y-2">
            {references.length === 0 ? (
               <p className="font-mono text-[10px] text-black/30 dark:text-white/30 italic">No references added.</p>
            ) : (
              references.map((ref, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="text" value={ref} onChange={e => { const n = [...references]; n[idx] = e.target.value; setReferences(n); }} placeholder="https://..." className={fieldClass} />
                  <button onClick={() => setReferences(references.filter((_, i) => i !== idx))} className="text-black/30 dark:text-white/30 hover:text-red-500 transition-colors px-2">×</button>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">TASK_DESCRIPTION (MARKDOWN)</label>
          <textarea value={formData.taskDescription} onChange={e => setFormData({...formData, taskDescription: e.target.value})} placeholder="Describe the task using Markdown format..." rows={4} className={fieldClass} />
        </div>
      </div>

      {/* Access Control & Timing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">UNLOCK_AT</label>
          <input type="datetime-local" value={formData.unlockAtStr} onChange={e => setFormData({...formData, unlockAtStr: e.target.value})} className={fieldClass} />
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">PROPER_DEADLINE</label>
          <input type="datetime-local" value={formData.deadlineAtStr} onChange={e => setFormData({...formData, deadlineAtStr: e.target.value})} className={fieldClass} />
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">LATE_LOCK_DEADLINE</label>
          <input type="datetime-local" value={formData.lateDeadlineAtStr} onChange={e => setFormData({...formData, lateDeadlineAtStr: e.target.value})} className={fieldClass} />
        </div>
      </div>

      {/* Scoring & Timing */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">QUIZ_ON_TIME</label>
          <input type="number" value={formData.quizPointsOnTime} onChange={e => setFormData({...formData, quizPointsOnTime: e.target.value})} className={fieldClass} />
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">TASK_ON_TIME</label>
          <input type="number" value={formData.taskPointsOnTime} onChange={e => setFormData({...formData, taskPointsOnTime: e.target.value})} className={fieldClass} />
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">TASK_LATE</label>
          <input type="number" value={formData.taskPointsLate} onChange={e => setFormData({...formData, taskPointsLate: e.target.value})} className={fieldClass} />
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">TIME_LIMIT_PER_Q</label>
          <input 
            type="number" 
            placeholder="e.g. 15 (Blank = No limit)" 
            value={timeLimit} 
            onChange={e => setTimeLimit(e.target.value)} 
            className={fieldClass} 
          />
        </div>
      </div>

      {/* Quiz questions */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase">QUIZ_QUESTIONS</p>
          <div className="flex gap-2">
            <button onClick={async () => {
              if (confirm("WARNING: This will wipe all existing quiz scores for this day and deduct points from the leaderboard. Students will be able to retake the quiz. Are you absolutely sure?")) {
                await resetAllQuizAttempts({ dayId });
                alert("All student attempts for this quiz have been reset.");
              }
            }} className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all flex items-center gap-1.5">
              RESET_ALL_ATTEMPTS
            </button>
            <button onClick={addQuestion} className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-black/[0.1] dark:border-white/[0.1] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              ADD_QUESTION
            </button>
          </div>
        </div>


        {questions.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-black/10 dark:border-white/10 rounded-lg">
            <p className="font-mono text-[10px] text-black/25 dark:text-white/25 uppercase tracking-widest">NO_QUESTIONS // ADD ABOVE</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="p-4 border border-black/[0.08] dark:border-white/[0.08] rounded-lg bg-[#F8F9FA] dark:bg-[#111111]">
                <div className="flex gap-3 items-start mb-3">
                  <span className="font-mono text-[9px] text-black/30 dark:text-white/30 mt-1 shrink-0">Q{qIdx + 1}</span>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => { const n = [...questions]; n[qIdx] = {...n[qIdx], question: e.target.value}; setQuestions(n); }}
                    className="flex-1 border-b border-black/[0.12] dark:border-white/[0.12] bg-transparent outline-none font-mono text-sm text-black dark:text-white focus:border-black dark:focus:border-white pb-1 transition-colors"
                  />
                  <button onClick={() => {
                    if (window.confirm("Are you sure you want to delete this question?")) {
                      setQuestions(questions.filter((_, i) => i !== qIdx));
                    }
                  }} className="p-1 text-black/30 dark:text-white/30 hover:text-red-500 transition-colors shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <div className="space-y-2 pl-6">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-3">
                      <input type="radio" name={`correct-${qIdx}`} checked={q.answerIndex === oIdx}
                        onChange={() => { const n = [...questions]; n[qIdx] = {...n[qIdx], answerIndex: oIdx}; setQuestions(n); }}
                        className="accent-black"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={e => { const n = [...questions]; n[qIdx].options[oIdx] = e.target.value; setQuestions(n); }}
                        className="flex-1 border-b border-black/[0.08] dark:border-white/[0.08] bg-transparent outline-none font-mono text-xs text-black dark:text-white focus:border-black dark:focus:border-white pb-0.5 transition-colors"
                      />
                      <button onClick={() => {
                        const n = [...questions];
                        n[qIdx].options = n[qIdx].options.filter((_, i) => i !== oIdx);
                        if (n[qIdx].answerIndex >= oIdx) n[qIdx].answerIndex = Math.max(0, n[qIdx].answerIndex - 1);
                        setQuestions(n);
                      }} className="text-black/20 dark:text-white/20 hover:text-red-400 transition-colors font-mono text-xs px-1">×</button>
                    </div>
                  ))}
                  <button
                    onClick={() => { const n = [...questions]; n[qIdx].options.push(`Option ${n[qIdx].options.length + 1}`); setQuestions(n); }}
                    className="font-mono text-[9px] text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white uppercase tracking-wider transition-colors mt-1 inline-block"
                  >
                    + ADD_OPTION
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <div className="mb-8 p-4 border border-black/[0.08] dark:border-white/[0.08] rounded-xl bg-[#F8F9FA] dark:bg-[#111111]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase">TASK_FEEDBACK</p>
            <p className="font-mono text-[9px] text-black/40 dark:text-white/40 mt-0.5">Show a feedback prompt when submitting the task</p>
          </div>
          <button
            onClick={() => setFeedbackEnabled(!feedbackEnabled)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
              feedbackEnabled ? "bg-black dark:bg-white" : "bg-black/10 dark:bg-white/10"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white dark:bg-black transition-transform duration-200 ${
              feedbackEnabled ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
        </div>
        {feedbackEnabled && (
          <>
            <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase">STAR_RATING</p>
                <p className="font-mono text-[9px] text-black/40 dark:text-white/40 mt-0.5">Enable students to give a star rating when submitting task feedback</p>
              </div>
              <button
                onClick={() => setStarRatingEnabled(!starRatingEnabled)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                  starRatingEnabled ? "bg-black dark:bg-white" : "bg-black/10 dark:bg-white/10"
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white dark:bg-black transition-transform duration-200 ${
                  starRatingEnabled ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
              <label className="block font-mono text-[9px] tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1.5">FEEDBACK_QUESTION</label>
              <textarea
                value={feedbackQuestion}
                onChange={e => setFeedbackQuestion(e.target.value)}
                rows={2}
                placeholder="e.g. What did you think of today's session?"
                className="w-full border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#0a0a0a] rounded-lg px-3 py-2 font-mono text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white resize-none"
              />
            </div>
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex justify-between items-center pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
        <button onClick={handleDelete} className="font-mono text-[9px] uppercase tracking-wider px-4 py-2.5 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M3 4h10M6 4V2h4v2M6 7v5M10 7v5M4 4l.5 9h7l.5-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          DELETE_DAY
        </button>
        <button onClick={handleSave} disabled={isSaving} className="font-mono text-[9px] uppercase tracking-wider px-6 py-2.5 rounded bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-50 flex items-center gap-2">
          {saved ? (
            <><svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> SAVED</>
          ) : isSaving ? "SAVING..." : (
            <><svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M4 11h8M4 5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> SAVE_CHANGES</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
