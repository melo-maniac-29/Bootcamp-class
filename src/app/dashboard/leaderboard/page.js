"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Skeleton } from "../../../components/ui/skeleton";

export default function LeaderboardPage() {
  const users = useQuery(api.users.getLeaderboard);

  if (users === undefined) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/3 bg-black/5" />
        <Skeleton className="h-96 w-full rounded-xl bg-black/5" />
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
          GLOBAL_RANKINGS // REALTIME
        </p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">
          Leaderboard.
        </h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          {users.length} PARTICIPANTS // POINTS_EVALUATION
        </p>
      </div>

      <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
          <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 w-12 text-center uppercase">RANK</p>
          <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase">PARTICIPANT</p>
          <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase text-right pr-4">POINTS</p>
        </div>

        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          {users.map((user, idx) => {
            const isTop3 = idx < 3;
            const rankColors = ["text-yellow-500", "text-neutral-400", "text-orange-500"];
            
            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="grid grid-cols-[auto_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
              >
                <div className="w-12 flex justify-center">
                  <span className={`font-display font-black text-2xl ${isTop3 ? rankColors[idx] : 'text-black/20 dark:text-white/20 group-hover:text-black/40 dark:group-hover:text-white/40'} transition-colors`}>
                    {idx + 1}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center font-mono text-xs text-black/40 dark:text-white/40">
                      {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div>
                    <p className="font-mono text-sm font-bold uppercase tracking-wider text-black dark:text-white group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors">
                      {user.name || "UNKNOWN_PARTICIPANT"}
                    </p>
                    <p className="font-mono text-[9px] text-black/30 dark:text-white/30 uppercase tracking-widest mt-1">
                      ID // {user.participantId || user._id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="pr-4">
                  <p className="font-mono text-xl font-bold tracking-tight text-black dark:text-white">
                    {user.totalPoints || 0}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {users.length === 0 && (
            <div className="p-16 text-center">
              <p className="font-mono text-[10px] text-black/30 dark:text-white/30 tracking-widest uppercase">
                NO_PARTICIPANTS // PENDING_DATA
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
