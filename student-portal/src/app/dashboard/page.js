'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getBootcamp, getModulesByBootcamp, subscribeToStudent, subscribeToUserProgress } from '@/lib/db';
import { getSocieties } from '@/shared/societies';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  LayoutDashboard
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [bootcamp, setBootcamp] = useState(null);
  const [modules, setModules] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.bootcampId) return;

    const loadData = async () => {
      const bc = await getBootcamp(user.bootcampId);
      if (bc) setBootcamp(bc);

      const mods = await getModulesByBootcamp(user.bootcampId);
      setModules(mods || []);
      setLoading(false);
    };
    loadData();

    const unsubStudent = subscribeToStudent(user.bootcampId, user.uid, (profile) => {
      setStudentProfile(profile);
      if (profile?.level && user?.level && profile.level !== user.level) {
        refreshUser();
      }
    });

    const unsubProgress = subscribeToUserProgress(user.uid, (progressList) => {
      setUserProgress(progressList);
    });

    return () => {
      unsubStudent();
      if (unsubProgress) unsubProgress();
    };
  }, [user, refreshUser]);

  if (loading || !bootcamp) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const societies = getSocieties(bootcamp.society);
  const totalDaysCompleted = userProgress.filter(p => p.overallCompleted).length;
  const totalPoints = studentProfile?.totalPoints || user?.totalPoints || 0;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 400, damping: 30 }
    }
  };

  return (
    <motion.div 
      className="max-w-[80rem] mx-auto space-y-10 pb-16 pt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {societies.map((society) => (
              <span 
                key={society.id} 
                className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-secondary text-secondary-foreground border border-border"
              >
                {society.shortName}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl font-medium">
            Continue where you left off in {bootcamp.name}.
          </p>
        </div>
        
        <button 
          onClick={() => modules.length > 0 && router.push(`/dashboard/modules/${modules[0].id}`)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg font-medium transition-colors border border-primary/10"
        >
          Continue Learning
          <ArrowRight size={16} />
        </button>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-5 hover:border-amber-500/30 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Trophy size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Points</p>
            <h3 className="text-2xl font-bold text-foreground font-mono">{totalPoints}</h3>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-5 hover:border-emerald-500/30 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Days Completed</p>
            <h3 className="text-2xl font-bold text-foreground font-mono">{totalDaysCompleted}</h3>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-5 hover:border-orange-500/30 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Flame size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Current Streak</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-foreground font-mono">{studentProfile?.streakCount || 0}</h3>
              <span className="text-muted-foreground font-medium text-sm">days</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="text-muted-foreground" size={20} />
              Modules
            </h2>
          </div>
          
          {modules.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <BookOpen size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No modules yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Modules will appear here once published by the instructor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((module) => (
                <div 
                  key={module.id} 
                  onClick={() => router.push(`/dashboard/modules/${module.id}`)}
                  className="group bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer hover:border-muted-foreground/30 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{module.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{module.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Activity Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="text-muted-foreground" size={20} />
            Activity
          </h2>
          
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="space-y-5">
              {userProgress.slice(0, 5).map(up => (
                <div key={up.id} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-[-20px] before:w-px before:bg-border last:before:hidden">
                  <div className={`absolute left-[5px] top-1.5 w-3 h-3 rounded-full border-2 border-card ${
                    up.overallCompleted ? 'bg-foreground' : 'bg-muted-foreground'
                  }`} />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground text-sm">Day {up.dayId}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 font-medium">
                        <Calendar size={12} />
                        {up.updatedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {up.overallCompleted ? 'Done' : 'In Progress'}
                    </span>
                  </div>
                </div>
              ))}
              
              {userProgress.length === 0 && (
                <div className="text-center py-6 flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">No recent activity.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
