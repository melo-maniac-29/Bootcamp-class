"use client";

import AppSidebar from "@/components/AppSidebar";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Purpose:
 *   Client-side sidebar wrapper for the student dashboard.
 *   Fetches the current user to conditionally render AdminPortalLink,
 *   then passes nav config to the shared AppSidebar component.
 */
export default function DashboardSidebarClient() {
  const user = useQuery(api.users.current);
  const generateParticipantId = useMutation(api.users.generateParticipantId);

  useEffect(() => {
    // Only assign ID if the user is loaded and doesn't have an ID
    if (user && !user.participantId) {
      generateParticipantId().catch(console.error);
    }
  }, [user, generateParticipantId]);

  const navItems = [
    {
      href: "/dashboard",
      label: "SYS_OVERVIEW",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/days",
      label: "ROADMAP",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/leaderboard",
      label: "LEADERBOARD",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M5 14V6m6 8V2m-3 12V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/profile",
      label: "PROFILE",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M8 11A3.5 3.5 0 108 4a3.5 3.5 0 000 7zM4.5 15C4.5 12.5 6 11 8 11s3.5 1.5 3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  // Inject admin portal link as topSection if user is admin
  const adminSection = (user?.role === "admin")
    ? (open) => open ? (
        <div>
          <p className="text-[9px] font-mono tracking-[0.3em] text-black/25 uppercase px-2 pb-2">MANAGEMENT</p>
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-black dark:text-white border border-black/10 dark:border-white/10 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4v4c0 3.5-2.5 6-6 7C2.5 14 0 11.5 0 8V4L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            ADMIN_PORTAL
          </Link>
        </div>
      ) : (
        <Link href="/admin" title="Admin Portal" className="flex justify-center py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <svg className="w-4 h-4 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L14 4v4c0 3.5-2.5 6-6 7C2.5 14 0 11.5 0 8V4L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </Link>
      )
    : null;

  return (
    <AppSidebar
      navItems={navItems}
      brand="STUDENT"
      badge="LIVE"
      badgeColor="text-green-600 border-green-200 bg-green-50"
      topSection={adminSection}
    />
  );
}
