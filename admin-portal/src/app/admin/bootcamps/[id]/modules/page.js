'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getBootcamp, getModulesByBootcamp, createModule, updateModule, deleteModule } from '@/lib/db';
import { 
  ArrowLeft,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  ListVideo,
  GripVertical
} from 'lucide-react';

export default function BootcampModulesPage() {
  const { id: bootcampId } = useParams();
  const router = useRouter();
  const [bootcamp, setBootcamp] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', order: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const bc = await getBootcamp(bootcampId);
        if (!bc) {
          router.push('/admin/bootcamps');
          return;
        }
        setBootcamp(bc);
        
        const mods = await getModulesByBootcamp(bootcampId);
        // Sort modules by order
        setModules(mods.sort((a, b) => a.order - b.order));
      } catch (err) {
        console.error('Error loading modules:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [bootcampId, router]);

  const handleOpenModal = (mod = null) => {
    if (mod) {
      setEditingModule(mod);
      setFormData({ title: mod.title, description: mod.description, order: mod.order || 0 });
    } else {
      setEditingModule(null);
      setFormData({ title: '', description: '', order: modules.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingModule) {
        await updateModule(editingModule.id, formData);
        setModules(modules.map(m => m.id === editingModule.id ? { ...m, ...formData } : m).sort((a, b) => a.order - b.order));
      } else {
        const newId = await createModule({ ...formData, bootcampId });
        setModules([...modules, { id: newId, ...formData, bootcampId }].sort((a, b) => a.order - b.order));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving module:', err);
      alert('Failed to save module');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (moduleId) => {
    if (confirm('Are you sure you want to delete this module? This will hide it from students.')) {
      try {
        await deleteModule(moduleId);
        setModules(modules.filter(m => m.id !== moduleId));
      } catch (err) {
        console.error('Error deleting module:', err);
        alert('Failed to delete module');
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
            onClick={() => router.push(`/admin/bootcamps/${bootcampId}`)}
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <BookOpen className="text-primary" size={32} />
            Curriculum Modules
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Manage the learning path for {bootcamp?.name}</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 shrink-0"
        >
          <Plus size={20} />
          Create Module
        </button>
      </div>

      {/* Kanban-style List */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
            <BookOpen size={48} className="text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground mb-2">No modules found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">You haven't added any curriculum modules yet. Create one to get started.</p>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium"
            >
              Create First Module
            </button>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-8 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
            {modules.map((mod, index) => (
              <div key={mod.id} className="relative flex items-start gap-4 md:gap-6 group">
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground font-bold text-lg shadow-sm relative z-10 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                  {mod.order}
                </div>
                
                <div className="flex-1 bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <GripVertical size={16} className="text-muted-foreground opacity-50 cursor-grab" />
                        <h3 className="text-xl font-bold text-foreground">{mod.title}</h3>
                      </div>
                      <p className="text-muted-foreground pl-6">{mod.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 pl-6 md:pl-0">
                      <button 
                        onClick={() => router.push(`/admin/bootcamps/${bootcampId}/modules/${mod.id}/days`)}
                        className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg font-medium transition-colors border border-border"
                      >
                        <ListVideo size={16} />
                        Manage Days
                      </button>
                      <button 
                        onClick={() => handleOpenModal(mod)}
                        className="p-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border"
                        title="Edit Module"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(mod.id)}
                        className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors border border-destructive/20"
                        title="Delete Module"
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-card border border-border rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingModule ? 'Edit Module' : 'Create New Module'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Module Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="e.g. Introduction to IoT"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    rows={3}
                    placeholder="What will students learn in this module?"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
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
                
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        Saving...
                      </>
                    ) : 'Save Module'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
