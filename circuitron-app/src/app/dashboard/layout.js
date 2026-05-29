import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardLayout({ children }) {
  // Protect the route
  if (!convexAuthNextjsToken()) {
    redirect("/");
  }
  
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row text-white">
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Circuitron</h1>
          <nav className="mt-8 space-y-2">
            <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg text-sm font-medium">
              <LayoutDashboard size={18} /> Dashboard
            </a>
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
