'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  Video, FileText, HelpCircle, Save, ExternalLink, X,
  Calendar, Clock, BookOpen, Loader2, Check
} from 'lucide-react';
import {
  createWeek, subscribeToWeeks, updateWeek, deleteWeek,
  createDay, subscribeToDays, updateDay, deleteDay,
  createQuiz, getQuiz, updateQuiz, deleteQuiz,
} from '@/lib/db';

export default function AdminContentCMS() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('details'); // details, quiz
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [showNewWeek, setShowNewWeek] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  // Subscribe to weeks
  useEffect(() => {
    const unsub = subscribeToWeeks((data) => {
      setWeeks(data.filter(w => !w.deleted));
      // Auto-expand first week
      if (data.length > 0 && Object.keys(expandedWeeks).length === 0) {
        setExpandedWeeks({ [data[0].id]: true });
        setSelectedWeekId(data[0].id);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to days for selected week
  useEffect(() => {
    if (!selectedWeekId) { setDays([]); return; }
    const unsub = subscribeToDays(selectedWeekId, (data) => {
      setDays(data);
    });
    return () => unsub();
  }, [selectedWeekId]);

  // Load quiz when day is selected
  useEffect(() => {
    if (!selectedDayId) { setQuiz(null); return; }
    loadQuiz(selectedDayId);
  }, [selectedDayId]);

  const loadQuiz = async (dayId) => {
    try {
      const q = await getQuiz(dayId);
      setQuiz(q || { dayId, questions: [] });
    } catch { setQuiz({ dayId, questions: [] }); }
  };

  // ==================== WEEK OPERATIONS ====================
  const handleCreateWeek = async () => {
    if (!newWeekTitle.trim()) return;
    setSaving(true);
    try {
      const weekId = await createWeek({
        title: newWeekTitle.trim(),
        order: weeks.length + 1,
      });
      setNewWeekTitle('');
      setShowNewWeek(false);
      setSelectedWeekId(weekId);
      setExpandedWeeks(prev => ({ ...prev, [weekId]: true }));
    } catch (err) { console.error('Failed to create week:', err); }
    setSaving(false);
  };

  const handleDeleteWeek = async (weekId) => {
    if (!confirm('Delete this week and all its days?')) return;
    setSaving(true);
    try {
      await deleteWeek(weekId);
      if (selectedWeekId === weekId) {
        setSelectedWeekId(null);
        setSelectedDayId(null);
        setEditingDay(null);
      }
    } catch (err) { console.error('Failed to delete week:', err); }
    setSaving(false);
  };

  // ==================== DAY OPERATIONS ====================
  const handleCreateDay = async (weekId) => {
    setSaving(true);
    try {
      const dayId = await createDay({
        weekId,
        title: `Day ${days.length + 1}`,
        description: '',
        videoUrl: '',
        videoTitle: '',
        references: [],
        unlockAt: new Date().toISOString().slice(0, 16),
        deadlineAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        order: days.length + 1,
        taskDescription: '',
        taskRequirements: [],
      });
      setSelectedDayId(dayId);
      // Load fresh data for editing
      const newDay = {
        id: dayId, weekId, title: `Day ${days.length + 1}`, description: '',
        videoUrl: '', videoTitle: '', references: [],
        unlockAt: new Date().toISOString().slice(0, 16),
        deadlineAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        order: days.length + 1, taskDescription: '', taskRequirements: [],
      };
      setEditingDay(newDay);
      setActiveSection('details');
    } catch (err) { console.error('Failed to create day:', err); }
    setSaving(false);
  };

  const handleSelectDay = (day) => {
    setSelectedDayId(day.id);
    setEditingDay({ ...day });
    setActiveSection('details');
  };

  const handleSaveDay = async () => {
    if (!editingDay) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const { id, ...data } = editingDay;
      // Remove Firestore-generated fields
      delete data.createdAt;
      delete data.updatedAt;
      delete data.deleted;

      // Clean up any undefined fields that would crash Firestore
      Object.keys(data).forEach(key => {
        if (data[key] === undefined) delete data[key];
      });

      await updateDay(id, data);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) { 
      console.error('Failed to save day:', err); 
      alert('Failed to save day. Check console.');
    }
    setSaving(false);
  };

  const handleDeleteDay = async (dayId) => {
    if (!confirm('Delete this day?')) return;
    setSaving(true);
    try {
      await deleteDay(dayId);
      if (selectedDayId === dayId) {
        setSelectedDayId(null);
        setEditingDay(null);
      }
    } catch (err) { console.error('Failed to delete day:', err); }
    setSaving(false);
  };

  // ==================== QUIZ OPERATIONS ====================
  const handleSaveQuiz = async () => {
    if (!quiz || !selectedDayId) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      if (quiz.questions.length > 0) {
        const quizData = { dayId: selectedDayId, questions: quiz.questions };
        const existing = await getQuiz(selectedDayId);
        if (existing) {
          await updateQuiz(selectedDayId, quizData);
        } else {
          await createQuiz(selectedDayId, quizData);
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) { 
      console.error('Failed to save quiz:', err); 
      alert('Failed to save quiz. Check console.');
    }
    setSaving(false);
  };

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [...(prev.questions || []), {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        timeLimit: 15,
      }]
    }));
  };

  const updateQuestion = (qIndex, field, value) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      questions[qIndex] = { ...questions[qIndex], [field]: value };
      return { ...prev, questions };
    });
  };

  const updateOption = (qIndex, optIndex, value) => {
    setQuiz(prev => {
      const questions = [...prev.questions];
      const options = [...questions[qIndex].options];
      options[optIndex] = value;
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const removeQuestion = (qIndex) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex)
    }));
  };

  // ==================== REFERENCE OPERATIONS ====================
  const addReference = () => {
    setEditingDay(prev => ({
      ...prev,
      references: [...(prev.references || []), { title: '', url: '', type: 'link' }]
    }));
  };

  const updateReference = (index, field, value) => {
    setEditingDay(prev => {
      const refs = [...(prev.references || [])];
      refs[index] = { ...refs[index], [field]: value };
      return { ...prev, references: refs };
    });
  };

  const removeReference = (index) => {
    setEditingDay(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  // ==================== TASK REQUIREMENT OPERATIONS ====================
  const addTaskRequirement = () => {
    setEditingDay(prev => ({
      ...prev,
      taskRequirements: [...(prev.taskRequirements || []), '']
    }));
  };

  const updateTaskRequirement = (index, value) => {
    setEditingDay(prev => {
      const reqs = [...(prev.taskRequirements || [])];
      reqs[index] = value;
      return { ...prev, taskRequirements: reqs };
    });
  };

  const removeTaskRequirement = (index) => {
    setEditingDay(prev => ({
      ...prev,
      taskRequirements: prev.taskRequirements.filter((_, i) => i !== index)
    }));
  };

  const toggleWeek = (weekId) => {
    setExpandedWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }));
    setSelectedWeekId(weekId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Content CMS</h1>
          <p className="text-white/60">Manage Weeks, Days, Quizzes, and Learning Content.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Week & Day Tree */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Curriculum</h2>
            <Button
              size="sm"
              onClick={() => setShowNewWeek(true)}
              className="bg-white text-black hover:bg-white/90 h-8 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" /> Add Week
            </Button>
          </div>

          {showNewWeek && (
            <div className="flex gap-2">
              <Input
                value={newWeekTitle}
                onChange={(e) => setNewWeekTitle(e.target.value)}
                placeholder="Week title..."
                className="bg-[#121214] border-white/10 text-white text-sm h-9"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWeek()}
                autoFocus
              />
              <Button size="sm" onClick={handleCreateWeek} disabled={saving} className="bg-white text-black hover:bg-white/90 h-9">
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowNewWeek(false); setNewWeekTitle(''); }} className="text-white/60 hover:text-white h-9">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {weeks.length === 0 && !showNewWeek && (
            <Card className="bg-[#121214] border-white/10 text-white shadow-none">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-8 w-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">No weeks created yet.</p>
                <p className="text-xs text-white/30 mt-1">Click "Add Week" to start building your curriculum.</p>
              </CardContent>
            </Card>
          )}

          {/* Week Tree */}
          <div className="space-y-2">
            {weeks.map((week) => (
              <div key={week.id}>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedWeekId === week.id ? 'bg-white/10' : 'bg-[#121214] hover:bg-[#1A1A1D]'
                  } border border-white/10`}
                  onClick={() => toggleWeek(week.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedWeeks[week.id] ?
                      <ChevronDown size={16} className="text-white/40" /> :
                      <ChevronRight size={16} className="text-white/40" />
                    }
                    <span className="text-sm font-medium text-white">{week.title}</span>
                    <span className="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                      {expandedWeeks[week.id] ? days.length : '...'} days
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteWeek(week.id); }}
                    className="text-white/20 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Days List */}
                {expandedWeeks[week.id] && selectedWeekId === week.id && (
                  <div className="ml-6 mt-1 space-y-1">
                    {days.map((day) => (
                      <div
                        key={day.id}
                        onClick={() => handleSelectDay(day)}
                        className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors text-sm ${
                          selectedDayId === day.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/70 hover:bg-white/5'
                        }`}
                      >
                        <span>{day.title || 'Untitled Day'}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteDay(day.id); }}
                          className="text-white/20 hover:text-red-400 transition-colors p-0.5"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleCreateDay(week.id)}
                      className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white p-2 transition-colors w-full"
                    >
                      <Plus size={14} /> Add Day
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Day Editor */}
        <div className="lg:col-span-8">
          {!editingDay ? (
            <Card className="bg-[#121214] border-white/10 text-white shadow-none h-full">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                <FileText className="h-12 w-12 text-white/10 mb-4" />
                <p className="text-lg font-medium text-white/30">Select a day to edit</p>
                <p className="text-sm text-white/20 mt-1">Choose a day from the left panel or create a new one.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Section Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 bg-[#121214] p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setActiveSection('details')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === 'details' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                  >
                    <FileText size={14} className="inline mr-1.5" />Day Details
                  </button>
                  <button
                    onClick={() => setActiveSection('quiz')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === 'quiz' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                  >
                    <HelpCircle size={14} className="inline mr-1.5" />Quiz ({quiz?.questions?.length || 0})
                  </button>
                </div>
                <Button
                  onClick={activeSection === 'quiz' ? handleSaveQuiz : handleSaveDay}
                  disabled={saving || saveSuccess}
                  className={saveSuccess ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-white text-black hover:bg-white/90"}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : saveSuccess ? <Check size={14} className="mr-2" /> : <Save size={14} className="mr-2" />}
                  {saveSuccess ? 'Saved!' : `Save ${activeSection === 'quiz' ? 'Quiz' : 'Day'}`}
                </Button>
              </div>

              {/* DAY DETAILS SECTION */}
              {activeSection === 'details' && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <Card className="bg-[#121214] border-white/10 text-white shadow-none">
                    <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Title</label>
                          <Input
                            value={editingDay.title || ''}
                            onChange={(e) => setEditingDay(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-[#0A0A0A] border-white/10 text-white"
                            placeholder="e.g. Introduction to Arduino"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Order</label>
                          <Input
                            type="number"
                            value={editingDay.order || 1}
                            onChange={(e) => setEditingDay(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                            className="bg-[#0A0A0A] border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Description</label>
                        <textarea
                          value={editingDay.description || ''}
                          onChange={(e) => setEditingDay(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-md px-3 py-2 text-white text-sm min-h-[80px] focus:outline-none focus:border-white/30 transition-colors resize-none"
                          placeholder="Brief description of what will be learned today..."
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Schedule */}
                  <Card className="bg-[#121214] border-white/10 text-white shadow-none">
                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar size={16} /> Schedule</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1">
                            <Clock size={12} /> Unlock At
                          </label>
                          <Input
                            type="datetime-local"
                            value={editingDay.unlockAt || ''}
                            onChange={(e) => setEditingDay(prev => ({ ...prev, unlockAt: e.target.value }))}
                            className="bg-[#0A0A0A] border-white/10 text-white [color-scheme:dark]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1">
                            <Clock size={12} /> Deadline At
                          </label>
                          <Input
                            type="datetime-local"
                            value={editingDay.deadlineAt || ''}
                            onChange={(e) => setEditingDay(prev => ({ ...prev, deadlineAt: e.target.value }))}
                            className="bg-[#0A0A0A] border-white/10 text-white [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Video */}
                  <Card className="bg-[#121214] border-white/10 text-white shadow-none">
                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><Video size={16} /> YouTube Video</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Video URL</label>
                        <Input
                          value={editingDay.videoUrl || ''}
                          onChange={(e) => setEditingDay(prev => ({ ...prev, videoUrl: e.target.value }))}
                          className="bg-[#0A0A0A] border-white/10 text-white"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Video Title</label>
                        <Input
                          value={editingDay.videoTitle || ''}
                          onChange={(e) => setEditingDay(prev => ({ ...prev, videoTitle: e.target.value }))}
                          className="bg-[#0A0A0A] border-white/10 text-white"
                          placeholder="Introduction to Microcontrollers"
                        />
                      </div>
                      {editingDay.videoUrl && getYouTubeEmbedUrl(editingDay.videoUrl) && (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                          <iframe
                            width="100%"
                            height="100%"
                            src={getYouTubeEmbedUrl(editingDay.videoUrl)}
                            title="Video Preview"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* References */}
                  <Card className="bg-[#121214] border-white/10 text-white shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2"><ExternalLink size={16} /> References</CardTitle>
                      <Button size="sm" variant="ghost" onClick={addReference} className="text-white/60 hover:text-white h-8 text-xs">
                        <Plus size={14} className="mr-1" /> Add Reference
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(!editingDay.references || editingDay.references.length === 0) && (
                        <p className="text-xs text-white/30 text-center py-4">No references added yet.</p>
                      )}
                      {(editingDay.references || []).map((ref, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Input
                              value={ref.title}
                              onChange={(e) => updateReference(idx, 'title', e.target.value)}
                              placeholder="Title"
                              className="bg-[#0A0A0A] border-white/10 text-white text-sm h-9"
                            />
                            <Input
                              value={ref.url}
                              onChange={(e) => updateReference(idx, 'url', e.target.value)}
                              placeholder="URL"
                              className="bg-[#0A0A0A] border-white/10 text-white text-sm h-9 md:col-span-2"
                            />
                          </div>
                          <button onClick={() => removeReference(idx)} className="text-white/20 hover:text-red-400 p-1.5 mt-0.5">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Task */}
                  <Card className="bg-[#121214] border-white/10 text-white shadow-none">
                    <CardHeader><CardTitle className="text-base">Task / Submission</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Task Description</label>
                        <textarea
                          value={editingDay.taskDescription || ''}
                          onChange={(e) => setEditingDay(prev => ({ ...prev, taskDescription: e.target.value }))}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-md px-3 py-2 text-white text-sm min-h-[100px] focus:outline-none focus:border-white/30 transition-colors resize-none"
                          placeholder="Describe what participants need to do and submit..."
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Requirements</label>
                          <button onClick={addTaskRequirement} className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                            <Plus size={12} /> Add
                          </button>
                        </div>
                        {(editingDay.taskRequirements || []).map((req, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              value={req}
                              onChange={(e) => updateTaskRequirement(idx, e.target.value)}
                              placeholder="e.g. Screenshot of circuit, Wokwi link"
                              className="bg-[#0A0A0A] border-white/10 text-white text-sm h-9"
                            />
                            <button onClick={() => removeTaskRequirement(idx)} className="text-white/20 hover:text-red-400 p-1">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* QUIZ SECTION */}
              {activeSection === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/60">
                      {quiz?.questions?.length || 0} / 5 questions • 15 seconds per question
                    </p>
                    <Button
                      size="sm"
                      onClick={addQuestion}
                      disabled={(quiz?.questions?.length || 0) >= 5}
                      className="bg-white/10 text-white hover:bg-white/20 h-8 text-xs"
                    >
                      <Plus size={14} className="mr-1" /> Add Question
                    </Button>
                  </div>

                  {(!quiz?.questions || quiz.questions.length === 0) && (
                    <Card className="bg-[#121214] border-white/10 text-white shadow-none">
                      <CardContent className="p-8 text-center">
                        <HelpCircle className="h-8 w-8 text-white/20 mx-auto mb-3" />
                        <p className="text-sm text-white/40">No quiz questions yet.</p>
                        <p className="text-xs text-white/30 mt-1">Add up to 5 questions with 4 options each.</p>
                      </CardContent>
                    </Card>
                  )}

                  {(quiz?.questions || []).map((q, qIdx) => (
                    <Card key={qIdx} className="bg-[#121214] border-white/10 text-white shadow-none">
                      <CardHeader className="flex flex-row items-start justify-between pb-3">
                        <CardTitle className="text-sm text-white/60">Question {qIdx + 1}</CardTitle>
                        <button onClick={() => removeQuestion(qIdx)} className="text-white/20 hover:text-red-400 p-1">
                          <Trash2 size={14} />
                        </button>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Input
                          value={q.question}
                          onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                          placeholder="Enter your question..."
                          className="bg-[#0A0A0A] border-white/10 text-white"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuestion(qIdx, 'correctAnswer', optIdx)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  q.correctAnswer === optIdx
                                    ? 'border-emerald-500 bg-emerald-500/20'
                                    : 'border-white/20 hover:border-white/40'
                                }`}
                              >
                                {q.correctAnswer === optIdx && (
                                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                                )}
                              </button>
                              <Input
                                value={opt}
                                onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                className="bg-[#0A0A0A] border-white/10 text-white text-sm h-9"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to convert YouTube URLs to embed URLs
function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  try {
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      videoId = new URL(url).searchParams.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : '';
  } catch { return ''; }
}
