'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDay, subscribeToUserProgress, updateUserProgress, submitQuizAttempt, submitTaskNew } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  PlayCircle, 
  FileText, 
  UploadCloud, 
  CheckCircle2,
  CheckCircle,
  HelpCircle,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';

export default function DayPage({ params }) {
  const { moduleId, dayId } = params;
  const { user } = useAuth();
  const router = useRouter();

  const [dayData, setDayData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tabs: 'video', 'quiz', 'submission'
  const [activeTab, setActiveTab] = useState('video');

  // Video State
  const playerRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Submission State
  const [subForm, setSubForm] = useState({
    wokwiLink: '',
    tinkerhubLink: '',
    demoVideoLink: '',
    screenshotLink: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadDay = async () => {
      const d = await getDay(dayId);
      setDayData(d);
      setLoading(false);
    };
    loadDay();

    const unsubProgress = subscribeToUserProgress(user.uid, (progressList) => {
      const current = progressList.find(p => p.dayId === dayId && p.moduleId === moduleId);
      setProgress(current || {
        videoCompleted: false,
        quizCompleted: false,
        submissionCompleted: false,
        overallCompleted: false,
        watchPercentage: 0
      });
      if (current?.quizCompleted) setQuizSubmitted(true);
    });

    return () => {
      if (unsubProgress) unsubProgress();
    };
  }, [user, moduleId, dayId]);

  // Load YouTube Iframe API
  useEffect(() => {
    if (dayData && dayData.youtubeUrl && !window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, [dayData]);

  useEffect(() => {
    if (!dayData?.youtubeUrl) return;
    
    // Extract video ID
    const getVidId = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };
    const vidId = getVidId(dayData.youtubeUrl);
    if (!vidId) return;

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: vidId,
        events: {
          onReady: () => setVideoLoaded(true),
          onStateChange: (e) => {
            // YT.PlayerState.PLAYING = 1
            if (e.data === 1 && !progress?.videoCompleted) {
              startTracking();
            } else {
              stopTracking();
            }
          }
        }
      });
    };

    let trackInterval;
    const startTracking = () => {
      trackInterval = setInterval(async () => {
        if (!playerRef.current) return;
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          const percentage = (currentTime / duration) * 100;
          if (percentage >= 50 && !progress?.videoCompleted) {
            // Mark video as completed!
            await updateUserProgress(user.uid, dayId, moduleId, { videoCompleted: true, watchPercentage: Math.round(percentage) });
            stopTracking();
          }
        }
      }, 5000);
    };

    const stopTracking = () => {
      if (trackInterval) clearInterval(trackInterval);
    };

    // If API already loaded previously (SPA navigation)
    if (window.YT && window.YT.Player && !playerRef.current && activeTab === 'video') {
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady();
      }
    }

    return () => {
      stopTracking();
    };
  }, [dayData, activeTab, progress?.videoCompleted, user?.uid, dayId, moduleId]);


  const handleQuizSubmit = async () => {
    if (!dayData.quizQuestions) return;
    let score = 0;
    dayData.quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) score++;
    });
    
    await submitQuizAttempt(user.uid, dayId, moduleId, {
      answers: quizAnswers,
      score,
      total: dayData.quizQuestions.length
    });
    setQuizSubmitted(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await submitTaskNew(user.bootcampId, user.uid, dayId, {
      moduleId,
      ...subForm
    });
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!dayData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-foreground mb-2">Day not found</h2>
        <button 
          onClick={() => router.push(`/dashboard/modules/${moduleId}`)}
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          Return to Module
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[60rem] mx-auto pb-16 pt-4">
      <button 
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        onClick={() => router.push(`/dashboard/modules/${moduleId}`)}
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Module
      </button>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">{dayData.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{dayData.description}</p>
        </div>
        
        {progress?.overallCompleted && (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-md border border-emerald-500/20 shrink-0">
            <CheckCircle2 size={16} />
            <span className="font-bold tracking-wide text-sm">Day Completed</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-border pb-4">
        <button 
          onClick={() => setActiveTab('video')} 
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'video' 
              ? 'bg-secondary text-foreground' 
              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
          }`}
        >
          <PlayCircle size={16} />
          Video 
          {progress?.videoCompleted && <CheckCircle size={14} className="text-emerald-500" />}
        </button>
        <button 
          onClick={() => setActiveTab('quiz')} 
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'quiz' 
              ? 'bg-secondary text-foreground' 
              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
          }`}
        >
          <FileText size={16} />
          Quiz 
          {progress?.quizCompleted && <CheckCircle size={14} className="text-emerald-500" />}
        </button>
        <button 
          onClick={() => setActiveTab('submission')} 
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'submission' 
              ? 'bg-secondary text-foreground' 
              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
          }`}
        >
          <UploadCloud size={16} />
          Task 
          {progress?.submissionCompleted && <CheckCircle size={14} className="text-emerald-500" />}
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 md:p-10 shadow-sm min-h-[500px]">
        <AnimatePresence mode="wait">
          {/* VIDEO TAB */}
          {activeTab === 'video' && (
            <motion.div 
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col"
            >
              <div className="flex items-center gap-2 mb-6 text-lg font-bold text-foreground">
                <PlayCircle className="text-muted-foreground" size={20} />
                Learning Material
              </div>
              
              {!dayData.youtubeUrl ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-secondary/20 rounded-xl border border-dashed border-border">
                  <PlayCircle size={32} className="text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-base font-medium text-foreground mb-1">No video assigned</h3>
                  <p className="text-sm text-muted-foreground">There is no video material for this day. You can proceed to the quiz or submission.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-6">
                  <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video border border-border">
                    <div id="youtube-player" className="absolute top-0 left-0 w-full h-full z-10"></div>
                    {!videoLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-card z-0">
                        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    <a href={dayData.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                      <PlayCircle size={16} />
                      Watch on YouTube
                    </a>
                    {progress?.videoCompleted && (
                      <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md">
                        <CheckCircle2 size={16} />
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* QUIZ TAB */}
          {activeTab === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <HelpCircle className="text-muted-foreground" size={20} />
                  Knowledge Check
                </div>
              </div>

              {!dayData.quizQuestions || dayData.quizQuestions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-secondary/20 rounded-xl border border-dashed border-border">
                  <HelpCircle size={32} className="text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-base font-medium text-foreground mb-1">No quiz assigned</h3>
                  <p className="text-sm text-muted-foreground">There is no knowledge check for this day. You can proceed to the submission.</p>
                </div>
              ) : quizSubmitted ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Quiz Completed</h3>
                  <p className="text-muted-foreground">
                    Your Score: <strong className="text-emerald-500 ml-1">{progress?.quizScore || 0} / {dayData.quizQuestions.length}</strong>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  {dayData.quizQuestions.map((q, idx) => (
                    <div key={idx}>
                      <h4 className="text-lg font-semibold text-foreground mb-4 flex gap-3 leading-snug">
                        <span className="text-muted-foreground">{idx + 1}.</span>
                        {q.question}
                      </h4>
                      <div className="space-y-3 pl-6">
                        {q.options?.map((opt, optIdx) => (
                          <label key={optIdx} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                            quizAnswers[idx] === opt 
                              ? 'bg-secondary border-muted-foreground text-foreground' 
                              : 'bg-transparent border-border hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'
                          }`}>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              quizAnswers[idx] === opt ? 'border-foreground' : 'border-muted-foreground'
                            }`}>
                              {quizAnswers[idx] === opt && <div className="w-2 h-2 rounded-full bg-foreground" />}
                            </div>
                            <input 
                              type="radio" 
                              name={`quiz-${idx}`} 
                              value={opt}
                              checked={quizAnswers[idx] === opt}
                              onChange={(e) => setQuizAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                              className="sr-only"
                            />
                            <span className="font-medium text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end pt-6 border-t border-border">
                    <button 
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < dayData.quizQuestions.length}
                    >
                      Submit Answers
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* SUBMISSION TAB */}
          {activeTab === 'submission' && (
            <motion.div 
              key="submission"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2 text-lg font-bold text-foreground">
                <UploadCloud className="text-muted-foreground" size={20} />
                Task Submission
              </div>
              <p className="text-sm text-muted-foreground mb-8">Submit your project links and files for this day below to get them reviewed.</p>

              {progress?.submissionCompleted ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-secondary/30 rounded-xl border border-border">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6 border border-border">
                    <UploadCloud size={32} className="text-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Submission Received</h3>
                  <p className="text-muted-foreground max-w-sm">Your work has been successfully submitted and is awaiting review by a volunteer.</p>
                </div>
              ) : (
                <form onSubmit={handleTaskSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <LinkIcon size={14} className="text-muted-foreground" />
                        TinkerHub Link <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                      </label>
                      <input 
                        type="url" 
                        placeholder="https://tinkerhub.org/..." 
                        value={subForm.tinkerhubLink} 
                        onChange={e => setSubForm({...subForm, tinkerhubLink: e.target.value})}
                        className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <LinkIcon size={14} className="text-muted-foreground" />
                        Wokwi / Blynk Link <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                      </label>
                      <input 
                        type="url" 
                        placeholder="https://wokwi.com/..." 
                        value={subForm.wokwiLink} 
                        onChange={e => setSubForm({...subForm, wokwiLink: e.target.value})}
                        className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Video size={14} className="text-muted-foreground" />
                        Demo Video Link <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                      </label>
                      <input 
                        type="url" 
                        placeholder="YouTube, Drive, etc." 
                        value={subForm.demoVideoLink} 
                        onChange={e => setSubForm({...subForm, demoVideoLink: e.target.value})}
                        className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <ImageIcon size={14} className="text-muted-foreground" />
                        Project Screenshot <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                      </label>
                      <input 
                        type="url" 
                        placeholder="Imgur, Drive, etc." 
                        value={subForm.screenshotLink} 
                        onChange={e => setSubForm({...subForm, screenshotLink: e.target.value})}
                        className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <MessageSquare size={14} className="text-muted-foreground" />
                      Notes or Feedback <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                    </label>
                    <textarea 
                      rows="4" 
                      placeholder="Any difficulties faced or feedback about this task..."
                      value={subForm.notes} 
                      onChange={e => setSubForm({...subForm, notes: e.target.value})}
                      className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <UploadCloud size={16} />
                          Submit Work
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
