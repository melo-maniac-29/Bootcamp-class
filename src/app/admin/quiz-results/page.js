"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizResultsPage() {
  const submissions = useQuery(api.content.listQuizSubmissions) || [];
  const resetSingleQuizAttempt = useMutation(api.content.resetSingleQuizAttempt);
  
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [weekFilter, setWeekFilter] = useState("All");
  const [dayFilter, setDayFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, weekFilter, dayFilter]);

  const weeks = Array.from(new Set(submissions.map(s => JSON.stringify({ id: s.weekTitle, order: s.weekOrder }))))
    .map(w => JSON.parse(w))
    .sort((a, b) => a.order - b.order)
    .map(w => w.id);

  const daysInWeek = weekFilter === "All" 
    ? submissions
    : submissions.filter(s => s.weekTitle === weekFilter);
  
  const days = Array.from(new Set(daysInWeek.map(s => JSON.stringify({ id: s.dayTitle, order: s.dayOrder }))))
    .map(d => JSON.parse(d))
    .sort((a, b) => a.order - b.order)
    .map(d => d.id);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.dayTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWeek = weekFilter === "All" || sub.weekTitle === weekFilter;
    const matchesDay = dayFilter === "All" || sub.dayTitle === dayFilter;
    return matchesSearch && matchesWeek && matchesDay;
  }).sort((a, b) => {
    if (a.weekOrder !== b.weekOrder) return b.weekOrder - a.weekOrder;
    return b.dayOrder - a.dayOrder;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-8 mb-10">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3">
          REVIEW_QUEUE // LIVE
        </p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">
          Quiz Results.
        </h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          {filteredSubmissions.length} QUIZ_NODES LOADED
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input 
          type="text" 
          placeholder="SEARCH STUDENT OR QUIZ..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg px-4 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
        />
        <div className="relative w-full md:w-48 shrink-0">
          <select
            value={weekFilter}
            onChange={(e) => { setWeekFilter(e.target.value); setDayFilter("All"); }}
            className="w-full h-full bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg pl-4 pr-10 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white appearance-none"
          >
            <option value="All">ALL_WEEKS</option>
            {weeks.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black/30 dark:text-white/30">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div className="relative w-full md:w-48 shrink-0">
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="w-full h-full bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg pl-4 pr-10 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white appearance-none"
          >
            <option value="All">ALL_DAYS</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black/30 dark:text-white/30">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
                {["STUDENT", "QUIZ_NODE", "SCORE", "ACTION"].map(col => (
                  <th key={col} className={`px-5 py-4 font-mono text-[9px] tracking-[0.25em] text-black/30 dark:text-white/30 uppercase font-bold ${col === 'QUIZ_NODE' ? 'w-1/3' : 'w-1/6'}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedSubmissions.map((sub, i) => (
                <React.Fragment key={sub._id}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-[#F8F9FA] dark:hover:bg-[#111111] transition-colors ${expandedId === sub._id ? 'bg-[#F8F9FA] dark:bg-[#111111]' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-bold text-black dark:text-white uppercase tracking-wider block">{sub.studentName}</span>
                      <span className="font-mono text-[9px] text-black/40 dark:text-white/40 tracking-widest">{sub.studentEmail}</span>
                    </td>
                    <td className="px-5 py-4 max-w-[300px]">
                      <span className="font-mono text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest block mb-0.5">{sub.weekTitle}</span>
                      <span className="font-mono text-xs text-black/80 dark:text-white/80 whitespace-normal break-words block">{sub.dayTitle}</span>
                      <span suppressHydrationWarning className="font-mono text-[10px] text-amber-600 dark:text-amber-500 uppercase tracking-widest mt-1.5 block font-bold">
                        {sub.submittedAt || sub._creationTime ? new Date(sub.submittedAt || sub._creationTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "NO TIMESTAMP"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-[11px] text-black dark:text-white font-bold tracking-widest">
                        {sub.quizScore !== undefined ? sub.quizScore : 0} / {sub.quizTotal !== undefined ? sub.quizTotal : 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleExpand(sub._id)}
                          className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-black/20 dark:border-white/20 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          {expandedId === sub._id ? "CLOSE_DETAILS" : "VIEW_DETAILS"}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete quiz attempt for ${sub.studentName}? Points will be deducted and they can retake it.`)) {
                              await resetSingleQuizAttempt({ progressId: sub._id });
                            }
                          }}
                          className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                  {/* Expanded Details Row */}
                  <AnimatePresence>
                    {expandedId === sub._id && (
                      <tr>
                        <td colSpan={4} className="p-0 border-b border-black/[0.06] dark:border-white/[0.06] whitespace-normal">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-[#fcfcfc] dark:bg-[#0c0c0c] p-6 lg:p-8 whitespace-normal break-words">
                              <h3 className="font-display font-bold tracking-tight text-lg uppercase text-black/70 dark:text-white/70 mb-4 border-b border-black/10 dark:border-white/10 pb-2">
                                Submission Details
                              </h3>
                              {sub.quizAnswers && sub.quizAnswers.length > 0 ? (
                                <div className="space-y-6">
                                  {sub.quizAnswers.map((answer, idx) => (
                                    <div key={idx} className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-black/[0.06] dark:border-white/[0.06] p-5">
                                      <div className="flex items-start justify-between mb-4">
                                        <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase mt-1">
                                          Question {String(idx + 1).padStart(2, "0")}
                                        </p>
                                        {answer.selectedIndex === null || answer.selectedIndex === undefined ? (
                                          <span className="font-mono text-[9px] tracking-widest font-bold px-2 py-1 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 uppercase">
                                            MISSED
                                          </span>
                                        ) : answer.selectedIndex === answer.correctIndex ? (
                                          <span className="font-mono text-[9px] tracking-widest font-bold px-2 py-1 rounded bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 uppercase">
                                            CORRECT
                                          </span>
                                        ) : (
                                          <span className="font-mono text-[9px] tracking-widest font-bold px-2 py-1 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 uppercase">
                                            INCORRECT
                                          </span>
                                        )}
                                      </div>
                                      <p className="font-display font-bold text-base text-black dark:text-white mb-4">
                                        {answer.question}
                                      </p>
                                      <div className="space-y-2">
                                        {answer.options.map((opt, optIdx) => {
                                          const isSelected = answer.selectedIndex === optIdx;
                                          const isCorrect = answer.correctIndex === optIdx;
                                          let style = "border-black/[0.06] dark:border-white/[0.06] text-black/40 dark:text-white/40";
                                          
                                          if (isSelected && isCorrect) {
                                            style = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold";
                                          } else if (isSelected && !isCorrect) {
                                            style = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold";
                                          } else if (!isSelected && isCorrect) {
                                            style = "border-green-500/50 bg-green-50/50 dark:bg-green-900/10 text-green-700/80 dark:text-green-400/80 border-dashed";
                                          }
                                          
                                          return (
                                            <div key={optIdx} className={`px-4 py-3 rounded-md border ${style} flex flex-col gap-1.5`}>
                                              <div className="flex items-start gap-3">
                                                <span className={`font-mono text-[9px] font-bold tracking-widest mt-0.5 shrink-0 ${isCorrect || isSelected ? 'opacity-100' : 'opacity-40'}`}>
                                                  {String.fromCharCode(65 + optIdx)}
                                                </span>
                                                <span className="font-mono text-xs uppercase tracking-wide flex-1 whitespace-normal break-words">{opt}</span>
                                              </div>
                                              <div className="pl-6">
                                                {isSelected && isCorrect && (
                                                  <span className="font-mono text-[8px] uppercase tracking-widest text-green-600 font-bold flex items-center gap-1.5">
                                                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                    STUDENT SELECTED (CORRECT)
                                                  </span>
                                                )}
                                                {isSelected && !isCorrect && (
                                                  <span className="font-mono text-[8px] uppercase tracking-widest text-red-600 font-bold flex items-center gap-1.5">
                                                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                    STUDENT SELECTED (INCORRECT)
                                                  </span>
                                                )}
                                                {!isSelected && isCorrect && (
                                                  <span className="font-mono text-[8px] uppercase tracking-widest text-green-600/80 font-bold">
                                                    CORRECT ANSWER
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="font-mono text-xs text-black/40 dark:text-white/40 uppercase">
                                  DETAILS_UNAVAILABLE // OLD_SUBMISSION_FORMAT
                                </p>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
              {paginatedSubmissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <p className="font-mono text-[10px] tracking-widest text-black/20 dark:text-white/20 uppercase">
                      QUEUE_EMPTY // NO_QUIZZES_FOUND
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden flex flex-col divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          {paginatedSubmissions.map((sub, i) => (
            <motion.div
              key={`mobile-${sub._id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="p-5 hover:bg-[#F8F9FA] dark:hover:bg-[#111111] transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-mono text-sm font-bold text-black dark:text-white uppercase tracking-wider block">{sub.studentName}</span>
                  <span className="font-mono text-[9px] text-black/40 dark:text-white/40 tracking-widest block mt-0.5">{sub.studentEmail}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[11px] text-black dark:text-white font-bold tracking-widest block">
                    {sub.quizScore !== undefined ? sub.quizScore : 0} / {sub.quizTotal !== undefined ? sub.quizTotal : 0}
                  </span>
                  <span className="font-mono text-[8px] text-black/30 dark:text-white/30 uppercase tracking-widest">SCORE</span>
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                <span className="font-mono text-[9px] text-black/40 dark:text-white/40 uppercase tracking-widest block mb-1">{sub.weekTitle}</span>
                <span className="font-mono text-xs text-black/80 dark:text-white/80 leading-tight block">{sub.dayTitle}</span>
                <span suppressHydrationWarning className="font-mono text-[10px] text-amber-600 dark:text-amber-500 uppercase tracking-widest mt-2 block pt-2 border-t border-black/5 dark:border-white/5 font-bold">
                  {sub.submittedAt || sub._creationTime ? new Date(sub.submittedAt || sub._creationTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "NO TIMESTAMP"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleExpand(sub._id)}
                  className="flex-1 font-mono text-[9px] uppercase tracking-wider px-3 py-2 rounded border border-black/20 dark:border-white/20 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center"
                >
                  {expandedId === sub._id ? "CLOSE_DETAILS" : "VIEW_DETAILS"}
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Delete quiz attempt for ${sub.studentName}? Points will be deducted and they can retake it.`)) {
                      await resetSingleQuizAttempt({ progressId: sub._id });
                    }
                  }}
                  className="font-mono text-[9px] uppercase tracking-wider px-3 py-2 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  DELETE
                </button>
              </div>

              {/* Mobile Expanded Details */}
              <AnimatePresence>
                {expandedId === sub._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#fcfcfc] dark:bg-[#0c0c0c] rounded-lg border border-black/[0.06] dark:border-white/[0.06] p-4">
                      <h3 className="font-display font-bold tracking-tight text-sm uppercase text-black/70 dark:text-white/70 mb-3 border-b border-black/10 dark:border-white/10 pb-2">
                        Submission Details
                      </h3>
                      {sub.quizAnswers && sub.quizAnswers.length > 0 ? (
                        <div className="space-y-4">
                          {sub.quizAnswers.map((answer, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#0a0a0a] rounded border border-black/[0.06] dark:border-white/[0.06] p-3">
                              <div className="flex items-start justify-between mb-3">
                                <p className="font-mono text-[9px] tracking-widest text-black/40 dark:text-white/40 uppercase mt-0.5">
                                  Q{String(idx + 1).padStart(2, "0")}
                                </p>
                                {answer.selectedIndex === null || answer.selectedIndex === undefined ? (
                                  <span className="font-mono text-[8px] tracking-widest font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 uppercase">
                                    MISSED
                                  </span>
                                ) : answer.selectedIndex === answer.correctIndex ? (
                                  <span className="font-mono text-[8px] tracking-widest font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 uppercase">
                                    CORRECT
                                  </span>
                                ) : (
                                  <span className="font-mono text-[8px] tracking-widest font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 uppercase">
                                    INCORRECT
                                  </span>
                                )}
                              </div>
                              <p className="font-display font-bold text-sm text-black dark:text-white mb-3">
                                {answer.question}
                              </p>
                              <div className="space-y-1.5">
                                {answer.options.map((opt, optIdx) => {
                                  const isSelected = answer.selectedIndex === optIdx;
                                  const isCorrect = answer.correctIndex === optIdx;
                                  let style = "border-black/[0.06] dark:border-white/[0.06] text-black/40 dark:text-white/40";
                                  
                                  if (isSelected && isCorrect) {
                                    style = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold";
                                    } else if (isSelected && !isCorrect) {
                                      style = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold";
                                    } else if (!isSelected && isCorrect) {
                                      style = "border-green-500/50 bg-green-50/50 dark:bg-green-900/10 text-green-700/80 dark:text-green-400/80 border-dashed";
                                    }
                                    
                                    return (
                                      <div key={optIdx} className={`px-3 py-2 rounded border ${style} flex flex-col gap-1`}>
                                        <div className="flex items-start gap-2">
                                          <span className={`font-mono text-[9px] font-bold mt-0.5 ${isCorrect || isSelected ? 'opacity-100' : 'opacity-40'}`}>
                                            {String.fromCharCode(65 + optIdx)}
                                          </span>
                                          <span className="font-mono text-[10px] uppercase leading-tight">{opt}</span>
                                        </div>
                                        <div className="pl-4">
                                          {isSelected && isCorrect && (
                                            <span className="font-mono text-[8px] uppercase tracking-widest text-green-600 font-bold flex items-center gap-1">
                                              <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                              SELECTED (CORRECT)
                                            </span>
                                          )}
                                          {isSelected && !isCorrect && (
                                            <span className="font-mono text-[8px] uppercase tracking-widest text-red-600 font-bold flex items-center gap-1">
                                              <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                              SELECTED (INCORRECT)
                                            </span>
                                          )}
                                          {!isSelected && isCorrect && (
                                            <span className="font-mono text-[8px] uppercase tracking-widest text-green-600/80 font-bold">
                                              CORRECT ANSWER
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="font-mono text-[10px] text-black/40 dark:text-white/40 uppercase">
                          DETAILS_UNAVAILABLE
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          {paginatedSubmissions.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-mono text-[10px] tracking-widest text-black/20 dark:text-white/20 uppercase">
                QUEUE_EMPTY
              </p>
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
            <p className="font-mono text-[10px] text-black/40 dark:text-white/40 tracking-widest uppercase">
              PAGE {currentPage} OF {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black dark:text-white"
              >
                PREVIOUS
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black dark:text-white"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
