import { Card, CardContent } from '@/components/ui/card';
import { Lock, PlayCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RoadmapPage() {
  const roadmapDays = [
    { id: 'day-1', title: 'Day 1: Introduction to Circuits', status: 'completed' },
    { id: 'day-2', title: 'Day 2: Microcontrollers', status: 'active' },
    { id: 'day-3', title: 'Day 3: Sensors & Inputs', status: 'locked' },
    { id: 'day-4', title: 'Day 4: Actuators', status: 'locked' },
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Learning Roadmap</h1>
        <p className="text-white/60">Follow the path to master embedded systems.</p>
      </div>

      <div className="relative border-l border-white/10 ml-6 pl-8 space-y-12">
        {roadmapDays.map((day, index) => (
          <div key={day.id} className="relative">
            {/* Timeline Node */}
            <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-[#0A0A0A] flex items-center justify-center
              ${day.status === 'completed' ? 'bg-emerald-500' : 
                day.status === 'active' ? 'bg-blue-500' : 'bg-[#27272A]'}
            `}>
              <div className="w-1.5 h-1.5 bg-[#0A0A0A] rounded-full"></div>
            </div>

            <Card className={`bg-[#121214] border-white/10 transition-colors shadow-none
              ${day.status === 'active' ? 'ring-1 ring-blue-500/50' : ''}
              ${day.status === 'locked' ? 'opacity-60' : 'hover:bg-[#1A1A1D]'}
            `}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">{day.title}</h3>
                  <p className="text-sm text-white/50">
                    {day.status === 'completed' ? 'Completed on May 27, 2026' :
                     day.status === 'active' ? 'Available now' : 'Unlocks Tomorrow, 9:00 AM'}
                  </p>
                </div>
                
                <div>
                  {day.status === 'completed' && <CheckCircle2 className="text-emerald-500" size={24} />}
                  {day.status === 'locked' && <Lock className="text-white/30" size={24} />}
                  {day.status === 'active' && (
                    <Link 
                      href={`/dashboard/days/${day.id}`}
                      className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                    >
                      <PlayCircle size={18} /> Resume
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
