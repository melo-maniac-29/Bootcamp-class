"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from "framer-motion";

export default function MyStudentsPage() {
  const myStudents = useQuery(api.users.getMyStudents);

  if (myStudents === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase animate-pulse">LOADING_STUDENTS...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto"
    >
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-8 mb-10">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3">STAFF // ASSIGNMENTS</p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">My Students.</h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          {myStudents.length} ASSIGNED_NODES
        </p>
      </div>

      <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
                {["STUDENT_NAME", "EMAIL", "PARTICIPANT_ID"].map(col => (
                  <th key={col} className="px-5 py-4 font-mono text-[9px] tracking-[0.25em] text-black/30 dark:text-white/30 uppercase font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myStudents.map((u, i) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-[#F8F9FA] dark:hover:bg-[#111111] transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-mono text-sm font-bold text-black dark:text-white">{u.name || "—"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-black/60 dark:text-white/60">{u.email || "N/A"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-black/40 dark:text-white/40">{u.participantId || "NULL"}</span>
                  </td>
                </motion.tr>
              ))}
              {myStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-16 text-center">
                    <p className="font-mono text-[10px] tracking-widest text-black/20 dark:text-white/20 uppercase">
                      NO_STUDENTS_ASSIGNED // PENDING_ADMIN_ALLOCATION
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
