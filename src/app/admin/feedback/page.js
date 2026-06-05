"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className={`${
            star <= (rating || 0)
              ? "text-yellow-500 dark:text-yellow-400"
              : "text-black/10 dark:text-white/20"
          }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

const PAGE_SIZE = 10;

export default function FeedbackPage() {
  const feedbacks = useQuery(api.content.listFeedbackResponses) || [];
  const [expanded, setExpanded] = useState({});
  const [pages, setPages] = useState({});
  const [search, setSearch] = useState("");
  const [weekFilter, setWeekFilter] = useState("All");
  const [dayFilter, setDayFilter] = useState("All");

  // Derive unique week and day lists for dropdowns
  const allWeeks = [...new Set(feedbacks.map(fb => fb.weekTitle))].sort((a, b) => {
    const wa = feedbacks.find(f => f.weekTitle === a)?.weekOrder ?? 999;
    const wb = feedbacks.find(f => f.weekTitle === b)?.weekOrder ?? 999;
    return wa - wb;
  });

  const daysForSelectedWeek = weekFilter === "All"
    ? [...new Set(feedbacks.map(fb => fb.dayTitle))]
    : [...new Set(feedbacks.filter(fb => fb.weekTitle === weekFilter).map(fb => fb.dayTitle))];

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  const getPage = (key) => pages[key] || 1;
  const setPage = (key, p) => setPages(prev => ({ ...prev, [key]: p }));

  // Filter by search term + week + day
  const filtered = feedbacks.filter(fb => {
    const matchesSearch = !search.trim() ||
      fb.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      fb.dayTitle?.toLowerCase().includes(search.toLowerCase()) ||
      fb.weekTitle?.toLowerCase().includes(search.toLowerCase()) ||
      fb.feedbackResponse?.toLowerCase().includes(search.toLowerCase());
    const matchesWeek = weekFilter === "All" || fb.weekTitle === weekFilter;
    const matchesDay = dayFilter === "All" || fb.dayTitle === dayFilter;
    return matchesSearch && matchesWeek && matchesDay;
  });

  // Group by week then by day
  const grouped = {};
  for (const fb of filtered) {
    const wKey = fb.weekTitle;
    const dKey = fb.dayTitle;
    if (!grouped[wKey]) grouped[wKey] = { weekOrder: fb.weekOrder, days: {} };
    if (!grouped[wKey].days[dKey]) grouped[wKey].days[dKey] = { dayOrder: fb.dayOrder, responses: [] };
    grouped[wKey].days[dKey].responses.push(fb);
  }

  const sortedWeeks = Object.entries(grouped).sort((a, b) => a[1].weekOrder - b[1].weekOrder);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-8 mb-8">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3">
          QUIZ_FEEDBACK // RESPONSES
        </p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">
          Feedback.
        </h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          {filtered.length} / {feedbacks.length} RESPONSE_NODES
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 mb-8">
        <input
          type="text"
          placeholder="SEARCH BY STUDENT, DAY, WEEK OR RESPONSE..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPages({}); }}
          className="w-full bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg px-4 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20"
        />
        <div className="flex gap-3">
          {/* Week filter */}
          <div className="relative flex-1">
            <select
              value={weekFilter}
              onChange={e => { setWeekFilter(e.target.value); setDayFilter("All"); setPages({}); }}
              className="w-full appearance-none bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg pl-4 pr-10 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
            >
              <option value="All">ALL_WEEKS</option>
              {allWeeks.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black/40 dark:text-white/40">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {/* Day filter */}
          <div className="relative flex-1">
            <select
              value={dayFilter}
              onChange={e => { setDayFilter(e.target.value); setPages({}); }}
              className="w-full appearance-none bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg pl-4 pr-10 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
            >
              <option value="All">ALL_DAYS</option>
              {daysForSelectedWeek.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black/40 dark:text-white/40">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="py-20 text-center border border-dashed border-black/10 dark:border-white/10 rounded-xl">
          <p className="font-mono text-[10px] tracking-widest text-black/20 dark:text-white/20 uppercase">
            {feedbacks.length === 0 ? "NO_FEEDBACK_YET // ENABLE_FEEDBACK_IN_QUIZ_SETTINGS" : "NO_RESULTS // TRY_A_DIFFERENT_SEARCH"}
          </p>
        </div>
      )}

      {/* Grouped Feedback */}
      <div className="space-y-8">
        {sortedWeeks.map(([weekTitle, weekData]) => {
          const sortedDays = Object.entries(weekData.days).sort((a, b) => a[1].dayOrder - b[1].dayOrder);
          return (
            <div key={weekTitle}>
              {/* Week header */}
              <div className="flex items-center gap-4 mb-4">
                <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase shrink-0">
                  {weekTitle}
                </p>
                <div className="flex-1 h-[1px] bg-black/[0.06] dark:bg-white/[0.06]" />
              </div>

              <div className="space-y-4">
                {sortedDays.map(([dayTitle, dayData]) => {
                  const groupKey = `${weekTitle}::${dayTitle}`;
                  const isOpen = expanded[groupKey] !== false;
                  const currentPage = getPage(groupKey);
                  const totalPages = Math.ceil(dayData.responses.length / PAGE_SIZE);
                  const pageResponses = dayData.responses.slice(
                    (currentPage - 1) * PAGE_SIZE,
                    currentPage * PAGE_SIZE
                  );

                  return (
                    <div key={dayTitle} className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
                      {/* Day header toggle */}
                      <button
                        onClick={() => toggle(groupKey)}
                        className="w-full flex items-center justify-between px-5 py-4 bg-[#F8F9FA] dark:bg-[#111111] hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[9px] tracking-widest text-black/30 dark:text-white/30 uppercase">
                            {weekTitle}
                          </span>
                          <span className="text-black/20 dark:text-white/20">·</span>
                          <span className="font-mono text-xs font-bold text-black dark:text-white uppercase tracking-wide">
                            {dayTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[9px] text-black/30 dark:text-white/30 tracking-widest">
                            {dayData.responses.length} RESPONSE{dayData.responses.length !== 1 ? "S" : ""}
                          </span>
                          <svg
                            className={`w-3 h-3 text-black/40 dark:text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Responses */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                              {pageResponses.map((fb) => (
                                <div key={fb._id} className="px-5 py-4">
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                    <span className="font-mono text-[11px] font-bold text-black dark:text-white uppercase tracking-wider">
                                      {fb.studentName}
                                    </span>
                                    {fb.starRatingEnabled ? (
                                      <div className="shrink-0">
                                        <StarRating rating={fb.studentRating} />
                                      </div>
                                    ) : fb.quizScore !== undefined ? (
                                      <span className="font-mono text-[9px] text-black/40 dark:text-white/40 tracking-widest shrink-0">
                                        SCORE: {fb.quizScore}/{fb.quizTotal}
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="font-mono text-sm text-black/70 dark:text-white/60 leading-relaxed">
                                    {fb.feedbackResponse}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Pagination within this day group */}
                            {totalPages > 1 && (
                              <div className="flex items-center justify-between px-5 py-3 border-t border-black/[0.04] dark:border-white/[0.04] bg-[#F8F9FA] dark:bg-[#111111]">
                                <p className="font-mono text-[9px] text-black/30 dark:text-white/30 tracking-widest uppercase">
                                  PAGE {currentPage} OF {totalPages}
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(groupKey, currentPage - 1)}
                                    className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-black dark:text-white"
                                  >
                                    PREV
                                  </button>
                                  <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setPage(groupKey, currentPage + 1)}
                                    className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-black dark:text-white"
                                  >
                                    NEXT
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
