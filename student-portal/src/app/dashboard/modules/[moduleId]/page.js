'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getModule, getDaysByModule, subscribeToUserProgress } from '@/lib/db';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Check,
  PlayCircle,
  FileText,
  UploadCloud,
  Lock,
  Unlock,
  Circle
} from 'lucide-react';

export default function ModulePage({ params }) {
  const { moduleId } = params;
  const { user } = useAuth();
  const router = useRouter();

  const [moduleData, setModuleData] = useState(null);
  const [days, setDays] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadModule = async () => {
      const mod = await getModule(moduleId);
      setModuleData(mod);
      if (mod) {
        const dList = await getDaysByModule(moduleId);
        setDays(dList || []);
      }
      setLoading(false);
    };
    loadModule();

    const unsubProgress = subscribeToUserProgress(user.uid, (progressList) => {
      const map = {};
      progressList.forEach(p => {
        if (p.moduleId === moduleId) {
          map[p.dayId] = p;
        }
      });
      setProgressData(map);
    });

    return () => {
      if (unsubProgress) unsubProgress();
    };
  }, [user, moduleId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-foreground mb-2">Module not found</h2>
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Determine which days are unlocked. Day 1 is always unlocked. 
  // Day N is unlocked if Day N-1 is completed. (Assuming days are sorted)
  const sortedDays = [...days].sort((a, b) => {
    const aNum = parseInt(a.title.replace(/[^0-9]/g, '')) || 0;
    const bNum = parseInt(b.title.replace(/[^0-9]/g, '')) || 0;
    return aNum - bNum;
  });

  return (
    <div className="max-w-[60rem] mx-auto pb-16 pt-4">
      <button 
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        onClick={() => router.push('/dashboard')}
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">{moduleData.title}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">{moduleData.description}</p>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-border">
        {sortedDays.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center relative z-10 mx-auto max-w-lg shadow-sm">
            <p className="text-muted-foreground">No days have been added to this module yet.</p>
          </div>
        ) : (
          sortedDays.map((day, index) => {
            const prog = progressData[day.id] || {};
            const isCompleted = prog.overallCompleted;
            
            // Check if previous day is completed to unlock this one
            let isUnlocked = true;
            if (index > 0) {
              const prevDay = sortedDays[index - 1];
              const prevProg = progressData[prevDay.id] || {};
              isUnlocked = prevProg.overallCompleted;
            }

            return (
              <div key={day.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Timeline dot */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 transition-colors ${
                  isCompleted 
                    ? 'bg-foreground border-background text-background' 
                    : isUnlocked 
                      ? 'bg-background border-foreground text-foreground'
                      : 'bg-background border-border text-muted-foreground'
                }`}>
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : isUnlocked ? <Circle size={12} fill="currentColor" /> : <Lock size={14} />}
                </div>
                
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-2">
                  <motion.div 
                    className={`bg-card border rounded-xl p-6 transition-all shadow-sm ${
                      isUnlocked 
                        ? 'border-border hover:border-muted-foreground/30 hover:bg-secondary/30 cursor-pointer' 
                        : 'border-border/50 opacity-50 cursor-not-allowed bg-transparent'
                    }`}
                    onClick={() => {
                      if (isUnlocked) {
                        router.push(`/dashboard/modules/${moduleId}/days/${day.id}`);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className={`text-xl font-bold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{day.title}</h3>
                        {isCompleted && (
                          <span className="text-xs font-bold text-foreground uppercase tracking-wider bg-secondary px-2 py-1 rounded">
                            Done
                          </span>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{day.description}</p>
                      
                      {isUnlocked && (
                        <div className="flex flex-wrap gap-4 mt-auto pt-4 border-t border-border/50">
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${prog.videoCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            <PlayCircle size={14} />
                            Video
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${prog.quizCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            <FileText size={14} />
                            Quiz
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${prog.submissionCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            <UploadCloud size={14} />
                            Task
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
