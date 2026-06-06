"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useSearchParams, usePathname } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

function timeAgo(timestamp) {
  if (!timestamp || isNaN(timestamp)) return "Unknown time";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " seconds ago";
}

function ProfileContent() {
  const user = useQuery(api.users.current);
  const recentActivity = useQuery(api.users.getRecentActivity) || [];
  const breakdownData = useQuery(api.users.getUserPointsBreakdown, user ? { targetUserId: user._id } : "skip");
  const staffStats = useQuery(api.users.getStaffProfileStats);
  const updateProfile = useMutation(api.users.updateProfile);
  const updatePassword = useAction(api.password.updatePassword);

  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Password Reset States
  const [passwordFlow, setPasswordFlow] = useState("idle"); // "idle" | "editing" | "submitting"
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await updateProfile({ name });
      alert("Profile updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerEdit = () => {
    setPasswordFlow("editing");
  };

  const handleConfirmPassword = async () => {
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    setPasswordFlow("submitting");
    try {
      await updatePassword({ newPassword });
      alert("Password updated successfully!");
      setPasswordFlow("idle");
      setNewPassword("");
    } catch (e) {
      console.error(e);
      alert("Failed to update password: " + (e.message || "Please try again."));
      setPasswordFlow("editing");
    }
  };

  if (user === undefined) {
    return <div className="p-10 font-mono text-sm">LOADING_PROFILE...</div>;
  }

  const creationDate = user?._creationTime
    ? new Date(user._creationTime).toLocaleDateString('en-GB')
    : "Unknown";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto px-6 pb-10"
    >
      {/* Header */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-6 mb-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3">CIRCUTRON // SYSTEM_SETTINGS</p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">Profile.</h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          MANAGE YOUR ACCOUNT SETTINGS AND VIEW HISTORY
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: ID Card */}
        <div className="md:col-span-1">
          <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6 bg-transparent flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center mb-6 bg-black/5 dark:bg-white/5">
              <svg className="w-8 h-8 text-black/40 dark:text-white/40" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-display font-black text-xl tracking-tight uppercase mb-1">
              {user?.name || "Participant"}
            </h2>
            <p className="font-mono text-[10px] tracking-widest uppercase text-black/40 dark:text-white/40 mb-2">
              {user?.participantId || "NO_ID_ASSIGNED"}
            </p>
            <p className="text-xs text-black/50 dark:text-white/50 mb-8">
              {user?.role === 'admin' || user?.participantId?.includes('ADMIN') ? 'Administrator' : user?.role === 'volunteer' || user?.participantId?.includes('VOL') ? 'Volunteer' : 'Student'}
            </p>

            <div className="w-full flex justify-between text-xs border-t border-black/5 dark:border-white/5 pt-4 mb-2">
              <span className="text-black/50 dark:text-white/50">Batch</span>
              <span className="font-bold">June 2026</span>
            </div>
            <div className="w-full flex justify-between text-xs border-t border-black/5 dark:border-white/5 pt-4">
              <span className="text-black/50 dark:text-white/50">Joined</span>
              <span className="font-bold">{creationDate}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="md:col-span-2 space-y-6">

          {/* Account Details */}
          <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-sm">
              <svg className="w-4 h-4 text-black/50 dark:text-white/50" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              Account Details
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono tracking-widest uppercase text-black/50 dark:text-white/50 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-black/30 dark:focus:border-white/30 outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono tracking-widest uppercase text-black/50 dark:text-white/50 mb-2">Email Address</label>
                  <div className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-lg px-4 py-2.5 text-sm text-black/50 dark:text-white/50 flex items-center gap-2 cursor-not-allowed">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M4 7l6.2 4.65a3 3 0 003.6 0L20 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    {user?.email || "No email"}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex items-center gap-2 w-max mt-2"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {isSaving ? "SAVING..." : "SAVE_CHANGES"}
              </button>
            </form>
          </div>

          {/* Security */}
          <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-sm">
              <svg className="w-4 h-4 text-black/50 dark:text-white/50" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              Security
            </h3>
            <div className="space-y-4 max-w-sm">
              {passwordFlow === "idle" && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-black/50 dark:text-white/50 mb-2">Current Password</label>
                    <input
                      type="password"
                      value="........"
                      disabled
                      className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-black/30 dark:text-white/30 cursor-not-allowed"
                    />
                  </div>
                  <button
                    onClick={handleTriggerEdit}
                    className="bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 px-5 py-2 rounded-lg text-xs font-bold transition-colors mt-2"
                  >
                    Change Password
                  </button>
                </>
              )}

              {(passwordFlow === "editing" || passwordFlow === "submitting") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-black/50 dark:text-white/50 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-lg px-4 py-2 pr-10 text-sm focus:border-black/30 dark:focus:border-white/30 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleConfirmPassword}
                      disabled={passwordFlow === "submitting"}
                      className="bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider hover:opacity-80 transition-colors flex-1"
                    >
                      {passwordFlow === "submitting" ? "SAVING..." : "SAVE PASSWORD"}
                    </button>
                    <button
                      onClick={() => { setPasswordFlow("idle"); setNewPassword(""); }}
                      disabled={passwordFlow === "submitting"}
                      className="bg-black/5 dark:bg-white/5 text-black dark:text-white px-4 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {user?.role === "volunteer" ? (
            <>
              {/* Staff Overview */}
              <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6">
                <h3 className="font-bold flex items-center gap-2 mb-6 text-sm">
                  <svg className="w-4 h-4 text-black/50 dark:text-white/50" viewBox="0 0 24 24" fill="none"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Caseload Breakdown
                </h3>
                
                {staffStats ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-black/5 dark:border-white/5">
                      <p className="text-[10px] font-mono tracking-widest uppercase text-black/50 dark:text-white/50 mb-1">Assigned Students</p>
                      <p className="text-3xl font-display font-black">{staffStats.assignedStudentCount}</p>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-black/5 dark:border-white/5">
                      <p className="text-[10px] font-mono tracking-widest uppercase text-black/50 dark:text-white/50 mb-1">Pending Reviews</p>
                      <p className="text-3xl font-display font-black text-orange-500">{staffStats.pendingReviews}</p>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-black/5 dark:border-white/5 col-span-2">
                      <p className="text-[10px] font-mono tracking-widest uppercase text-black/50 dark:text-white/50 mb-1">Reviews Completed</p>
                      <p className="text-3xl font-display font-black text-green-600 dark:text-green-400">{staffStats.reviewsCompleted}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-black/40 dark:text-white/40">Loading stats...</div>
                )}
              </div>

              {/* System/Grading Heatmap */}
              <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6">
                <h3 className="font-bold flex items-center gap-2 mb-6 text-sm">
                  <svg className="w-4 h-4 text-black/50 dark:text-white/50" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.5"/></svg>
                  Grading Activity
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(staffStats?.activityHeatmap || []).map((day, i) => {
                    let bgColor = "bg-black/5 dark:bg-white/5";
                    if (day.count > 5) bgColor = "bg-emerald-500/80 dark:bg-emerald-500/80";
                    else if (day.count > 2) bgColor = "bg-emerald-400/60 dark:bg-emerald-500/60";
                    else if (day.count > 0) bgColor = "bg-emerald-300/40 dark:bg-emerald-500/40";
                    return (
                      <div key={i} className="relative group cursor-help">
                        <div className={`w-6 h-6 rounded-sm ${bgColor} border border-black/[0.04] dark:border-white/[0.04] transition-colors group-hover:ring-2 group-hover:ring-black/20 dark:group-hover:ring-white/20`} />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                          <div className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-mono px-3 py-2 rounded-md shadow-xl text-center">
                            <span className="font-bold opacity-50 uppercase tracking-widest block mb-1">{day.date}</span>
                            <span className="block mt-1 text-green-400 dark:text-green-600">{day.count} Reviews</span>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-white" />
                        </div>
                      </div>
                    );
                  })}
                  {staffStats?.activityHeatmap?.length === 0 && (
                    <p className="font-mono text-[10px] text-black/40 dark:text-white/40 tracking-widest uppercase">No activity data</p>
                  )}
                </div>
              </div>
              
              {/* Assigned Students List (Volunteers only) */}
              {user?.role === "volunteer" && staffStats?.assignedStudents?.length > 0 && (
                <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6">
                  <h3 className="font-bold flex items-center gap-2 mb-6 text-sm">
                    <svg className="w-4 h-4 text-black/50 dark:text-white/50" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Assigned Students Roster
                  </h3>
                  <div className="space-y-3">
                    {(staffStats?.assignedStudents || []).map(student => (
                      <div key={student._id} className="flex justify-between items-center p-3 border border-black/5 dark:border-white/5 rounded-lg bg-black/5 dark:bg-white/5">
                        <span className="text-sm font-bold">{student.name}</span>
                        <span className="text-xs font-mono bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded-md">{student.totalPoints} PTS</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : user?.role === "admin" ? null : (
            <>
              {/* Recent Activity */}
          <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-sm">
              <svg className="w-4 h-4 text-black/50 dark:text-white/50" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Recent Activity
            </h3>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-black/40 dark:text-white/40">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {(recentActivity || []).map((activity, index) => (
                  <div key={index} className="flex justify-between items-center text-sm py-2">
                    <span className="text-black dark:text-white">{activity.description}</span>
                    <span className="text-xs text-black/50 dark:text-white/50 font-mono">{timeAgo(activity.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Heatmap */}
          {breakdownData && (
            <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6">
              <h3 className="font-bold flex items-center gap-2 mb-6 text-sm">
                <svg className="w-4 h-4 text-black/50 dark:text-white/50" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.5"/></svg>
                Activity Heatmap
              </h3>
              <div className="flex flex-wrap gap-2">
                {(breakdownData?.breakdown || []).map((day) => {
                  let bgColor = "bg-black/5 dark:bg-white/5";
                  if (day.totalPointsForDay > 0) {
                    const maxPossible = day.maxQuizPoints + day.maxTaskPoints;
                    if (maxPossible > 0 && day.totalPointsForDay >= maxPossible * 0.8) {
                      bgColor = "bg-green-500/80 dark:bg-green-500/80";
                    } else if (day.totalPointsForDay > 0) {
                      bgColor = "bg-emerald-400/50 dark:bg-emerald-500/50";
                    }
                  }
                  return (
                    <div key={day.dayId} className="relative group cursor-help">
                      <div className={`w-6 h-6 rounded-sm ${bgColor} border border-black/[0.04] dark:border-white/[0.04] transition-colors group-hover:ring-2 group-hover:ring-black/20 dark:group-hover:ring-white/20`} />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                        <div className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-mono px-3 py-2 rounded-md shadow-xl text-center">
                          <span className="font-bold opacity-50 uppercase tracking-widest block mb-1">
                            Week {day.weekOrder} {"//"} Day {day.dayOrder}
                          </span>
                          <span className="block font-bold">{day.dayTitle}</span>
                          <span className="block mt-1 text-green-400 dark:text-green-600">Earned: {day.totalPointsForDay} pts</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-white" />
                      </div>
                    </div>
                  );
                })}
                {breakdownData.breakdown.length === 0 && (
                  <p className="font-mono text-[10px] text-black/40 dark:text-white/40 tracking-widest uppercase">No data</p>
                )}
              </div>
            </div>
          )}

          {/* Points Breakdown */}
          {breakdownData && (
            <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6">
              <h3 className="font-bold flex items-center gap-2 mb-6 text-sm">
                <svg className="w-4 h-4 text-black/50 dark:text-white/50" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Points Breakdown
              </h3>
              <div className="max-h-[500px] overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-black/10 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-black/10 dark:before:via-white/10 before:to-transparent">
                {(breakdownData?.breakdown || []).map((day, idx) => (
                  <div key={day.dayId} className="relative flex items-start justify-between gap-4 md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="absolute left-5 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-3 h-3 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-black/20 dark:bg-white/20 group-hover:bg-black group-hover:dark:bg-white transition-colors mt-1.5" />
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] ml-12 md:ml-0 p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#111] hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                          W{day.weekOrder} {"//"} D{day.dayOrder} <span className="text-black/60 dark:text-white/60 ml-1.5">{day.dayTitle}</span>
                        </h5>
                        <span className="font-mono text-sm font-bold text-black dark:text-white">{day.totalPointsForDay} pts</span>
                      </div>
                      <div className="space-y-1.5 mt-3">
                        {day.maxQuizPoints > 0 && (
                          <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                            <span className="text-black/50 dark:text-white/50">Quiz Points</span>
                            <span className={day.quizPoints > 0 ? "text-green-600 dark:text-green-400 font-bold" : "text-black/30 dark:text-white/30"}>{day.quizPoints} / {day.maxQuizPoints}</span>
                          </div>
                        )}
                        {day.maxTaskPoints > 0 && (
                          <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                            <span className="text-black/50 dark:text-white/50">Task Points</span>
                            <span className={day.taskPoints > 0 ? "text-green-600 dark:text-green-400 font-bold" : "text-black/30 dark:text-white/30"}>{day.taskPoints} / {day.maxTaskPoints}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {breakdownData.breakdown.length === 0 && (
                  <p className="font-mono text-[10px] text-black/40 dark:text-white/40 tracking-widest uppercase text-center py-8">No bootcamp days available.</p>
                )}
                {breakdownData.breakdown.length > 0 && (
                  <div className="relative flex items-center justify-center pt-8 pb-4">
                    <div className="absolute left-5 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-4 h-4 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-black dark:bg-white z-10" />
                    <div className="ml-12 md:ml-0 bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-widest z-10 shadow-lg">
                      TOTAL EARNED: {breakdownData?.user?.calculatedPoints || 0} PTS
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>
          )}
            </>
          )}

        </div>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-10 font-mono text-sm">LOADING_PROFILE...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
