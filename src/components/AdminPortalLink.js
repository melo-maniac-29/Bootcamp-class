"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

/**
 * Purpose:
 *   Conditionally renders an "Admin Portal" navigation link in the
 *   student dashboard sidebar. Only visible to users with the "admin" role.
 *
 * Returns:
 *   A styled Link element or null.
 */
export default function AdminPortalLink() {
  const user = useQuery(api.users.current);
  if (!user || user.role !== "admin") return null;
  
  return (
    <div className="pt-6 mt-6 border-t border-black/[0.06]">
      <p className="text-[9px] font-mono tracking-[0.3em] text-black/30 uppercase mb-3">MANAGEMENT</p>
      <Link
        href="/admin"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-black border border-black/10 hover:bg-black hover:text-white transition-all group"
      >
        <svg className="w-3.5 h-3.5 transition-colors" viewBox="0 0 16 16" fill="none">
          <path d="M8 1L14 4v4c0 3.5-2.5 6-6 7C2.5 14 0 11.5 0 8V4L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        ADMIN_PORTAL
      </Link>
    </div>
  );
}
