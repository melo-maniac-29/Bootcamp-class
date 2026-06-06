"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Skeleton } from "../ui/skeleton";

export default function StudentDrawer({ isOpen, onClose, userId }) {
  const data = useQuery(api.users.getUserPointsBreakdown, userId ? { targetUserId: userId } : "skip");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 z-40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-[#0a0a0a] border-l border-black/[0.1] dark:border-white/[0.1] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h2 className="font-display font-black text-xl tracking-tight uppercase text-black dark:text-white">
                Participant Profile
              </h2>
              <button
                onClick={onClose}
                className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {!data ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-64 w-full rounded-xl" />
                </div>
              ) : (
                <>
                  {/* Profile Summary */}
                  <div className="flex items-center gap-5">
                    {data.user.image ? (
                      <img src={data.user.image} alt={data.user.name} className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center font-mono text-xl text-black/40 dark:text-white/40">
                        {data.user.name ? data.user.name.charAt(0).toUpperCase() : "?"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-mono text-lg font-bold uppercase tracking-wider text-black dark:text-white">
                        {data.user.name || "UNKNOWN"}
                      </h3>
                      <p className="font-mono text-xs text-black/40 dark:text-white/40 uppercase tracking-widest mt-1">
                        ID // {data.user.participantId}
                      </p>
                      <p className="font-mono text-sm font-bold text-black dark:text-white mt-2">
                        {data.user.totalPoints || 0} <span className="text-black/40 dark:text-white/40 text-[10px] tracking-widest uppercase">TOTAL PTS</span>
                      </p>
                    </div>
                  </div>

                  {/* Activity Heatmap */}
                  <div>
                    <h4 className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase mb-3">
                      Activity Heatmap (Bootcamp Days)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.breakdown.map((day) => {
                        // Determine color based on completion
                        let bgColor = "bg-black/5 dark:bg-white/5"; // Empty
                        if (day.totalPointsForDay > 0) {
                          const maxPossible = day.maxQuizPoints + day.maxTaskPoints;
                          if (maxPossible > 0 && day.totalPointsForDay >= maxPossible * 0.8) {
                            bgColor = "bg-green-500/80 dark:bg-green-500/80"; // High score
                          } else if (day.totalPointsForDay > 0) {
                            bgColor = "bg-emerald-400/50 dark:bg-emerald-500/50"; // Partial score
                          }
                        }

                        return (
                          <div key={day.dayId} className="relative group cursor-help">
                            <div
                              className={`w-6 h-6 rounded-sm ${bgColor} border border-black/[0.04] dark:border-white/[0.04] transition-colors group-hover:ring-2 group-hover:ring-black/20 dark:group-hover:ring-white/20`}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                              <div className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-mono px-3 py-2 rounded-md shadow-xl text-center">
                                <span className="font-bold opacity-50 uppercase tracking-widest block mb-1">
                                  Week {day.weekOrder} {"//"} Day {day.dayOrder}
                                </span>
                                <span className="block font-bold">{day.dayTitle}</span>
                                <span className="block mt-1 text-green-400 dark:text-green-600">Earned: {day.totalPointsForDay} pts</span>
                              </div>
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-white" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Points Breakdown Timeline */}
                  <div>
                    <h4 className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase mb-4">
                      Points Breakdown
                    </h4>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-black/10 dark:before:via-white/10 before:to-transparent">
                      {data.breakdown.map((day, idx) => (
                        <div key={day.dayId} className="relative flex items-start justify-between gap-4 md:justify-normal md:odd:flex-row-reverse group is-active">
                          {/* Timeline dot */}
                          <div className="absolute left-5 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-3 h-3 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-black/20 dark:bg-white/20 group-hover:bg-black group-hover:dark:bg-white transition-colors mt-1.5" />
                          
                          {/* Card */}
                          <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] ml-12 md:ml-0 p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#111] hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                                W{day.weekOrder} {"//"} D{day.dayOrder} <span className="text-black/60 dark:text-white/60 ml-1.5">{day.dayTitle}</span>
                              </h5>
                              <span className="font-mono text-sm font-bold text-black dark:text-white">
                                {day.totalPointsForDay} pts
                              </span>
                            </div>
                            
                            <div className="space-y-1.5 mt-3">
                              {day.maxQuizPoints > 0 && (
                                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                                  <span className="text-black/50 dark:text-white/50">Quiz Points</span>
                                  <span className={day.quizPoints > 0 ? "text-green-600 dark:text-green-400 font-bold" : "text-black/30 dark:text-white/30"}>
                                    {day.quizPoints} / {day.maxQuizPoints}
                                  </span>
                                </div>
                              )}
                              {day.maxTaskPoints > 0 && (
                                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                                  <span className="text-black/50 dark:text-white/50">Task Points</span>
                                  <span className={day.taskPoints > 0 ? "text-green-600 dark:text-green-400 font-bold" : "text-black/30 dark:text-white/30"}>
                                    {day.taskPoints} / {day.maxTaskPoints}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {data.breakdown.length === 0 && (
                        <p className="font-mono text-[10px] text-black/40 dark:text-white/40 tracking-widest uppercase text-center py-8">
                          No bootcamp days available.
                        </p>
                      )}

                      {data.breakdown.length > 0 && (
                        <div className="relative flex items-center justify-center pt-8 pb-4">
                          <div className="absolute left-5 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-4 h-4 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-black dark:bg-white z-10" />
                          <div className="ml-12 md:ml-0 bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-widest z-10 shadow-lg">
                            TOTAL EARNED: {data.user.calculatedPoints} PTS
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
