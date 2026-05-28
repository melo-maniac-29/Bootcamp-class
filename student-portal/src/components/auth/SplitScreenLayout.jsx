'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Code, Trophy, 
  Activity, BarChart3, Users,
  CheckCircle, ShieldCheck
} from 'lucide-react';

const SLIDES = {
  student: [
    { id: 1, title: 'Your Learning Journey', subtitle: 'Track your progress and master new skills systematically.', icon: Map, color: 'from-blue-500/20 to-indigo-500/20', accent: 'text-blue-500' },
    { id: 2, title: 'Interactive Workspace', subtitle: 'Write code, submit tasks, and get instant feedback.', icon: Code, color: 'from-indigo-500/20 to-purple-500/20', accent: 'text-indigo-400' },
    { id: 3, title: 'Earn & Achieve', subtitle: 'Gain points, climb the leaderboard, and unlock rewards.', icon: Trophy, color: 'from-amber-500/20 to-orange-500/20', accent: 'text-amber-500' }
  ],
  admin: [
    { id: 1, title: 'Platform Command', subtitle: 'Manage bootcamps, students, and system health seamlessly.', icon: Activity, color: 'from-purple-500/20 to-pink-500/20', accent: 'text-purple-500' },
    { id: 2, title: 'Real-time Analytics', subtitle: 'Monitor engagement, completion rates, and metrics.', icon: BarChart3, color: 'from-emerald-500/20 to-teal-500/20', accent: 'text-emerald-500' },
    { id: 3, title: 'Team Coordination', subtitle: 'Coordinate with volunteers to deliver the best experience.', icon: Users, color: 'from-blue-500/20 to-cyan-500/20', accent: 'text-blue-500' }
  ],
  volunteer: [
    { id: 1, title: 'Review Submissions', subtitle: 'Evaluate student tasks and provide constructive feedback.', icon: CheckCircle, color: 'from-emerald-500/20 to-teal-500/20', accent: 'text-emerald-500' },
    { id: 2, title: 'Student Mentorship', subtitle: 'Guide participants through their learning journey.', icon: Users, color: 'from-cyan-500/20 to-blue-500/20', accent: 'text-cyan-500' },
    { id: 3, title: 'Community Impact', subtitle: 'Help shape the next generation of developers.', icon: ShieldCheck, color: 'from-indigo-500/20 to-purple-500/20', accent: 'text-indigo-400' }
  ]
};

const THEMES = {
  student: {
    bgOuter: 'bg-violet-950',
    bgInner: 'bg-[#9162F5]',
    blob1: 'bg-white/5',
    blob2: 'bg-white/5',
    title: 'Welcome to student portal',
    accent: 'text-[#9162F5]'
  },
  admin: {
    bgOuter: 'bg-[#064e3b]',
    bgInner: 'bg-emerald-700',
    blob1: 'bg-white/5',
    blob2: 'bg-white/5',
    title: 'Welcome to admin portal',
    accent: 'text-emerald-700'
  },
  volunteer: {
    bgOuter: 'bg-blue-950',
    bgInner: 'bg-[#2563EB]',
    blob1: 'bg-white/5',
    blob2: 'bg-white/5',
    title: 'Welcome to volunteer portal',
    accent: 'text-[#2563EB]'
  }
};

export default function SplitScreenLayout({ children, role = 'student' }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = SLIDES[role] || SLIDES.student;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 9000); // 9 seconds per slide for calmer reading
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className={`flex min-h-screen w-full bg-background overflow-hidden font-sans ${role === 'student' ? 'flex-row' : 'flex-row-reverse'}`}>
      
      {/* LEFT SIDE: Login Form (50% Width) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 bg-[#0B0F19] shadow-[10px_0_40px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-[400px] relative z-10">
          {children}
        </div>
      </div>

      <div className={`hidden lg:flex lg:w-1/2 relative ${THEMES[role].bgOuter} overflow-hidden items-center justify-center p-8`}>
        
        {/* Large Inner Card (Matching the reference image) */}
        <div className={`relative w-full max-w-[800px] h-full max-h-[900px] rounded-3xl ${THEMES[role].bgInner} shadow-2xl overflow-hidden flex flex-col`}>
          
          {/* Abstract Organic Blobs */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute -top-[20%] -left-[10%] w-[70%] h-[60%] rounded-full ${THEMES[role].blob1} blur-3xl`}
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className={`absolute -bottom-[20%] -right-[10%] w-[80%] h-[70%] rounded-full ${THEMES[role].blob2} blur-3xl`}
          />

          {/* Center Animated Content */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 lg:p-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[480px]"
              >
                {/* Translucent Card matching the image */}
                <div className="bg-white/5 rounded-3xl p-10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] border border-white/5">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-white flex items-center justify-center mb-8 shadow-sm">
                    {(() => {
                      const Icon = slides[currentSlide].icon;
                      return <Icon size={32} strokeWidth={2} className={THEMES[role].accent} />;
                    })()}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-white/80 text-lg leading-relaxed">
                    {slides[currentSlide].subtitle}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2">
              {slides.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`relative h-1.5 rounded-full transition-all duration-500 overflow-hidden ${
                    currentSlide === idx ? 'w-10 bg-white/20' : 'w-10 bg-black/10'
                  }`}
                >
                  {currentSlide === idx && (
                    <motion.div
                      layoutId="indicator"
                      initial={{ x: '-100%' }}
                      animate={{ x: '0%' }}
                      transition={{ duration: 9, ease: "linear" }}
                      className="absolute inset-0 bg-white rounded-full"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
