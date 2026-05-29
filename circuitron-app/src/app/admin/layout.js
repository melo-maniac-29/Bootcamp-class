"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "../../components/ui/skeleton";
import LogoutButton from "@/components/LogoutButton";

export default function AdminLayout({ children }) {
  const user = useQuery(api.users.current);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user !== undefined && user.role !== "admin" && user.role !== "volunteer") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="w-[220px] border-r border-black/[0.06] p-6">
          <Skeleton className="h-8 w-32 mb-8 bg-black/5" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full bg-black/5" />
            <Skeleton className="h-10 w-full bg-black/5" />
            <Skeleton className="h-10 w-full bg-black/5" />
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-12 w-1/4 mb-8 bg-black/5" />
          <Skeleton className="h-96 w-full rounded-xl bg-black/5" />
        </div>
      </div>
    );
  }
  if (!user || (user.role !== "admin" && user.role !== "volunteer")) return null;

  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen bg-white text-black flex font-sans selection:bg-black selection:text-white">
      
      {/* ---- SIDEBAR ---- */}
      <aside className="w-[220px] shrink-0 border-r border-black/[0.06] flex-col justify-between hidden md:flex py-12 px-6 relative bg-white">
        
        {/* Fine grid overlay */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:2rem_2rem]" />

        <div className="relative z-10">
          {/* Logo / Role badge */}
          <div className="flex items-center gap-2 mb-12">
            <span className="font-display font-black text-xl tracking-tighter uppercase text-black">C //</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-black/10 bg-black/5">
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase text-black/50">
                {isAdmin ? "ADMIN" : "STAFF"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            <p className="text-[9px] font-mono tracking-[0.3em] text-black/30 uppercase mb-3">ADMIN_NAVIGATION</p>
            
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-black/40 hover:text-black hover:bg-black/5 transition-all group">
              <svg className="w-3.5 h-3.5 text-black/20 group-hover:text-black transition-colors" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              OVERVIEW
            </Link>

            {isAdmin && (
              <>
                <Link href="/admin/content" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-black/40 hover:text-black hover:bg-black/5 transition-all group">
                  <svg className="w-3.5 h-3.5 text-black/20 group-hover:text-black transition-colors" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  CURRICULUM
                </Link>
                <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-black/40 hover:text-black hover:bg-black/5 transition-all group">
                  <svg className="w-3.5 h-3.5 text-black/20 group-hover:text-black transition-colors" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  USERS
                </Link>
              </>
            )}

            <Link href="/admin/submissions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-black/40 hover:text-black hover:bg-black/5 transition-all group">
              <svg className="w-3.5 h-3.5 text-black/20 group-hover:text-black transition-colors" viewBox="0 0 16 16" fill="none">
                <path d="M3 3h10v10H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              REVIEWS
            </Link>

            {/* Return to Student view */}
            <div className="pt-6 mt-6 border-t border-black/[0.06]">
              <p className="text-[9px] font-mono tracking-[0.3em] text-black/30 uppercase mb-3">STUDENT_VIEW</p>
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-green-700 hover:bg-green-50 transition-all group border border-green-200">
                <svg className="w-3.5 h-3.5 text-green-600" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                DASHBOARD
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Logout */}
        <div className="relative z-10">
          <div className="border-t border-black/[0.06] pt-6">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
          <div className="font-mono text-[9px] tracking-[0.3em] text-black/30 uppercase">
            CIRCUITRON // {isAdmin ? "ADMIN_PORTAL" : "STAFF_PORTAL"}
          </div>
          <div className="font-mono text-[9px] tracking-[0.3em] text-black/30 uppercase">ACCESS: {isAdmin ? "FULL" : "PARTIAL"}</div>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
