"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "../../components/ui/skeleton";
import AppSidebar from "@/components/AppSidebar";
import Topbar from "@/components/Topbar";

/**
 * Purpose:
 *   Layout wrapper for all /admin/* routes. Validates the user has the
 *   "admin" or "volunteer" role before rendering children. Redirects
 *   unauthenticated or unauthorized users. Renders the shared AppSidebar
 *   configured with admin-specific nav items.
 */
export default function AdminLayout({ children }) {
  const user = useQuery(api.users.current);
  const generateParticipantId = useMutation(api.users.generateParticipantId);
  const router = useRouter();

  useEffect(() => {
    // Only assign ID if the user is loaded and doesn't have an ID
    if (user && !user.participantId) {
      generateParticipantId().catch(console.error);
    }
  }, [user, generateParticipantId]);

  useEffect(() => {
    if (user === null) router.push("/login");
    else if (user !== undefined && user.role !== "admin" && user.role !== "volunteer") router.push("/dashboard");
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex min-h-screen bg-white dark:bg-[#0a0a0a]">
        <div className="w-[220px] border-r border-black/[0.06] dark:border-white/[0.06] p-6 shrink-0">
          <Skeleton className="h-7 w-24 mb-10 bg-black/5 dark:bg-white/5" />
          <div className="space-y-3">
            <Skeleton className="h-9 w-full bg-black/5 dark:bg-white/5" />
            <Skeleton className="h-9 w-full bg-black/5 dark:bg-white/5" />
            <Skeleton className="h-9 w-full bg-black/5 dark:bg-white/5" />
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-10 w-1/4 mb-8 bg-black/5 dark:bg-white/5" />
          <Skeleton className="h-80 w-full rounded-xl bg-black/5 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "volunteer")) return null;

  const isAdmin = user.role === "admin";

  const navItems = [
    {
      href: "/admin",
      label: "OVERVIEW",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    },
    ...(isAdmin ? [
      {
        href: "/admin/content",
        label: "CURRICULUM",
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: "/admin/users",
        label: "USERS",
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: "/admin/volunteers",
        label: "VOLUNTEERS",
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 2a2 2 0 100 4 2 2 0 000-4zM2 14c0-3 3-4 6-4s6 1 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="4" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
      },
    ] : []),
    ...(!isAdmin ? [
      {
        href: "/admin/my-students",
        label: "MY_STUDENTS",
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M1 14c0-2.5 2-4 4-4s4 1.5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 14c0-2 1.5-3 3-3s3 1 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
    ] : []),
    {
      href: "/admin/submissions",
      label: "REVIEWS",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M3 3h10v10H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      href: "/admin/feedback",
      label: "FEEDBACK",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 2V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M5 7h6M5 9.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      href: "/admin/leaderboard",
      label: "LEADERBOARD",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M4 14V8m4 6V4m4 10v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      href: "/admin/profile",
      label: "PROFILE",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  // "Return to student view" block injected as topSection
  const studentViewSection = (open) => open ? (
    <div>
      <p className="text-[9px] font-mono tracking-[0.3em] text-black/25 uppercase px-2 pb-2">STUDENT_VIEW</p>
      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-green-700 dark:text-green-500 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        DASHBOARD
      </Link>
    </div>
  ) : (
    <Link href="/dashboard" title="Student Dashboard" className="flex justify-center py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
      <svg className="w-4 h-4 text-green-500" viewBox="0 0 16 16" fill="none">
        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Link>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white flex font-sans selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black">
      <AppSidebar
        navItems={navItems}
        brand="ADMIN"
        badge={isAdmin ? "ADMIN" : "STAFF"}
        badgeColor="text-black/50 dark:text-white/50 border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5"
        topSection={studentViewSection}
      />

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={`CIRCUITRON // ${isAdmin ? "ADMIN_PORTAL" : "STAFF_PORTAL"}`} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
