"use client";

import { useConvexAuth } from "convex/react";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Welcome to your Dashboard</h2>
      <div className="p-8 bg-[#121214] border border-white/10 rounded-2xl shadow-xl">
        <h3 className="text-xl font-semibold mb-2">Convex Integration Successful! 🚀</h3>
        <p className="text-white/60 mb-6">
          You have successfully logged in via Convex Auth. This is a protected route.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-sm text-white/50 mb-1">Status</div>
              <div className="text-lg font-medium text-emerald-400">Authenticated</div>
           </div>
           <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-sm text-white/50 mb-1">Active Users</div>
              <div className="text-lg font-medium">Tracking 75-100/day</div>
           </div>
           <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-sm text-white/50 mb-1">Next Steps</div>
              <div className="text-lg font-medium text-blue-400">Rebuild Curriculum UI</div>
           </div>
        </div>
      </div>
    </div>
  );
}
