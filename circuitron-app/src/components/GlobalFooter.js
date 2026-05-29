"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function GlobalFooter() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  return (
    <footer className="mt-auto border-t border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#0a0a0a] py-6 px-8 transition-colors shrink-0 relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest">
            CREDIT: ALLEN //
          </p>
          <a
            href="https://itsemallen.dev"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] text-black dark:text-white font-bold uppercase tracking-widest hover:underline underline-offset-4"
          >
            itsemallen.dev
          </a>
          <p className="font-mono text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest ml-1">
            & KASHINADTH
          </p>
        </div>

        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <>
                <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v1m0 8v1m-3.5-6.5h-1m8 0h-1m-4.5-3.5l-.7-.7m7.1 7.1l-.7-.7m-5.7.7l-.7.7m7.1-7.1l-.7.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-mono text-[9px] uppercase tracking-wider text-white/50 group-hover:text-white">LIGHT_MODE</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-black/50 group-hover:text-black transition-colors" viewBox="0 0 16 16" fill="none">
                  <path d="M12.5 10.5A5.5 5.5 0 015.5 3.5a5.5 5.5 0 107 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-mono text-[9px] uppercase tracking-wider text-black/50 group-hover:text-black">DARK_MODE</span>
              </>
            )}
          </button>
        )}
      </div>
    </footer>
  );
}
