"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Skeleton } from "../../../components/ui/skeleton";
import { motion } from "framer-motion";

export default function RoadmapPage() {
  const weeks = useQuery(api.content.getWeeks);
  
  if (weeks === undefined) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/3 bg-black/5" />
        <Skeleton className="h-48 w-full rounded-xl bg-black/5" />
        <Skeleton className="h-48 w-full rounded-xl bg-black/5" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-8 mb-10">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3">
          COGNITION_MAP // ACTIVATED
        </p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">
          Bootcamp Roadmap.
        </h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          {weeks.length} WEEK_CLUSTERS LOADED // SEQUENTIAL_MODE
        </p>
      </div>

      {/* Weeks */}
      <div className="space-y-6">
        {weeks.map((week, index) => (
          <motion.div
            key={week._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden bg-[#F8F9FA] dark:bg-[#111111]"
          >
            {/* Week Header */}
            <div className="p-6 border-b border-black/[0.06] dark:border-white/[0.06] flex justify-between items-start bg-white dark:bg-[#0a0a0a]">
              <div>
                <p className="font-mono text-[9px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-1">
                  WEEK_CLUSTER // {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-xl font-display font-black tracking-tighter uppercase text-black dark:text-white">{week.title}</h3>
                {week.description && (
                  <p className="text-black/40 dark:text-white/40 text-sm font-mono mt-1">{week.description}</p>
                )}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 border border-black/10 dark:border-white/10 rounded-full text-black/40 dark:text-white/40">
                {week.status}
              </span>
            </div>
            
            {/* Days */}
            <div className="p-4">
              <WeekDays weekId={week._id} />
            </div>
          </motion.div>
        ))}

        {weeks.length === 0 && (
          <div className="text-center py-16 border border-dashed border-black/10 dark:border-white/10 rounded-xl">
            <p className="font-mono text-[10px] tracking-widest text-black/30 dark:text-white/30 uppercase">
              NO_CONTENT_NODES // AWAITING_ADMIN_RELEASE
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function WeekDays({ weekId }) {
  const days = useQuery(api.content.getDays, { weekId });
  const now = Date.now();

  if (days === undefined) {
    return (
      <div className="space-y-2 p-2">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg bg-black/5 dark:bg-white/5" />)}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {days.map((day, idx) => {
        const isLocked = day.unlockAt && now < day.unlockAt;
        
        return (
          <Link 
            href={`/dashboard/days/${day._id}`} 
            key={day._id}
            onClick={(e) => isLocked && e.preventDefault()}
            className={`flex items-center justify-between p-4 rounded-lg border border-black/[0.06] dark:border-white/[0.06] hover:border-black/20 dark:hover:border-white/20 transition-all group bg-[#F8F9FA] dark:bg-[#111111] ${isLocked ? 'opacity-60 cursor-not-allowed hover:bg-[#F8F9FA] dark:hover:bg-[#111111]' : 'hover:bg-white dark:hover:bg-[#151515]'}`}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] font-bold text-black/20 dark:text-white/20 group-hover:text-black/50 dark:group-hover:text-white/50 transition-colors w-6">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white transition-colors uppercase tracking-wider">
                  {day.title}
                  {isLocked && (
                    <svg className="w-3.5 h-3.5 text-black/40 dark:text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  )}
                </div>
                <div className="font-mono text-[9px] text-black/30 dark:text-white/30 uppercase tracking-wider mt-0.5">
                  DAY_{String(day.order).padStart(2, "0")} // {isLocked ? `UNLOCKS ${new Date(day.unlockAt).toLocaleDateString()}` : "ACTIVE"}
                </div>
              </div>
            </div>
            {!isLocked && (
              <svg className="w-4 h-4 text-black/20 dark:text-white/20 group-hover:text-black/60 dark:group-hover:text-white/60 group-hover:translate-x-1 transition-all" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </Link>
        );
      })}
      {days.length === 0 && (
        <div className="font-mono text-[10px] text-black/20 dark:text-white/20 uppercase tracking-widest py-4 px-4">
          NO_DAY_NODES // PENDING
        </div>
      )}
    </div>
  );
}
