"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <button
      onClick={() => void signOut().then(() => router.push("/"))}
      className="flex items-center gap-3 px-3 py-2 w-full text-red-400 hover:bg-red-400/10 rounded-lg text-sm transition-colors"
    >
      <LogOut size={18} /> Logout
    </button>
  );
}
