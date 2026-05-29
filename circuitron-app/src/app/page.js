"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [step, setStep] = useState("login"); // "login" or "signUp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthActions();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (step === "login") {
        await signIn("password", { email, password, flow: "signIn" });
        router.push("/dashboard");
      } else {
        await signIn("password", { email, password, flow: "signUp" });
        router.push("/dashboard");
      }
    } catch (err) {
      setError(step === "login" ? "Invalid email or password" : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-[#121214] rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-3xl font-semibold mb-2">
          {step === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-white/60 mb-8 text-sm">
          {step === "login"
            ? "Enter your credentials to access the portal."
            : "Sign up to begin your bootcamp journey."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 focus:border-white outline-none px-0 py-2 text-white placeholder:text-white/20 transition-all text-sm"
              placeholder="circuitron@ieee.org"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 focus:border-white outline-none px-0 py-2 text-white placeholder:text-white/20 transition-all text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-white text-black font-medium rounded-xl mt-6 hover:bg-white/90 transition-all flex items-center justify-center disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setStep(step === "login" ? "signUp" : "login")}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            {step === "login" ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
