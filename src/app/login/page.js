"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const quotes = [
  "Hardware is just software crystallized.",
  "Engineering is the closest thing to magic that exists in the world.",
  "First, solve the problem. Then, write the code.",
];

export default function LoginPage() {
  const [step, setStep] = useState("login"); // "login" or "signUp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signIn } = useAuthActions();
  const convex = useConvex();
  const router = useRouter();

  // Mouse tracking logic for biometric eyes
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Cycle quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password;
      const sanitizedConfirm = confirmPassword;

      if (step === "login") {
        await signIn("password", { email: sanitizedEmail, password: sanitizedPassword, flow: "signIn" });
        router.push("/dashboard");
      } else {
        if (sanitizedPassword !== sanitizedConfirm) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        await signIn("password", { email: sanitizedEmail, password: sanitizedPassword, flow: "signUp" });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      if (step === "login") {
        try {
          const emailExists = await convex.query(api.users.checkEmailExists, { email: email.trim().toLowerCase() });
          if (!emailExists) {
            setError("Invalid email address.");
          } else {
            // If the email exists, it's usually a password mismatch.
            // But if there's a different error (like network failure), we can display it.
            if (err.message && !err.message.toLowerCase().includes("invalid")) {
              setError(`Error: ${err.message}`);
            } else {
              setError("Invalid password.");
            }
          }
        } catch (fallbackErr) {
          setError("A network or server error occurred. Please try again.");
        }
      } else {
        setError(err.message ? `Registration failed: ${err.message}` : "Failed to register.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Eye displacement calculation (max displacement 10px)
  const eyeX = mousePos.x * 10;
  const eyeY = mousePos.y * 10;

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-sans">
      
      {/* ----------------- FIXED TELEMETRY BACKGROUND GRID ----------------- */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]" />

      {/* ----------------- FLOATING HEADER INTERFACE ----------------- */}
      <header className="fixed top-6 sm:top-8 left-4 right-4 sm:left-8 sm:right-8 z-50 flex items-center justify-between pointer-events-none select-none">
        <Link 
          href="/" 
          className="font-display font-black text-2xl tracking-tighter uppercase pointer-events-auto text-black dark:text-white hover:opacity-75 transition-opacity"
        >
          C //
        </Link>
        
        {/* Floating Mechanical Gliding Switcher */}
        <div className="relative flex bg-gray-100/90 dark:bg-white/10 backdrop-blur-md p-1 rounded-full border border-gray-200 dark:border-white/5 pointer-events-auto shadow-sm select-none">
          
          {/* Gliding shutter active background indicator */}
          <motion.div
            animate={{ x: step === "login" ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-black dark:bg-white rounded-full z-0"
          />

          <button
            onClick={() => { setStep("login"); setError(""); }}
            className={`relative z-10 px-3 sm:px-6 py-2 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest transition-colors duration-300 cursor-pointer ${step === "login" ? "text-white dark:text-black" : "text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white"}`}
          >
            <span className="sm:hidden">SIGN_IN</span>
            <span className="hidden sm:inline">SYS_SIGN_IN</span>
          </button>
          <button
            onClick={() => { setStep("signUp"); setError(""); }}
            className={`relative z-10 px-3 sm:px-6 py-2 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest transition-colors duration-300 cursor-pointer ${step === "signUp" ? "text-white dark:text-black" : "text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white"}`}
          >
            <span className="sm:hidden">REGISTER</span>
            <span className="hidden sm:inline">REGISTER_NODE</span>
          </button>
        </div>
      </header>

      {/* ----------------- FLUID SOLID-PANEL SLIDE RAIL ----------------- */}
      <div className={`w-full h-full flex flex-col lg:flex-row overflow-hidden relative ${step === "login" ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
        
        {/* Left/Right Art Panel (Smooth layout animation) */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
          className="hidden lg:flex lg:w-1/2 h-full bg-[#F8F9FA] dark:bg-[#111111] border-x border-gray-100 dark:border-white/5 flex-col justify-between p-16 pt-24 relative overflow-hidden z-20 select-none"
        >
          {/* Top Telemetry */}
          <div className="flex items-center justify-between font-mono text-[9px] text-gray-400">
            <div>TELEMETRY // ART_GATE_SYS</div>
            <div>LOC: [A_PORTAL_{step === "login" ? "01" : "02"}]</div>
          </div>

          {/* Dynamic Interactive Visuals based on current state */}
          <div className="flex-1 flex flex-col items-center justify-center gap-12">
            <AnimatePresence mode="wait">
              {step === "login" ? (
                // Sign In Art Visuals (Clock & Quotes)
                <motion.div
                  key="login-art"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-12 w-full"
                >
                  <div className="relative">
                    <div className="absolute inset-0 w-[180px] h-[180px] -m-[20px] border border-gray-300 rounded-full border-double pointer-events-none" />
                    <svg width="140" height="140" viewBox="0 0 100 100" fill="none" className="animate-[spin_40s_linear_infinite] pointer-events-none">
                      <circle cx="50" cy="50" r="45" stroke="#CED4DA" strokeWidth="2" />
                      <circle cx="50" cy="50" r="35" stroke="#CED4DA" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="50" y1="5" x2="50" y2="95" stroke="#CED4DA" strokeWidth="1" />
                      <line x1="5" y1="50" x2="95" y2="50" stroke="#CED4DA" strokeWidth="1" />
                      <circle cx="50" cy="15" r="4" fill="black" />
                      <circle cx="50" cy="85" r="4" fill="black" />
                      <circle cx="15" cy="50" r="4" fill="black" />
                      <circle cx="85" cy="50" r="4" fill="black" />
                    </svg>
                  </div>

                  <div className="h-16 flex items-center justify-center text-center">
                    <p className="font-sans text-lg font-medium text-gray-500 max-w-sm leading-relaxed">
                      "{quotes[quoteIndex]}"
                    </p>
                  </div>
                </motion.div>
              ) : (
                // Sign Up Art Visuals (Biometric Tracking Scanner)
                <motion.div
                  key="signup-art"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-8 w-full"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 w-[240px] h-[240px] -m-[20px] border border-dashed border-gray-300 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
                    <div className="absolute inset-0 w-[280px] h-[280px] -m-[40px] border border-gray-200 rounded-full pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[8px] text-gray-300 tracking-widest uppercase pointer-events-none">
                      BIOMETRIC_MATRIX
                    </div>

                    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 pointer-events-none">
                      <rect width="200" height="200" rx="40" fill="#E9ECEF" />
                      <path d="M40 80C40 80 70 50 100 80C130 110 160 80 160 80" stroke="#CED4DA" strokeWidth="8" strokeLinecap="round"/>
                      {/* Left Eye Base */}
                      <circle cx="65" cy="110" r="25" fill="white" />
                      {/* Right Eye Base */}
                      <circle cx="135" cy="110" r="25" fill="white" />
                      {/* Left Pupil */}
                      <circle cx={65 + eyeX} cy={110 + eyeY} r="8" fill="black" />
                      {/* Right Pupil */}
                      <circle cx={135 + eyeX} cy={110 + eyeY} r="8" fill="black" />
                    </svg>
                  </div>

                  <div className="font-mono text-[10px] text-gray-500 text-center space-y-1 select-none pointer-events-none">
                    <div className="text-black font-bold uppercase tracking-widest">Biometric Pupil Scanner</div>
                    <div>COORDINATES: X: {eyeX.toFixed(2)} // Y: {eyeY.toFixed(2)}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="font-mono text-[9px] text-gray-400">
            SECURITY_CORE // ACTIVE_SHUTTER
          </div>
        </motion.div>

        {/* Right/Left Solid Form Panel (Smooth layout animation) */}
        {/* Right/Left Solid Form Panel (Smooth layout animation) */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
          className="w-full lg:w-1/2 h-full flex items-start lg:items-center justify-center p-6 sm:p-12 lg:p-24 bg-white dark:bg-[#0a0a0a] relative z-10 overflow-y-auto lg:overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="w-full max-w-md pt-24 pb-12 lg:pt-0 lg:pb-0">
            <AnimatePresence mode="wait">
              {step === "login" ? (
                // Sign In Form interface
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="font-mono text-[10px] tracking-widest text-gray-400 uppercase">[ SYSTEM_ENTRY_NODE_02 ]</span>
                  <h1 className="text-5xl font-display font-black uppercase tracking-tighter mt-2 mb-3">
                    Welcome Back.
                  </h1>
                  <p className="text-gray-500 mb-12 text-sm font-medium">
                    Establish credentials to continue your hardware conquest.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2 group relative">
                      <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-black">
                        EMAIL_ADDRESS
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-200 dark:border-white/20 focus:border-black dark:focus:border-white outline-none px-0 py-3 text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 transition-colors text-lg font-medium font-mono"
                        placeholder="student@university.edu"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        required
                      />
                    </div>

                    <div className="space-y-2 group relative">
                      <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-black">
                        PASSWORD
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-transparent border-b border-gray-200 dark:border-white/20 focus:border-black dark:focus:border-white outline-none px-0 py-3 pr-10 text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 transition-colors text-lg font-medium font-mono"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck="false"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="py-3 px-4 bg-red-50 text-red-600 rounded-xl text-xs font-mono font-bold border border-red-200">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold uppercase tracking-widest mt-8 hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          EXECUTE_CONQUEST_LOGIN
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Contextual Terminal-style switch button */}
                  <div className="mt-8 text-center select-none">
                    <button
                      type="button"
                      onClick={() => { setStep("signUp"); setError(""); }}
                      className="font-mono text-[10px] text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white uppercase tracking-widest cursor-pointer transition-colors duration-300 group"
                    >
                      NEED_LOGIC_NODE? <span className="text-black dark:text-white font-bold group-hover:underline">[ INITIALIZE_REGISTRATION ]</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                // Sign Up Form interface
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="font-mono text-[10px] tracking-widest text-gray-400 uppercase">[ SYSTEM_ENTRY_NODE_01 ]</span>
                  <h1 className="text-5xl font-display font-black uppercase tracking-tighter mt-2 mb-3">
                    Create Account.
                  </h1>
                  <p className="text-gray-500 mb-12 text-sm font-medium">
                    Connect your logic schematic directly to the main repository.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2 group relative">
                      <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-black">
                        EMAIL_ADDRESS
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-200 dark:border-white/20 focus:border-black dark:focus:border-white outline-none px-0 py-3 text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 transition-colors text-lg font-medium font-mono"
                        placeholder="architect@circuitron.net"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        required
                      />
                    </div>

                    <div className="space-y-2 group relative">
                      <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-black">
                        PASSWORD
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-transparent border-b border-gray-200 dark:border-white/20 focus:border-black dark:focus:border-white outline-none px-0 py-3 pr-10 text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 transition-colors text-lg font-medium font-mono"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 group relative">
                      <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-black">
                        CONFIRM_PASSWORD
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-transparent border-b border-gray-200 dark:border-white/20 focus:border-black dark:focus:border-white outline-none px-0 py-3 pr-10 text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 transition-colors text-lg font-medium font-mono"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck="false"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="py-3 px-4 bg-red-50 text-red-600 rounded-xl text-xs font-mono font-bold border border-red-200">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold uppercase tracking-widest mt-8 hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          EXECUTE_REGISTRATION
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Contextual Terminal-style switch button */}
                  <div className="mt-8 text-center select-none">
                    <button
                      type="button"
                      onClick={() => { setStep("login"); setError(""); }}
                      className="font-mono text-[10px] text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white uppercase tracking-widest cursor-pointer transition-colors duration-300 group"
                    >
                      CREDENTIALS_FOUND? <span className="text-black dark:text-white font-bold group-hover:underline">[ ACCESS_SYS_NODE ]</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
