"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Skeleton } from "../../../components/ui/skeleton";
import { useState, useEffect } from "react";

export default function LeaderboardPage() {
  const users = useQuery(api.users.getLeaderboard);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredUsers = (users || []).filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.participantId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user._id.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="SEARCH PARTICIPANT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg px-4 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
          />
        </div>
      </div>

      <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
          <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 w-12 text-center uppercase">RANK</p>
          <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase">PARTICIPANT</p>
          <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase text-right pr-4">POINTS</p>
        </div>

        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          {paginatedUsers.map((user, idx) => {
            const actualRank = users.findIndex(u => u._id === user._id) + 1;
            const isTop3 = actualRank <= 3;
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
                  <span className={`font-display font-black text-2xl ${isTop3 ? rankColors[actualRank - 1] : 'text-black/20 dark:text-white/20 group-hover:text-black/40 dark:group-hover:text-white/40'} transition-colors`}>
                    {actualRank}
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

          {users.length > 0 && filteredUsers.length === 0 && (
            <div className="p-16 text-center">
              <p className="font-mono text-[10px] text-black/30 dark:text-white/30 tracking-widest uppercase">
                NO_RESULTS_FOUND
              </p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8 px-2 border-t border-black/[0.06] dark:border-white/[0.06] pt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors"
          >
            &lt; PREVIOUS_PAGE
          </button>
          <span className="font-mono text-[10px] tracking-widest text-black/30 dark:text-white/30 uppercase">
            PAGE {currentPage} OF {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors"
          >
            NEXT_PAGE &gt;
          </button>
        </div>
      )}
    </motion.div>
  );
}
