'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B0F19] relative overflow-hidden">
      {/* Subtle Ambient Light */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute w-[40vw] h-[40vw] rounded-full bg-white/5 blur-[100px] pointer-events-none"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 relative z-10"
      >
        {/* Minimal Logo Box */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-xl">
          <GraduationCap size={28} className="text-white" strokeWidth={1.5} />
        </div>

        {/* Loading Text */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <div className="text-white/40 text-[10px] tracking-[0.25em] uppercase font-semibold">
            Initializing
          </div>
          <div className="flex gap-1">
            <motion.div 
              animate={{ opacity: [0.2, 1, 0.2] }} 
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} 
              className="w-1 h-1 rounded-full bg-white/40" 
            />
            <motion.div 
              animate={{ opacity: [0.2, 1, 0.2] }} 
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} 
              className="w-1 h-1 rounded-full bg-white/40" 
            />
            <motion.div 
              animate={{ opacity: [0.2, 1, 0.2] }} 
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} 
              className="w-1 h-1 rounded-full bg-white/40" 
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
