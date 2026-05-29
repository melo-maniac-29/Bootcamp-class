"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, BookOpen, CheckSquare, Settings, ChevronLeft, Inbox } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import LogoutButton from "@/components/LogoutButton";

export default function AdminLayout({ children }) {
  const user = useQuery(api.users.current);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/");
    } else if (user !== undefined && user.role !== "admin" && user.role !== "volunteer") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex min-h-screen bg-black">
        <div className="w-64 border-r border-white/10 bg-[#0A0A0B] p-6">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-12 w-1/4 mb-8" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }
  if (!user || (user.role !== "admin" && user.role !== "volunteer")) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex text-white font-sans">
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {user.role === "admin" ? "Admin Portal" : "Staff Portal"}
          </h1>
          <nav className="mt-8 space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors">
              <LayoutDashboard size={18} /> Overview
            </Link>
            {user.role === "admin" && (
              <>
                <Link href="/admin/content" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors">
                  <BookOpen size={18} /> Curriculum
                </Link>
                <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors">
                  <Users size={18} /> Users
                </Link>
              </>
            )}
            <Link href="/admin/submissions" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors">
              <CheckSquare size={18} /> Reviews
            </Link>
            
            <div className="pt-6 mt-6 border-t border-white/10">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3">Student View</p>
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors">
                <LayoutDashboard size={18} /> Enter Dashboard
              </Link>
            </div>
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
