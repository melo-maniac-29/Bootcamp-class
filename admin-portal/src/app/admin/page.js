'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { subscribeToBootcamps } from '@/lib/db';
import { getPrimarySocietyId, getSocietyLabel } from '@/shared/societies';
import { 
  Rocket, 
  Book, 
  Code, 
  GraduationCap, 
  Settings, 
  Bot, 
  Users,
  Plus,
  ArrowRight,
  MonitorPlay
} from 'lucide-react';

const SOCIETY_ICONS = {
  computer_society: <Code size={20} />,
  student_branch: <GraduationCap size={20} />,
  women_in_engineering: <Users size={20} />,
  robotics: <Bot size={20} />,
  industrial_applications: <Settings size={20} />,
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [bootcamps, setBootcamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToBootcamps((data) => {
      setBootcamps(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const activeBootcamps = bootcamps.filter(b => b.status === 'active');
  const pastBootcamps = bootcamps.filter(b => b.status !== 'active');

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[80rem] mx-auto pb-16 pt-4">
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-10">
        
        {/* Header Section */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              {greeting()}, {user?.displayName?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Manage and track your active bootcamps.</p>
          </div>
          
          <button 
            onClick={() => router.push('/admin/bootcamps')}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-medium transition-colors border border-primary/10 shrink-0"
          >
            <Plus size={18} />
            New Bootcamp
          </button>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-5 hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Rocket size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active</p>
              <h3 className="text-2xl font-bold text-foreground font-mono">{activeBootcamps.length}</h3>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-5 hover:border-slate-500/30 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-slate-500/10 flex items-center justify-center shrink-0">
              <Book size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Archived</p>
              <h3 className="text-2xl font-bold text-foreground font-mono">{pastBootcamps.length}</h3>
            </div>
          </div>
        </motion.div>

        {/* Active Bootcamps Section */}
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <MonitorPlay className="text-muted-foreground" size={20} />
              Active Bootcamps
            </h2>
          </div>

          {activeBootcamps.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                <Rocket size={28} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No Active Bootcamps</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">Create your first bootcamp to get started.</p>
              <button 
                onClick={() => router.push('/admin/bootcamps')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Create Bootcamp
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBootcamps.map((bc, i) => {
                const socId = getPrimarySocietyId(bc.society);
                return (
                  <motion.div
                    key={bc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div 
                      onClick={() => router.push(`/admin/bootcamps/${bc.id}`)}
                      className="group flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/30 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="p-6 flex-1 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-colors">
                            {SOCIETY_ICONS[socId] || <Book size={18} />}
                          </div>
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
                            Active
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{bc.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{bc.description}</p>
                        </div>
                      </div>
                      
                      <div className="px-6 py-4 border-t border-border bg-secondary/10 flex items-center justify-between mt-auto">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-medium bg-secondary text-muted-foreground px-2 py-1 rounded">
                            {getSocietyLabel(bc.society)}
                          </span>
                          {bc.teamConfig?.enabled && (
                            <span className="text-xs font-medium bg-secondary text-muted-foreground px-2 py-1 rounded">
                              Team-based
                            </span>
                          )}
                        </div>
                        <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
}
