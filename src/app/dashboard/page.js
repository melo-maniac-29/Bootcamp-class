"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Skeleton } from "../../components/ui/skeleton";

/**
 * Purpose:
 *   Student dashboard overview. Displays real stats sourced from Convex:
 *   streak from user.streakCount, submission/completion counts from
 *   getMyProgress, and the leaderboard from getLeaderboard.
 *   No mock data is used.
 */
export default function DashboardPage() {
  const user = useQuery(api.users.current);
  const progress = useQuery(api.content.getMyProgress);

  const isLoading = user === undefined || progress === undefined;

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-1/3 bg-black/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl bg-black/5" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-64 rounded-xl bg-black/5" />
          <Skeleton className="h-64 rounded-xl bg-black/5" />
        </div>
      </div>
    );
  }

  const userName = user?.name || user?.email?.split('@')[0] || "USER";
  const totalDays = progress?.totalDays || 0;
  const submittedDays = progress?.submittedDays || 0;
  const approvedDays = progress?.approvedDays || 0;
  const quizCompleted = progress?.quizCompleted || 0;

  // Derived percentages — guard against zero totalDays
  const submissionPct = totalDays > 0 ? Math.round((submittedDays / totalDays) * 100) : 0;
  const approvalPct = totalDays > 0 ? Math.round((approvedDays / totalDays) * 100) : 0;
  const quizPct = totalDays > 0 ? Math.round((quizCompleted / totalDays) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto space-y-10"
    >
      {/* Header */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-8">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3">
          SYS_IDENTITY // AUTHENTICATED
        </p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">
          {userName}.
        </h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          ROLE_NODE: <span className="text-black dark:text-white font-bold">{user?.role?.toUpperCase() || "STUDENT"}</span> // SYSTEM_ACCESS: GRANTED
        </p>
      </div>

      {/* Stats Grid — all real data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="TASKS_SUBMITTED" value={submittedDays} unit={`/ ${totalDays}`} index={0} />
        <StatCard label="TASKS_APPROVED" value={approvedDays} unit={`/ ${totalDays}`} index={1} />
        <StatCard label="QUIZZES_DONE" value={quizCompleted} unit={`/ ${totalDays}`} index={2} />
      </div>

      <div className="grid grid-cols-1 gap-8">

        {/* Progress Panel — real percentages */}
        <div>
          <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-8 bg-[#F8F9FA] dark:bg-[#111111] relative overflow-hidden">
            <div className="absolute top-3 right-4 font-mono text-[8px] text-black/10 dark:text-white/10 pointer-events-none select-none">
              PROGRESS_MATRIX
            </div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-2">COGNITIVE_JOURNEY</p>
            <h2 className="text-2xl font-display font-black tracking-tighter uppercase text-black dark:text-white mb-8">
              Completion Status.
            </h2>
            
            <div className="space-y-7">
              <ProgressBar
                label="TASKS_SUBMITTED"
                pct={submissionPct}
                detail={`${submittedDays} of ${totalDays} days`}
                delay={0}
                color="bg-black dark:bg-white"
              />
              <ProgressBar
                label="TASKS_APPROVED"
                pct={approvalPct}
                detail={`${approvedDays} of ${totalDays} days`}
                delay={0.15}
                color="bg-green-600"
              />
              <ProgressBar
                label="QUIZZES_COMPLETED"
                pct={quizPct}
                detail={`${quizCompleted} of ${totalDays} days`}
                delay={0.3}
                color="bg-black/50 dark:bg-white/50"
              />
            </div>

            {totalDays === 0 && (
              <p className="font-mono text-[10px] text-black/25 dark:text-white/25 uppercase tracking-widest mt-6">
                NO_CONTENT_RELEASED // CHECK BACK SOON
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProgressBar({ label, pct, detail, delay, color }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="font-mono text-[10px] text-black/40 dark:text-white/40 tracking-wider uppercase">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="font-display font-black text-2xl text-black dark:text-white leading-none">{pct}%</span>
        </div>
      </div>
      <div className="h-[2px] w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mb-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
      <p className="font-mono text-[9px] text-black/25 dark:text-white/25 uppercase tracking-wider">{detail}</p>
    </div>
  );
}

function StatCard({ label, value, unit, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-6 bg-[#F8F9FA] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#151515] transition-colors relative overflow-hidden"
    >
      <div className="absolute top-2 right-3 font-mono text-[8px] text-black/10 dark:text-white/10 select-none pointer-events-none">NODE</div>
      <p className="font-mono text-[9px] tracking-[0.25em] text-black/30 dark:text-white/30 uppercase mb-3">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-display font-black text-4xl tracking-tighter text-black dark:text-white leading-none">{value}</span>
        <span className="font-mono text-[10px] text-black/30 dark:text-white/30 uppercase tracking-wider">{unit}</span>
      </div>
    </motion.div>
  );
}
