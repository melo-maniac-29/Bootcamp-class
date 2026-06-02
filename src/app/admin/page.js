"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminDashboard() {
  const user = useQuery(api.users.current);
  const stats = useQuery(api.users.getDashboardStats);
  const isAdmin = user?.role === "admin";

  const modules = [
    ...(isAdmin ? [
      {
        href: "/admin/content",
        label: "CURRICULUM",
        desc: "Manage weeks, days, and content releases",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: "/admin/users",
        label: "USERS",
        desc: "View and manage registered students",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: "/admin/feedback",
        label: "FEEDBACK",
        desc: "Review student feedback on curriculum tasks",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none">
            <path d="M4 4h8M4 7h6M2 13.5V3a1 1 0 011-1h10a1 1 0 011 1v8a1 1 0 01-1 1H5.5L2 14.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
    ] : [
      {
        href: "/dashboard/days",
        label: "ROADMAP",
        desc: "View the student curriculum roadmap",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      }
    ]),
    {
      href: "/admin/submissions",
      label: "REVIEWS",
      desc: "Approve or request revision on student work",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none">
          <path d="M3 3h10v10H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

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
          CONTROL_NODE // AUTHENTICATED
        </p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">
          {isAdmin ? "Admin Portal." : "Staff Portal."}
        </h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          CLEARANCE_LEVEL: <span className="text-black dark:text-white font-bold">{isAdmin ? "ADMIN" : "VOLUNTEER"}</span> // SELECT_MODULE_BELOW
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
            <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase mb-2">PARTICIPANTS</p>
            <p className="text-3xl font-display font-black text-black dark:text-white">{stats.totalStudents}</p>
          </div>
          <div className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
            <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase mb-2">ACTIVE</p>
            <p className="text-3xl font-display font-black text-black dark:text-white">{stats.activeStudents}</p>
          </div>
          <div className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
            <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase mb-2">SUBMISSIONS (TODAY)</p>
            <p className="text-3xl font-display font-black text-black dark:text-white">{stats.submissionsToday}</p>
          </div>
          <div className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111]">
            <p className="font-mono text-[10px] tracking-widest text-black/40 dark:text-white/40 uppercase mb-2">TOTAL SUBMISSIONS</p>
            <p className="text-3xl font-display font-black text-black dark:text-white">{stats.totalSubmissions}</p>
          </div>
        </div>
      )}

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={mod.href}
              className="flex items-start gap-5 p-6 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#151515] hover:border-black/20 dark:hover:border-white/20 transition-all group"
            >
              <div className="p-3 rounded-lg border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#0a0a0a] text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white group-hover:border-black/20 dark:group-hover:border-white/20 transition-colors">
                {mod.icon}
              </div>
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-black dark:text-white font-bold uppercase mb-1">{mod.label}</p>
                <p className="font-mono text-xs text-black/40 dark:text-white/40">{mod.desc}</p>
              </div>
              <svg className="w-4 h-4 text-black/20 dark:text-white/20 group-hover:text-black/60 dark:group-hover:text-white/60 group-hover:translate-x-1 transition-all ml-auto mt-1 shrink-0" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
