"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

/**
 * Purpose:
 *   Render a sign-out button. On click, clears the auth session and
 *   redirects the user to /login.
 *
 * Returns:
 *   JSX button element styled in the editorial light-theme mono aesthetic.
 *
 * Side Effects:
 *   - Calls convex signOut which invalidates the session token.
 *   - Navigates to /login after sign-out resolves.
 */
export default function LogoutButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <button
      onClick={() => void signOut().then(() => router.push("/login"))}
      className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-black/30 hover:text-black hover:bg-black/5 transition-all group"
    >
      <svg className="w-3.5 h-3.5 text-black/20 group-hover:text-black transition-colors" viewBox="0 0 16 16" fill="none">
        <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      SIGN_OUT
    </button>
  );
}
