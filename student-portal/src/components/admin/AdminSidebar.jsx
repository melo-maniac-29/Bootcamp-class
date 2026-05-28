'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  MonitorPlay, 
  Users, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'bootcamps', label: 'Bootcamps', icon: <MonitorPlay size={20} />, path: '/admin/bootcamps', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 'students', label: 'All Students', icon: <Users size={20} />, path: '/admin/students', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/admin/settings', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
];

export default function AdminSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleNav = (path) => {
    router.push(path);
  };

  const isActive = (path) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex flex-col h-screen bg-card border-r border-border sticky top-0 z-40 shadow-xl overflow-hidden"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        animate={{ width: isExpanded ? 260 : 76 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 1 }}
      >
        <div className="h-20 flex items-center px-4 mb-4 mt-2">
          <div className="flex items-center justify-center min-w-[44px] h-[44px] rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
            <Zap size={24} />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-3 flex flex-col whitespace-nowrap overflow-hidden shrink-0"
              >
                <span className="font-bold tracking-tight text-foreground text-lg leading-tight">Admin</span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Portal</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-3 space-y-2 overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`relative flex items-center w-full h-12 px-3 rounded-xl transition-colors group overflow-hidden ${
                  active ? `${item.bg} ${item.color}` : `text-muted-foreground hover:bg-white/5`
                }`}
              >
                {active && (
                  <motion.div 
                    layoutId="active-nav-admin"
                    className={`absolute inset-0 rounded-xl border ${item.border} ${item.bg}`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 flex items-center justify-center min-w-[24px] shrink-0 transition-colors ${active ? '' : 'group-hover:text-foreground'}`}>
                  {item.icon}
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, filter: 'blur(4px)', x: -5 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                      exit={{ opacity: 0, filter: 'blur(4px)', x: -5 }}
                      transition={{ duration: 0.2 }}
                      className={`ml-3 font-medium whitespace-nowrap relative z-10 shrink-0 transition-colors ${active ? '' : 'group-hover:text-foreground'}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border overflow-hidden">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center min-w-[40px] h-[40px] rounded-full bg-secondary text-foreground font-bold border border-white/10 shrink-0">
              {user?.displayName?.[0] || 'A'}
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 flex flex-col whitespace-nowrap overflow-hidden shrink-0"
                >
                  <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">{user?.displayName || 'Administrator'}</span>
                  <span className="text-xs text-primary font-medium">Admin Role</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center w-full h-11 px-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group overflow-hidden whitespace-nowrap"
          >
            <div className="flex items-center justify-center min-w-[24px] shrink-0">
              <LogOut size={20} />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 font-medium shrink-0"
                >
                  Log Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-50">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors group ${
                active ? item.color : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                {active && (
                  <motion.div 
                    layoutId="active-mobile-admin"
                    className={`absolute inset-[-6px] rounded-full ${item.bg}`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 transition-colors ${active ? '' : 'group-hover:text-foreground'}`}>
                  {item.icon}
                </div>
              </div>
              <span className={`text-[10px] font-medium relative z-10 transition-colors ${active ? '' : 'group-hover:text-foreground'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}