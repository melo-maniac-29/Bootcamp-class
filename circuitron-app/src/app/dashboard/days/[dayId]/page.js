'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle2, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function DailyLearningWorkspace({ params }) {
  const [activeTab, setActiveTab] = useState('video'); // video, quiz, task
  const [videoProgress, setVideoProgress] = useState(0);

  // Mock checking YouTube iframe progress
  // In a real implementation, we'd use the YouTube IFrame API to listen for time updates
  const handleSimulateWatch = () => {
    setVideoProgress(100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/days" className="text-white/40 hover:text-white transition-colors text-sm">
          ← Back to Roadmap
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-white ml-2">Day 2: Microcontrollers</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#121214] p-1 rounded-lg border border-white/10 w-fit">
        {['video', 'quiz', 'task'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
              activeTab === tab 
                ? 'bg-white/10 text-white' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10 relative">
              {/* Simulated YouTube Embed */}
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&rel=0" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0"
              ></iframe>
            </div>
            
            <div className="flex items-center justify-between bg-[#121214] p-4 rounded-lg border border-white/10">
              <div>
                <p className="text-sm font-medium text-white">Video Progress Tracking</p>
                <p className="text-xs text-white/50">Watch at least 50% to complete this section.</p>
              </div>
              {videoProgress >= 50 ? (
                <div className="flex items-center text-emerald-500 text-sm font-medium">
                  <CheckCircle2 size={16} className="mr-1" /> Completed
                </div>
              ) : (
                <Button onClick={handleSimulateWatch} variant="outline" className="border-white/10 text-white hover:bg-white/10">
                  Simulate Watch &gt;50%
                </Button>
              )}
            </div>

            <Card className="bg-[#121214] border-white/10 text-white shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Reference Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                      <ExternalLink size={14} className="mr-2" /> Datasheet PDF
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                      <ExternalLink size={14} className="mr-2" /> Arduino Reference Guide
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'quiz' && (
          <Card className="bg-[#121214] border-white/10 text-white shadow-none">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
              <h2 className="text-xl font-medium mb-2">Knowledge Check</h2>
              <p className="text-white/60 mb-6 max-w-md">Complete a quick 5-question quiz to verify your understanding of today's lesson.</p>
              <Button className="bg-white text-black hover:bg-white/90">
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'task' && (
          <Card className="bg-[#121214] border-white/10 text-white shadow-none">
            <CardHeader>
              <CardTitle>Daily Task Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="font-medium text-sm text-white mb-2">Instructions</h4>
                <p className="text-sm text-white/60">
                  Build the circuit shown in the video using Wokwi. Submit a screenshot of your circuit and the public Wokwi link.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">Project Link (Wokwi)</label>
                  <input type="url" placeholder="https://wokwi.com/..." className="w-full bg-[#0A0A0A] border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-white transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">Upload Screenshot / Video</label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors">
                    <UploadCloud className="text-white/40 mb-3" size={32} />
                    <p className="text-sm font-medium text-white">Click to upload or drag and drop</p>
                    <p className="text-xs text-white/40 mt-1">PNG, JPG, MP4 up to 50MB</p>
                  </div>
                </div>

                <Button className="w-full bg-[#9162F5] hover:bg-[#8152e5] text-white mt-4">
                  Submit Task
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
