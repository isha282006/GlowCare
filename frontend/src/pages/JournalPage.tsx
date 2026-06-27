import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiCalendar, FiUpload } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { journalService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSkeleton, EmptyState, Modal, Pagination } from '../components/ui';
import type { JournalEntry } from '../types';

interface JournalFormData {
  date: string;
  mood: 'Great' | 'Good' | 'Okay' | 'Bad' | 'Terrible';
  sleepHours: number;
  waterIntake: number;
  stressLevel: number;
  skinConcern: string;
  notes: string;
}

const skinConcernsList = ['Acne', 'Dryness', 'Redness', 'Dark Spots', 'Fine Lines', 'Oiliness', 'Sensitivity', 'Dullness'];
const moods = [
  { value: 'Great', emoji: '😄' },
  { value: 'Good', emoji: '🙂' },
  { value: 'Okay', emoji: '😐' },
  { value: 'Bad', emoji: '😞' },
  { value: 'Terrible', emoji: '😢' }
];

const JournalPage: React.FC = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<JournalFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      mood: 'Okay',
      sleepHours: 8,
      waterIntake: 8,
      stressLevel: 3,
      skinConcern: '',
      notes: ''
    }
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);

  useEffect(() => {
    fetchEntries();
  }, [page]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await journalService.getAll({ page: String(page), limit: '5' });
      setEntries(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      showToast('Failed to load journal entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleConcern = (concern: string) => {
    setSelectedConcerns(prev =>
      prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
    );
  };

  const onSubmit = async (data: JournalFormData) => {
    try {
      const formData = new FormData();
      formData.append('date', data.date);
      formData.append('mood', data.mood);
      formData.append('sleepHours', String(data.sleepHours));
      formData.append('waterIntake', String(data.waterIntake));
      formData.append('stressLevel', String(data.stressLevel));
      formData.append('notes', data.notes);
      formData.append('skinConcern', selectedConcerns.join(','));
      if (imageFile) {
        formData.append('progressPhoto', imageFile);
      }

      await journalService.create(formData);
      showToast('Journal logged! 📝✨', 'success');
      setIsModalOpen(false);
      reset();
      setImageFile(null);
      setImagePreview(null);
      setSelectedConcerns([]);
      setPage(1);
      fetchEntries();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to log journal', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      await journalService.delete(id);
      showToast('Entry deleted', 'success');
      fetchEntries();
    } catch {
      showToast('Failed to delete entry', 'error');
    }
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Daily Skin Journal 📝</h1>
          <p className="page-subtitle">Track your hydration, sleep, stress levels, and skin behavior daily</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-1">
          <FiPlus /> New Log
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon="📓"
          title="No journal entries yet."
          description="Log your daily skin condition and lifestyle variables to discover patterns."
          action={<button onClick={() => setIsModalOpen(true)} className="btn-primary"><FiPlus /> Write Your First Entry</button>}
        />
      ) : (
        <div className="space-y-6">
          {entries.map((entry, index) => (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {entry.progressPhoto && (
                  <div className="w-full md:w-44 h-44 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      src={`http://localhost:5000${entry.progressPhoto}`}
                      alt="Skin progress"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FiCalendar style={{ color: 'var(--color-lavender-dark)' }} />
                        <span className="font-bold text-sm">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {moods.find(m => m.value === entry.mood)?.emoji || '😐'}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(200, 182, 255, 0.2)', color: 'var(--color-lavender-dark)' }}>
                          Mood: {entry.mood}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer border-none"
                      style={{ background: 'transparent' }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  {/* Lifestyle items */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-3 rounded-2xl text-center" style={{ background: isDark ? 'rgba(26,26,46,0.6)' : 'var(--color-sky-light)' }}>
                      <span className="text-xl">💧</span>
                      <p className="text-xs mt-1" style={{ color: '#888' }}>Water Intake</p>
                      <p className="font-bold text-sm">{entry.waterIntake} / 8 glasses</p>
                    </div>
                    <div className="p-3 rounded-2xl text-center" style={{ background: isDark ? 'rgba(26,26,46,0.6)' : 'var(--color-mint-light)' }}>
                      <span className="text-xl">😴</span>
                      <p className="text-xs mt-1" style={{ color: '#888' }}>Sleep</p>
                      <p className="font-bold text-sm">{entry.sleepHours} hrs</p>
                    </div>
                    <div className="p-3 rounded-2xl text-center" style={{ background: isDark ? 'rgba(26,26,46,0.6)' : 'var(--color-soft-pink-light)' }}>
                      <span className="text-xl">⚡</span>
                      <p className="text-xs mt-1" style={{ color: '#888' }}>Stress Level</p>
                      <p className="font-bold text-sm">{entry.stressLevel} / 10</p>
                    </div>
                  </div>

                  {/* Concerns */}
                  {entry.skinConcern && entry.skinConcern.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {entry.skinConcern.filter(Boolean).map((concern, idx) => (
                        <span key={idx} className="badge badge-warning">
                          ⚠️ {concern}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {entry.notes && (
                    <div className="p-3 rounded-2xl text-sm" style={{ background: isDark ? '#1a1a2e' : '#fcfcfc', border: '1px solid rgba(200,182,255,0.1)' }}>
                      <p className="font-semibold text-xs mb-1 text-gray-500">Daily Notes:</p>
                      <p style={{ color: isDark ? 'var(--color-dark-text)' : '#555' }}>{entry.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Modal for logging a new day */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Daily Skin & Lifestyle">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Date</label>
              <input {...register('date', { required: true })} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Mood</label>
              <select {...register('mood', { required: true })} className="input-field">
                {moods.map(m => (
                  <option key={m.value} value={m.value}>{m.emoji} {m.value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Water (Glasses)</label>
              <input {...register('waterIntake', { valueAsNumber: true })} type="number" min="0" max="20" className="input-field text-center" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Sleep (Hours)</label>
              <input {...register('sleepHours', { valueAsNumber: true })} type="number" min="0" max="24" className="input-field text-center" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Stress (1-10)</label>
              <input {...register('stressLevel', { valueAsNumber: true })} type="number" min="1" max="10" className="input-field text-center" />
            </div>
          </div>

          {/* Skin concerns tag select */}
          <div>
            <label className="block text-sm font-semibold mb-2">Skin Concerns Today</label>
            <div className="flex flex-wrap gap-2">
              {skinConcernsList.map(concern => {
                const isSelected = selectedConcerns.includes(concern);
                return (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => toggleConcern(concern)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-peach border-peach text-amber-900'
                        : 'bg-transparent border-gray-300 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {concern}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Progress Photo</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(200, 182, 255, 0.1)', border: '2px dashed var(--color-lavender)' }}>📸</div>
              )}
              <label className="btn-secondary cursor-pointer text-xs">
                <FiUpload size={12} /> {imagePreview ? 'Change' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Notes</label>
            <textarea {...register('notes')} className="input-field" rows={3} placeholder="How does your skin feel? Any new products tried?" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving Log...' : 'Save Log'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JournalPage;
