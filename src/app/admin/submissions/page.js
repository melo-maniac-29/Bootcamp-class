"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SubmissionsPage() {
  const submissions = useQuery(api.submissions.listSubmissions) || [];
  const updateStatus = useMutation(api.submissions.updateStatus).withOptimisticUpdate(
    (localStore, args) => {
      const existing = localStore.getQuery(api.submissions.listSubmissions);
      if (existing) {
        localStore.setQuery(
          api.submissions.listSubmissions, 
          {}, 
          existing.map(sub => sub._id === args.submissionId ? { ...sub, status: args.status } : sub)
        );
      }
    }
  );
  
  const [successId, setSuccessId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [scores, setScores] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [weekFilter, setWeekFilter] = useState("All");
  const [dayFilter, setDayFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, weekFilter, dayFilter]);

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
    const matchesSearch = sub.userName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.dayTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const subStatus = sub.status || "Pending Review";
    const matchesStatus = statusFilter === "All" || subStatus === statusFilter;
    const matchesWeek = weekFilter === "All" || sub.weekTitle === weekFilter;
    const matchesDay = dayFilter === "All" || sub.dayTitle === dayFilter;
    return matchesSearch && matchesStatus && matchesWeek && matchesDay;
  }).sort((a, b) => {
    const statusWeight = { "Pending Review": 0, "Needs Revision": 1, "Approved": 2 };
    const weightA = statusWeight[a.status || "Pending Review"] ?? 0;
    const weightB = statusWeight[b.status || "Pending Review"] ?? 0;
    
    if (weightA !== weightB) return weightA - weightB;
    return (b.submittedAt || 0) - (a.submittedAt || 0);
  });

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdate = async (id, status, awardedScore) => {
    try {
      await updateStatus({ submissionId: id, status, awardedScore });
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 2000);
      setEditingId(null);
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const statusColor = (status) => {
    if (status === "Approved") return "text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30";
    if (status === "Needs Revision") return "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30";
    return "text-black/40 dark:text-white/40 border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5";
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
          Submissions.
        </h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          {filteredSubmissions.length} SUBMISSION_NODES LOADED
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input 
          type="text" 
          placeholder="SEARCH STUDENT OR TASK..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg px-4 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
        />
        <div className="relative w-full md:w-56 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-full bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg pl-4 pr-10 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white appearance-none"
          >
            <option value="All">ALL_STATUSES</option>
            <option value="Pending Review">PENDING_REVIEW</option>
            <option value="Approved">APPROVED</option>
            <option value="Needs Revision">NEEDS_REVISION</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black/30 dark:text-white/30">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
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
                {["STUDENT", "TASK_NODE", "SUBMISSION_LINK", "SCORE", "STATUS", "ACTION"].map(col => (
                  <th key={col} className="px-5 py-4 font-mono text-[9px] tracking-[0.25em] text-black/30 dark:text-white/30 uppercase font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedSubmissions.map((sub, i) => (
                <motion.tr
                  key={sub._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-[#F8F9FA] dark:hover:bg-[#111111] transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-bold text-black dark:text-white uppercase tracking-wider">{sub.userName}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest block mb-0.5">{sub.weekTitle}</span>
                    <span className="font-mono text-xs text-black/80 dark:text-white/80">{sub.dayTitle}</span>
                  </td>
                  <td className="px-5 py-4">
                    {sub.link ? (
                      <a href={sub.link} target="_blank" rel="noreferrer" className="font-mono text-xs text-black dark:text-white underline underline-offset-4 hover:text-black/60 dark:hover:text-white/60 transition-colors flex items-center gap-1">
                        VIEW_LINK
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path d="M2 10L10 2M5 2h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    ) : (
                      <span className="font-mono text-xs text-black/20 dark:text-white/20">NULL</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {sub.status === "Approved" && editingId !== sub._id ? (
                      <span className="font-mono text-[10px] text-black dark:text-white font-bold tracking-widest">
                        {sub.awardedScore !== undefined ? sub.awardedScore : sub.maxPoints} / {sub.maxPoints}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={sub.maxPoints}
                          value={scores[sub._id] !== undefined ? scores[sub._id] : (sub.awardedScore !== undefined ? sub.awardedScore : sub.maxPoints)}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setScores({ ...scores, [sub._id]: "" });
                              return;
                            }
                            const num = parseInt(val);
                            if (!isNaN(num)) {
                              setScores({ ...scores, [sub._id]: Math.min(Math.max(num, 0), sub.maxPoints) });
                            }
                          }}
                          className="w-16 bg-transparent border-b border-black/20 dark:border-white/20 font-mono text-[10px] text-center focus:outline-none focus:border-black dark:focus:border-white"
                        />
                        <span className="font-mono text-[10px] text-black/50 dark:text-white/50">/ {sub.maxPoints}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block font-mono text-[9px] uppercase tracking-widest px-2 py-1 border rounded-full ${statusColor(sub.status)}`}>
                      {sub.status || "PENDING"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {sub.status !== "Approved" || editingId === sub._id ? (
                        <>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to ${sub.status === "Approved" ? "save changes" : "approve"} this submission?`)) {
                                handleUpdate(sub._id, "Approved", scores[sub._id] !== undefined ? scores[sub._id] : (sub.awardedScore !== undefined ? sub.awardedScore : sub.maxPoints));
                              }
                            }}
                            className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                          >
                            {sub.status === "Approved" ? "SAVE" : "APPROVE"}
                          </button>
                          {sub.status === "Approved" ? (
                            <button
                              onClick={() => setEditingId(null)}
                              className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-black/20 dark:border-white/20 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              CANCEL
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to mark this submission for revision?")) {
                                  handleUpdate(sub._id, "Needs Revision");
                                }
                              }}
                              className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                            >
                              REVISE
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-[9px] text-black/30 dark:text-white/30 uppercase tracking-widest">
                            REVIEWED
                          </span>
                          <button
                            onClick={() => setEditingId(sub._id)}
                            className="ml-2 font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            EDIT
                          </button>
                        </>
                      )}
                      {successId === sub._id && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="font-mono text-[9px] text-green-600 dark:text-green-400 uppercase tracking-wider"
                        >
                          SAVED
                        </motion.span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paginatedSubmissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <p className="font-mono text-[10px] tracking-widest text-black/20 dark:text-white/20 uppercase">
                      QUEUE_EMPTY // NO_SUBMISSIONS_PENDING
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
