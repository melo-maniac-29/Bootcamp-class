"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Check } from "lucide-react";

export default function SubmissionsPage() {
  const submissions = useQuery(api.submissions.listSubmissions) || [];
  const updateStatus = useMutation(api.submissions.updateStatus);
  
  const [updatingId, setUpdatingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const handleUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateStatus({ submissionId: id, status });
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (e) {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Review Submissions</h2>
      <div className="bg-[#121214] rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 font-medium text-white/80">Student</th>
              <th className="p-4 font-medium text-white/80">Task (Day)</th>
              <th className="p-4 font-medium text-white/80">Submission Link</th>
              <th className="p-4 font-medium text-white/80">Status</th>
              <th className="p-4 font-medium text-white/80">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub._id} className="border-b border-white/5 last:border-0">
                <td className="p-4 font-semibold">{sub.userName}</td>
                <td className="p-4 text-white/70">{sub.dayTitle}</td>
                <td className="p-4">
                  {sub.link ? (
                    <a href={sub.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                      View Link
                    </a>
                  ) : (
                    <span className="text-white/40 italic">No Link</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    sub.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" :
                    sub.status === "Needs Revision" ? "bg-amber-500/10 text-amber-400" :
                    "bg-white/10 text-white/60"
                  }`}>
                    {sub.status || "Pending"}
                  </span>
                </td>
                <td className="p-4 flex gap-2 items-center">
                  <button 
                    onClick={() => handleUpdate(sub._id, "Approved")}
                    disabled={updatingId === sub._id}
                    className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded transition-colors text-xs font-semibold disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleUpdate(sub._id, "Needs Revision")}
                    disabled={updatingId === sub._id}
                    className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded transition-colors text-xs font-semibold disabled:opacity-50"
                  >
                    Reject
                  </button>
                  {updatingId === sub._id && <span className="text-xs text-blue-400 animate-pulse ml-2">Saving...</span>}
                  {successId === sub._id && <Check size={16} className="text-emerald-400 ml-2" />}
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-white/50">No submissions pending review.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
