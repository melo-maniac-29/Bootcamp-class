import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import DashboardSidebarClient from "@/components/DashboardSidebarClient";

export default function DashboardLayout({ children }) {
  if (!convexAuthNextjsToken()) {
    redirect("/login");
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white flex font-sans selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black">
      <DashboardSidebarClient />
      
      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="sticky top-0 z-20 flex items-center justify-between pl-16 md:pl-8 pr-8 py-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md shrink-0">
          <span className="font-mono text-[9px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase">CIRCUITRON // STUDENT_TERMINAL</span>
          <span className="font-mono text-[9px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase">NODE_STATUS: ACTIVE</span>
        </div>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
