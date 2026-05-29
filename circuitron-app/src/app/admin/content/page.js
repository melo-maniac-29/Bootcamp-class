"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DayEditor from "./DayEditor";

/**
 * Purpose:
 *   Admin curriculum management page. Creates/deletes weeks, selects
 *   weeks to view their days, and opens the DayEditor for a selected day.
 *   Volunteers are redirected to /admin/submissions.
 */
export default function ContentPage() {
  const router = useRouter();
  const currentUser = useQuery(api.users.current);
  
  if (currentUser === undefined) return null;
  if (currentUser && currentUser.role === "volunteer") {
    router.push("/admin/submissions");
    return null;
  }

  const weeks = useQuery(api.content.getWeeks) || [];
  const createWeek = useMutation(api.content.createWeek);
  const createDay = useMutation(api.content.createDay);
  const deleteWeek = useMutation(api.content.deleteWeek);

  const [newWeekTitle, setNewWeekTitle] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [editingDayId, setEditingDayId] = useState(null);
  
  const days = useQuery(api.content.getDays, { weekId: selectedWeek === null ? undefined : selectedWeek }) || [];

  const handleCreateWeek = async (e) => {
    e.preventDefault();
    if (!newWeekTitle.trim()) return;
    await createWeek({ title: newWeekTitle, status: "active", order: weeks.length + 1 });
    setNewWeekTitle("");
  };

  const handleCreateDay = async () => {
    if (!selectedWeek) return;
    await createDay({ weekId: selectedWeek, title: "New Day", order: days.length + 1 });
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
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3">ADMIN // CURRICULUM_MANAGER</p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">Curriculum.</h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          {weeks.length} WEEK_CLUSTERS · SELECT TO MANAGE DAYS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ── WEEKS ── */}
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-4">WEEK_CLUSTERS</p>

          {/* Create week form */}
          <form onSubmit={handleCreateWeek} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newWeekTitle}
              onChange={(e) => setNewWeekTitle(e.target.value)}
              placeholder="Week title e.g. Week 1 — Foundations"
              className="flex-1 border border-black/[0.12] dark:border-white/[0.12] rounded-lg px-4 py-2.5 font-mono text-sm outline-none focus:border-black dark:focus:border-white transition-colors bg-white dark:bg-[#0a0a0a] text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20"
            />
            <button
              type="submit"
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center gap-2 shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              ADD
            </button>
          </form>

          <div className="space-y-2">
            {weeks.map((week, i) => (
              <div
                key={week._id}
                className={`p-4 rounded-xl border transition-all flex justify-between items-center group cursor-pointer ${
                  selectedWeek === week._id
                    ? "bg-black dark:bg-white border-black dark:border-white"
                    : "bg-[#F8F9FA] dark:bg-[#111111] border-black/[0.06] dark:border-white/[0.06] hover:border-black/20 dark:hover:border-white/20"
                }`}
                onClick={() => { setSelectedWeek(week._id); setEditingDayId(null); }}
              >
                <div>
                  <p className={`font-mono text-[9px] tracking-[0.2em] uppercase mb-0.5 ${selectedWeek === week._id ? "text-white/50 dark:text-black/50" : "text-black/30 dark:text-white/30"}`}>
                    CLUSTER_{String(i + 1).padStart(2, "0")}
                  </p>
                  <p className={`font-mono text-sm font-bold uppercase tracking-wider ${selectedWeek === week._id ? "text-white dark:text-black" : "text-black dark:text-white"}`}>
                    {week.title}
                  </p>
                  <p className={`font-mono text-[9px] uppercase mt-0.5 ${selectedWeek === week._id ? "text-white/40 dark:text-black/40" : "text-black/30 dark:text-white/30"}`}>
                    STATUS: {week.status?.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this week and all its days?")) {
                      deleteWeek({ weekId: week._id });
                      if (selectedWeek === week._id) setSelectedWeek(null);
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                    selectedWeek === week._id ? "hover:bg-white/10 dark:hover:bg-black/10 text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black" : "hover:bg-red-50 dark:hover:bg-red-900/30 text-black/30 dark:text-white/30 hover:text-red-600 dark:hover:text-red-400"
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M3 4h10M6 4V2h4v2M6 7v5M10 7v5M4 4l.5 9h7l.5-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
            {weeks.length === 0 && (
              <div className="py-10 text-center border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase">NO_CLUSTERS // CREATE ABOVE</p>
              </div>
            )}
          </div>
        </div>

        {/* ── DAYS ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase">DAY_NODES</p>
            {selectedWeek && !editingDayId && (
              <button
                onClick={handleCreateDay}
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg border border-black/[0.12] dark:border-white/[0.12] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all"
              >
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                ADD_DAY
              </button>
            )}
          </div>

          {!selectedWeek ? (
            <div className="py-16 text-center border border-dashed border-black/10 dark:border-white/10 rounded-xl">
              <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase">SELECT_CLUSTER // TO VIEW DAYS</p>
            </div>
          ) : editingDayId ? (
            <DayEditor dayId={editingDayId} onClose={() => setEditingDayId(null)} />
          ) : (
            <div className="space-y-2">
              {days.map((day, idx) => (
                <div
                  key={day._id}
                  className="p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111] flex justify-between items-center group hover:border-black/20 dark:hover:border-white/20 transition-all"
                >
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.2em] text-black/30 dark:text-white/30 uppercase mb-0.5">
                      DAY_{String(day.order).padStart(2, "0")}
                    </p>
                    <p className="font-mono text-sm font-bold text-black dark:text-white uppercase tracking-wider">{day.title}</p>
                  </div>
                  <button
                    onClick={() => setEditingDayId(day._id)}
                    className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-black/[0.08] dark:border-white/[0.08] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    EDIT
                  </button>
                </div>
              ))}
              {days.length === 0 && (
                <div className="py-10 text-center border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                  <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase">NO_DAYS // ADD ABOVE</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
