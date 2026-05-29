import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import DashboardSidebarClient from "@/components/DashboardSidebarClient";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({ children }) {
  if (!convexAuthNextjsToken()) {
    redirect("/login");
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white flex font-sans selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black">
      <DashboardSidebarClient />
      
      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="CIRCUITRON // STUDENT_TERMINAL" />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
