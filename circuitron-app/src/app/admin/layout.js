"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, BookOpen, CheckSquare } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default function AdminLayout({ children }) {
  const user = useQuery(api.users.current);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/");
    } else if (user !== undefined && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user === undefined) return <div className="p-8 text-white">Loading Admin Portal...</div>;
  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex text-white font-sans">
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
          <nav className="mt-8 space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors">
              <LayoutDashboard size={18} /> Overview
            </Link>
            <Link href="/admin/content" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors">
              <BookOpen size={18} /> Curriculum
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors">
              <Users size={18} /> Users
            </Link>
            <Link href="/admin/submissions" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors">
              <CheckSquare size={18} /> Reviews
            </Link>
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
