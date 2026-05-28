'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getBootcamp, getModule, getDaysByModule, createDay, updateDay, deleteDay } from '@/lib/db';
import { 
  ArrowLeft,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Video,
  FileQuestion,
  GripVertical
} from 'lucide-react';

const DEFAULT_QUIZ = Array.from({ length: 5 }, () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctAnswerIndex: 0
}));

export default function BootcampDaysPage() {
  const { id: bootcampId, moduleId } = useParams();
  const router = useRouter();
  const [bootcamp, setBootcamp] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', description: '', videoUrl: '', order: 0, quiz: JSON.parse(JSON.stringify(DEFAULT_QUIZ)) });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bc, mod, daysList] = await Promise.all([
          getBootcamp(bootcampId),
          getModule(moduleId),
          getDaysByModule(moduleId)
        ]);
        
        if (!bc || !mod) {
          router.push(`/admin/bootcamps/${bootcampId}/modules`);
          return;
        }
        
        setBootcamp(bc);
        setModuleData(mod);
        setDays(daysList.sort((a, b) => a.order - b.order));
      } catch (err) {
        console.error('Error loading days:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [bootcampId, moduleId, router]);

  const handleOpenModal = (day = null) => {
    if (day) {
      setEditingDay(day);
      setFormData({ 
        title: day.title || '', 
        description: day.description || '', 
        videoUrl: day.videoUrl || '',
        order: day.order || 0,
        quiz: day.quiz && day.quiz.length === 5 ? day.quiz : JSON.parse(JSON.stringify(DEFAULT_QUIZ))
      });
    } else {
      setEditingDay(null);
      setFormData({ 
        title: '', 
        description: '', 
        videoUrl: '',
        order: days.length + 1,
        quiz: JSON.parse(JSON.stringify(DEFAULT_QUIZ))
      });
    }
    setIsModalOpen(true);
  };

  const updateQuizField = (questionIndex, field, value) => {
    const newQuiz = [...formData.quiz];
    if (field === 'questionText') {
      newQuiz[questionIndex].questionText = value;
    } else if (field === 'correctAnswerIndex') {
      newQuiz[questionIndex].correctAnswerIndex = parseInt(value);
    } else if (field.startsWith('option_')) {
      const optIndex = parseInt(field.split('_')[1]);
      newQuiz[questionIndex].options[optIndex] = value;
    }
    setFormData({ ...formData, quiz: newQuiz });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dayPayload = { ...formData, moduleId, bootcampId };
      if (editingDay) {
        await updateDay(editingDay.id, dayPayload);
        setDays(days.map(d => d.id === editingDay.id ? { ...d, ...dayPayload } : d).sort((a, b) => a.order - b.order));
      } else {
        const newId = await createDay(dayPayload);
        setDays([...days, { id: newId, ...dayPayload }].sort((a, b) => a.order - b.order));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving day:', err);
      alert('Failed to save day');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (dayId) => {
    if (confirm('Are you sure you want to delete this day?')) {
      try {
        await deleteDay(dayId);
        setDays(days.filter(d => d.id !== dayId));
      } catch (err) {
        console.error('Error deleting day:', err);
        alert('Failed to delete day');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <button 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group"
            onClick={() => router.push(`/admin/bootcamps/${bootcampId}/modules`)}
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Modules
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <CalendarDays className="text-primary" size={32} />
            {moduleData?.title} - Days
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Manage curriculum days and quizzes for this module.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 shrink-0"
        >
          <Plus size={20} />
          Create Day
        </button>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
        {days.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
            <CalendarDays size={48} className="text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground mb-2">No days found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">This module is currently empty. Add days to build the curriculum.</p>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium"
            >
              Create First Day
            </button>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-8 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
            {days.map((day, index) => (
              <div key={day.id} className="relative flex items-start gap-4 md:gap-6 group">
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground font-bold text-lg shadow-sm relative z-10 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                  {day.order}
                </div>
                
                <div className="flex-1 bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <GripVertical size={16} className="text-muted-foreground opacity-50 cursor-grab" />
                        <h3 className="text-xl font-bold text-foreground">{day.title}</h3>
                      </div>
                      <p className="text-muted-foreground pl-6 mb-3">{day.description}</p>
                      <div className="flex flex-wrap items-center gap-3 pl-6">
                        {day.videoUrl && (
                          <span className="flex items-center gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-1 rounded-md">
                            <Video size={14} /> Video Attached
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-md">
                          <FileQuestion size={14} /> Quiz: {day.quiz?.length || 0} Qs
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 pl-6 md:pl-0">
                      <button 
                        onClick={() => handleOpenModal(day)}
                        className="p-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border"
                        title="Edit Day"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(day.id)}
                        className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors border border-destructive/20"
                        title="Delete Day"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-border/50 shrink-0">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingDay ? 'Edit Day Details' : 'Create New Day'}
                </h2>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto">
                <form id="day-form" onSubmit={handleSubmit} className="space-y-8">
                  {/* General Info */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-foreground border-b border-border/50 pb-2">General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Day Title</label>
                        <input 
                          type="text" 
                          value={formData.title} 
                          onChange={(e) => setFormData({...formData, title: e.target.value})} 
                          required 
                          placeholder="e.g. Blinking an LED"
                          className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Order Number</label>
                        <input 
                          type="number" 
                          value={formData.order} 
                          onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} 
                          required
                          min="1"
                          className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Description</label>
                      <textarea 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                        required 
                        rows={2}
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        YouTube Video URL <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                      </label>
                      <input 
                        type="url" 
                        value={formData.videoUrl} 
                        onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} 
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Quiz Builder */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-foreground border-b border-border/50 pb-2">Quiz Builder (5 Questions)</h3>
                    <div className="space-y-6">
                      {formData.quiz.map((q, qIndex) => (
                        <div key={qIndex} className="bg-secondary/20 border border-border rounded-2xl p-5 md:p-6 hover:border-primary/30 transition-colors">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-primary flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                  {qIndex + 1}
                                </span>
                                Question Text
                              </label>
                              <input 
                                type="text" 
                                value={q.questionText} 
                                onChange={(e) => updateQuizField(qIndex, 'questionText', e.target.value)} 
                                required 
                                placeholder="Enter question..."
                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                              />
                            </div>
                            
                            <div className="pl-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {q.options.map((opt, optIndex) => (
                                <div key={optIndex} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                                  q.correctAnswerIndex === optIndex ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-transparent hover:border-border'
                                }`}>
                                  <input 
                                    type="radio" 
                                    name={`q_${qIndex}_correct`}
                                    checked={q.correctAnswerIndex === optIndex}
                                    onChange={() => updateQuizField(qIndex, 'correctAnswerIndex', optIndex)}
                                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500/50 border-border bg-card shrink-0 cursor-pointer"
                                  />
                                  <input 
                                    type="text" 
                                    value={opt} 
                                    onChange={(e) => updateQuizField(qIndex, `option_${optIndex}`, e.target.value)} 
                                    required 
                                    placeholder={`Option ${optIndex + 1}`}
                                    className="w-full bg-transparent border-b border-border/50 focus:border-emerald-500/50 px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-border/50 shrink-0 bg-secondary/10 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="day-form"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Day & Quiz'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
