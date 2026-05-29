"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { BookOpen, CheckCircle, Lock } from "lucide-react";

export default function RoadmapPage() {
  const weeks = useQuery(api.content.getWeeks) || [];
  
  // In a real app we'd fetch all days and group them, or fetch them per week.
  // We'll just do a simple UI showing weeks for now.

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Bootcamp Roadmap</h2>
      
      <div className="space-y-6">
        {weeks.map((week, index) => (
          <div key={week._id} className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{week.title}</h3>
                {week.description && <p className="text-white/60 text-sm mt-1">{week.description}</p>}
              </div>
              <div className="text-sm font-medium px-3 py-1 bg-white/10 rounded-full">
                {week.status}
              </div>
            </div>
            
            <div className="p-6">
               {/* We need a separate component to fetch days per week or just fetch them all */}
               <WeekDays weekId={week._id} />
            </div>
          </div>
        ))}
        {weeks.length === 0 && (
          <div className="text-center text-white/50 py-12 border border-dashed border-white/20 rounded-2xl">
            No roadmap content available yet. Wait for admins to release it!
          </div>
        )}
      </div>
    </div>
  );
}

function WeekDays({ weekId }) {
  const days = useQuery(api.content.getDays, { weekId }) || [];
  
  return (
    <div className="space-y-3">
      {days.map((day) => (
        <Link 
          href={`/dashboard/days/${day._id}`} 
          key={day._id}
          className="flex items-center justify-between p-4 bg-black border border-white/10 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-black transition-colors">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="font-semibold text-white/90 group-hover:text-white transition-colors">{day.title}</div>
              <div className="text-xs text-white/50">Day {day.order}</div>
            </div>
          </div>
          <div className="text-white/30">
            {/* If locked, show Lock. If done, show CheckCircle */}
            <Lock size={18} />
          </div>
        </Link>
      ))}
      {days.length === 0 && <div className="text-sm text-white/40">No days released.</div>}
    </div>
  );
}
