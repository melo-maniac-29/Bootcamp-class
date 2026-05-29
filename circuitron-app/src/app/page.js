"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 80, 
        damping: 20 
      } 
    },
  };

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* Borderless Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-12 pointer-events-none mix-blend-difference text-white">
        <div className="font-display font-black text-3xl tracking-tighter uppercase">C /</div>
        <Link 
          href="/login"
          className="font-sans font-bold text-sm tracking-[0.3em] uppercase pointer-events-auto hover:italic transition-all relative overflow-hidden group"
        >
          <span className="relative z-10 group-hover:text-black transition-colors duration-300">Access</span>
          <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-40 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center text-center min-h-[85vh]">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-5xl relative z-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-gray-600">Bootcamp Registration Open</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-[12vw] font-black font-display leading-[0.85] tracking-tighter mb-12 text-black uppercase"
          >
            Engineering <br />
            <span className="text-gray-200 italic font-medium">Evolved.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-16 font-sans font-medium leading-relaxed tracking-wide"
          >
            A masterfully crafted curriculum designed to take you from absolute beginner to hardware wizard. Prove your skills on the global leaderboard.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login"
              className="group relative inline-flex items-center justify-center px-12 py-5 border-2 border-black hover:bg-black hover:text-white transition-colors duration-500 rounded-full overflow-hidden"
            >
              <span className="font-display font-black text-2xl tracking-widest uppercase relative z-10 mix-blend-difference text-white">
                Access Portal
              </span>
              <div className="absolute inset-0 bg-black translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0" />
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Feature Section */}
      <section className="bg-white py-40 px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-24 md:gap-12"
        >
          <div className="flex flex-col group">
            <span className="font-display font-black text-[10vw] md:text-9xl text-black/5 leading-none mb-2 group-hover:text-black transition-colors duration-700">01</span>
            <h3 className="text-2xl font-display font-black mb-6 tracking-widest uppercase">Structure</h3>
            <p className="text-black/40 font-medium leading-relaxed text-lg max-w-sm">Follow a highly structured daily roadmap. Watch lectures, take strict timed quizzes, and execute assignments.</p>
          </div>
          
          <div className="flex flex-col group">
            <span className="font-display font-black text-[10vw] md:text-9xl text-black/5 leading-none mb-2 group-hover:text-black transition-colors duration-700">02</span>
            <h3 className="text-2xl font-display font-black mb-6 tracking-widest uppercase">Review</h3>
            <p className="text-black/40 font-medium leading-relaxed text-lg max-w-sm">Submit your projects and get instant, constructive feedback from our dedicated engineering staff.</p>
          </div>

          <div className="flex flex-col group">
            <span className="font-display font-black text-[10vw] md:text-9xl text-black/5 leading-none mb-2 group-hover:text-black transition-colors duration-700">03</span>
            <h3 className="text-2xl font-display font-black mb-6 tracking-widest uppercase">Rank</h3>
            <p className="text-black/40 font-medium leading-relaxed text-lg max-w-sm">Compete against hundreds of students. Maintain your streak and climb the global leaderboard.</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
