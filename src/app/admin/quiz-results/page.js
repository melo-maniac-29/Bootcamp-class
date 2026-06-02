"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizResultsPage() {
  const submissions = useQuery(api.content.listQuizSubmissions) || [];
  
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
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
                {["STUDENT", "QUIZ_NODE", "SCORE", "ACTION"].map(col => (
                  <th key={col} className="px-5 py-4 font-mono text-[9px] tracking-[0.25em] text-black/30 dark:text-white/30 uppercase font-bold">
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
                    <td className="px-5 py-4">
                      <span className="font-mono text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest block mb-0.5">{sub.weekTitle}</span>
                      <span className="font-mono text-xs text-black/80 dark:text-white/80">{sub.dayTitle}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-[11px] text-black dark:text-white font-bold tracking-widest">
                        {sub.quizScore !== undefined ? sub.quizScore : 0} / {sub.quizTotal !== undefined ? sub.quizTotal : 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleExpand(sub._id)}
                        className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-black/20 dark:border-white/20 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        {expandedId === sub._id ? "CLOSE_DETAILS" : "VIEW_DETAILS"}
                      </button>
                    </td>
                  </motion.tr>
                  {/* Expanded Details Row */}
                  <AnimatePresence>
                    {expandedId === sub._id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <td colSpan={4} className="p-0 border-b border-black/[0.06] dark:border-white/[0.06]">
                          <div className="bg-[#fcfcfc] dark:bg-[#0c0c0c] p-6 lg:p-8">
                            <h3 className="font-display font-bold tracking-tight text-lg uppercase text-black/70 dark:text-white/70 mb-4 border-b border-black/10 dark:border-white/10 pb-2">
                              Submission Details
                            </h3>
                            {sub.quizAnswers && sub.quizAnswers.length > 0 ? (
                              <div className="space-y-6">
                                {sub.quizAnswers.map((answer, idx) => (
                                  <div key={idx} className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-black/[0.06] dark:border-white/[0.06] p-5">
                                    <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase mb-2">
                                      Question {String(idx + 1).padStart(2, "0")}
                                    </p>
                                    <p className="font-display font-bold text-base text-black dark:text-white mb-4">
                                      {answer.question}
                                    </p>
                                    <div className="space-y-2">
                                      {answer.options.map((opt, optIdx) => {
                                        const isSelected = answer.selectedIndex === optIdx;
                                        const isCorrect = answer.correctIndex === optIdx;
                                        let style = "border-black/[0.06] dark:border-white/[0.06] text-black/40 dark:text-white/40";
                                        
                                        if (isCorrect) {
                                          style = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold";
                                        } else if (isSelected && !isCorrect) {
                                          style = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold";
                                        }
                                        
                                        return (
                                          <div key={optIdx} className={`px-4 py-2.5 rounded-md border ${style} flex items-center justify-between`}>
                                            <div className="flex items-center gap-3">
                                              <span className={`font-mono text-[9px] font-bold tracking-widest ${isCorrect || isSelected ? 'opacity-100' : 'opacity-40'}`}>
                                                {String.fromCharCode(65 + optIdx)}
                                              </span>
                                              <span className="font-mono text-xs uppercase tracking-wide">{opt}</span>
                                            </div>
                                            {isCorrect && (
                                              <span className="font-mono text-[8px] uppercase tracking-widest text-green-600 font-bold">CORRECT</span>
                                            )}
                                            {isSelected && !isCorrect && (
                                              <span className="font-mono text-[8px] uppercase tracking-widest text-red-600 font-bold">INCORRECT</span>
                                            )}
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
                        </td>
                      </motion.tr>
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
