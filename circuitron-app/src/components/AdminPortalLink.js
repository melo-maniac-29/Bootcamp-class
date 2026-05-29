"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function AdminPortalLink() {
  const user = useQuery(api.users.current);
  if (!user || user.role !== "admin") return null;
  
  return (
    <div className="pt-6 mt-6 border-t border-white/10">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3">Management</p>
      <Link href="/admin" className="flex items-center gap-3 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors">
        <LayoutDashboard size={18} /> Admin Portal
      </Link>
    </div>
  );
}
