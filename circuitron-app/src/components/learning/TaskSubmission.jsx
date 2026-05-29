'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  UploadCloud, CheckCircle2, XCircle, Clock, Loader2, X,
  Image as ImageIcon, Video, ExternalLink, AlertTriangle, RotateCcw
} from 'lucide-react';
import { getSubmission, submitTask } from '@/lib/db';
import { uploadFile } from '@/lib/storage';
import { FILE_LIMITS } from '@/shared/constants';

export default function TaskSubmission({ dayId, userId, taskDescription, taskRequirements, isExpired, onComplete }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');

  // Form state
  const [files, setFiles] = useState([]); // { file, preview }
  const [uploadedFiles, setUploadedFiles] = useState([]); // { name, url, type, size }
  const [links, setLinks] = useState({ wokwi: '', tinkerhub: '', blynk: '', github: '' });
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef(null);

  // Load existing submission
  useEffect(() => {
    const load = async () => {
      try {
        const sub = await getSubmission(userId, dayId);
        if (sub) {
          setSubmission(sub);
          if (sub.links) setLinks(prev => ({ ...prev, ...sub.links }));
          if (sub.notes) setNotes(sub.notes);
          if (sub.files) setUploadedFiles(sub.files);
        }
      } catch (err) { console.error('Failed to load submission:', err); }
      setLoading(false);
    };
    if (userId && dayId) load();
  }, [userId, dayId]);

  const validateFile = (file) => {
    const isImage = FILE_LIMITS.ACCEPTED_IMAGE_TYPES.includes(file.type);
    const isVideo = FILE_LIMITS.ACCEPTED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return `${file.name}: Unsupported file type. Use PNG, JPG, GIF, WebP, MP4, or WebM.`;
    }
    if (isImage && file.size > FILE_LIMITS.IMAGE_MAX_SIZE) {
      return `${file.name}: Image too large (max 5MB).`;
    }
    if (isVideo && file.size > FILE_LIMITS.VIDEO_MAX_SIZE) {
      return `${file.name}: Video too large (max 50MB).`;
    }
    return null;
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError('');

    for (const file of selectedFiles) {
      const err = validateFile(file);
      if (err) { setError(err); return; }
    }

    const newFiles = selectedFiles.map(f => ({
      file: f,
      preview: f.type.startsWith('image') ? URL.createObjectURL(f) : null,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    setError('');

    for (const file of droppedFiles) {
      const err = validateFile(file);
      if (err) { setError(err); return; }
    }

    const newFiles = droppedFiles.map(f => ({
      file: f,
      preview: f.type.startsWith('image') ? URL.createObjectURL(f) : null,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (idx) => {
    setFiles(prev => {
      const removed = prev[idx];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeUploadedFile = (idx) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      // Upload new files
      const newUploadedFiles = [...uploadedFiles];
      for (let i = 0; i < files.length; i++) {
        const { file } = files[i];
        const path = `submissions/${userId}/${dayId}/${Date.now()}_${file.name}`;

        setUploadProgress(prev => ({ ...prev, [i]: 0 }));

        const url = await uploadFile(file, path, (progress) => {
          setUploadProgress(prev => ({ ...prev, [i]: Math.round(progress) }));
        });

        newUploadedFiles.push({
          name: file.name,
          url,
          type: file.type,
          size: file.size,
        });
      }

      // Filter out empty links
      const filteredLinks = {};
      Object.entries(links).forEach(([key, val]) => {
        if (val.trim()) filteredLinks[key] = val.trim();
      });

      // Submit to Firestore
      await submitTask(userId, dayId, {
        files: newUploadedFiles,
        links: filteredLinks,
        notes: notes.trim(),
      });

      // Update local state
      setSubmission({
        files: newUploadedFiles,
        links: filteredLinks,
        notes: notes.trim(),
        status: 'Pending Review',
      });
      setFiles([]);
      setUploadProgress({});
      onComplete?.();
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Submission failed. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    );
  }

  // Status display helpers
  const statusConfig = {
    'Pending Review': { color: 'bg-yellow-500/10 text-yellow-400', icon: Clock },
    'pending_review': { color: 'bg-yellow-500/10 text-yellow-400', icon: Clock },
    'submitted': { color: 'bg-yellow-500/10 text-yellow-400', icon: Clock },
    'Approved': { color: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle2 },
    'approved': { color: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle2 },
    'Needs Revision': { color: 'bg-red-500/10 text-red-400', icon: RotateCcw },
    'needs_revision': { color: 'bg-red-500/10 text-red-400', icon: RotateCcw },
    'rejected': { color: 'bg-red-500/10 text-red-400', icon: XCircle },
  };

  const canResubmit = submission && (
    submission.status === 'Needs Revision' || submission.status === 'needs_revision'
  );
  const isSubmitted = submission && !canResubmit;

  // ==================== EXPIRED STATE ====================
  if (isExpired && !submission) {
    return (
      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardContent className="p-8 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">Deadline Passed</h3>
          <p className="text-sm text-white/40">The submission deadline for this day has expired.</p>
        </CardContent>
      </Card>
    );
  }

  // ==================== SUBMITTED STATE ====================
  if (isSubmitted) {
    const cfg = statusConfig[submission.status] || { color: 'bg-white/10 text-white/40', icon: Clock };
    const StatusIcon = cfg.icon;

    return (
      <div className="space-y-4">
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <StatusIcon size={20} className={cfg.color.split(' ')[1]} />
              <h3 className="text-lg font-medium text-white">Submission Status</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full ml-auto ${cfg.color}`}>
                {submission.status}
              </span>
            </div>

            {/* Submitted Files */}
            {submission.files && submission.files.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-white/60 uppercase mb-2">Uploaded Files</p>
                <div className="grid grid-cols-2 gap-2">
                  {submission.files.map((f, idx) => (
                    <a key={idx} href={f.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      {f.type?.startsWith('image') ? <ImageIcon size={14} className="text-blue-400" /> :
                       <Video size={14} className="text-purple-400" />}
                      <span className="text-xs text-white/70 truncate">{f.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Submitted Links */}
            {submission.links && Object.keys(submission.links).length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-white/60 uppercase mb-2">External Links</p>
                <div className="space-y-1">
                  {Object.entries(submission.links).map(([key, val]) => val && (
                    <a key={key} href={val} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300">
                      <ExternalLink size={12} /> {key}: {val}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {submission.notes && (
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase mb-1">Notes</p>
                <p className="text-sm text-white/60">{submission.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== SUBMISSION FORM ====================
  return (
    <div className="space-y-4">
      {/* Revision Feedback */}
      {canResubmit && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw size={16} className="text-red-400" />
            <p className="text-sm font-medium text-red-400">Revision Requested</p>
          </div>
          <p className="text-xs text-white/60">Please review the feedback and resubmit your task.</p>
        </div>
      )}

      {/* Task Description */}
      {taskDescription && (
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm text-white mb-2">Instructions</h4>
            <p className="text-sm text-white/60 whitespace-pre-wrap">{taskDescription}</p>
            {taskRequirements && taskRequirements.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-white/40 uppercase mb-1">Requirements</p>
                <ul className="space-y-1">
                  {taskRequirements.map((req, idx) => (
                    <li key={idx} className="text-xs text-white/50 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 flex items-center gap-2">
          <AlertTriangle size={14} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={12} /></button>
        </div>
      )}

      {/* File Upload */}
      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Upload Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/15 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 hover:border-white/25 transition-colors"
          >
            <UploadCloud className="text-white/30 mb-3" size={32} />
            <p className="text-sm font-medium text-white/70">Click to upload or drag and drop</p>
            <p className="text-xs text-white/30 mt-1">PNG, JPG, GIF, WebP (5MB) • MP4, WebM (50MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Pending uploads */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  {f.preview ? (
                    <img src={f.preview} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                      <Video size={16} className="text-white/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{f.file.name}</p>
                    <p className="text-xs text-white/30">{(f.file.size / (1024 * 1024)).toFixed(1)} MB</p>
                    {uploadProgress[idx] !== undefined && (
                      <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${uploadProgress[idx]}%` }} />
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeFile(idx)} className="text-white/20 hover:text-red-400 p-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Already uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/40">Previously uploaded:</p>
              {uploadedFiles.map((f, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                  {f.type?.startsWith('image') ? <ImageIcon size={14} className="text-emerald-400" /> : <Video size={14} className="text-emerald-400" />}
                  <span className="text-xs text-white/60 truncate flex-1">{f.name}</span>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <button onClick={() => removeUploadedFile(idx)} className="text-white/20 hover:text-red-400 p-0.5">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* External Links */}
      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardHeader>
          <CardTitle className="text-base">External Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'wokwi', label: 'Wokwi Project', placeholder: 'https://wokwi.com/projects/...' },
            { key: 'tinkerhub', label: 'TinkerHub / Tinkercad', placeholder: 'https://www.tinkercad.com/...' },
            { key: 'blynk', label: 'Blynk Project', placeholder: 'https://blynk.io/...' },
            { key: 'github', label: 'GitHub Repository', placeholder: 'https://github.com/...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs text-white/50">{label}</label>
              <Input
                value={links[key]}
                onChange={(e) => setLinks(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="bg-[#0A0A0A] border-white/10 text-white text-sm h-9"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes about your submission..."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-md px-3 py-2 text-white text-sm min-h-[80px] focus:outline-none focus:border-white/30 resize-none"
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={submitting || (files.length === 0 && uploadedFiles.length === 0 && !Object.values(links).some(v => v.trim()))}
        className="w-full bg-white text-black hover:bg-white/90 h-12 text-base font-medium"
      >
        {submitting ? (
          <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Uploading & Submitting...</>
        ) : canResubmit ? (
          <><RotateCcw size={18} className="mr-2" /> Resubmit Task</>
        ) : (
          'Submit Task'
        )}
      </Button>
    </div>
  );
}
