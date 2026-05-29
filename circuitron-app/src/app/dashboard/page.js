"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Skeleton } from "../../components/ui/skeleton";

export default function DashboardPage() {
  const user = useQuery(api.users.current);
  const leaderboard = useQuery(api.users.getLeaderboard);

  if (user === undefined) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-1/3 bg-black/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl bg-black/5" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-xl bg-black/5" />
      </div>
    );
  }

  const userName = user?.name || user?.email?.split('@')[0] || "USER";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto space-y-10"
    >
      {/* Header */}
      <div className="border-b border-black/[0.06] pb-8">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 uppercase mb-3">
          SYS_IDENTITY // AUTHENTICATED
        </p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black">
          {userName}.
        </h1>
        <p className="text-black/40 mt-2 font-mono text-xs tracking-wider uppercase">
          ROLE_NODE: <span className="text-black font-bold">{user?.role || "STUDENT"}</span> // SYSTEM_ACCESS: GRANTED
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="STREAK_COUNT" value={`${user?.streakCount || 0}`} unit="DAYS" index={0} />
        <StatCard label="TASK_NODES" value="04" unit="/ 12" index={1} />
        <StatCard label="WATCH_CYCLES" value="12h" unit="30m" index={2} />
        <StatCard label="GLOBAL_RANK" value="#42" unit="APEX" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress Panel */}
        <div className="lg:col-span-2">
          <div className="border border-black/[0.06] rounded-xl p-8 bg-[#F8F9FA] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 font-mono text-[8px] text-black/10 pointer-events-none select-none">
              PROGRESS_MATRIX
            </div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 uppercase mb-2">COGNITIVE_JOURNEY</p>
            <h2 className="text-2xl font-display font-black tracking-tighter uppercase text-black mb-8">
              Completion Status.
            </h2>
            
            <div className="space-y-6">
              <ProgressBar label="OVERALL_COMPLETION" pct={33} delay={0} color="bg-black" />
              <ProgressBar label="QUIZ_MODULES" pct={56} delay={0.15} color="bg-green-600" />
              <ProgressBar label="SUBMISSION_RATE" pct={20} delay={0.3} color="bg-black/40" />
            </div>
          </div>
        </div>

        {/* Leaderboard Panel */}
        <div className="border border-black/[0.06] rounded-xl p-6 bg-[#F8F9FA]">
          <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 uppercase mb-2">RANK_MATRIX</p>
          <h2 className="text-xl font-display font-black tracking-tighter uppercase text-black mb-6">
            Top Nodes.
          </h2>
          
          {leaderboard === undefined ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg bg-black/5" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 8).map((u, i) => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-lg border border-black/[0.06] hover:bg-black/[0.03] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-[10px] font-bold w-6 ${
                      i === 0 ? "text-yellow-600" :
                      i === 1 ? "text-gray-500" :
                      i === 2 ? "text-amber-600" :
                      "text-black/20"
                    }`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-xs text-black/60">{u.name || "ANONYMOUS"}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-green-700">
                    {u.streakCount || 0}d
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProgressBar({ label, pct, delay, color }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <span className="font-mono text-[10px] text-black/40 tracking-wider uppercase">{label}</span>
        <span className="font-display font-black text-2xl text-black leading-none">{pct}%</span>
      </div>
      <div className="h-[2px] w-full bg-black/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="border border-black/[0.06] rounded-xl p-6 bg-[#F8F9FA] hover:bg-white transition-colors group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2 font-mono text-[8px] text-black/10 select-none pointer-events-none">NODE</div>
      <p className="font-mono text-[9px] tracking-[0.25em] text-black/30 uppercase mb-3">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-display font-black text-4xl tracking-tighter text-black leading-none">{value}</span>
        <span className="font-mono text-[10px] text-black/30 uppercase tracking-wider">{unit}</span>
      </div>
    </motion.div>
  );
}
