"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Skeleton } from "../../../components/ui/skeleton";
import { motion } from "framer-motion";
import LinkifiedText from "@/components/LinkifiedText";

export default function RoadmapPage() {
  const weeks = useQuery(api.content.getWeeks);
  
  if (weeks === undefined) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pt-10">
        <Skeleton className="h-8 w-1/3 bg-black/5" />
        <Skeleton className="h-48 w-full rounded-xl bg-black/5" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto pb-24"
    >
      {/* Header */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-8 mb-16">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          COGNITION_MAP // ACTIVATED
        </p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">
          Bootcamp Roadmap.
        </h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          {weeks.length} WEEK_CLUSTERS LOADED // SEQUENTIAL_MODE
        </p>
      </div>

      {/* Timeline */}
      <div className="relative pl-8 md:pl-12">
        {/* Main vertical trace line */}
        <div className="absolute top-0 bottom-0 left-4 md:left-6 w-[1px] bg-black/[0.06] dark:bg-white/[0.06] z-0"></div>

        <div className="space-y-16">
          {weeks.map((week, index) => {
            const now = Date.now();
            const isWeekLocked = week.unlockAt && now < week.unlockAt;
            return (
            <motion.div
              key={week._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              {/* Week Node */}
              <div className="flex items-start gap-6 mb-8">
                {/* Node dot */}
                <div className="relative z-10 w-8 h-8 rounded-full bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white flex items-center justify-center shrink-0 -ml-8 md:-ml-10">
                  <span className="font-mono text-[9px] font-bold text-black dark:text-white">{index + 1}</span>
                </div>
                
                <div className="flex-1 pt-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div>
                      <p className="font-mono text-[9px] tracking-[0.3em] text-black/40 dark:text-white/40 uppercase mb-1">
                        WEEK_CLUSTER // {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="text-2xl font-display font-black tracking-tighter uppercase text-black dark:text-white">{week.title}</h3>
                    </div>
                    <span className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 border rounded-full self-start ${isWeekLocked ? "border-orange-500/20 text-orange-500 bg-orange-500/5" : "border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 bg-black/5 dark:bg-white/5"}`}>
                      {isWeekLocked ? `UNLOCKS ${new Date(week.unlockAt).toLocaleDateString('en-GB')}` : week.status}
                    </span>
                  </div>
                  {week.description && (
                    <p className="text-black/50 dark:text-white/50 text-sm font-mono leading-relaxed max-w-2xl">
                      <LinkifiedText>{week.description}</LinkifiedText>
                    </p>
                  )}
                </div>
              </div>
              
              {/* Days List */}
              <div className="pl-8 md:pl-14">
                <WeekDays weekId={week._id} isWeekLocked={isWeekLocked} />
              </div>
            </motion.div>
          )})}

          {weeks.length === 0 && (
            <div className="text-center py-24 relative z-10 bg-white dark:bg-[#0a0a0a] border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
              <p className="font-mono text-[10px] tracking-widest text-black/30 dark:text-white/30 uppercase">
                NO_CONTENT_NODES // AWAITING_ADMIN_RELEASE
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function WeekDays({ weekId, isWeekLocked }) {
  const days = useQuery(api.content.getDays, { weekId });
  const now = Date.now();

  if (days === undefined) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl bg-black/5 dark:bg-white/5" />)}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {days.map((day, idx) => {
        const isLocked = isWeekLocked || (day.unlockAt && now < day.unlockAt);
        
        return (
          <Link 
            href={isLocked ? "#" : `/admin/roadmap/${day._id}`}
            key={day._id}
            className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] transition-all group bg-white dark:bg-[#0a0a0a] relative overflow-hidden ${
              isLocked 
                ? "opacity-60 cursor-not-allowed" 
                : "hover:border-black/30 dark:hover:border-white/30 hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {/* Hover Accent Line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-white scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
            
            <div className="flex items-start gap-5">
              <span className="font-mono text-[10px] font-bold text-black/20 dark:text-white/20 group-hover:text-black/40 dark:group-hover:text-white/40 transition-colors w-6 pt-0.5">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="flex items-center gap-3 font-mono text-base font-bold text-black/70 dark:text-white/70 group-hover:text-black dark:group-hover:text-white transition-colors uppercase tracking-wider mb-1">
                  {day.title}
                  {isLocked && (
                    <svg className="w-3.5 h-3.5 text-black/30 dark:text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  )}
                </div>
                <div className="font-mono text-[9px] text-black/40 dark:text-white/40 uppercase tracking-widest flex flex-wrap gap-3 items-center">
                  <span>DAY_{String(day.order).padStart(2, "0")}</span>
                  <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20"></span>
                  <span className={isLocked ? "text-orange-500" : "text-green-500"}>
                    {isLocked ? (isWeekLocked ? `LOCKED BY WEEK` : `UNLOCKS ${new Date(day.unlockAt).toLocaleDateString('en-GB')}`) : "ACTIVE_NODE"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-black/20 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors">
              <span className="font-mono text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">ENTER</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        );
      })}
      {days.length === 0 && (
        <div className="font-mono text-[10px] text-black/30 dark:text-white/30 uppercase tracking-widest py-6 px-6 border border-dashed border-black/10 dark:border-white/10 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
          NO_DAY_NODES // PENDING
        </div>
      )}
    </div>
  );
}
