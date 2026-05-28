'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { subscribeToBootcamps } from '@/lib/db';
import { getSocieties, getSocietyLabel, getPrimarySocietyId } from '@/shared/societies';
import { Plus, ArrowRight, Book, Code, GraduationCap, Users, Bot, Settings, MonitorPlay } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

const SOCIETY_ICONS = {
  computer_society: <Code size={20} />,
  student_branch: <GraduationCap size={20} />,
  women_in_engineering: <Users size={20} />,
  robotics: <Bot size={20} />,
  industrial_applications: <Settings size={20} />,
};

export default function BootcampsPage() {
  const [bootcamps, setBootcamps] = useState([]);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const unsub = subscribeToBootcamps(setBootcamps);
    return () => unsub();
  }, []);

  const filtered = filter === 'all'
    ? bootcamps
    : bootcamps.filter(bc => bc.status === filter);

  return (
    <div className="max-w-[80rem] mx-auto pb-16 pt-4">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Bootcamps
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Manage all your IEEE bootcamps.</p>
          </div>
          <button 
            onClick={() => router.push('/admin/bootcamps/create')}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-medium transition-colors border border-primary/10 shrink-0"
          >
            <Plus size={18} />
            New Bootcamp
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'active', 'archived'].map((f) => {
            const count = f === 'all' ? bootcamps.length : bootcamps.filter(bc => bc.status === f).length;
            const isActive = filter === f;
            
            return (
              <button
                key={f}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isActive ? 'bg-primary-foreground/20' : 'bg-background'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
              <MonitorPlay size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No bootcamps found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              {filter === 'all'
                ? 'Create your first bootcamp to get started.'
                : `No ${filter} bootcamps available.`}
            </p>
            {filter === 'all' && (
              <button 
                onClick={() => router.push('/admin/bootcamps/create')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Create Bootcamp
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((bc, i) => {
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
                    className="group flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-muted-foreground/30 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="p-6 flex-1 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-colors">
                          {SOCIETY_ICONS[socId] || <Book size={18} />}
                        </div>
                        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded ${
                          bc.status === 'active' ? 'bg-secondary text-foreground' : 'bg-secondary/50 text-muted-foreground'
                        }`}>
                          {bc.status}
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
    </div>
  );
}
