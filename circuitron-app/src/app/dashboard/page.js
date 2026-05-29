"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Flame, Target, Trophy, Clock } from "lucide-react";

export default function DashboardPage() {
  const user = useQuery(api.users.current);
  const leaderboard = useQuery(api.users.getLeaderboard) || [];

  if (user === undefined) return <div className="p-8 text-white">Loading...</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="max-w-6xl mx-auto space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-4xl font-bold tracking-tight">Welcome back, {user?.name || "Student"}! 🚀</h2>
        <p className="text-white/60 mt-2 text-lg">Here is your Bootcamp progress.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Flame className="text-orange-500" />} title="Current Streak" value={`${user?.streakCount || 0} Days`} />
        <StatCard icon={<Target className="text-blue-500" />} title="Tasks Completed" value="4/12" />
        <StatCard icon={<Clock className="text-emerald-500" />} title="Watch Time" value="12h 30m" />
        <StatCard icon={<Trophy className="text-yellow-500" />} title="Global Rank" value="#42" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Progress Area */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-2xl font-semibold mb-6 relative z-10">Your Journey</h3>
            
            <div className="space-y-4 relative z-10">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Overall Completion</span>
                  <span className="font-bold">33%</span>
                </div>
                <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "33%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard Sidebar */}
        <motion.div variants={itemVariants}>
          <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} /> Top Students
            </h3>
            <div className="space-y-4">
              {leaderboard.map((u, i) => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      i === 0 ? "bg-yellow-500/20 text-yellow-500" :
                      i === 1 ? "bg-gray-400/20 text-gray-300" :
                      i === 2 ? "bg-amber-600/20 text-amber-500" :
                      "bg-white/5 text-white/50"
                    }`}>
                      {i + 1}
                    </div>
                    <span className="font-medium">{u.name || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-orange-400">
                    {u.streakCount || 0} <Flame size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl hover:bg-white/10 transition-colors group cursor-pointer relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-3 bg-black/30 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-white/60">{title}</div>
          <div className="text-2xl font-bold tracking-tight mt-0.5">{value}</div>
        </div>
      </div>
    </div>
  );
}
