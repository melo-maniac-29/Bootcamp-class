"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Topbar({ title }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between pl-16 md:pl-8 pr-8 py-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md shrink-0 gap-4">
      {/* Left side: Page Title */}
      <span className="font-mono text-[9px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase truncate">
        {title}
      </span>

      {/* Right side: Credits and Theme Toggle */}
      <div className="flex items-center gap-4 md:gap-6">


        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <>
                <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v1m0 8v1m-3.5-6.5h-1m8 0h-1m-4.5-3.5l-.7-.7m7.1 7.1l-.7-.7m-5.7.7l-.7.7m7.1-7.1l-.7.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-black/50 group-hover:text-black transition-colors" viewBox="0 0 16 16" fill="none">
                  <path d="M12.5 10.5A5.5 5.5 0 015.5 3.5a5.5 5.5 0 107 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
