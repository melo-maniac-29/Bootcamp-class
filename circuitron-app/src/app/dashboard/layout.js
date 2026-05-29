import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import AdminPortalLink from "@/components/AdminPortalLink";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  if (!convexAuthNextjsToken()) {
    redirect("/login");
  }
  
  return (
    <div className="min-h-screen bg-white text-black flex flex-col md:flex-row font-sans selection:bg-black selection:text-white">
      
      {/* ---- SIDEBAR ---- */}
      <aside className="w-[220px] shrink-0 border-r border-black/[0.06] flex-col justify-between hidden md:flex py-12 px-6 relative bg-white">
        
        {/* Fine grid overlay */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:2rem_2rem]" />

        <div className="relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12 group">
            <span className="font-display font-black text-xl tracking-tighter uppercase text-black">C //</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-green-500/30 bg-green-50">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase text-green-600">LIVE</span>
            </div>
          </Link>

          {/* Navigation */}
          <div className="space-y-1">
            <p className="text-[9px] font-mono tracking-[0.3em] text-black/30 uppercase mb-3">SYS_NAVIGATION</p>
            
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-black/40 hover:text-black hover:bg-black/5 transition-all group">
              <svg className="w-3.5 h-3.5 text-black/20 group-hover:text-black transition-colors" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              SYS_OVERVIEW
            </Link>
            
            <Link href="/dashboard/days" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-black/40 hover:text-black hover:bg-black/5 transition-all group">
              <svg className="w-3.5 h-3.5 text-black/20 group-hover:text-black transition-colors" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              ROADMAP
            </Link>
            
            <AdminPortalLink />
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
          <div className="font-mono text-[9px] tracking-[0.3em] text-black/30 uppercase">CIRCUITRON // STUDENT_TERMINAL</div>
          <div className="font-mono text-[9px] tracking-[0.3em] text-black/30 uppercase">NODE_STATUS: ACTIVE</div>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
