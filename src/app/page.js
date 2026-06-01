"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";

export default function LandingPage() {
  const [time, setTime] = useState("");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  const { scrollYProgress: pageScrollY } = useScroll();
  const rotate = useTransform(pageScrollY, [0, 1], [0, 360]);

  // Horizontal scroll timeline ref
  const timelineRef = useRef(null);
  const { scrollYProgress: timelineScrollY } = useScroll({
    target: timelineRef,
    offset: ["start start", "end end"],
  });

  // Transform vertical scroll progress of sticky section into translateX for a 300vw canvas
  const timelineX = useTransform(timelineScrollY, [0, 1], ["0%", "-66.6%"]);

  // Logic Sandbox States
  const [nodes, setNodes] = useState({
    IN_A: false,
    IN_B: false,
    GATE: false,
    OUT: false,
  });
  const [telemetry, setTelemetry] = useState([
    "MAINFRAME_SYSTEM: STANDBY",
    "VOLTAGE_NODE: 0.00V // NOMINAL",
    "CLOCK_FREQUENCY: 144.00MHz",
  ]);

  // Real-Time System Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Logic Node Interaction
  const handleNodeClick = (nodeKey) => {
    setNodes((prev) => {
      const nextNodes = { ...prev, [nodeKey]: !prev[nodeKey] };
      
      // Calculate outputs based on active gates
      // Logical AND gate configuration
      nextNodes.GATE = nextNodes.IN_A && nextNodes.IN_B;
      nextNodes.OUT = nextNodes.GATE;

      // Update telemetry console log entries
      const logs = [
        `NODE_${nodeKey}: ${nextNodes[nodeKey] ? "ENGAGED" : "RELEASED"}`,
        `SYS_VOLTAGE: ${(nextNodes.IN_A || nextNodes.IN_B ? 3.3 : 0).toFixed(2)}V`,
        `LOGIC_STATE_GATE: ${nextNodes.GATE ? "HIGH (1)" : "LOW (0)"}`,
        `OUTPUT_COGNITION: ${nextNodes.OUT ? "TRANSMITTING" : "STANDBY"}`,
      ];
      setTelemetry((prevLogs) => [logs[0], logs[1], logs[2], logs[3], ...prevLogs.slice(0, 4)]);

      return nextNodes;
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black relative font-sans">
      
      {/* ----------------- PERSPECTIVE BLUEPRINT FLOOR GRID ----------------- */}
      <div className="absolute inset-0 z-0 opacity-[0.025] pointer-events-none overflow-hidden select-none">
        <div className="absolute top-0 left-0 w-full h-[150%] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem] [transform:perspective(600px)_rotateX(65deg)_translateY(-20%)] origin-top scale-125" />
      </div>

      {/* ----------------- EDITORIAL GALLERY FRAME ----------------- */}
      
      {/* Left Frame Border */}
      <div className="hidden xl:flex fixed left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-center z-50 text-[9px] tracking-[0.5em] uppercase font-mono text-gray-400 select-none mix-blend-difference pointer-events-none">
        CIRCUITRON // COGNITIVE INTEGRATED MAINBOARD
      </div>

      {/* Right Frame Border */}
      <div className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 rotate-90 origin-center z-50 text-[9px] tracking-[0.5em] uppercase font-mono text-gray-400 select-none mix-blend-difference pointer-events-none">
        IEEE INTELLECTUAL PLATFORM // NODE_SHUTTER_v2.7
      </div>

      {/* Top Left Navigation logo */}
      <div className="fixed top-8 left-8 md:top-12 md:left-12 z-50 flex items-center gap-3 pointer-events-auto select-none">
        <Link href="/" className="font-display font-black text-2xl tracking-tighter uppercase text-black dark:text-white">
          C //
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-bold tracking-wider uppercase font-mono text-green-700 dark:text-green-400">ONLINE_CORE</span>
        </div>
      </div>

      {/* Top Right Navigation actions */}
      <div className="fixed top-8 right-8 md:top-12 md:right-12 z-50 flex items-center gap-4 md:gap-6 mix-blend-difference text-black dark:text-white font-mono text-xs select-none">
        


        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors group"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <>
                <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v1m0 8v1m-3.5-6.5h-1m8 0h-1m-4.5-3.5l-.7-.7m7.1 7.1l-.7-.7m-5.7.7l-.7.7m7.1-7.1l-.7.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" viewBox="0 0 16 16" fill="none">
                  <path d="M12.5 10.5A5.5 5.5 0 015.5 3.5a5.5 5.5 0 107 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        )}

        <div className="hidden lg:block text-gray-400 tracking-wider">
          COGNITIVE_TIME: <span className="text-white font-bold">{time || "00:00:00"}</span>
        </div>
        <Link 
          href="/login"
          className="group relative px-5 py-2.5 border border-white rounded-lg overflow-hidden bg-transparent text-white font-bold uppercase tracking-[0.2em] text-[10px] pointer-events-auto transition-colors duration-300"
        >
          <span className="relative z-10 group-hover:text-black transition-colors duration-300">Access Portal</span>
          <span className="absolute inset-0 bg-white scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 ease-out z-0" />
        </Link>
      </div>

      {/* Bottom Left System Latency metrics */}
      <div className="fixed bottom-8 left-8 md:bottom-12 md:left-12 z-50 hidden md:flex flex-col gap-1 font-mono text-[9px] text-gray-400 select-none mix-blend-difference pointer-events-none">
        <div>SYS_LATENCY: 12MS // METRIC: ULTRA_OK</div>
        <div>COORDINATES: [SYS_NODE_57A]</div>
      </div>

      {/* Bottom Right Scroll Indicator compass */}
      <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-50 hidden md:flex items-center gap-4 font-mono text-[9px] text-gray-400 select-none mix-blend-difference pointer-events-none">
        <div className="text-right">
          <div>SCROLL_VECTOR</div>
          <div className="text-black dark:text-white font-bold">MONITORING</div>
        </div>
        <motion.svg style={{ rotate }} className="w-8 h-8 text-black dark:text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M50 15 L50 85 M15 50 L85 50" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <polygon points="50,25 55,50 50,75 45,50" fill="currentColor" />
        </motion.svg>
      </div>

      {/* ----------------- ASYMMETRICAL INTERACTIVE HERO CONTENT ----------------- */}
      
      <main className="relative min-h-screen flex flex-col justify-center px-8 md:px-24 xl:px-36 py-32 z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative z-10 max-w-[1400px] w-full mx-auto">
          
          {/* Left Large Typography Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 text-[10px] font-mono tracking-[0.2em] text-black/60 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                TACTILE_INTEGRITY_VERIFIED
              </div>

              <h1 className="text-[11vw] sm:text-[9vw] lg:text-[7vw] xl:text-[6.5vw] font-display font-black leading-[0.85] tracking-tighter uppercase text-black dark:text-white select-none">
                HARDWARE <br />
                <span className="text-gray-300 font-medium italic normal-case">Evolved.</span> <br />
                ENGINEERING.
              </h1>

              <p className="text-gray-500 font-sans text-base md:text-lg leading-relaxed tracking-wide font-medium max-w-xl">
                A pristine, tactile learning system configured to launch minds into architectural logic. Engage physical components, solve hardware sprints, and establish intellectual dominance.
              </p>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="group relative inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-display font-bold text-sm tracking-[0.2em] uppercase rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span className="relative z-10">INITIALIZE COGNITIVE Vault</span>
                  <span className="absolute inset-0 bg-gray-800 dark:bg-gray-200 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out z-0" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Column: INTERACTIVE SCHEMATIC SANDBOX */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="w-full bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden group/sandbox"
            >
              {/* Outer decorative tech lines */}
              <div className="absolute top-0 right-0 p-3 font-mono text-[8px] text-gray-300 pointer-events-none select-none">
                MAP // COGNITIVE_LOGIC
              </div>

              {/* Title Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-black" />
                <span className="font-mono text-[10px] tracking-wider font-bold text-black uppercase">TACTILE_SCHEMATIC_SANDBOX</span>
              </div>

              {/* Interactive SVG Canvas */}
              <div className="bg-[#F8F9FA] dark:bg-[#111] border border-gray-150 dark:border-white/5 rounded-xl p-4 flex items-center justify-center relative mb-6 overflow-hidden">
                <svg width="100%" height="220" viewBox="0 0 400 220" className="relative z-10">
                  {/* Grid Lines Overlay */}
                  <defs>
                    <pattern id="sandbox-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#sandbox-grid)" />

                  {/* Connective Paths */}
                  <path
                    d="M 60 60 H 180 V 100"
                    strokeWidth="2"
                    fill="none"
                    className={`transition-colors duration-300 ${nodes.IN_A ? "stroke-black dark:stroke-white" : "stroke-[#CED4DA] dark:stroke-gray-700"}`}
                  />
                  {nodes.IN_A && (
                    <path
                      d="M 60 60 H 180 V 100"
                      stroke="#4ADE80"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="6 6"
                      className="animate-[dash_0.8s_linear_infinite]"
                    />
                  )}

                  <path
                    d="M 60 160 H 180 V 120"
                    strokeWidth="2"
                    fill="none"
                    className={`transition-colors duration-300 ${nodes.IN_B ? "stroke-black dark:stroke-white" : "stroke-[#CED4DA] dark:stroke-gray-700"}`}
                  />
                  {nodes.IN_B && (
                    <path
                      d="M 60 160 H 180 V 120"
                      stroke="#4ADE80"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="6 6"
                      className="animate-[dash_0.8s_linear_infinite]"
                    />
                  )}

                  <path
                    d="M 220 110 H 320"
                    strokeWidth="2"
                    fill="none"
                    className={`transition-colors duration-300 ${nodes.GATE ? "stroke-black dark:stroke-white" : "stroke-[#CED4DA] dark:stroke-gray-700"}`}
                  />
                  {nodes.GATE && (
                    <path
                      d="M 220 110 H 320"
                      stroke="#4ADE80"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="6 6"
                      className="animate-[dash_0.8s_linear_infinite]"
                    />
                  )}

                  {/* INPUT_A Node */}
                  <g onClick={() => handleNodeClick("IN_A")} className="cursor-pointer group/node">
                    <circle
                      cx="60"
                      cy="60"
                      r="16"
                      strokeWidth="2"
                      className={`transition-all duration-300 stroke-black dark:stroke-white ${nodes.IN_A ? "fill-black dark:fill-white" : "fill-white dark:fill-[#111]"}`}
                    />
                    <text
                      x="60"
                      y="64"
                      textAnchor="middle"
                      className={`font-mono text-[9px] font-bold select-none ${nodes.IN_A ? "fill-white dark:fill-[#111]" : "fill-black dark:fill-white"}`}
                    >
                      A
                    </text>
                    <text x="60" y="38" textAnchor="middle" fill="#9CA3AF" className="font-mono text-[7px] tracking-wider uppercase">
                      IN_A
                    </text>
                  </g>

                  {/* INPUT_B Node */}
                  <g onClick={() => handleNodeClick("IN_B")} className="cursor-pointer group/node">
                    <circle
                      cx="60"
                      cy="160"
                      r="16"
                      strokeWidth="2"
                      className={`transition-all duration-300 stroke-black dark:stroke-white ${nodes.IN_B ? "fill-black dark:fill-white" : "fill-white dark:fill-[#111]"}`}
                    />
                    <text
                      x="60"
                      y="164"
                      textAnchor="middle"
                      className={`font-mono text-[9px] font-bold select-none ${nodes.IN_B ? "fill-white dark:fill-[#111]" : "fill-black dark:fill-white"}`}
                    >
                      B
                    </text>
                    <text x="60" y="190" textAnchor="middle" fill="#9CA3AF" className="font-mono text-[7px] tracking-wider uppercase">
                      IN_B
                    </text>
                  </g>

                  {/* AND GATE Node */}
                  <rect
                    x="180"
                    y="90"
                    width="40"
                    height="40"
                    rx="8"
                    strokeWidth="2"
                    className={`transition-colors duration-300 stroke-black dark:stroke-white ${nodes.GATE ? "fill-black dark:fill-white" : "fill-white dark:fill-[#111]"}`}
                  />
                  <text
                    x="200"
                    y="114"
                    textAnchor="middle"
                    className={`font-mono text-[9px] font-bold select-none ${nodes.GATE ? "fill-white dark:fill-[#111]" : "fill-black dark:fill-white"}`}
                  >
                    AND
                  </text>
                  <text x="200" y="78" textAnchor="middle" fill="#9CA3AF" className="font-mono text-[7px] tracking-wider uppercase">
                    SYS_GATE
                  </text>

                  {/* OUTPUT Node */}
                  <circle
                    cx="320"
                    cy="110"
                    r="12"
                    strokeWidth="2"
                    className={`transition-colors duration-300 stroke-black dark:stroke-white ${nodes.OUT ? "fill-green-400 stroke-green-500" : "fill-white dark:fill-[#111]"}`}
                  />
                  <text
                    x="320"
                    y="113"
                    textAnchor="middle"
                    className={`font-mono text-[8px] font-bold select-none ${nodes.OUT ? "fill-[#111]" : "fill-black dark:fill-white"}`}
                  >
                    Y
                  </text>
                  <text x="320" y="90" textAnchor="middle" fill="#9CA3AF" className="font-mono text-[7px] tracking-wider uppercase">
                    OUT_Y
                  </text>
                </svg>
              </div>

              {/* Real-time Telemetry Monitor terminal */}
              <div className="bg-[#F3F4F6] dark:bg-[#111] rounded-xl p-4 font-mono text-[10px] text-gray-500 dark:text-gray-400 h-28 overflow-y-auto space-y-1.5 border border-black/10 dark:border-white/10 select-none shadow-inner">
                {telemetry.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-green-500 font-bold">&gt;</span>
                    <span className="tracking-wide">{log}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* ----------------- DESKTOP ONLY: HORIZONTAL BLUEPRINT TIMELINE (INLINE STYLES FOR ABSOLUTE PINNING) ----------------- */}
      <section 
        ref={timelineRef} 
        className="hidden lg:block bg-white dark:bg-black z-20"
        style={{ height: "300vh", position: "relative" }}
      >
        <div 
          className="bg-white dark:bg-black text-black dark:text-white flex items-center"
          style={{ 
            position: "sticky", 
            top: 0, 
            height: "100vh", 
            width: "100vw", 
            overflow: "hidden" 
          }}
        >
          
          {/* Animated 300vw horizontal sliding track */}
          <motion.div style={{ x: timelineX }} className="w-[300vw] h-full flex flex-row">
            
            {/* PANEL 01: STRUCTURE */}
              <div className="w-screen shrink-0 h-full flex flex-row items-center justify-between px-24 xl:px-36 py-20 relative select-none">
              {/* Vertical technical section boundary line */}
              <div className="absolute top-0 right-0 w-[1px] h-full bg-black/10 dark:bg-white/10" />

              <div className="w-[40vw] space-y-8 pr-12">
                <span className="font-mono text-xs uppercase tracking-[0.4em] text-gray-500">OPERATIONAL NODE // 01</span>
                <h2 className="text-6xl xl:text-7xl font-display font-black tracking-tighter uppercase leading-none">
                  SYSTEM <br />STRUCTURE.
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-sans font-medium leading-relaxed max-w-md">
                  Follow an uncompromising, day-by-day technical roadmap. Attend rigorous live lectures, solve logical gate challenges, and build physical structural hardware tasks.
                </p>
              </div>

              {/* Right Side: Timeline Logic Chip SVG illustration */}
              <div className="w-[45vw] flex items-center justify-center">
                <svg width="100%" height="320" viewBox="0 0 500 320" fill="none" className="max-w-xl w-full">
                  <rect width="100%" height="100%" rx="12" className="fill-gray-50 dark:fill-[#111] stroke-gray-200 dark:stroke-[#333]" strokeWidth="2" />
                  <path d="M 0 40 H 500 M 0 280 H 500" className="stroke-gray-200 dark:stroke-[#222]" strokeWidth="1" strokeDasharray="4 4" />
                  
                  <rect x="150" y="80" width="200" height="140" rx="6" className="fill-white dark:fill-[#1A1A1A] stroke-gray-300 dark:stroke-[#444]" strokeWidth="2" />
                  <text x="250" y="155" textAnchor="middle" className="fill-gray-400 dark:fill-[#666] font-mono text-[9px] tracking-[0.2em] font-bold">CIRCUITRON_IC_01</text>
                  
                  <path d="M 50 150 H 150 M 350 150 H 450" className="stroke-gray-300 dark:stroke-[#333]" strokeWidth="2" />
                  <path d="M 50 150 H 150" stroke="#4ADE80" strokeWidth="2" strokeDasharray="6 6" className="animate-[dash_1s_linear_infinite]" />
                  
                  <circle cx="50" cy="150" r="6" fill="#4ADE80" />
                  <text x="50" y="132" textAnchor="middle" fill="#4ADE80" className="font-mono text-[8px] tracking-widest">PIN_ACTIVE</text>
                  
                  <g className="stroke-gray-300 dark:stroke-[#292929]" strokeWidth="1">
                    <line x1="200" y1="80" x2="200" y2="220" />
                    <line x1="250" y1="80" x2="250" y2="220" />
                    <line x1="300" y1="80" x2="300" y2="220" />
                    <line x1="150" y1="120" x2="350" y2="120" />
                    <line x1="150" y1="170" x2="350" y2="170" />
                  </g>
                  <circle cx="200" cy="120" r="4" className="fill-gray-300 dark:fill-[#555]" />
                  <circle cx="250" cy="170" r="4" fill="#4ADE80" className="animate-pulse" />
                  <circle cx="300" cy="120" r="4" className="fill-gray-300 dark:fill-[#555]" />
                </svg>
              </div>
            </div>

            {/* PANEL 02: EVALUATION */}
            <div className="w-screen shrink-0 h-full flex flex-row items-center justify-between px-24 xl:px-36 py-20 relative select-none">
              <div className="absolute top-0 right-0 w-[1px] h-full bg-black/10 dark:bg-white/10" />

              <div className="w-[40vw] space-y-8 pr-12">
                <span className="font-mono text-xs uppercase tracking-[0.4em] text-gray-500">OPERATIONAL NODE // 02</span>
                <h2 className="text-6xl xl:text-7xl font-display font-black tracking-tighter uppercase leading-none">
                  GRANULAR <br />EVALUATION.
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-sans font-medium leading-relaxed max-w-md">
                  Your architectural schematic submissions are reviewed by professional engineering mentors. Receive comprehensive line-by-line code optimizations and physical delay debugging.
                </p>
              </div>

              {/* Right Side: Oscilloscope Waveform Feedback SVG */}
              <div className="w-[45vw] flex items-center justify-center">
                <svg width="100%" height="320" viewBox="0 0 500 320" fill="none" className="max-w-xl w-full">
                  <rect width="100%" height="100%" rx="12" className="fill-gray-50 dark:fill-[#111] stroke-gray-200 dark:stroke-[#333]" strokeWidth="2" />
                  
                  <g className="stroke-gray-200 dark:stroke-[#1F1F1F]" strokeWidth="0.5">
                    <line x1="50" y1="0" x2="50" y2="320" />
                    <line x1="100" y1="0" x2="100" y2="320" />
                    <line x1="150" y1="0" x2="150" y2="320" />
                    <line x1="200" y1="0" x2="200" y2="320" />
                    <line x1="250" y1="0" x2="250" y2="320" />
                    <line x1="300" y1="0" x2="300" y2="320" />
                    <line x1="350" y1="0" x2="350" y2="320" />
                    <line x1="400" y1="0" x2="400" y2="320" />
                    <line x1="450" y1="0" x2="450" y2="320" />
                    <line x1="0" y1="80" x2="500" y2="80" />
                    <line x1="0" y1="160" x2="500" y2="160" />
                    <line x1="0" y1="240" x2="500" y2="240" />
                  </g>
                  
                  <path
                    d="M 50 160 Q 100 60 150 160 T 250 160 T 350 160 T 450 160"
                    className="stroke-gray-300 dark:stroke-[#222]"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 50 160 Q 100 60 150 160 T 250 160 T 350 160 T 450 160"
                    stroke="#4ADE80"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="8 8"
                    className="animate-[dash_1.5s_linear_infinite]"
                  />
                  
                  <circle cx="250" cy="160" r="8" stroke="#4ADE80" strokeWidth="2" fill="none" className="animate-ping" />
                  
                  <text x="40" y="45" className="fill-gray-400 dark:fill-[#555] font-mono text-[8px] tracking-widest uppercase">CH_A: COGNITIVE_FEEDBACK</text>
                  <text x="40" y="65" fill="#4ADE80" className="font-mono text-[9px] font-bold">STATUS: STABLE_PROPAGATION (4.2ns)</text>
                  
                  <rect x="320" y="35" width="140" height="55" rx="4" className="fill-white dark:fill-[#1A1A1A] stroke-gray-200 dark:stroke-[#333]" strokeWidth="1" />
                  <text x="335" y="50" className="fill-gray-500 dark:fill-[#888] font-mono text-[7.5px] tracking-widest">FREQ: 144.00MHz</text>
                  <text x="335" y="65" className="fill-gray-500 dark:fill-[#888] font-mono text-[7.5px] tracking-widest">DEVIATION: 0.02%</text>
                  <text x="335" y="80" fill="#4ADE80" className="font-mono text-[7.5px] tracking-widest font-bold">VERDICT: OPTIMIZED</text>
                </svg>
              </div>
            </div>

            {/* PANEL 03: CONQUEST */}
            <div className="w-screen shrink-0 h-full flex flex-col relative select-none">
              
              {/* Main Content Area */}
              <div className="flex-1 flex flex-row items-center justify-between px-24 xl:px-36 py-20 relative">
                <div className="w-[40vw] space-y-8 pr-12">
                  <span className="font-mono text-xs uppercase tracking-[0.4em] text-gray-500">OPERATIONAL NODE // 03</span>
                  <h2 className="text-6xl xl:text-7xl font-display font-black tracking-tighter uppercase leading-none">
                    PLATFORM <br />CONQUEST.
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-sans font-medium leading-relaxed max-w-md">
                    Establish architectural hierarchy. Compete against global student cohorts in logical speed sprints, secure your streak multiplier, and ascend the ranks.
                  </p>
                </div>

                {/* Right Side: 3D Isometric Ranking Staircase SVG */}
                <div className="w-[45vw] flex items-center justify-center">
                  <svg width="100%" height="320" viewBox="0 0 500 320" fill="none" className="max-w-xl w-full">
                    <rect width="100%" height="100%" rx="12" className="fill-white dark:fill-[#111] stroke-[#E5E7EB] dark:stroke-[#333]" strokeWidth="2" />
                    
                    <g className="stroke-[#E5E7EB] dark:stroke-[#1F1F1F]" strokeWidth="0.5">
                      <line x1="50" y1="320" x2="300" y2="70" />
                      <line x1="150" y1="320" x2="400" y2="70" />
                      <line x1="250" y1="320" x2="500" y2="70" />
                    </g>
                    
                    {/* Isometric Staircase blocks */}
                    {/* Step 1 */}
                    <path d="M 80 260 L 140 230 L 200 260 L 140 290 Z" className="fill-[#F3F4F6] dark:fill-[#1A1A1A] stroke-[#E5E7EB] dark:stroke-[#333]" strokeWidth="1.5" />
                    <path d="M 80 260 L 80 290 L 140 320 L 140 290 Z" className="fill-[#E5E7EB] dark:fill-[#151515] stroke-[#E5E7EB] dark:stroke-[#333]" strokeWidth="1.5" />
                    <path d="M 140 290 L 140 320 L 200 290 L 200 260 Z" className="fill-[#FFFFFF] dark:fill-[#222] stroke-[#E5E7EB] dark:stroke-[#333]" strokeWidth="1.5" />
                    <text x="140" y="275" textAnchor="middle" className="fill-[#9CA3AF] dark:fill-[#666] font-mono text-[8px] font-bold">L_03</text>
                    
                    {/* Step 2 */}
                    <path d="M 180 180 L 240 150 L 300 180 L 240 210 Z" className="fill-[#F9FAFB] dark:fill-[#252525] stroke-[#E5E7EB] dark:stroke-[#333]" strokeWidth="1.5" />
                    <path d="M 180 180 L 180 210 L 240 240 L 240 210 Z" className="fill-[#F3F4F6] dark:fill-[#1E1E1E] stroke-[#E5E7EB] dark:stroke-[#333]" strokeWidth="1.5" />
                    <path d="M 240 210 L 240 240 L 300 210 L 300 180 Z" className="fill-[#FFFFFF] dark:fill-[#2D2D2D] stroke-[#E5E7EB] dark:stroke-[#333]" strokeWidth="1.5" />
                    <text x="240" y="195" textAnchor="middle" className="fill-[#6B7280] dark:fill-[#888] font-mono text-[8px] font-bold">L_02</text>
                    
                    {/* Step 3 (Active Top Step) */}
                    <path d="M 280 100 L 340 70 L 400 100 L 340 130 Z" className="fill-black dark:fill-black stroke-green-400" strokeWidth="2" />
                    <path d="M 280 100 L 280 130 L 340 160 L 340 130 Z" className="fill-gray-900 dark:fill-[#0A0A0A] stroke-green-400" strokeWidth="1.5" />
                    <path d="M 340 130 L 340 160 L 400 130 L 400 100 Z" className="fill-gray-800 dark:fill-[#151515] stroke-green-400" strokeWidth="1.5" />
                    <text x="340" y="115" textAnchor="middle" className="fill-green-400 font-mono text-[8px] font-bold animate-pulse">APEX_01</text>
                    
                    <path d="M 340 70 V 30" stroke="#4ADE80" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="340" cy="30" r="4" fill="#4ADE80" className="animate-ping" />
                  </svg>
                </div>
              </div>
              
              {/* Desktop Footer Embedded in Last Panel - Positioned at bottom of flex column */}
              <div className="w-full shrink-0 flex flex-col md:flex-row items-center justify-between px-24 xl:px-36 py-8 border-t border-black/10 dark:border-white/10 z-30">
                <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                  &copy; 2026 CIRCUITRON. ALL RIGHTS RESERVED.
                </div>
                
                <div className="flex items-center gap-2 group cursor-pointer mt-4 md:mt-0">
                  <span className="font-mono text-[9px] text-gray-500 tracking-widest uppercase transition-colors group-hover:text-gray-400">
                    CRAFTED_BY //
                  </span>
                  
                  {/*
                  <a
                    href="https://itsmeallen.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[9px] font-black tracking-widest text-white uppercase flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 opacity-40 group-hover:opacity-100 transition-opacity animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                    <span className="group-hover:text-green-400 transition-colors duration-300">ALLEN</span>
                  </a>
                  <span className="font-mono text-[9px] text-gray-500 tracking-widest uppercase transition-colors group-hover:text-gray-400">
                    & KASHINADTH
                  </span>
                  */}

                  <a
                    href="https://ieee.ce-kgr.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[9px] font-black tracking-widest text-black dark:text-white uppercase flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 opacity-40 group-hover:opacity-100 transition-opacity animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                    <span className="group-hover:text-green-400 transition-colors duration-300">IEEE SB CE KIDANGOOR</span>
                  </a>
                </div>
              </div>

            </div>

          </motion.div>
        </div>
      </section>

      {/* ----------------- MOBILE ONLY: STANDARD VERTICAL TECHNICAL BLOCKS ----------------- */}
      <section className="block lg:hidden bg-black text-white py-32 px-8 space-y-24 z-20 relative select-none">
        
        {/* Module 1 */}
        <div className="space-y-8 border-l border-white/10 pl-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">SYSTEM_NODE // 01</span>
          <h2 className="text-4xl font-display font-black tracking-tighter uppercase">STRUCTURE</h2>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Follow an uncompromising roadmap. Attend comprehensive live lectures, solve logical circuit sprints, and build structural assignments.
          </p>
        </div>

        {/* Module 2 */}
        <div className="space-y-8 border-l border-white/10 pl-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">SYSTEM_NODE // 02</span>
          <h2 className="text-4xl font-display font-black tracking-tighter uppercase">EVALUATION</h2>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Your architectural files are evaluated by engineering staff. Obtain precise line-by-line feedback with optimized schematic diagrams.
          </p>
        </div>

        {/* Module 3 */}
        <div className="space-y-8 border-l border-white/10 pl-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">SYSTEM_NODE // 03</span>
          <h2 className="text-4xl font-display font-black tracking-tighter uppercase">CONQUEST</h2>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Establish architectural rank. Compete against global cohorts in logical speed sprints, secure your streak, and ascend the engineering leaderboards.
          </p>
        </div>

        {/* Mobile Footer Embedded */}
        <div className="flex flex-col items-center justify-center border-t border-white/10 pt-12 mt-16 gap-6 w-full">
          <div className="flex flex-wrap justify-center items-center gap-2 group cursor-pointer">
            <span className="font-mono text-[9px] text-gray-500 tracking-widest uppercase transition-colors group-hover:text-gray-400">
              CRAFTED_BY //
            </span>
            <a
              href="https://ieee.ce-kgr.org/"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[9px] font-black tracking-widest text-white uppercase flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 bg-green-500 opacity-40 group-hover:opacity-100 transition-opacity animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              <span className="group-hover:text-green-400 transition-colors duration-300">IEEE SB CE KIDANGOOR</span>
            </a>
          </div>
          <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest text-center">
            &copy; 2026 CIRCUITRON. ALL RIGHTS RESERVED.
          </div>
        </div>

      </section>

      {/* Dynamic Keyframes */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </div>
  );
}
