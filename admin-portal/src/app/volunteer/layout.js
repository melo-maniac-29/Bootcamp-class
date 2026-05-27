'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import VolunteerSidebar from '@/components/volunteer/VolunteerSidebar';
import { Loader2 } from 'lucide-react';

export default function VolunteerLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'volunteer')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'volunteer') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading volunteer portal...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <VolunteerSidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 h-screen scroll-smooth">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
