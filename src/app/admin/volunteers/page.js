"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function VolunteersPage() {
  const overview = useQuery(api.users.getVolunteersOverview) || [];
  const allUsers = useQuery(api.users.listUsers) || [];
  const submissions = useQuery(api.submissions.listSubmissions) || [];
  const assignStudents = useMutation(api.users.assignStudentsToVolunteer);
  
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [editingStudentIds, setEditingStudentIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const STUDENTS_PER_PAGE = 6;

  const [volSearchTerm, setVolSearchTerm] = useState("");
  const [volFilter, setVolFilter] = useState("all");
  const [weekFilter, setWeekFilter] = useState("All");
  const [dayFilter, setDayFilter] = useState("All");

  const weeks = Array.from(new Set(submissions.map(s => JSON.stringify({ id: s.weekTitle, order: s.weekOrder }))))
    .map(w => JSON.parse(w))
    .sort((a, b) => a.order - b.order)
    .map(w => w.id);

  const daysInWeek = weekFilter === "All" 
    ? submissions
    : submissions.filter(s => s.weekTitle === weekFilter);
  
  const days = Array.from(new Set(daysInWeek.map(s => JSON.stringify({ id: s.dayTitle, order: s.dayOrder }))))
    .map(d => JSON.parse(d))
    .sort((a, b) => a.order - b.order)
    .map(d => d.id);

  const students = allUsers.filter(u => u.role === "student" || !u.role);
  
  const filteredStudents = students.filter(u => {
    if (selectedVolunteer && u.assignedVolunteerId && u.assignedVolunteerId !== selectedVolunteer._id) {
      return false;
    }
    return !searchTerm.trim() || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.participantId?.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => {
    if (selectedVolunteer) {
      const aAssigned = a.assignedVolunteerId === selectedVolunteer._id;
      const bAssigned = b.assignedVolunteerId === selectedVolunteer._id;
      if (aAssigned && !bAssigned) return -1;
      if (!aAssigned && bAssigned) return 1;
    }
    return (a.name || a.email || "").localeCompare(b.name || b.email || "");
  });

  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * STUDENTS_PER_PAGE, currentPage * STUDENTS_PER_PAGE);

  const overviewWithDynamicStats = overview.map(vol => {
    let volSubs = submissions.filter(s => s.assignedVolunteerId === vol._id);
    if (weekFilter !== "All") volSubs = volSubs.filter(s => s.weekTitle === weekFilter);
    if (dayFilter !== "All") volSubs = volSubs.filter(s => s.dayTitle === dayFilter);
    
    return {
      ...vol,
      pendingReviews: volSubs.filter(s => s.status === "Pending Review").length,
      reviewsCompleted: volSubs.filter(s => s.reviewedBy === vol._id).length,
    };
  });

  const filteredVolunteers = overviewWithDynamicStats.filter(vol => {
    const matchesSearch = !volSearchTerm.trim() || 
      vol.name?.toLowerCase().includes(volSearchTerm.toLowerCase()) || 
      vol.email?.toLowerCase().includes(volSearchTerm.toLowerCase()) ||
      vol.participantId?.toLowerCase().includes(volSearchTerm.toLowerCase());
      
    let matchesFilter = true;
    if (volFilter === "pending") matchesFilter = (vol.pendingReviews || 0) > 0;
    if (volFilter === "completed") matchesFilter = (vol.pendingReviews || 0) === 0 && (vol.assignedStudentCount || 0) > 0;
    if (volFilter === "no_students") matchesFilter = (vol.assignedStudentCount || 0) === 0;

    return matchesSearch && matchesFilter;
  });

  const openAssignModal = (vol) => {
    setSelectedVolunteer(vol);
    setEditingStudentIds(new Set(vol.assignedStudentIds || []));
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleToggleStudent = (studentId) => {
    const next = new Set(editingStudentIds);
    if (next.has(studentId)) {
      next.delete(studentId);
    } else {
      next.add(studentId);
    }
    setEditingStudentIds(next);
  };

  const handleSaveAssignments = async () => {
    if (!selectedVolunteer) return;
    setIsSaving(true);
    try {
      await assignStudents({
        volunteerId: selectedVolunteer._id,
        studentIds: Array.from(editingStudentIds),
      });
      setSelectedVolunteer(null);
    } catch (e) {
      alert("Failed to assign students.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto"
    >
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-8 mb-10">
        <p className="font-mono text-[10px] tracking-[0.3em] text-black/30 dark:text-white/30 uppercase mb-3">ADMIN // VOLUNTEER_MANAGEMENT</p>
        <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-black dark:text-white">Volunteers.</h1>
        <p className="text-black/40 dark:text-white/40 mt-2 font-mono text-xs tracking-wider uppercase">
          {filteredVolunteers.length} ACTIVE_VOLUNTEERS
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-auto flex-1 flex gap-3">
          <input
            type="text"
            placeholder="SEARCH VOLUNTEER..."
            value={volSearchTerm}
            onChange={(e) => setVolSearchTerm(e.target.value)}
            className="w-full h-full bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg px-4 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
          />
        </div>
        
        <div className="relative w-full md:w-48 shrink-0">
          <select
            value={weekFilter}
            onChange={(e) => { setWeekFilter(e.target.value); setDayFilter("All"); }}
            className="w-full h-full bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg pl-4 pr-10 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white appearance-none"
          >
            <option value="All">ALL_WEEKS</option>
            {weeks.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black/30 dark:text-white/30">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        <div className="relative w-full md:w-48 shrink-0">
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="w-full h-full bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg pl-4 pr-10 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white appearance-none"
          >
            <option value="All">ALL_DAYS</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black/30 dark:text-white/30">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        <div className="relative w-full md:w-48 shrink-0">
          <select
            value={volFilter}
            onChange={(e) => setVolFilter(e.target.value)}
            className="w-full h-full bg-white dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-lg pl-4 pr-10 py-3 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white appearance-none"
          >
            <option value="all">ALL VOLUNTEERS</option>
            <option value="pending">HAS PENDING REVIEWS</option>
            <option value="completed">ALL REVIEWS DONE</option>
            <option value="no_students">NO STUDENTS ASSIGNED</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black/30 dark:text-white/30">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVolunteers.map((vol, i) => (
          <motion.div
            key={vol._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#111] rounded-2xl p-6 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/20 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-mono text-lg font-bold text-black dark:text-white">{vol.name || "Unnamed"}</h3>
                  <p className="font-mono text-[10px] tracking-wider text-black/40 dark:text-white/40 uppercase mt-1">{vol.email}</p>
                </div>
                <span className="shrink-0 whitespace-nowrap font-mono text-[9px] px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 rounded uppercase tracking-widest">
                  {vol.participantId || "VOL"}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg text-center">
                  <p className="font-mono text-[9px] tracking-widest text-black/40 dark:text-white/40 uppercase mb-1">STUDENTS</p>
                  <p className="font-display font-black text-2xl text-black dark:text-white">{vol.assignedStudentCount || 0}</p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg text-center">
                  <p className="font-mono text-[9px] tracking-widest text-black/40 dark:text-white/40 uppercase mb-1">REVIEWED</p>
                  <p className="font-display font-black text-2xl text-green-600 dark:text-green-500">{vol.reviewsCompleted || 0}</p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg text-center border border-red-500/20 bg-red-50/50 dark:bg-red-900/10">
                  <p className="font-mono text-[9px] tracking-widest text-red-600/70 dark:text-red-400/70 uppercase mb-1">PENDING</p>
                  <p className="font-display font-black text-2xl text-red-600 dark:text-red-500">{vol.pendingReviews || 0}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => openAssignModal(vol)}
              className="mt-6 w-full font-mono text-[10px] tracking-widest uppercase font-bold py-3 border border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg transition-colors"
            >
              MANAGE_ASSIGNMENTS
            </button>
          </motion.div>
        ))}
      </div>
      
      {overview.length === 0 && (
        <div className="py-20 text-center border border-dashed border-black/10 dark:border-white/10 rounded-xl">
          <p className="font-mono text-[10px] tracking-widest text-black/25 dark:text-white/25 uppercase">NO_VOLUNTEERS // ASSIGN_ROLE_IN_USERS_TAB</p>
        </div>
      )}

      {/* Assignment Modal */}
      <AnimatePresence>
        {selectedVolunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
                <p className="font-mono text-[9px] tracking-widest text-black/40 dark:text-white/40 uppercase mb-2">ALLOCATING_STUDENTS_TO</p>
                <h2 className="text-2xl font-display font-black tracking-tight text-black dark:text-white uppercase">
                  {selectedVolunteer.name || selectedVolunteer.email}
                </h2>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50 dark:bg-black/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <p className="font-mono text-xs text-black/50 dark:text-white/50 uppercase tracking-wider">SELECT_STUDENTS</p>
                  <input
                    type="text"
                    placeholder="Search by name, email, ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full md:w-64 bg-white dark:bg-[#111] border border-black/[0.1] dark:border-white/[0.1] rounded-lg px-3 py-2 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paginatedStudents.map(student => {
                    const isSelected = editingStudentIds.has(student._id);
                    const isAssignedToOther = student.assignedVolunteerId && student.assignedVolunteerId !== selectedVolunteer._id;
                    return (
                      <label 
                        key={student._id} 
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-black dark:border-white bg-black/5 dark:bg-white/5' 
                            : 'border-black/[0.08] dark:border-white/[0.08] hover:border-black/30 dark:hover:border-white/30 bg-white dark:bg-[#111]'
                        }`}
                      >
                        <div className="pt-0.5">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleToggleStudent(student._id)}
                            className="w-4 h-4 accent-black dark:accent-white"
                          />
                        </div>
                        <div>
                          <p className="font-mono text-xs font-bold text-black dark:text-white truncate max-w-[150px]">{student.name || student.email}</p>
                          <p className="font-mono text-[9px] text-black/40 dark:text-white/40 uppercase mt-0.5">{student.participantId || "NO_ID"}</p>
                          {isAssignedToOther && !isSelected && (
                            <p className="font-mono text-[8px] text-orange-500 uppercase mt-1">ASSIGNED_ELSEWHERE</p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <div className="col-span-1 md:col-span-2 py-8 text-center border border-dashed border-black/10 dark:border-white/10 rounded-lg bg-white/50 dark:bg-black/20">
                      <p className="font-mono text-[10px] tracking-widest text-black/30 dark:text-white/30 uppercase">NO_STUDENTS_MATCH_SEARCH</p>
                    </div>
                  )}
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/5 dark:border-white/5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      PREV
                    </button>
                    <p className="font-mono text-[10px] text-black/40 dark:text-white/40 tracking-widest uppercase">
                      PAGE {currentPage} / {totalPages}
                    </p>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      NEXT
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 p-6 border-t border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#111] shrink-0 justify-between items-center">
                <p className="font-mono text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest">
                  {editingStudentIds.size} SELECTED
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedVolunteer(null)}
                    disabled={isSaving}
                    className="px-4 py-2.5 text-[10px] font-mono font-bold tracking-widest text-black/50 dark:text-white/50 uppercase hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    CANCEL
                  </button>
                  <button 
                    onClick={handleSaveAssignments}
                    disabled={isSaving}
                    className="px-6 py-2.5 text-[10px] font-mono font-bold tracking-widest text-white dark:text-black bg-black dark:bg-white uppercase rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "SAVING..." : "SAVE_ASSIGNMENTS"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
