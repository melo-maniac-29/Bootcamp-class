"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "../../components/ui/skeleton";
import AppSidebar from "@/components/AppSidebar";

/**
 * Purpose:
 *   Layout wrapper for all /admin/* routes. Validates the user has the
 *   "admin" or "volunteer" role before rendering children. Redirects
 *   unauthenticated or unauthorized users. Renders the shared AppSidebar
 *   configured with admin-specific nav items.
 */
export default function AdminLayout({ children }) {
  const user = useQuery(api.users.current);
  const router = useRouter();

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
        {/* Topbar */}
        <div className="sticky top-0 z-20 flex items-center justify-between pl-16 md:pl-8 pr-8 py-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md shrink-0">
          <span className="font-mono text-[9px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase">
            CIRCUITRON // {isAdmin ? "ADMIN_PORTAL" : "STAFF_PORTAL"}
          </span>
          <span className="font-mono text-[9px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase">
            ACCESS: {isAdmin ? "FULL" : "PARTIAL"}
          </span>
        </div>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
