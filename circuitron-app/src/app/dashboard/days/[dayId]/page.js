"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PlayCircle, Code, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DayViewerPage() {
  const params = useParams();
  const dayId = params.dayId;
  
  const day = useQuery(api.content.getDay, { dayId });
  const submitTask = useMutation(api.submissions.submitTask);
  
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link) return;
    setSubmitting(true);
    try {
      await submitTask({ dayId, link });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (day === undefined) return <div className="p-8 text-white">Loading Day Details...</div>;
  if (!day) return <div className="p-8 text-white">Day not found.</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/dashboard/days" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Roadmap
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-3xl font-bold">Day Details</h2>
             <Link 
               href={`/dashboard/days/${dayId}/quiz`}
               className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/20"
             >
               Take Knowledge Check
             </Link>
           </div>
           
           <div className="aspect-video bg-black border border-white/20 rounded-2xl flex items-center justify-center group overflow-hidden relative cursor-pointer hover:border-white/40 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <PlayCircle size={64} className="text-white/50 group-hover:text-white transition-transform group-hover:scale-110 z-20" />
              <div className="absolute bottom-6 left-6 z-20">
                <div className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-1">Video Lesson</div>
                <div className="text-xl font-bold">{day.videoTitle || day.title}</div>
              </div>
           </div>
           
           <div className="bg-[#121214] p-6 border border-white/10 rounded-2xl">
             <h3 className="text-xl font-semibold flex items-center gap-2 mb-4"><FileText size={20} /> Description & Task</h3>
             <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
               {day.description || day.taskDescription || "No description provided for this day."}
             </p>
           </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-[#121214] p-6 border border-white/10 rounded-2xl">
             <h3 className="text-xl font-semibold flex items-center gap-2 mb-4"><Code size={20} /> Submission</h3>
             {success ? (
               <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-3">
                 <CheckCircle2 size={24} />
                 <div>
                   <div className="font-semibold text-sm">Successfully Submitted!</div>
                   <div className="text-xs opacity-80">Pending review from admins.</div>
                 </div>
               </div>
             ) : (
               <form onSubmit={handleSubmit}>
                 <p className="text-sm text-white/60 mb-6">Submit your work link below to complete this day.</p>
                 <input 
                   type="url" 
                   value={link}
                   onChange={(e) => setLink(e.target.value)}
                   required
                   placeholder="https://github.com/..." 
                   className="w-full bg-black border border-white/20 rounded-lg p-3 text-sm outline-none focus:border-white transition-colors mb-4 text-white" 
                 />
                 <button 
                   type="submit"
                   disabled={submitting}
                   className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-white/90 transition-colors disabled:opacity-70"
                 >
                   {submitting ? "Submitting..." : "Submit Task"}
                 </button>
               </form>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
