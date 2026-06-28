import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Calendar, Upload, Search, List, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { journalService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { BACKEND_URL } from '../api/axios';
import { LoadingSkeleton, EmptyState, Modal, Pagination } from '../components/ui';
import type { JournalEntry } from '../types';

interface JournalFormData {
  date: string;
  mood: 'Great' | 'Good' | 'Okay' | 'Bad' | 'Terrible';
  sleepHours: number;
  waterIntake: number;
  stressLevel: number;
  skinCondition: string;
  acne: 'None' | 'Mild' | 'Moderate' | 'Severe';
  dryness: 'None' | 'Mild' | 'Moderate' | 'Severe';
  oiliness: 'None' | 'Mild' | 'Moderate' | 'Severe';
  redness: 'None' | 'Mild' | 'Moderate' | 'Severe';
  reaction: string;
  rating: number;
  notes: string;
}

const severityLevels = ['None', 'Mild', 'Moderate', 'Severe'];

const moods = [
  { value: 'Great', emoji: '😄' },
  { value: 'Good', emoji: '🙂' },
  { value: 'Okay', emoji: '😐' },
  { value: 'Bad', emoji: '😞' },
  { value: 'Terrible', emoji: '😢' }
];

const JournalPage: React.FC = () => {
  const { showToast } = useToast();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form setup
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<JournalFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      mood: 'Okay',
      sleepHours: 8,
      waterIntake: 8,
      stressLevel: 3,
      skinCondition: 'Normal',
      acne: 'None',
      dryness: 'None',
      oiliness: 'None',
      redness: 'None',
      reaction: '',
      rating: 3,
      notes: ''
    }
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Calendar parameters
  const [calendarDate, setCalendarDate] = useState(new Date());

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: '5' };
      if (search) params.search = search;
      
      const res = await journalService.getAll(params);
      setEntries(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      showToast('Failed to load journal entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [page, search]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditClick = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setValue('date', entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setValue('mood', entry.mood);
    setValue('sleepHours', entry.sleepHours);
    setValue('waterIntake', entry.waterIntake);
    setValue('stressLevel', entry.stressLevel);
    setValue('skinCondition', entry.skinCondition || 'Normal');
    setValue('acne', entry.acne || 'None');
    setValue('dryness', entry.dryness || 'None');
    setValue('oiliness', entry.oiliness || 'None');
    setValue('redness', entry.redness || 'None');
    setValue('reaction', entry.reaction || '');
    setValue('rating', entry.rating || 3);
    setValue('notes', entry.notes);
    if (entry.progressPhoto) {
      setImagePreview(`${BACKEND_URL}${entry.progressPhoto}`);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCreateNewClick = () => {
    setEditingEntry(null);
    reset({
      date: new Date().toISOString().split('T')[0],
      mood: 'Okay',
      sleepHours: 8,
      waterIntake: 8,
      stressLevel: 3,
      skinCondition: 'Normal',
      acne: 'None',
      dryness: 'None',
      oiliness: 'None',
      redness: 'None',
      reaction: '',
      rating: 3,
      notes: ''
    });
    setImagePreview(null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: JournalFormData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        formData.append(key, String(val));
      });
      if (imageFile) {
        formData.append('progressPhoto', imageFile);
      }

      if (editingEntry) {
        await journalService.update(editingEntry._id, formData);
        showToast('Journal log updated! 📝✨', 'success');
      } else {
        await journalService.create(formData);
        showToast('Journal logged! 📝✨', 'success');
      }
      
      setIsModalOpen(false);
      fetchEntries();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save journal log', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this journal log?')) return;
    try {
      await journalService.delete(id);
      showToast('Journal log deleted', 'success');
      fetchEntries();
    } catch {
      showToast('Failed to delete entry', 'error');
    }
  };

  // Star Ratings renderer
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-sm">{i < rating ? '★' : '☆'}</span>
        ))}
      </div>
    );
  };

  // Calendar View grid calculations
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const renderCalendarGrid = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = new Date(year, month, 1).getDay();

    const days = [];
    // Empty padding cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`pad-${i}`} className="h-16 border-b border-r border-transparent opacity-10" />);
    }

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const cellDate = new Date(year, month, dayNum);
      const cellDateStr = cellDate.toISOString().split('T')[0];

      // Find matching entry
      const matchingEntry = entries.find(e => e.date && e.date.split('T')[0] === cellDateStr);

      days.push(
        <div
          key={`day-${dayNum}`}
          onClick={() => matchingEntry && handleEditClick(matchingEntry)}
          className={`h-16 p-1 border-b border-r flex flex-col justify-between cursor-pointer border-pink-100/30 transition-all hover:bg-pink-50/20 ${
            matchingEntry ? 'bg-pink-100/20 font-bold' : ''
          }`}
        >
          <span className="text-[10px] text-gray-400 font-bold">{dayNum}</span>
          {matchingEntry && (
            <div className="flex flex-col items-center gap-0.5 pb-1">
              <span className="text-base leading-none">
                {moods.find(m => m.value === matchingEntry.mood)?.emoji || '😐'}
              </span>
              <span className="text-[8px] text-gray-400 font-black">Score: {matchingEntry.rating}/5</span>
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="page-container relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            Skin Journal 📝
          </h1>
          <p className="page-subtitle">Log daily skin condition variables, lifestyle habits, and track correlations</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* View mode toggle */}
          <div className="flex bg-pink-50/50 p-1 rounded-full border border-pink-100/30">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full border-none cursor-pointer flex items-center justify-center transition-all ${
                viewMode === 'list' ? 'btn-primary py-2 shadow-sm text-white' : 'bg-transparent text-gray-400 hover:text-primary'
              }`}
              title="List View"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-full border-none cursor-pointer flex items-center justify-center transition-all ${
                viewMode === 'calendar' ? 'btn-primary py-2 shadow-sm text-white' : 'bg-transparent text-gray-400 hover:text-primary'
              }`}
              title="Calendar View"
            >
              <Calendar size={14} />
            </button>
          </div>

          <button onClick={handleCreateNewClick} className="btn-primary flex items-center gap-1.5 text-xs font-black py-2.5 px-6 shadow-md cursor-pointer">
            <Plus size={15} /> New Entry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-5 mb-8 border border-white/40 shadow-sm">
        <div className="max-w-md relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search entries notes, conditions, or skin concerns..."
            className="input-field pl-11 text-xs"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : viewMode === 'calendar' ? (
        /* Calendar view grid */
        <div className="glass-card p-6 border border-white/40 shadow-sm text-left">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider">
              {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="btn-secondary py-1.5 px-4.5 text-xs bg-white border-none cursor-pointer">
                Prev
              </button>
              <button onClick={handleNextMonth} className="btn-secondary py-1.5 px-4.5 text-xs bg-white border-none cursor-pointer">
                Next
              </button>
            </div>
          </div>
          <div className="border border-pink-100/40 rounded-2xl overflow-hidden shadow-sm bg-white/40">
            <div className="grid grid-cols-7 text-center font-bold text-[9px] uppercase py-2.5 bg-pink-50/30 border-b border-pink-100/40 text-gray-400 tracking-wider">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {renderCalendarGrid()}
            </div>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon="📓"
          title="No entries logged yet"
          description="Log daily skin symptoms to monitor irritation, acne, oiliness levels, and lifestyle correlates."
          action={<button onClick={handleCreateNewClick} className="btn-primary text-xs cursor-pointer"><Plus size={14} /> Log First Entry</button>}
        />
      ) : (
        /* List view card logs */
        <div className="space-y-6">
          <AnimatePresence>
            {entries.map((entry, idx) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6 border border-white/40 shadow-sm"
              >
                <div className="flex flex-col md:flex-row gap-6 text-left">
                  {entry.progressPhoto && (
                    <div className="w-full md:w-44 h-44 rounded-2xl overflow-hidden flex-shrink-0 border border-pink-100/30 shadow-sm">
                      <img
                        src={`${BACKEND_URL}${entry.progressPhoto}`}
                        alt="Skin photo log"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-400 font-bold">
                          <Calendar size={13} className="text-primary" />
                          <span>
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg leading-none">
                            {moods.find(m => m.value === entry.mood)?.emoji || '😐'}
                          </span>
                          <span className="badge badge-lavender text-[9px] uppercase font-black">
                            Mood: {entry.mood}
                          </span>
                          {renderStars(entry.rating || 3)}
                        </div>
                      </div>

                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditClick(entry)}
                          className="p-2 rounded-xl text-gray-400 hover:text-primary border-none cursor-pointer bg-transparent"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="p-2 rounded-xl text-coral border-none cursor-pointer bg-transparent"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Skin Symptoms Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                      <div className="p-2.5 bg-white/50 rounded-xl border border-pink-100/20 text-center shadow-inner">
                        <span className="text-[9px] text-gray-400 font-bold block uppercase mb-1">Acne</span>
                        <span className={`badge text-[9px] py-0.5 px-2.5 uppercase font-black ${entry.acne === 'Severe' ? 'badge-danger' : entry.acne === 'Moderate' ? 'badge-warning' : 'badge-safe'}`}>
                          {entry.acne || 'None'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white/50 rounded-xl border border-pink-100/20 text-center shadow-inner">
                        <span className="text-[9px] text-gray-400 font-bold block uppercase mb-1">Dryness</span>
                        <span className={`badge text-[9px] py-0.5 px-2.5 uppercase font-black ${entry.dryness === 'Severe' ? 'badge-danger' : entry.dryness === 'Moderate' ? 'badge-warning' : 'badge-safe'}`}>
                          {entry.dryness || 'None'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white/50 rounded-xl border border-pink-100/20 text-center shadow-inner">
                        <span className="text-[9px] text-gray-400 font-bold block uppercase mb-1">Oiliness</span>
                        <span className={`badge text-[9px] py-0.5 px-2.5 uppercase font-black ${entry.oiliness === 'Severe' ? 'badge-danger' : entry.oiliness === 'Moderate' ? 'badge-warning' : 'badge-safe'}`}>
                          {entry.oiliness || 'None'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white/50 rounded-xl border border-pink-100/20 text-center shadow-inner">
                        <span className="text-[9px] text-gray-400 font-bold block uppercase mb-1">Redness</span>
                        <span className={`badge text-[9px] py-0.5 px-2.5 uppercase font-black ${entry.redness === 'Severe' ? 'badge-danger' : entry.redness === 'Moderate' ? 'badge-warning' : 'badge-safe'}`}>
                          {entry.redness || 'None'}
                        </span>
                      </div>
                    </div>

                    {/* Lifestyle Variables & Condition */}
                    <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                      <div className="p-3 bg-pink-50/30 rounded-2xl border border-pink-100/20">
                        <span className="text-xl">💧</span>
                        <p className="text-[9px] text-gray-400 uppercase font-black mt-1">Water intake</p>
                        <p className="font-extrabold text-xs text-gray-700">{entry.waterIntake} glasses</p>
                      </div>
                      <div className="p-3 bg-pink-50/30 rounded-2xl border border-pink-100/20">
                        <span className="text-xl">😴</span>
                        <p className="text-[9px] text-gray-400 uppercase font-black mt-1">Sleep log</p>
                        <p className="font-extrabold text-xs text-gray-700">{entry.sleepHours} hrs</p>
                      </div>
                      <div className="p-3 bg-pink-50/30 rounded-2xl border border-pink-100/20">
                        <span className="text-xl">⚡</span>
                        <p className="text-[9px] text-gray-400 uppercase font-black mt-1">Condition</p>
                        <p className="font-extrabold text-xs text-gray-700 truncate uppercase tracking-tight">{entry.skinCondition || 'Normal'}</p>
                      </div>
                    </div>

                    {entry.reaction && (
                      <div className="p-3.5 rounded-2xl border border-coral/10 bg-coral/5 text-xs text-coral mb-3.5">
                        <p className="font-black uppercase text-[9px] mb-0.5">⚠️ Skin Reaction Alert</p>
                        <p className="opacity-90 leading-relaxed font-semibold">{entry.reaction}</p>
                      </div>
                    )}

                    {entry.notes && (
                      <div className="p-4 rounded-2xl text-xs bg-pink-50/15 border border-pink-100/10 leading-relaxed text-gray-500 font-semibold">
                        <p className="font-black text-[9px] text-gray-400 uppercase mb-1.5 tracking-wider">Journal Notes</p>
                        <p>"{entry.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Write / Edit entry Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEntry ? 'Edit Skin Journal Log' : 'New Daily Skin Journal Log'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Log Date *</label>
              <input {...register('date', { required: true })} type="date" className="input-field font-semibold text-gray-600" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Mood Rating *</label>
              <select {...register('mood', { required: true })} className="input-field text-xs font-semibold text-gray-650 appearance-none">
                {moods.map(m => (
                  <option key={m.value} value={m.value}>{m.emoji} {m.value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Overall Skin Rating (1-5 Stars)</label>
              <select {...register('rating', { valueAsNumber: true })} className="input-field text-xs font-semibold text-gray-650 appearance-none">
                <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                <option value="4">⭐⭐⭐⭐ Good (4/5)</option>
                <option value="3">⭐⭐⭐ Okay (3/5)</option>
                <option value="2">⭐⭐ Bad (2/5)</option>
                <option value="1">⭐ Terrible (1/5)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">General Skin Condition</label>
              <input {...register('skinCondition')} className="input-field" placeholder="e.g. Flaky, Glowy, Red, Clear" />
            </div>
          </div>

          {/* Skin Symptom levels */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Skin Symptoms Severity</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Acne</label>
                <select {...register('acne')} className="input-field py-2 text-xs font-semibold text-gray-600 appearance-none">
                  {severityLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Dryness</label>
                <select {...register('dryness')} className="input-field py-2 text-xs font-semibold text-gray-600 appearance-none">
                  {severityLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Oiliness</label>
                <select {...register('oiliness')} className="input-field py-2 text-xs font-semibold text-gray-600 appearance-none">
                  {severityLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Redness</label>
                <select {...register('redness')} className="input-field py-2 text-xs font-semibold text-gray-600 appearance-none">
                  {severityLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Water & Sleep details */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1.5">Water (Cups)</label>
              <input {...register('waterIntake', { valueAsNumber: true })} type="number" min="0" max="25" className="input-field text-center font-bold" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1.5">Sleep (Hours)</label>
              <input {...register('sleepHours', { valueAsNumber: true })} type="number" min="0" max="24" className="input-field text-center font-bold" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1.5">Stress (1-10)</label>
              <input {...register('stressLevel', { valueAsNumber: true })} type="number" min="1" max="10" className="input-field text-center font-bold" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Negative Reaction description</label>
            <input {...register('reaction')} className="input-field" placeholder="e.g. Itchiness/burning on cheeks after toner application" />
          </div>

          {/* Photo upload preview */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Attach Photo Log</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview log" className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-pink-100" />
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-pink-50/40 text-primary border border-dashed border-pink-200 shadow-inner">
                  <Star size={18} />
                </div>
              )}
              <label className="btn-secondary cursor-pointer text-xs flex items-center gap-1.5 border-pink-200">
                <Upload size={13} /> Upload Image
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Daily Journal Notes</label>
            <textarea {...register('notes')} className="input-field" rows={3} placeholder="How does your skin feel? Did you eat any triggering foods, or stay outdoors long?" />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-pink-100/50">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 text-xs font-black py-3.5 shadow-md cursor-pointer">
              {isSubmitting ? 'Saving log...' : 'Save Log'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-3.5 px-6">Cancel</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default JournalPage;
