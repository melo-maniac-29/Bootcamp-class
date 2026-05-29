'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Loader2, Trophy } from 'lucide-react';
import { getQuiz, getQuizAttempt, submitQuizAttempt } from '@/lib/db';
import { QUIZ_CONFIG } from '@/shared/constants';

export default function QuizEngine({ dayId, userId, onComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState('idle'); // idle, active, reviewing, results
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_CONFIG.TIME_PER_QUESTION);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  const advanceTimeoutRef = useRef(null);

  // Load quiz and check existing attempt
  useEffect(() => {
    const load = async () => {
      try {
        const [q, a] = await Promise.all([
          getQuiz(dayId),
          getQuizAttempt(userId, dayId),
        ]);
        setQuiz(q);
        if (a) {
          setAttempt(a);
          setQuizState('results');
        }
      } catch (err) { console.error('Failed to load quiz:', err); }
      setLoading(false);
    };
    if (dayId && userId) load();
  }, [dayId, userId]);

  // Timer
  useEffect(() => {
    if (quizState !== 'active') return;
    setTimeLeft(QUIZ_CONFIG.TIME_PER_QUESTION);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimerExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [quizState, currentQ]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  const handleTimerExpiry = () => {
    // Mark as unanswered (-1) and advance
    setAnswers(prev => {
      const updated = [...prev, -1];
      advanceAfterAnswer(updated);
      return updated;
    });
  };

  const handleSelectOption = (optionIndex) => {
    if (selectedOption !== null || quizState !== 'active') return; // Prevent double-selection
    setSelectedOption(optionIndex);
    if (timerRef.current) clearInterval(timerRef.current);

    // Show correct/incorrect for 1 second then advance
    setQuizState('reviewing');
    setAnswers(prev => {
      const updated = [...prev, optionIndex];
      advanceTimeoutRef.current = setTimeout(() => {
        advanceAfterAnswer(updated);
      }, 1000);
      return updated;
    });
  };

  const advanceAfterAnswer = (currentAnswers) => {
    const questions = quiz?.questions || [];
    if (currentAnswers.length >= questions.length) {
      // All questions answered — submit
      handleSubmit(currentAnswers);
    } else {
      setCurrentQ(prev => prev + 1);
      setSelectedOption(null);
      setQuizState('active');
    }
  };

  const handleSubmit = async (finalAnswers) => {
    if (submitting) return;
    setSubmitting(true);
    setQuizState('results');

    const questions = quiz?.questions || [];
    let correctCount = 0;
    finalAnswers.forEach((ans, idx) => {
      if (ans === questions[idx]?.correctAnswer) correctCount++;
    });

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    try {
      await submitQuizAttempt(userId, dayId, {
        quizId: dayId,
        score,
        totalQuestions: questions.length,
        correctCount,
        answers: finalAnswers,
      });
      setAttempt({
        score,
        totalQuestions: questions.length,
        correctCount,
        answers: finalAnswers,
      });
      onComplete?.();
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
    setSubmitting(false);
  };

  const startQuiz = () => {
    setCurrentQ(0);
    setAnswers([]);
    setSelectedOption(null);
    setQuizState('active');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardContent className="p-8 text-center">
          <p className="text-white/40 text-sm">No quiz available for this day.</p>
        </CardContent>
      </Card>
    );
  }

  const questions = quiz.questions;

  // ==================== RESULTS SCREEN ====================
  if (quizState === 'results') {
    const resultAnswers = attempt?.answers || answers;
    const resultScore = attempt?.score ?? (resultAnswers.length > 0 ? Math.round(
      (resultAnswers.filter((a, i) => a === questions[i]?.correctAnswer).length / questions.length) * 100
    ) : 0);
    const resultCorrect = attempt?.correctCount ?? resultAnswers.filter((a, i) => a === questions[i]?.correctAnswer).length;

    return (
      <div className="space-y-4">
        {/* Score Card */}
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-8 text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              resultScore >= 80 ? 'bg-emerald-500/20' : resultScore >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'
            }`}>
              <Trophy size={32} className={
                resultScore >= 80 ? 'text-emerald-400' : resultScore >= 50 ? 'text-yellow-400' : 'text-red-400'
              } />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{resultScore}%</h2>
            <p className="text-white/60 text-sm">{resultCorrect} of {questions.length} correct</p>
            <p className="text-xs text-white/30 mt-2">
              {resultScore >= 80 ? 'Excellent work!' : resultScore >= 50 ? 'Good effort!' : 'Keep practicing!'}
            </p>
          </CardContent>
        </Card>

        {/* Answer Review */}
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const userAnswer = resultAnswers[idx];
            const isCorrect = userAnswer === q.correctAnswer;
            const isUnanswered = userAnswer === -1;

            return (
              <Card key={idx} className="bg-[#121214] border-white/10 text-white shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-white">{q.question}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-7">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className={`text-xs px-3 py-2 rounded-md border ${
                        optIdx === q.correctAnswer
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : optIdx === userAnswer && !isCorrect
                          ? 'border-red-500/30 bg-red-500/10 text-red-400'
                          : 'border-white/5 text-white/40'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                  {isUnanswered && <p className="text-xs text-white/30 ml-7 mt-1">Time expired — no answer</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== START SCREEN ====================
  if (quizState === 'idle') {
    return (
      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <Clock size={28} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">Knowledge Check</h2>
          <p className="text-white/60 mb-1 max-w-md text-sm">
            {questions.length} questions • {QUIZ_CONFIG.TIME_PER_QUESTION} seconds each
          </p>
          <p className="text-white/40 mb-6 max-w-md text-xs">
            Questions auto-advance when time runs out. Your score is recorded immediately.
          </p>
          <Button onClick={startQuiz} className="bg-white text-black hover:bg-white/90 px-8">
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ==================== ACTIVE QUIZ ====================
  const question = questions[currentQ];
  if (!question) return null;
  
  const timerPercent = (timeLeft / QUIZ_CONFIG.TIME_PER_QUESTION) * 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">
          Question {currentQ + 1} of {questions.length}
        </p>
        <div className="flex items-center gap-2">
          <Clock size={14} className={`${timeLeft <= 5 ? 'text-red-400' : 'text-white/40'}`} />
          <span className={`text-sm font-mono font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 linear ${
            timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      {/* Question */}
      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardContent className="p-6">
          <p className="text-lg font-medium text-white mb-6">{question.question}</p>

          <div className="grid grid-cols-1 gap-3">
            {question.options.map((opt, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isCorrectAnswer = optIdx === question.correctAnswer;
              const showResult = quizState === 'reviewing';

              let btnClass = 'border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20';
              if (showResult) {
                if (isCorrectAnswer) btnClass = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
                else if (isSelected && !isCorrectAnswer) btnClass = 'border-red-500/50 bg-red-500/10 text-red-400';
                else btnClass = 'border-white/5 text-white/30';
              } else if (isSelected) {
                btnClass = 'border-blue-500/50 bg-blue-500/10 text-blue-400';
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${btnClass} ${
                    selectedOption === null ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 ${
                      showResult && isCorrectAnswer ? 'border-emerald-500 bg-emerald-500/20' :
                      showResult && isSelected ? 'border-red-500 bg-red-500/20' :
                      isSelected ? 'border-blue-500 bg-blue-500/20' :
                      'border-white/20'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-sm">{opt}</span>
                    {showResult && isCorrectAnswer && <CheckCircle2 size={18} className="ml-auto text-emerald-400" />}
                    {showResult && isSelected && !isCorrectAnswer && <XCircle size={18} className="ml-auto text-red-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2">
        {questions.map((_, idx) => (
          <div key={idx} className={`w-2.5 h-2.5 rounded-full ${
            idx < currentQ ? 'bg-blue-500' :
            idx === currentQ ? 'bg-white' :
            'bg-white/20'
          }`} />
        ))}
      </div>
    </div>
  );
}
