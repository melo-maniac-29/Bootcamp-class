'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Map, 
  Settings,
  LogOut,
  Bell
} from 'lucide-react';
import { logoutUser } from '@/lib/auth';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (user.role === 'admin') {
        router.push('/admin');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role === 'admin') {
    return <LoadingScreen />;
  }

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Roadmap', href: '/dashboard/days', icon: Map },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar for Desktop */}
      <aside className="w-64 border-r border-white/10 bg-[#0A0A0A] flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">Circuitron</h1>
          <p className="text-xs text-white/40 mt-1">Participant Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 shrink-0 bg-[#0A0A0A]">
          <h2 className="text-sm font-medium text-white/60">
            {navItems.find(i => pathname === i.href || (i.href !== '/dashboard' && pathname.startsWith(i.href)))?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white">
              <Bell size={18} />
            </button>
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
              {user.displayName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0A0A0A] z-50 flex justify-around p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors ${
                isActive ? 'text-white' : 'text-white/60'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-white/60'} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
