"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Save, Trash2, Plus, X } from "lucide-react";

export default function DayEditor({ dayId, onClose }) {
  const day = useQuery(api.content.getDay, { dayId });
  const quiz = useQuery(api.content.getQuiz, { dayId });
  
  const updateDay = useMutation(api.content.updateDay);
  const deleteDay = useMutation(api.content.deleteDay);
  const upsertQuiz = useMutation(api.content.upsertQuiz);

  const [formData, setFormData] = useState({ title: "", description: "", videoUrl: "", taskDescription: "" });
  const [questions, setQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (day) {
      setFormData({
        title: day.title || "",
        description: day.description || "",
        videoUrl: day.videoUrl || "",
        taskDescription: day.taskDescription || ""
      });
    }
  }, [day]);

  useEffect(() => {
    if (quiz) {
      setQuestions(quiz.questions || []);
    } else if (quiz === null) {
      setQuestions([]);
    }
  }, [quiz]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDay({ dayId, ...formData });
      if (questions.length > 0) {
        await upsertQuiz({ dayId, questions });
      }
      alert("Saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this day?")) {
      await deleteDay({ dayId });
      onClose();
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "New Question", options: ["Option 1", "Option 2"], answerIndex: 0 }]);
  };

  if (!day) return <div className="p-8 text-white/50">Loading editor...</div>;

  return (
    <div className="bg-[#1A1A1D] border border-white/10 p-6 rounded-2xl relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white p-2">
        <X size={20} />
      </button>
      
      <h3 className="text-2xl font-bold mb-6">Edit Day: {day.title}</h3>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm text-white/60 mb-1">Title</label>
          <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-white transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Description</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-white transition-colors h-24" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">YouTube Video URL</label>
          <input type="text" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} placeholder="https://youtube.com/watch?v=..." className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-white transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Task Description (Markdown)</label>
          <textarea value={formData.taskDescription} onChange={e => setFormData({...formData, taskDescription: e.target.value})} className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-white transition-colors h-32" />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-blue-400">Quiz Questions</h4>
          <button onClick={addQuestion} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors">
            <Plus size={14} /> Add Question
          </button>
        </div>
        
        {questions.length === 0 ? (
          <div className="text-sm text-white/40 italic">No quiz questions added yet.</div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="p-4 border border-white/10 rounded-xl bg-black/50">
                <div className="flex justify-between mb-2">
                  <input type="text" value={q.question} onChange={e => {
                    const newQ = [...questions];
                    newQ[qIndex].question = e.target.value;
                    setQuestions(newQ);
                  }} className="flex-1 bg-transparent border-b border-white/20 outline-none focus:border-blue-400 font-medium pb-1" />
                  <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} className="text-red-400 hover:text-red-300 ml-4"><Trash2 size={16} /></button>
                </div>
                <div className="space-y-2 mt-4 pl-4">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <input type="radio" name={`correct-${qIndex}`} checked={q.answerIndex === oIndex} onChange={() => {
                        const newQ = [...questions];
                        newQ[qIndex].answerIndex = oIndex;
                        setQuestions(newQ);
                      }} />
                      <input type="text" value={opt} onChange={e => {
                        const newQ = [...questions];
                        newQ[qIndex].options[oIndex] = e.target.value;
                        setQuestions(newQ);
                      }} className="flex-1 bg-transparent border-b border-white/10 outline-none focus:border-white text-sm pb-1" />
                      <button onClick={() => {
                        const newQ = [...questions];
                        newQ[qIndex].options = newQ[qIndex].options.filter((_, i) => i !== oIndex);
                        if(newQ[qIndex].answerIndex >= oIndex) newQ[qIndex].answerIndex = Math.max(0, newQ[qIndex].answerIndex - 1);
                        setQuestions(newQ);
                      }} className="text-white/40 hover:text-red-400 text-xs px-2">x</button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const newQ = [...questions];
                    newQ[qIndex].options.push(`Option ${newQ[qIndex].options.length + 1}`);
                    setQuestions(newQ);
                  }} className="text-xs text-blue-400 hover:underline mt-2 inline-block">Add Option</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <button onClick={handleDelete} className="text-red-400 hover:bg-red-400/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Trash2 size={16} /> Delete Day
        </button>
        <button onClick={handleSave} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50">
          <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
