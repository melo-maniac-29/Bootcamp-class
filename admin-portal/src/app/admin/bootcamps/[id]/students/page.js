'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getBootcamp, subscribeToStudents, subscribeToVolunteers, subscribeToTeams, getTeams, createTeam, updateStudent } from '@/lib/db';
import { TASK_LEVELS } from '@/shared/constants';
import * as XLSX from 'xlsx';
import { 
  ArrowLeft,
  Users,
  Upload,
  UserPlus,
  Wand2,
  MoreVertical,
  Key,
  Trash2,
  Search,
  UsersRound,
  X
} from 'lucide-react';

const TailwindModal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className={`w-full ${maxWidth} bg-card border border-border rounded-xl shadow-xl my-8 overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="p-6 border-b border-border shrink-0 flex justify-between items-center bg-secondary/30">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default function StudentsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [bootcamp, setBootcamp] = useState(null);
  const [students, setStudents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setModalOpen] = useState(false);
  const [isTeamModalOpen, setTeamModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    level: TASK_LEVELS.BEGINNER,
    volunteerId: '',
    teamId: ''
  });

  const [teamForm, setTeamForm] = useState({ name: '' });

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedStudentForPassword, setSelectedStudentForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [previewData, setPreviewData] = useState([]);
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const fileInputRef = useRef(null);

  const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
  const [genForm, setGenForm] = useState({ prefix: 'CIRCUITRON-', count: 10, defaultPassword: 'Circuitron2026!' });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadBc = async () => {
      const bc = await getBootcamp(id);
      if (bc) setBootcamp(bc);
    };
    loadBc();

    const unsubS = subscribeToStudents(id, setStudents);
    const unsubV = subscribeToVolunteers(id, setVolunteers);
    const unsubT = subscribeToTeams(id, setTeams);

    return () => {
      unsubS();
      unsubV();
      unsubT();
    };
  }, [id]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.displayName) return;

    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          role: 'student',
          bootcampId: id,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create student');
      }

      setModalOpen(false);
      setForm({ displayName: '', email: '', password: '', level: TASK_LEVELS.BEGINNER, volunteerId: '', teamId: '' });
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.name) return;
    setLoading(true);
    try {
      await createTeam(id, { name: teamForm.name, members: [] });
      setTeamModalOpen(false);
      setTeamForm({ name: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateParticipants = async (e) => {
    e.preventDefault();
    if (!genForm.prefix || genForm.count <= 0) return;
    
    setIsGenerating(true);
    let successCount = 0;
    
    try {
      for (let i = 1; i <= genForm.count; i++) {
        const participantId = `${genForm.prefix}${i.toString().padStart(3, '0')}`;
        const email = `${participantId}@circuitron.local`;
        
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: participantId,
            email: email,
            password: genForm.defaultPassword,
            role: 'student',
            level: TASK_LEVELS.BEGINNER,
            bootcampId: id,
            firstLogin: true
          }),
        });

        if (res.ok) successCount++;
      }
      alert(`Successfully generated ${successCount} participants!`);
      setGenerateModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error generating participants');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLevelUpdate = async (studentId, newLevel) => {
    try {
      await updateStudent(id, studentId, { level: newLevel });
    } catch (err) {
      console.error(err);
      alert("Failed to update student level");
    }
  };

  const handleVolunteerUpdate = async (studentId, newVolunteerId) => {
    try {
      await updateStudent(id, studentId, { volunteerId: newVolunteerId });
    } catch (err) {
      console.error(err);
      alert("Failed to assign volunteer");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!selectedStudentForPassword || !newPassword) return;

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/users/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: selectedStudentForPassword.uid || selectedStudentForPassword.id,
          newPassword: newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Password updated successfully!');
      setPasswordModalOpen(false);
      setNewPassword('');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const openPasswordModal = (student) => {
    setSelectedStudentForPassword(student);
    setNewPassword('');
    setPasswordModalOpen(true);
  };

  const handleDelete = async (uid, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from this bootcamp?`)) return;
    try {
      const res = await fetch(`/api/users?uid=${uid}&bootcampId=${id}&role=student`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const normalizedData = json.map((row, index) => {
        const rowKeys = Object.keys(row);
        const emailKey = rowKeys.find(k => k.toLowerCase().includes('email')) || rowKeys[1] || 'Email';
        const nameKey = rowKeys.find(k => k.toLowerCase().includes('name')) || rowKeys[0] || 'Name';
        const passwordKey = rowKeys.find(k => k.toLowerCase().includes('password'));

        return {
          slNo: index + 1,
          name: row[nameKey] || `Student ${index + 1}`,
          email: row[emailKey] || '',
          password: (passwordKey && row[passwordKey]) ? row[passwordKey].toString() : Math.random().toString(36).slice(-8),
          level: TASK_LEVELS.BEGINNER,
        };
      }).filter(row => row.email);

      setPreviewData(normalizedData);
      setPreviewModalOpen(true);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePreviewRow = (index) => {
    const newData = [...previewData];
    newData.splice(index, 1);
    setPreviewData(newData);
  };

  const handleBatchUpload = async () => {
    setIsUploadingBatch(true);
    let successCount = 0;
    let failCount = 0;

    for (const student of previewData) {
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: student.name,
            email: student.email,
            password: student.password,
            role: 'student',
            level: student.level,
            bootcampId: id,
            volunteerId: '', 
            teamId: ''
          }),
        });

        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (e) {
        console.error("Batch upload error:", e);
        failCount++;
      }
    }

    setIsUploadingBatch(false);
    setPreviewModalOpen(false);
    setPreviewData([]);
    alert(`Batch upload complete! \nSuccessful: ${successCount}\nFailed: ${failCount}`);
  };

  if (!bootcamp) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  const filteredStudents = students.filter(s => 
    s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[90rem] mx-auto pb-16 pt-4 px-4 sm:px-6 lg:px-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <button 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
            onClick={() => router.push(`/admin/bootcamps/${id}`)}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Users className="text-muted-foreground" size={28} />
            Students Directory
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage all students participating in {bootcamp.name}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/plain"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border"
          >
            <Upload size={16} />
            Bulk Upload
          </button>
          <button 
            onClick={() => setGenerateModalOpen(true)}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border"
          >
            <Wand2 size={16} />
            Generate IDs
          </button>
          {bootcamp.teamConfig?.enabled && (
            <button 
              onClick={() => setTeamModalOpen(true)}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border"
            >
              <UsersRound size={16} />
              New Team
            </button>
          )}
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* Analytics / Table Section */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-secondary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-secondary text-foreground px-3 py-1 rounded text-xs font-semibold border border-border">
              {students.length} Total Students
            </div>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/30 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Student Profile</th>
                <th className="px-6 py-3 font-medium">Track Level</th>
                <th className="px-6 py-3 font-medium">Assigned Volunteer</th>
                {bootcamp.teamConfig?.enabled && <th className="px-6 py-3 font-medium">Team</th>}
                <th className="px-6 py-3 font-medium">Total Points</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredStudents.map(student => (
                <tr key={student.uid || student.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold border border-border shrink-0">
                        {student.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{student.displayName}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={student.level || 'beginner'}
                      onChange={(e) => handleLevelUpdate(student.uid || student.id, e.target.value)}
                      className="bg-background border border-border rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-muted-foreground text-foreground"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={student.volunteerId || ''}
                      onChange={(e) => handleVolunteerUpdate(student.uid || student.id, e.target.value)}
                      className="bg-background border border-border rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-muted-foreground text-foreground w-40"
                    >
                      <option value="">-- Unassigned --</option>
                      {volunteers.map(v => (
                        <option key={v.id} value={v.id}>{v.displayName}</option>
                      ))}
                    </select>
                  </td>
                  {bootcamp.teamConfig?.enabled && (
                    <td className="px-6 py-3">
                      <span className="bg-secondary border border-border text-muted-foreground px-2 py-1 rounded text-xs font-medium">
                        {teams.find(t => t.id === student.teamId)?.name || 'No Team'}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-3">
                    <div className="font-mono font-medium text-foreground bg-secondary px-2 py-1 rounded border border-border inline-block text-xs">
                      {student.totalPoints || 0} pts
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openPasswordModal(student)}
                        className="p-1.5 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded transition-colors border border-border"
                        title="Change Password"
                      >
                        <Key size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.uid || student.id, student.displayName)}
                        className="p-1.5 bg-card hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-colors border border-border hover:border-destructive/20"
                        title="Remove Student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={bootcamp.teamConfig?.enabled ? 6 : 5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users size={24} className="opacity-50" />
                      <p className="text-sm">No students found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <TailwindModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add New Student">
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Full Name</label>
                <input required type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Email Address</label>
                <input required type="email" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Temporary Password</label>
                <input required type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Track Level</label>
                  <select 
                    value={form.level} 
                    onChange={e => setForm({ ...form, level: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all"
                  >
                    <option value={TASK_LEVELS.BEGINNER}>Beginner</option>
                    <option value={TASK_LEVELS.INTERMEDIATE}>Intermediate</option>
                    <option value={TASK_LEVELS.ADVANCED}>Advanced</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Assign Volunteer</label>
                  <select 
                    value={form.volunteerId} 
                    onChange={e => setForm({ ...form, volunteerId: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all"
                  >
                    <option value="">-- Unassigned --</option>
                    {volunteers.map(v => (
                      <option key={v.id} value={v.id}>{v.displayName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {bootcamp.teamConfig?.enabled && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Assign Team</label>
                  <select 
                    value={form.teamId} 
                    onChange={e => setForm({ ...form, teamId: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all"
                  >
                    <option value="">-- No Team --</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end pt-4 mt-2 border-t border-border">
                <button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </TailwindModal>
        )}
        
        {isGenerateModalOpen && (
          <TailwindModal isOpen={isGenerateModalOpen} onClose={() => setGenerateModalOpen(false)} title="Generate Participant IDs">
            <form onSubmit={handleGenerateParticipants} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">ID Prefix</label>
                <input required type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all" value={genForm.prefix} onChange={e => setGenForm({ ...genForm, prefix: e.target.value })} placeholder="e.g. CIRCUITRON-" />
                <p className="text-xs text-muted-foreground">Accounts formatted as {genForm.prefix}001, {genForm.prefix}002, etc.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Number of Participants</label>
                <input required type="number" min="1" max="100" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all" value={genForm.count} onChange={e => setGenForm({ ...genForm, count: e.target.value === '' ? '' : parseInt(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Default Temporary Password</label>
                <input required type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all" value={genForm.defaultPassword} onChange={e => setGenForm({ ...genForm, defaultPassword: e.target.value })} />
                <p className="text-xs text-muted-foreground">Students must change this on first login.</p>
              </div>
              <div className="flex justify-end pt-4 border-t border-border">
                <button type="submit" disabled={isGenerating} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {isGenerating ? 'Generating...' : `Generate ${genForm.count} Accounts`}
                </button>
              </div>
            </form>
          </TailwindModal>
        )}

        {isTeamModalOpen && (
          <TailwindModal isOpen={isTeamModalOpen} onClose={() => setTeamModalOpen(false)} title="Create New Team">
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Team Name</label>
                <input required type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all" value={teamForm.name} onChange={e => setTeamForm({ name: e.target.value })} />
              </div>
              <div className="flex justify-end pt-4 border-t border-border">
                <button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </TailwindModal>
        )}

        {passwordModalOpen && (
          <TailwindModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title={`Change Password: ${selectedStudentForPassword?.displayName}`}>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">New Password</label>
                <input required minLength={6} type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="flex justify-end pt-4 border-t border-border">
                <button type="submit" disabled={isChangingPassword} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </TailwindModal>
        )}

        {isPreviewModalOpen && (
          <TailwindModal isOpen={isPreviewModalOpen} onClose={() => setPreviewModalOpen(false)} title="Bulk Upload Preview" maxWidth="max-w-4xl">
            <div className="overflow-x-auto border border-border rounded-lg mb-6 max-h-[50vh]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-secondary/30 text-muted-foreground sticky top-0 border-b border-border">
                  <tr>
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Email</th>
                    <th className="px-4 py-2 font-medium">Temp Password</th>
                    <th className="px-4 py-2 font-medium">Level</th>
                    <th className="px-4 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20">
                      <td className="px-4 py-2">{row.slNo}</td>
                      <td className="px-4 py-2">
                        <input className="bg-transparent border-b border-border focus:border-muted-foreground px-1 py-1 w-full text-foreground focus:outline-none text-xs" value={row.name} onChange={e => {
                          const newData = [...previewData];
                          newData[idx].name = e.target.value;
                          setPreviewData(newData);
                        }} />
                      </td>
                      <td className="px-4 py-2">
                        <input className="bg-transparent border-b border-border focus:border-muted-foreground px-1 py-1 w-full text-foreground focus:outline-none text-xs" value={row.email} onChange={e => {
                          const newData = [...previewData];
                          newData[idx].email = e.target.value;
                          setPreviewData(newData);
                        }} />
                      </td>
                      <td className="px-4 py-2">
                        <input className="bg-transparent border-b border-border focus:border-muted-foreground px-1 py-1 w-full text-foreground focus:outline-none text-xs" value={row.password} onChange={e => {
                          const newData = [...previewData];
                          newData[idx].password = e.target.value;
                          setPreviewData(newData);
                        }} />
                      </td>
                      <td className="px-4 py-2">
                        <select className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none" value={row.level} onChange={e => {
                          const newData = [...previewData];
                          newData[idx].level = e.target.value;
                          setPreviewData(newData);
                        }}>
                          <option value={TASK_LEVELS.BEGINNER}>Beginner</option>
                          <option value={TASK_LEVELS.INTERMEDIATE}>Intermediate</option>
                          <option value={TASK_LEVELS.ADVANCED}>Advanced</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => removePreviewRow(idx)} className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" onClick={() => setPreviewModalOpen(false)}>Cancel</button>
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50" onClick={handleBatchUpload} disabled={isUploadingBatch || previewData.length === 0}>
                {isUploadingBatch ? 'Uploading...' : `Add ${previewData.length} Students`}
              </button>
            </div>
          </TailwindModal>
        )}
      </AnimatePresence>
    </div>
  );
}