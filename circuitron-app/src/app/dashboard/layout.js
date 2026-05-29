import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import AdminPortalLink from "@/components/AdminPortalLink";

export default function DashboardLayout({ children }) {
  // Protect the route
  if (!convexAuthNextjsToken()) {
    redirect("/login");
  }
  
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row text-white">
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-blue-400">Circuitron</h1>
          <nav className="mt-8 space-y-2">
            <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
              <LayoutDashboard size={18} /> Dashboard
            </a>
            <a href="/dashboard/days" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Bootcamp Roadmap
            </a>
            <AdminPortalLink />
          </nav>
        </div>
        <LogoutButton />
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
