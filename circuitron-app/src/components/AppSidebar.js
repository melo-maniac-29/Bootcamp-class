"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Purpose:
 *   Shared collapsible + mobile-drawer sidebar for Dashboard and Admin.
 *   - Desktop: slides between 60px icon-rail and 220px full sidebar
 *   - Mobile: hidden by default, opens as a full-height overlay drawer
 *   Logout is always pinned to the bottom.
 *
 * Args:
 *   navItems  Array  [{ href, label, icon: JSX }]
 *   brand     string Brand label (e.g. "STUDENT")
 *   badge     string Small badge text (e.g. "LIVE" | "ADMIN")
 *   badgeColor string Tailwind classes for badge
 *   topSection fn    (open: bool) => ReactNode — extra block below nav
 */
export default function AppSidebar({
  navItems = [],
  brand = "STUDENT",
  badge = "LIVE",
  badgeColor = "text-green-600 border-green-200 bg-green-50",
  topSection = null,
}) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () =>
    void signOut().then(() => router.push("/login"));

  return (
    <>
      {/* ─── MOBILE HAMBURGER BUTTON ─── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm"
        aria-label="Open navigation"
      >
        <svg className="w-4 h-4 text-black/60 dark:text-white/60" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed top-0 left-0 h-full w-[260px] z-50 bg-white dark:bg-[#0a0a0a] border-r border-black/[0.06] dark:border-white/[0.06] flex flex-col"
            >
              <SidebarContents
                open={true}
                navItems={navItems}
                brand={brand}
                badge={badge}
                badgeColor={badgeColor}
                topSection={topSection}
                pathname={pathname}
                onSignOut={handleSignOut}
                onToggle={() => setMobileOpen(false)}
                toggleIcon={
                  <svg className="w-3.5 h-3.5 text-black/40 dark:text-white/40" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── DESKTOP SIDEBAR ─── */}
      <motion.aside
        animate={{ width: open ? 220 : 60 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="shrink-0 border-r border-black/[0.06] dark:border-white/[0.06] hidden md:flex flex-col h-screen sticky top-0 bg-white dark:bg-[#0a0a0a] overflow-hidden"
      >
        <SidebarContents
          open={open}
          navItems={navItems}
          brand={brand}
          badge={badge}
          badgeColor={badgeColor}
          topSection={topSection}
          pathname={pathname}
          onSignOut={handleSignOut}
          onToggle={() => setOpen((o) => !o)}
          toggleIcon={
            <motion.svg
              animate={{ rotate: open ? 0 : 180 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-3.5 h-3.5 text-black/40 dark:text-white/40"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          }
        />
      </motion.aside>
    </>
  );
}

/* ── Inner contents shared by desktop + mobile drawer ── */
function SidebarContents({ open, navItems, brand, badge, badgeColor, topSection, pathname, onSignOut, onToggle, toggleIcon }) {
  return (
    <div className="flex flex-col h-full relative">
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.012] pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:2rem_2rem]" />

      {/* ── HEADER ── */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-8 pb-6 shrink-0">
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <Link href="/" className="font-display font-black text-lg tracking-tighter uppercase text-black dark:text-white whitespace-nowrap">
                C //
              </Link>
              {badge && (
                <span className={`text-[8px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded border whitespace-nowrap ${badgeColor}`}>
                  {badge}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0 ml-auto"
          aria-label="Toggle sidebar"
        >
          {toggleIcon}
        </button>
      </div>

      {/* ── NAV ── */}
      <nav className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-0.5">
        <AnimatePresence initial={false}>
          {open && (
            <motion.p
              key="nav-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[9px] font-mono tracking-[0.3em] text-black/25 dark:text-white/25 uppercase px-2 pb-2 pt-1"
            >
              SYS_NAVIGATION
            </motion.p>
          )}
        </AnimatePresence>

        {navItems.map((item) => (
          <NavItem key={item.href} item={item} open={open} isActive={pathname === item.href} />
        ))}

        {topSection && (
          <div className={`pt-4 mt-3 border-t border-black/[0.06] dark:border-white/[0.06] ${open ? "" : "flex justify-center"}`}>
            {topSection(open)}
          </div>
        )}
      </nav>

      {/* ── LOGOUT & FOOTER — pinned to bottom ── */}
      <div className="relative z-10 shrink-0 px-3 pb-8 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2 mb-6 overflow-hidden whitespace-nowrap px-1"
            >
              <span className="font-mono text-[9px] text-black/30 dark:text-white/30 tracking-widest uppercase transition-colors">
                CRAFTED_BY //
              </span>
              <div className="flex items-center gap-2 mt-1 group cursor-pointer">
                <a
                  href="https://itsmeallen.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[9px] font-black tracking-widest text-black dark:text-white uppercase flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-green-500 opacity-40 group-hover:opacity-100 transition-opacity animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                  <span className="group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300">ALLEN</span>
                </a>
                <span className="font-mono text-[9px] text-black/30 dark:text-white/30 tracking-widest uppercase transition-colors group-hover:text-black/50 dark:group-hover:text-white/50">
                  & KASHINADTH
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onSignOut}
          title="Sign out"
          className={`flex items-center rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all group w-full ${
            open ? "gap-3 px-3 py-2.5" : "justify-center py-2.5"
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0 text-black/25 dark:text-white/25 group-hover:text-black dark:group-hover:text-white transition-colors" viewBox="0 0 16 16" fill="none">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <AnimatePresence initial={false}>
            {open && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                SIGN_OUT
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

function NavItem({ item, open, isActive }) {
  return (
    <Link
      href={item.href}
      title={!open ? item.label : undefined}
      className={`flex items-center rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all group ${
        open ? "gap-3 px-3 py-2.5" : "justify-center py-2.5"
      } ${
        isActive
          ? "bg-black dark:bg-white text-white dark:text-black"
          : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      <span className={`shrink-0 transition-colors ${isActive ? "text-white dark:text-black" : "text-black/25 dark:text-white/25 group-hover:text-black dark:group-hover:text-white"}`}>
        {item.icon}
      </span>
      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            key={`label-${item.href}`}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
