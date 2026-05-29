"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Check } from "lucide-react";

export default function UsersPage() {
  const users = useQuery(api.users.listUsers) || [];
  const setRole = useMutation(api.users.setRole);
  
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [successUserId, setSuccessUserId] = useState(null);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      await setRole({ targetUserId: userId, role: newRole });
      setSuccessUserId(userId);
      setTimeout(() => setSuccessUserId(null), 2000);
    } catch (e) {
      alert("Failed to update role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">User Management</h2>
      <div className="bg-[#121214] rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 font-medium text-white/80">Email</th>
              <th className="p-4 font-medium text-white/80">Role</th>
              <th className="p-4 font-medium text-white/80">Participant ID</th>
              <th className="p-4 font-medium text-white/80">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-white/5 last:border-0">
                <td className="p-4 text-white/80">{u.email || "N/A"}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs">{u.role || "student"}</span>
                </td>
                <td className="p-4 text-white/50">{u.participantId || "None"}</td>
                <td className="p-4 flex items-center gap-3">
                   <select 
                     className="bg-black text-white/80 border border-white/20 rounded p-1 outline-none focus:border-white transition-colors cursor-pointer disabled:opacity-50"
                     value={u.role || "student"}
                     onChange={(e) => handleRoleChange(u._id, e.target.value)}
                     disabled={updatingUserId === u._id}
                   >
                     <option value="student">Student</option>
                     <option value="volunteer">Volunteer</option>
                     <option value="admin">Admin</option>
                   </select>
                   {updatingUserId === u._id && <span className="text-xs text-blue-400 animate-pulse">Saving...</span>}
                   {successUserId === u._id && <Check size={16} className="text-emerald-400" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
