"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PlayCircle, Code, FileText } from "lucide-react";
import Link from "next/link";

export default function DayViewerPage() {
  const params = useParams();
  const dayId = params.dayId;
  
  // Need to fetch specific day details here. We don't have a `getDay` query yet!
  // This is a placeholder UI.

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/dashboard/days" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Roadmap
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-3xl font-bold">Day Details</h2>
           
           <div className="aspect-video bg-black border border-white/20 rounded-2xl flex items-center justify-center group overflow-hidden relative cursor-pointer hover:border-white/40 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <PlayCircle size={64} className="text-white/50 group-hover:text-white transition-transform group-hover:scale-110 z-20" />
              <div className="absolute bottom-6 left-6 z-20">
                <div className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-1">Video Lesson</div>
                <div className="text-xl font-bold">Introduction to Convex</div>
              </div>
           </div>
           
           <div className="bg-[#121214] p-6 border border-white/10 rounded-2xl">
             <h3 className="text-xl font-semibold flex items-center gap-2 mb-4"><FileText size={20} /> Description & Task</h3>
             <p className="text-white/70 leading-relaxed">
               This is where the detailed markdown description for the day will be injected.
             </p>
           </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-[#121214] p-6 border border-white/10 rounded-2xl">
             <h3 className="text-xl font-semibold flex items-center gap-2 mb-4"><Code size={20} /> Submission</h3>
             <p className="text-sm text-white/60 mb-6">Submit your work link below to complete this day.</p>
             <input type="url" placeholder="https://github.com/..." className="w-full bg-black border border-white/20 rounded-lg p-3 text-sm outline-none focus:border-white transition-colors mb-4" />
             <button className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-white/90 transition-colors">
               Submit Task
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
