'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { updateVideoProgress, getVideoProgress, updateUserProgress } from '@/lib/db';
import { VIDEO_COMPLETION_THRESHOLD } from '@/shared/constants';

function extractVideoId(url) {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/watch')) return new URL(url).searchParams.get('v');
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0];
    if (url.includes('youtube.com/embed/')) return url.split('embed/')[1]?.split('?')[0];
  } catch {}
  return null;
}

export default function YouTubePlayer({ videoUrl, dayId, userId, onComplete }) {
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [maxWatchPercent, setMaxWatchPercent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const isCompletedRef = useRef(false);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const maxPercentRef = useRef(0);
  const saveTimeoutRef = useRef(null);
  const videoId = extractVideoId(videoUrl);

  // Load saved progress
  useEffect(() => {
    if (!userId || !dayId) return;
    const load = async () => {
      try {
        const data = await getVideoProgress(userId, dayId);
        if (data) {
          const pct = data.videoWatchPercent || 0;
          setMaxWatchPercent(pct);
          maxPercentRef.current = pct;
          if (data.videoCompleted) {
            setIsCompleted(true);
            isCompletedRef.current = true;
          }
        }
      } catch (err) { console.error('Failed to load video progress:', err); }
      setLoading(false);
    };
    load();
  }, [userId, dayId]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!videoId) return;
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = createPlayer;
    return () => { window.onYouTubeIframeAPIReady = null; };
  }, [videoId]);

  const createPlayer = useCallback(() => {
    if (!containerRef.current || !videoId) return;
    if (playerRef.current) { try { playerRef.current.destroy(); } catch {} }

    const p = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady: () => { setIsReady(true); playerRef.current = p; setPlayer(p); },
        onStateChange: (e) => handleStateChange(e, p),
      },
    });
  }, [videoId]);

  const handleStateChange = (event, p) => {
    // YT.PlayerState: PLAYING=1, PAUSED=2, ENDED=0, BUFFERING=3
    if (event.data === 1) {
      // Playing — start tracking
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => trackProgress(p), 3000);
    } else {
      // Not playing — stop tracking, save final state
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      trackProgress(p);
    }
  };

  const trackProgress = (p) => {
    if (!p || typeof p.getCurrentTime !== 'function' || typeof p.getDuration !== 'function') return;
    try {
      const current = p.getCurrentTime();
      const duration = p.getDuration();
      if (!duration || duration <= 0) return;

      const currentPercent = Math.round((current / duration) * 100);

      // Track max watched (prevents skip-ahead cheating)
      // We allow +5% increments from current max to handle normal playback
      const newMax = Math.min(currentPercent, maxPercentRef.current + 5);
      const finalMax = Math.max(maxPercentRef.current, newMax);

      if (finalMax > maxPercentRef.current) {
        maxPercentRef.current = finalMax;
        setMaxWatchPercent(finalMax);
        debouncedSave(finalMax);
      }
    } catch {}
  };

  const debouncedSave = (percent) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveProgress(percent), 2000);
  };

  const saveProgress = async (percent) => {
    if (!userId || !dayId) return;
    try {
      const completed = percent >= VIDEO_COMPLETION_THRESHOLD;
      await updateVideoProgress(userId, dayId, {
        videoWatchPercent: percent,
        videoCompleted: completed,
      });
      if (completed && !isCompletedRef.current) {
        setIsCompleted(true);
        isCompletedRef.current = true;
        await updateUserProgress(userId, dayId, { videoCompleted: true });
        onComplete?.();
      }
    } catch (err) { console.error('Failed to save video progress:', err); }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      // Save final progress on unmount
      if (maxPercentRef.current > 0 && userId && dayId) {
        saveProgress(maxPercentRef.current);
      }
    };
  }, []);

  if (!videoId) {
    return (
      <div className="aspect-video bg-[#121214] rounded-xl border border-white/10 flex items-center justify-center">
        <p className="text-white/30 text-sm">No video available for this day.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10 relative">
        <div ref={containerRef} className="w-full h-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <Loader2 className="h-8 w-8 animate-spin text-white/30" />
          </div>
        )}
      </div>

      {/* Progress Tracking Bar */}
      <div className="bg-[#121214] rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-white">Video Progress</p>
            <p className="text-xs text-white/40">{`Watch at least ${VIDEO_COMPLETION_THRESHOLD}% to complete this section.`}</p>
          </div>
          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
              <CheckCircle2 size={16} /> Completed
            </div>
          ) : (
            <span className="text-sm text-white/60 font-mono">{maxWatchPercent}%</span>
          )}
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-emerald-500' :
              maxWatchPercent >= 40 ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${Math.min(maxWatchPercent, 100)}%` }}
          />
        </div>
        {!isCompleted && maxWatchPercent > 0 && maxWatchPercent < VIDEO_COMPLETION_THRESHOLD && (
          <p className="text-xs text-white/30 mt-2">{VIDEO_COMPLETION_THRESHOLD - maxWatchPercent}% more to reach completion threshold</p>
        )}
      </div>
    </div>
  );
}
