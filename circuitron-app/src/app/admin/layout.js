'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FolderTree, 
  Users, 
  CheckSquare, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { logoutUser } from '@/lib/auth';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <LoadingScreen />;
  }

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Content CMS', href: '/admin/content', icon: FolderTree },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Submissions', href: '/admin/submissions', icon: CheckSquare },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0A0A0A] flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">Circuitron Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
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
        <header className="h-16 border-b border-white/10 flex items-center px-8 shrink-0 bg-[#0A0A0A]">
          <h2 className="text-sm font-medium text-white/60">
            {navItems.find(i => pathname === i.href || (i.href !== '/admin' && pathname.startsWith(i.href)))?.name || 'Admin'}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}