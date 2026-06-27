import React, { useEffect, useState } from 'react';

import { FiPlus, FiTrash2, FiCamera, FiLayout, FiMaximize2 } from 'react-icons/fi';
import { photoService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSkeleton, Modal, EmptyState } from '../components/ui';
import type { Photo } from '../types';

const GalleryPage: React.FC = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Before / After Slider state
  const [beforePhoto, setBeforePhoto] = useState<Photo | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<Photo | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Form upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<'before' | 'after' | 'progress'>('progress');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await photoService.getAll();
      setPhotos(res.data.data);
      
      // Auto set initial before/after if available
      const befores = res.data.data.filter(p => p.category === 'before');
      const afters = res.data.data.filter(p => p.category === 'after');
      if (befores.length > 0) setBeforePhoto(befores[0]);
      if (afters.length > 0) setAfterPhoto(afters[0]);
    } catch {
      showToast('Failed to load photos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Please select a photo', 'warning');
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', uploadFile);
      formData.append('category', category);
      formData.append('date', date);
      formData.append('notes', notes);

      await photoService.upload(formData);
      showToast('Photo uploaded successfully! 📸', 'success');
      setIsUploadOpen(false);
      
      // Reset form
      setUploadFile(null);
      setUploadPreview(null);
      setCategory('progress');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');

      fetchPhotos();
    } catch (error) {
      showToast('Failed to upload photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await photoService.delete(id);
      showToast('Photo deleted', 'success');
      
      if (beforePhoto?._id === id) setBeforePhoto(null);
      if (afterPhoto?._id === id) setAfterPhoto(null);
      
      fetchPhotos();
    } catch {
      showToast('Failed to delete photo', 'error');
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Skin Gallery 📸</h1>
          <p className="page-subtitle">Track visual changes and compare your skincare results side-by-side</p>
        </div>
        <button onClick={() => setIsUploadOpen(true)} className="btn-primary flex items-center gap-1">
          <FiPlus /> Upload Photo
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : photos.length === 0 ? (
        <EmptyState
          icon="📸"
          title="No photos uploaded yet."
          description="Take a selfie or upload progress photos to track your skincare journey visually."
          action={
            <button onClick={() => setIsUploadOpen(true)} className="btn-primary text-sm">
              <FiPlus /> Upload Your First Photo
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Before and After Comparison Slider */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiLayout /> Side-by-Side Comparison
            </h2>

            {beforePhoto && afterPhoto ? (
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden select-none">
                {/* After Photo (Base Layer) */}
                <img
                  src={`http://localhost:5000${afterPhoto.image}`}
                  alt="After"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute bottom-4 right-4 z-20 badge badge-safe">
                  After ({new Date(afterPhoto.date).toLocaleDateString()})
                </span>

                {/* Before Photo (Overlay Layer) */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                >
                  <img
                    src={`http://localhost:5000${beforePhoto.image}`}
                    alt="Before"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <span className="absolute bottom-4 left-4 z-20 badge badge-lavender">
                  Before ({new Date(beforePhoto.date).toLocaleDateString()})
                </span>

                {/* Divider Line & Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-lavender flex items-center justify-center text-xs">
                    ↔️
                  </div>
                </div>

                {/* Hidden slider input range overlay */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={handleSliderChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center"
                style={{ borderColor: 'var(--color-lavender)' }}>
                <span className="text-5xl mb-3">🖼️</span>
                <p className="font-semibold text-sm mb-1">Select Before & After Photos</p>
                <p className="text-xs max-w-sm mb-4" style={{ color: '#888' }}>
                  Assign photos as "before" and "after" categories to activate the visual comparison slider.
                </p>
              </div>
            )}

            {/* Selection Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Choose Before Photo</label>
                <select
                  value={beforePhoto?._id || ''}
                  onChange={(e) => setBeforePhoto(photos.find(p => p._id === e.target.value) || null)}
                  className="input-field py-2 text-sm"
                >
                  <option value="">None Selected</option>
                  {photos.filter(p => p.category === 'before' || p.category === 'progress').map(p => (
                    <option key={p._id} value={p._id}>
                      {new Date(p.date).toLocaleDateString()} - {p.notes || 'No notes'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Choose After Photo</label>
                <select
                  value={afterPhoto?._id || ''}
                  onChange={(e) => setAfterPhoto(photos.find(p => p._id === e.target.value) || null)}
                  className="input-field py-2 text-sm"
                >
                  <option value="">None Selected</option>
                  {photos.filter(p => p.category === 'after' || p.category === 'progress').map(p => (
                    <option key={p._id} value={p._id}>
                      {new Date(p.date).toLocaleDateString()} - {p.notes || 'No notes'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form (Side panel) */}
        <div>
          <div className="glass-card p-6 h-full">
            <h2 className="text-lg font-bold mb-4">Photo Timeline</h2>
            {loading ? (
              <LoadingSkeleton type="text" count={3} />
            ) : photos.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: '#888' }}>No photos uploaded yet</p>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {photos.map((photo) => (
                  <div
                    key={photo._id}
                    className="flex gap-3 p-3 rounded-2xl border items-center"
                    style={{
                      background: isDark ? 'rgba(26, 26, 46, 0.4)' : '#fafafa',
                      borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.1)'
                    }}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative group">
                      <img src={`http://localhost:5000${photo.image}`} alt="Skin log" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setZoomImage(`http://localhost:5000${photo.image}`); setIsZoomOpen(true); }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer text-white"
                      >
                        <FiMaximize2 size={14} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">
                          {new Date(photo.date).toLocaleDateString()}
                        </span>
                        <span className={`badge text-[10px] py-0 px-2 ${
                          photo.category === 'before' ? 'badge-lavender' : photo.category === 'after' ? 'badge-safe' : 'badge-info'
                        }`}>
                          {photo.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{photo.notes || 'No description'}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(photo._id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer border-none"
                      style={{ background: 'transparent' }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
      )}

      {/* Upload Photo Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Progress Photo">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Select Photo</label>
            <div className="flex items-center gap-4">
              {uploadPreview ? (
                <img src={uploadPreview} alt="Upload preview" className="w-24 h-24 rounded-2xl object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: 'rgba(200, 182, 255, 0.1)', border: '2px dashed var(--color-lavender)' }}>
                  <FiCamera style={{ color: 'var(--color-lavender-dark)' }} />
                </div>
              )}
              <label className="btn-secondary cursor-pointer text-xs">
                Browse file
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="input-field"
              >
                <option value="progress">Daily Progress</option>
                <option value="before">Baseline (Before)</option>
                <option value="after">Results (After)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="e.g. Skin feels dry today, noting some redness around cheeks."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={uploading} className="btn-primary flex-1">
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <button type="button" onClick={() => setIsUploadOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Image Zoom Modal */}
      <Modal isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)} title="View Photo">
        {zoomImage && (
          <div className="flex justify-center items-center">
            <img src={zoomImage} alt="Skin Zoom" className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GalleryPage;
