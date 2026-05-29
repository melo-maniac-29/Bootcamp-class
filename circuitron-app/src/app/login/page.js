"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const { signIn } = useAuthActions();
  const router = useRouter();

  // Mouse tracking logic for SVG eyes
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

    if (step === "signUp" && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (step === "login") {
        await signIn("password", { email, password, flow: "signIn" });
        router.push("/dashboard");
      } else {
        await signIn("password", { email, password, flow: "signUp" });
        router.push("/dashboard");
      }
    } catch (err) {
      setError(step === "login" ? "Invalid credentials." : "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  // Eye movement calculation (max displacement 10px)
  const eyeX = mousePos.x * 10;
  const eyeY = mousePos.y * 10;

  return (
    <div className={`min-h-screen bg-white text-black flex flex-col lg:flex-row overflow-hidden ${step === "login" ? "" : "lg:flex-row-reverse"}`}>
      
      {/* Art Panel */}
      <motion.div layout className="hidden lg:flex w-1/2 bg-[#F8F9FA] border-x border-gray-200 relative flex-col justify-between p-16 z-10">
        <div>
          <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-display font-bold text-2xl">
            C
          </div>
          <h2 className="mt-6 font-display font-black text-4xl tracking-tighter uppercase">Circuitron</h2>
        </div>

        {/* Mouse Tracking Face */}
        <div className="flex-1 flex items-center justify-center">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" rx="40" fill="#E9ECEF"/>
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

        {/* Rotating Quotes */}
        <div className="h-24">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-sans text-xl font-medium text-gray-500 max-w-md"
            >
              "{quotes[quoteIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Action Panel */}
      <motion.div layout className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative bg-white z-20">
        
        {/* Toggle Container */}
        <div className="absolute top-8 right-8 lg:top-12 lg:right-12 flex bg-gray-100 p-1 rounded-full">
          <button
            onClick={() => { setStep("login"); setError(""); }}
            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${step === "login" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setStep("signUp"); setError(""); }}
            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${step === "signUp" ? "bg-black shadow-sm text-white" : "text-gray-400 hover:text-gray-600"}`}
          >
            Sign Up
          </button>
        </div>

        <div className="w-full max-w-md overflow-hidden pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step === "login" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: step === "login" ? 20 : -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h1 className="text-4xl lg:text-5xl font-black mb-3 font-display uppercase tracking-tighter">
                {step === "login" ? "Welcome Back." : "Create Account."}
              </h1>
              <p className="text-gray-500 mb-12 text-sm font-sans font-medium">
                {step === "login"
                  ? "Sign in to continue your progress."
                  : "Join the platform and start building."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-black">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-gray-200 focus:border-black outline-none px-0 py-3 text-black placeholder:text-gray-300 transition-colors text-lg font-medium"
                    placeholder="student@university.edu"
                    required
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-black">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-gray-200 focus:border-black outline-none px-0 py-3 text-black placeholder:text-gray-300 transition-colors text-lg font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <AnimatePresence>
                  {step === "signUp" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 group overflow-hidden"
                    >
                      <div className="pt-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-black">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-transparent border-b-2 border-gray-200 focus:border-black outline-none px-0 py-3 text-black placeholder:text-gray-300 transition-colors text-lg font-medium"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-3 px-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-black text-white font-bold uppercase tracking-widest mt-8 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <>
                      {step === "login" ? "Sign In" : "Register"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
