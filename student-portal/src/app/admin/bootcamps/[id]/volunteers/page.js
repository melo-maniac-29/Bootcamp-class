'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getBootcamp, subscribeToVolunteers } from '@/lib/db';
import * as XLSX from 'xlsx';
import { 
  ArrowLeft,
  Shield,
  Upload,
  UserPlus,
  Trash2,
  Search,
  ShieldCheck,
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

export default function VolunteersPage() {
  const { id } = useParams();
  const router = useRouter();
  const [bootcamp, setBootcamp] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });

  // Bulk Upload State
  const [previewData, setPreviewData] = useState([]);
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadBc = async () => {
      const bc = await getBootcamp(id);
      if (bc) setBootcamp(bc);
    };
    loadBc();
    
    const unsub = subscribeToVolunteers(id, setVolunteers);
    return () => unsub();
  }, [id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.displayName) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          role: 'volunteer',
          bootcampId: id,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create volunteer');
      }
      
      setModalOpen(false);
      setForm({ displayName: '', email: '', password: '' });
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uid, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from this bootcamp?`)) return;
    try {
      const res = await fetch(`/api/users?uid=${uid}&bootcampId=${id}&role=volunteer`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete volunteer');
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
          name: row[nameKey] || `Volunteer ${index + 1}`,
          email: row[emailKey] || '',
          password: (passwordKey && row[passwordKey]) ? row[passwordKey].toString() : Math.random().toString(36).slice(-8),
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

    for (const vol of previewData) {
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: vol.name,
            email: vol.email,
            password: vol.password,
            role: 'volunteer',
            bootcampId: id,
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

  const filteredVolunteers = volunteers.filter(v => 
    v.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[80rem] mx-auto pb-16 pt-4 px-4 sm:px-6 lg:px-8">
      
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
            <Shield className="text-muted-foreground" size={28} />
            Volunteer Management
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage the support team for {bootcamp.name}</p>
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
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus size={16} />
            Add Volunteer
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-secondary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-secondary text-foreground px-3 py-1 rounded text-xs font-semibold border border-border">
              {volunteers.length} Active Volunteers
            </div>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search volunteers..." 
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
                <th className="px-6 py-3 font-medium">Volunteer Profile</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredVolunteers.map(vol => (
                <tr key={vol.uid || vol.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold border border-border shrink-0">
                        {vol.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{vol.displayName}</div>
                        <div className="text-xs text-muted-foreground">{vol.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-1 w-fit bg-secondary border border-border text-foreground px-2 py-1 rounded text-xs font-medium">
                      <ShieldCheck size={12} className="text-muted-foreground" /> Active
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(vol.uid || vol.id, vol.displayName)}
                        className="p-1.5 bg-card hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-colors border border-border hover:border-destructive/20"
                        title="Remove Volunteer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVolunteers.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Shield size={24} className="opacity-50" />
                      <p className="text-sm">No volunteers found.</p>
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
          <TailwindModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add New Volunteer">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Full Name</label>
                <input required type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all" placeholder="e.g. Jane Doe" value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Email Address</label>
                <input required type="email" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all" placeholder="jane@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Temporary Password</label>
                <input required type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-muted-foreground transition-all" placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              
              <div className="flex justify-end pt-4 mt-2 border-t border-border">
                <button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Account'}
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
                {isUploadingBatch ? 'Uploading...' : `Add ${previewData.length} Volunteers`}
              </button>
            </div>
          </TailwindModal>
        )}
      </AnimatePresence>
    </div>
  );
}
