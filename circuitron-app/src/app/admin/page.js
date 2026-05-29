"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AdminDashboard() {
  const user = useQuery(api.users.current);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">
        {user?.role === "admin" ? "Admin Overview" : "Staff Overview"}
      </h2>
      <div className="p-8 bg-[#121214] border border-white/10 rounded-2xl">
        <p className="text-white/60">
          Welcome to the administration panel. Select a module from the sidebar to manage content, users, or review student submissions.
        </p>
      </div>
    </div>
  );
}
