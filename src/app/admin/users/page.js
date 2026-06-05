"use client";

import { useQuery, useMutation, useAction } from "convex/react";
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

  const deleteUser = useMutation(api.users.deleteUser).withOptimisticUpdate(
    (localStore, args) => {
      const existing = localStore.getQuery(api.users.listUsers);
      if (existing) {
        localStore.setQuery(
          api.users.listUsers,
          {},
          existing.filter(u => u._id !== args.targetUserId)
        );
      }
    }
  );
  
  const adminResetPassword = useAction(api.password.adminResetPassword);
  
  const [successUserId, setSuccessUserId] = useState(null);
  const [resettingUserId, setResettingUserId] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortFilter, setSortFilter] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const filteredUsers = users.filter((u) => {
    const matchesSearch = !search.trim() ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.participantId?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || (u.role || "student") === roleFilter;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    if (sortFilter === "Newest") return (b._creationTime || 0) - (a._creationTime || 0);
    if (sortFilter === "Oldest") return (a._creationTime || 0) - (b._creationTime || 0);
    return 0;
  });

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await setRole({ targetUserId: userId, role: newRole });
      setSuccessUserId(userId);
      setTimeout(() => setSuccessUserId(null), 2000);
    } catch (e) {
      alert("Failed to update role.");
    }
  };

  const handleDeleteUser = (userId) => {
    const userToDelete = users.find(u => u._id === userId);
    setDeletingUser(userToDelete);
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser({ targetUserId: deletingUser._id });
      setDeletingUser(null);
      
      const newTotalPages = Math.ceil((filteredUsers.length - 1) / PAGE_SIZE) || 1;
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (e) {
      alert("Failed to delete user.");
    }
  };

  const handleResetPassword = async (userId) => {
    if (!newPassword || newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    try {
      await adminResetPassword({ targetUserId: userId, newPassword });
      setResettingUserId(null);
      setNewPassword("");
      alert("Password reset successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to reset password. Make sure you are an admin.");
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="SEARCH BY NAME, EMAIL OR ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="flex-1 bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg px-4 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20"
        />
        <div className="relative w-full md:w-64">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="w-full appearance-none bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg pl-4 pr-10 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white cursor-pointer"
          >
            <option value="All">ALL_ROLES</option>
            <option value="student">STUDENT</option>
            <option value="volunteer">VOLUNTEER</option>
            <option value="admin">ADMIN</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black/40 dark:text-white/40">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="relative w-full md:w-56">
          <select
            value={sortFilter}
            onChange={(e) => { setSortFilter(e.target.value); setCurrentPage(1); }}
            className="w-full appearance-none bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg pl-4 pr-10 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white cursor-pointer"
          >
            <option value="Newest">SORT: NEWEST FIRST</option>
            <option value="Oldest">SORT: OLDEST FIRST</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black/40 dark:text-white/40">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-max">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
                {["IDENTITY", "ROLE_NODE", "PARTICIPANT_ID", "ACTIONS"].map(col => (
                  <th key={col} className="px-5 py-4 font-mono text-[9px] tracking-[0.25em] text-black/30 dark:text-white/30 uppercase font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u, i) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-[#F8F9FA] dark:hover:bg-[#111111] transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-mono text-sm font-bold uppercase text-black dark:text-white">{u.name || "—"}</p>
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
                    <div className="flex flex-row flex-wrap items-center gap-4">
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
                      
                      <div className="flex items-center gap-4">
                        {resettingUserId === u._id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              placeholder="New password..."
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="border border-black/[0.12] dark:border-white/[0.12] rounded px-2 py-1 font-mono text-[10px] bg-transparent outline-none focus:border-black/30 dark:focus:border-white/30"
                            />
                            <button onClick={() => handleResetPassword(u._id)} className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded font-mono text-[9px] tracking-widest uppercase hover:opacity-80">
                              Save
                            </button>
                            <button onClick={() => setResettingUserId(null)} className="text-black/50 dark:text-white/50 px-2 py-1 rounded font-mono text-[9px] tracking-widest uppercase hover:bg-black/5 dark:hover:bg-white/5">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setResettingUserId(u._id); setNewPassword(""); }}
                            className="text-[9px] font-mono tracking-widest uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                          >
                            + RESET_PASSWORD
                          </button>
                        )}

                        {u._id !== currentUser?._id && (
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-[9px] font-mono tracking-widest uppercase text-red-500/70 hover:text-red-500 transition-colors"
                          >
                            + DELETE
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <p className="font-mono text-[10px] tracking-widest text-black/20 dark:text-white/20 uppercase">
                      {users.length === 0 ? "NO_USERS_FOUND // REGISTRY_EMPTY" : "NO_RESULTS // TRY_A_DIFFERENT_SEARCH"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden flex flex-col divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          {paginatedUsers.map((u, i) => (
            <motion.div
              key={`mobile-${u._id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="p-5 hover:bg-[#F8F9FA] dark:hover:bg-[#111111] transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-mono text-sm font-bold uppercase text-black dark:text-white">{u.name || "—"}</p>
                  <p className="font-mono text-xs text-black/40 dark:text-white/40 mt-0.5">{u.email || "N/A"}</p>
                </div>
                <span className={`inline-block font-mono text-[9px] uppercase tracking-widest px-2 py-1 border rounded-full ${roleColor(u.role)}`}>
                  {u.role || "STUDENT"}
                </span>
              </div>
              
              <div className="mb-4">
                <span className="font-mono text-[8px] text-black/30 dark:text-white/30 uppercase tracking-widest block mb-1">PARTICIPANT_ID</span>
                <span className="font-mono text-xs text-black/40 dark:text-white/40">{u.participantId || "NULL"}</span>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] text-black/30 dark:text-white/30 uppercase tracking-widest">ROLE</span>
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
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] text-black/30 dark:text-white/30 uppercase tracking-widest">ACTIONS</span>
                  <div className="flex items-center gap-4">
                    {resettingUserId === u._id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Password..."
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-20 border border-black/[0.12] dark:border-white/[0.12] rounded px-2 py-1 font-mono text-[10px] bg-transparent outline-none focus:border-black/30 dark:focus:border-white/30"
                        />
                        <button onClick={() => handleResetPassword(u._id)} className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded font-mono text-[9px] tracking-widest uppercase hover:opacity-80">
                          Save
                        </button>
                        <button onClick={() => setResettingUserId(null)} className="text-black/50 dark:text-white/50 px-2 py-1 rounded font-mono text-[9px] tracking-widest uppercase hover:bg-black/5 dark:hover:bg-white/5">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setResettingUserId(u._id); setNewPassword(""); }}
                        className="text-[9px] font-mono tracking-widest uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                      >
                        + RESET_PASS
                      </button>
                    )}

                    {u._id !== currentUser?._id && !resettingUserId && (
                      <button 
                        onClick={() => handleDeleteUser(u._id)}
                        className="text-[9px] font-mono tracking-widest uppercase text-red-500/70 hover:text-red-500 transition-colors"
                      >
                        + DELETE
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-mono text-[10px] tracking-widest text-black/20 dark:text-white/20 uppercase">
                {users.length === 0 ? "NO_USERS_FOUND // REGISTRY_EMPTY" : "NO_RESULTS // TRY_A_DIFFERENT_SEARCH"}
              </p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
            <p className="font-mono text-[9px] text-black/30 dark:text-white/30 tracking-widest uppercase">
              PAGE {currentPage} OF {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="font-mono text-[9px] uppercase tracking-wider px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-black dark:text-white"
              >
                PREVIOUS
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="font-mono text-[9px] uppercase tracking-wider px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-black dark:text-white"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white dark:bg-[#111] border border-red-500/20 dark:border-red-500/20 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h2 className="text-xl font-display font-black tracking-tight text-black dark:text-white uppercase">
                Delete User Account
              </h2>
            </div>
            
            <div className="p-6 bg-red-50/50 dark:bg-red-950/20">
              <p className="text-sm font-mono text-black/70 dark:text-white/70 mb-4 leading-relaxed">
                This action <strong className="text-red-600 dark:text-red-400">cannot</strong> be undone. This will permanently delete the 
                user account <strong className="text-black dark:text-white">{deletingUser.name || deletingUser.email}</strong> and remove their access.
              </p>
              
              <div className="p-3 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded text-xs font-mono text-black/60 dark:text-white/60">
                Are you absolutely sure?
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-black/[0.06] dark:border-white/[0.06] bg-gray-50/50 dark:bg-black/20 justify-end">
              <button 
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-xs font-mono font-bold tracking-widest text-black/50 dark:text-white/50 uppercase border border-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteUser}
                className="px-6 py-2 text-xs font-mono font-bold tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 uppercase border border-red-200 dark:border-red-900/50 rounded hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
