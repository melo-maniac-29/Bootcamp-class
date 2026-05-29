"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// Placeholder Quiz Data - eventually fetch from Convex
const MOCK_QUIZ = [
  {
    id: 1,
    question: "What is the primary benefit of using Convex?",
    options: ["Global State Management", "Real-time backend synchronization", "CSS Styling", "Deploying static assets"],
    answerIndex: 1
  },
  {
    id: 2,
    question: "How do you trigger a data change in Convex from Next.js?",
    options: ["useQuery", "fetch API", "useMutation", "SQL UPDATE"],
    answerIndex: 2
  }
];

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = MOCK_QUIZ[currentIndex];
  const isLast = currentIndex === MOCK_QUIZ.length - 1;

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === currentQuestion.answerIndex) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (isLast) {
      // In real app, call a Convex mutation here to save quiz progress
      router.push(`/dashboard/days/${params.dayId}`);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <Link href={`/dashboard/days/${params.dayId}`} className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm">
        <ArrowLeft size={16} /> Back to Lesson
      </Link>

      <div className="mb-8 flex justify-between items-center text-sm font-semibold text-white/50">
        <span>Question {currentIndex + 1} of {MOCK_QUIZ.length}</span>
        <span>Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((opt, idx) => {
              const isCorrect = showResult && idx === currentQuestion.answerIndex;
              const isWrong = showResult && selected === idx && idx !== currentQuestion.answerIndex;
              
              let bgClass = "bg-black/50 border-white/10 hover:border-white/30";
              if (isCorrect) bgClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
              if (isWrong) bgClass = "bg-red-500/20 border-red-500/50 text-red-400";

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showResult}
                  className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group ${bgClass}`}
                >
                  <span className="font-medium text-lg">{opt}</span>
                  {isCorrect && <CheckCircle2 className="text-emerald-400" />}
                  {isWrong && <XCircle className="text-red-400" />}
                </button>
              );
            })}
          </div>

          {showResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-8 border-t border-white/10 flex justify-end"
            >
              <button 
                onClick={nextQuestion}
                className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-white/90 transition-all"
              >
                {isLast ? "Complete Quiz" : "Next Question"}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
