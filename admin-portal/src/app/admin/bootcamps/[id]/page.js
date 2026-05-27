'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getBootcamp, updateBootcamp } from '@/lib/db';
import { getSocietyLabel } from '@/shared/societies';
import { 
  ArrowLeft,
  LayoutDashboard,
  BookOpen,
  Users,
  UserPlus,
  FileCheck,
  Trophy,
  Archive,
  MonitorPlay,
  Settings
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'modules', label: 'Modules', icon: <BookOpen size={16} /> },
  { id: 'volunteers', label: 'Volunteers', icon: <UserPlus size={16} /> },
  { id: 'students', label: 'Students', icon: <Users size={16} /> },
  { id: 'submissions', label: 'Submissions', icon: <FileCheck size={16} /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
];

export default function BootcampDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [bootcamp, setBootcamp] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBootcamp = async () => {
      const bc = await getBootcamp(id);
      if (!bc) {
        router.push('/admin/bootcamps');
        return;
      }
      setBootcamp(bc);
      setLoading(false);
    };
    loadBootcamp();
  }, [id, router]);

  const handleArchive = async () => {
    if (confirm('Are you sure you want to archive this bootcamp?')) {
      try {
        await updateBootcamp(id, { status: 'archived' });
        setBootcamp({ ...bootcamp, status: 'archived' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!bootcamp) return null;

  return (
    <div className="max-w-[80rem] mx-auto pb-16 pt-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="space-y-8"
      >
        <button 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 group w-fit"
          onClick={() => router.push('/admin/bootcamps')}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Bootcamps
        </button>

        {/* Bootcamp Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center text-foreground shrink-0 border border-border">
              <MonitorPlay size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">{bootcamp.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-secondary text-muted-foreground px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-border">
                  {getSocietyLabel(bootcamp.society)}
                </span>
                {bootcamp.teamConfig?.enabled && (
                  <span className="bg-secondary text-muted-foreground px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-border">
                    Team-based
                  </span>
                )}
                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border ${
                  bootcamp.status === 'active' 
                    ? 'bg-foreground text-background border-foreground' 
                    : 'bg-secondary text-muted-foreground border-border'
                }`}>
                  {bootcamp.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-px border-b border-border scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'modules') router.push(`/admin/bootcamps/${id}/modules`);
                else if (tab.id === 'volunteers') router.push(`/admin/bootcamps/${id}/volunteers`);
                else if (tab.id === 'students') router.push(`/admin/bootcamps/${id}/students`);
                else if (tab.id === 'submissions') router.push(`/admin/bootcamps/${id}/submissions`);
                else if (tab.id === 'leaderboard') router.push(`/admin/bootcamps/${id}/leaderboard`);
                else setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-colors whitespace-nowrap border-b-2 text-sm ${
                activeTab === 'overview' && tab.id === 'overview'
                  ? 'border-foreground text-foreground bg-secondary/50' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-6 pt-4"
          >
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Settings className="text-muted-foreground" size={20} />
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => router.push(`/admin/bootcamps/${id}/volunteers`)}
                  className="flex items-center justify-center gap-2 bg-card hover:bg-secondary/50 text-foreground px-6 py-4 rounded-xl font-medium transition-colors border border-border hover:border-muted-foreground/30 text-sm"
                >
                  <UserPlus size={18} />
                  Add Volunteer
                </button>
                <button 
                  onClick={() => router.push(`/admin/bootcamps/${id}/students`)}
                  className="flex items-center justify-center gap-2 bg-card hover:bg-secondary/50 text-foreground px-6 py-4 rounded-xl font-medium transition-colors border border-border hover:border-muted-foreground/30 text-sm"
                >
                  <Users size={18} />
                  Add Student
                </button>
                <button 
                  onClick={() => router.push(`/admin/bootcamps/${id}/modules`)}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-xl font-medium transition-colors text-sm"
                >
                  <BookOpen size={18} />
                  Manage Curriculum
                </button>
                
                {bootcamp.status !== 'archived' && (
                  <button 
                    onClick={handleArchive}
                    className="flex items-center justify-center gap-2 bg-card hover:bg-destructive/10 text-destructive px-6 py-4 rounded-xl font-medium transition-colors border border-destructive/20 text-sm"
                  >
                    <Archive size={18} />
                    Archive Bootcamp
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
