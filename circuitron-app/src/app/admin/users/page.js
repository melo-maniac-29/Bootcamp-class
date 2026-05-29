"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/**
 * Purpose:
 *   Admin user management page. Lists all registered users and allows
 *   changing their roles via a select dropdown with optimistic updates.
 *   Volunteers are redirected to /admin/submissions.
 */
export default function UsersPage() {
  const router = useRouter();
  const currentUser = useQuery(api.users.current);
  
  if (currentUser && currentUser.role === "volunteer") {
    router.push("/admin/submissions");
    return null;
  }

  const users = useQuery(api.users.listUsers) || [];
  const setRole = useMutation(api.users.setRole).withOptimisticUpdate(
    (localStore, args) => {
      const existing = localStore.getQuery(api.users.listUsers);
      if (existing) {
        localStore.setQuery(
          api.users.listUsers,
          {},
          existing.map(u => u._id === args.targetUserId ? { ...u, role: args.role } : u)
        );
      }
    }
  );
  
  const [successUserId, setSuccessUserId] = useState(null);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await setRole({ targetUserId: userId, role: newRole });
      setSuccessUserId(userId);
      setTimeout(() => setSuccessUserId(null), 2000);
    } catch (e) {
      alert("Failed to update role.");
    }
  };

  const roleColor = (role) => {
    if (role === "admin") return "text-black dark:text-white border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5";
    if (role === "volunteer") return "text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30";
    return "text-black/40 dark:text-white/40 border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03]";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-8 mb-10">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3">ADMIN // USER_REGISTRY</p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">Users.</h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          {users.length} REGISTERED_NODES
        </p>
      </div>

      {/* Table */}
      <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
                {["IDENTITY", "ROLE_NODE", "PARTICIPANT_ID", "SET_ROLE"].map(col => (
                  <th key={col} className="px-5 py-4 font-mono text-[9px] tracking-[0.25em] text-black/30 dark:text-white/30 uppercase font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-[#F8F9FA] dark:hover:bg-[#111111] transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-mono text-sm font-bold text-black dark:text-white">{u.name || "—"}</p>
                    <p className="font-mono text-xs text-black/40 dark:text-white/40 mt-0.5">{u.email || "N/A"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block font-mono text-[9px] uppercase tracking-widest px-2 py-1 border rounded-full ${roleColor(u.role)}`}>
                      {u.role || "STUDENT"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-black/40 dark:text-white/40">{u.participantId || "NULL"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <select
                        value={u.role || "student"}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="border border-black/[0.12] dark:border-white/[0.12] rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider outline-none focus:border-black dark:focus:border-white transition-colors bg-white dark:bg-[#0a0a0a] cursor-pointer text-black dark:text-white"
                      >
                        <option value="student">STUDENT</option>
                        <option value="volunteer">VOLUNTEER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                      {successUserId === u._id && (
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
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <p className="font-mono text-[10px] tracking-widest text-black/20 dark:text-white/20 uppercase">
                      NO_USERS_FOUND // REGISTRY_EMPTY
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
