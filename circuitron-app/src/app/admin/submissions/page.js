"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
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

  const handleUpdate = async (id, status) => {
    try {
      await updateStatus({ submissionId: id, status });
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const statusColor = (status) => {
    if (status === "Approved") return "text-green-700 border-green-200 bg-green-50";
    if (status === "Needs Revision") return "text-amber-700 border-amber-200 bg-amber-50";
    return "text-black/40 border-black/10 bg-black/5";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="border-b border-black/[0.06] pb-8 mb-10">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 uppercase mb-3">
          REVIEW_QUEUE // LIVE
        </p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black">
          Submissions.
        </h1>
        <p className="text-black/40 mt-2 font-mono text-xs tracking-wider uppercase">
          {submissions.length} SUBMISSION_NODES LOADED
        </p>
      </div>

      {/* Table */}
      <div className="border border-black/[0.06] rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#F8F9FA]">
                {["STUDENT", "TASK_NODE", "SUBMISSION_LINK", "STATUS", "ACTION"].map(col => (
                  <th key={col} className="px-5 py-4 font-mono text-[9px] tracking-[0.25em] text-black/30 uppercase font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, i) => (
                <motion.tr
                  key={sub._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-black/[0.04] last:border-0 hover:bg-[#F8F9FA] transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-bold text-black uppercase tracking-wider">{sub.userName}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-black/50">{sub.dayTitle}</span>
                  </td>
                  <td className="px-5 py-4">
                    {sub.link ? (
                      <a href={sub.link} target="_blank" rel="noreferrer" className="font-mono text-xs text-black underline underline-offset-4 hover:text-black/60 transition-colors flex items-center gap-1">
                        VIEW_LINK
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path d="M2 10L10 2M5 2h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    ) : (
                      <span className="font-mono text-xs text-black/20">NULL</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block font-mono text-[9px] uppercase tracking-widest px-2 py-1 border rounded-full ${statusColor(sub.status)}`}>
                      {sub.status || "PENDING"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdate(sub._id, "Approved")}
                        className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                      >
                        APPROVE
                      </button>
                      <button
                        onClick={() => handleUpdate(sub._id, "Needs Revision")}
                        className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        REVISE
                      </button>
                      {successId === sub._id && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="font-mono text-[9px] text-green-600 uppercase tracking-wider"
                        >
                          SAVED
                        </motion.span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <p className="font-mono text-[10px] tracking-widest text-black/20 uppercase">
                      QUEUE_EMPTY // NO_SUBMISSIONS_PENDING
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
