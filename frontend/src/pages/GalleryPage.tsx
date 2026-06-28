import React, { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Camera, LayoutGrid, Maximize2, Download, Upload, Calendar } from 'lucide-react';
import { photoService, uploadService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { LoadingSkeleton, Modal, EmptyState } from '../components/ui';
import type { Photo } from '../types';

const GalleryPage: React.FC = () => {
  const { showToast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Before / After Slider states
  const [beforePhoto, setBeforePhoto] = useState<Photo | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<Photo | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomPhoto, setZoomPhoto] = useState<Photo | null>(null);

  // Upload Form states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<'before' | 'after' | 'progress'>('progress');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  // Camera states inside upload modal
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await photoService.getAll();
      setPhotos(res.data.data);
      
      // Auto set initial before/after
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

  useEffect(() => {
    fetchPhotos();
  }, []);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      showToast('Camera access denied. Please upload files directly.', 'warning');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setUploadPreview(dataUrl);
        
        // Convert to blob and set file
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const file = new File([new Blob([u8arr], { type: mime })], `snapshot_${Date.now()}.jpg`, { type: mime });
        setUploadFile(file);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
      stopCamera();
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Please select a photo file or capture a webcam photo.', 'warning');
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', uploadFile);
      formData.append('category', category);
      formData.append('date', date);
      formData.append('notes', notes);

      await uploadService.uploadProgressPhoto(formData);
      showToast('Photo uploaded to timeline! 📸', 'success');
      setIsUploadOpen(false);
      
      // Reset forms
      setUploadFile(null);
      setUploadPreview(null);
      setCategory('progress');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      fetchPhotos();
    } catch {
      showToast('Failed to upload photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this skin photo permanently?')) return;
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

  const handleDownload = async (imgUrl: string, fileName: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(imgUrl, '_blank');
    }
  };

  // Group photos by Month for Monthly Comparison sidebar
  const getGroupedPhotos = () => {
    const groups: Record<string, Photo[]> = {};
    photos.forEach(p => {
      const dateObj = new Date(p.date);
      const monthYear = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(p);
    });
    return groups;
  };

  const grouped = getGroupedPhotos();

  return (
    <div className="page-container relative z-10">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            Skin Gallery 📸
          </h1>
          <p className="page-subtitle">Track visual skin changes side-by-side and group photo history by months</p>
        </div>
        <button onClick={() => { setIsUploadOpen(true); stopCamera(); }} className="btn-primary flex items-center gap-1.5 text-xs font-black py-2.5 px-6 shadow-md cursor-pointer">
          <Plus size={15} /> Upload Photo
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : photos.length === 0 ? (
        <EmptyState
          icon="📸"
          title="No photos uploaded yet"
          description="Log daily progress snaps to build a timeline slider comparing before/after results."
          action={<button onClick={() => setIsUploadOpen(true)} className="btn-primary text-xs cursor-pointer"><Plus size={14} /> Upload First Photo</button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Before/After slider comparison */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 border border-white/40 shadow-sm">
              <h2 className="text-sm font-black mb-4 flex items-center gap-2 text-gray-700">
                <LayoutGrid className="text-primary" size={16} /> Interactive Slider Comparison
              </h2>

              {beforePhoto && afterPhoto ? (
                <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden select-none border border-pink-100 shadow-inner">
                  {/* After Layer (Base) */}
                  <img
                    src={`http://localhost:5000${afterPhoto.image}`}
                    alt="After state"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <span className="absolute bottom-4 right-4 z-20 badge badge-safe uppercase font-black">
                    After ({new Date(afterPhoto.date).toLocaleDateString()})
                  </span>

                  {/* Before Layer (Overlay clip-path) */}
                  <div
                    className="absolute inset-0 w-full h-full overflow-hidden"
                    style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                  >
                    <img
                      src={`http://localhost:5000${beforePhoto.image}`}
                      alt="Before state"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-4 left-4 z-20 badge badge-lavender uppercase font-black">
                    Before ({new Date(beforePhoto.date).toLocaleDateString()})
                  </span>

                  {/* Slider divider line handler */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-2xl"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-xl border border-pink-100/50 flex items-center justify-center text-[10px] font-black">
                      ↔️
                    </div>
                  </div>

                  {/* Drag overlay input */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-pink-200 rounded-3xl p-6 text-center bg-white/20">
                  <span className="text-5xl mb-3 filter drop-shadow-sm">🖼️</span>
                  <p className="font-extrabold text-xs mb-1 text-gray-700">Select Before & After Photos</p>
                  <p className="text-[10px] text-gray-400 max-w-sm mb-4 leading-relaxed">
                    Assign photos to "before" and "after" categories to activate the sliding comparison tool.
                  </p>
                </div>
              )}

              {/* Slider image selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-left border-t border-pink-100/40 pt-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Choose Before Log</label>
                  <select
                    value={beforePhoto?._id || ''}
                    onChange={(e) => setBeforePhoto(photos.find(p => p._id === e.target.value) || null)}
                    className="input-field py-2 text-xs font-semibold text-gray-600 appearance-none"
                  >
                    <option value="">None Selected</option>
                    {photos.map(p => (
                      <option key={p._id} value={p._id}>
                        {new Date(p.date).toLocaleDateString()} - ({p.category}) {p.notes || 'No description'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Choose After Log</label>
                  <select
                    value={afterPhoto?._id || ''}
                    onChange={(e) => setAfterPhoto(photos.find(p => p._id === e.target.value) || null)}
                    className="input-field py-2 text-xs font-semibold text-gray-600 appearance-none"
                  >
                    <option value="">None Selected</option>
                    {photos.map(p => (
                      <option key={p._id} value={p._id}>
                        {new Date(p.date).toLocaleDateString()} - ({p.category}) {p.notes || 'No description'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Monthly Comparison sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 border border-white/40 shadow-sm text-left">
              <h2 className="text-sm font-black mb-4 flex items-center gap-2 text-gray-700">
                <Calendar className="text-primary" size={16} /> Monthly Logs Timeline
              </h2>

              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {Object.entries(grouped).map(([monthYear, groupPhotos]) => (
                  <div key={monthYear} className="space-y-3">
                    <h3 className="text-xs font-black text-primary uppercase tracking-wider border-b pb-2 border-pink-100/50">
                      {monthYear} ({groupPhotos.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5">
                      {groupPhotos.map((photo) => (
                        <div
                          key={photo._id}
                          className="flex gap-3.5 p-3 rounded-2xl border items-center bg-white/50 border-pink-100/30 hover:border-pink-200/50 transition-all shadow-sm"
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative group border border-pink-100/10">
                            <img src={`http://localhost:5000${photo.image}`} alt="Skin log" className="w-full h-full object-cover" />
                            <button
                              onClick={() => { setZoomPhoto(photo); setIsZoomOpen(true); }}
                              className="absolute inset-0 bg-pink-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer text-white"
                            >
                              <Maximize2 size={13} />
                            </button>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-black text-gray-700">
                                {new Date(photo.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                              </span>
                              <span className={`badge text-[8px] uppercase py-0.5 px-2 ${
                                photo.category === 'before' ? 'badge-lavender' : photo.category === 'after' ? 'badge-safe' : 'badge-info'
                              }`}>
                                {photo.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 truncate font-medium">{photo.notes || 'No description'}</p>
                          </div>

                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleDownload(`http://localhost:5000${photo.image}`, `skin_${photo.date}.jpg`)}
                              className="p-1 rounded-lg hover:bg-pink-50 text-gray-450 border-none cursor-pointer bg-transparent"
                            >
                              <Download size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(photo._id)}
                              className="p-1 rounded-lg hover:bg-red-50 text-coral border-none cursor-pointer bg-transparent"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Upload Modal (Camera snap + File select) */}
      <Modal isOpen={isUploadOpen} onClose={() => { setIsUploadOpen(false); stopCamera(); }} title="Upload Skin Progress Log">
        <form onSubmit={handleUploadSubmit} className="space-y-4.5 text-left">
          
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Capture Selfie or Choose File</label>
            
            <div className="flex flex-col items-center justify-center bg-pink-50/20 rounded-2xl p-4.5 border border-dashed border-pink-200 shadow-inner mb-3 min-h-[160px] relative">
              {uploadPreview ? (
                <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-md border border-pink-100">
                  <img src={uploadPreview} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setUploadPreview(null); setUploadFile(null); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white border-none cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : cameraActive ? (
                <div className="w-full aspect-[4/3] max-w-sm rounded-2xl overflow-hidden relative bg-black shadow-inner">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    <button
                      type="button"
                      onClick={captureCameraPhoto}
                      className="btn-primary py-1.5 px-4 text-xs font-bold"
                    >
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="btn-secondary py-1.5 px-3 text-xs bg-white border-none text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <p className="text-xs text-gray-400 font-semibold">Capture using webcam or select a saved image file</p>
                  <div className="flex gap-2.5 justify-center">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="btn-secondary text-xs font-bold flex items-center gap-1.5 bg-white border-pink-200 text-gray-700 hover:bg-pink-50/20"
                    >
                      <Camera size={14} /> Webcam Capture
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary text-xs font-bold flex items-center gap-1.5 bg-white border-pink-200 text-gray-700 hover:bg-pink-50/20"
                    >
                      <Upload size={14} /> Choose File
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="input-field text-xs font-semibold text-gray-600 appearance-none"
              >
                <option value="progress">Daily Progress log</option>
                <option value="before">Baseline (Before)</option>
                <option value="after">Target results (After)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field font-semibold text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Diagnostic Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="e.g. Skin barrier feels hydrated, less redness around nose."
            />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-pink-100/50">
            <button type="submit" disabled={uploading} className="btn-primary flex-1 text-xs font-black py-3.5 shadow-md cursor-pointer">
              {uploading ? 'Uploading Photo...' : 'Upload to Timeline'}
            </button>
            <button type="button" onClick={() => { setIsUploadOpen(false); stopCamera(); }} className="btn-secondary text-xs py-3.5 px-6">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Fullscreen Photo Preview Modal */}
      <Modal isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)} title="Skin Progress Log Preview">
        {zoomPhoto && (
          <div className="space-y-4 text-left">
            <div className="flex justify-center bg-pink-50/10 rounded-2xl overflow-hidden p-2 border border-pink-100/10 shadow-inner">
              <img
                src={`http://localhost:5000${zoomPhoto.image}`}
                alt="Skin Zoom"
                className="max-w-full max-h-[60vh] rounded-xl object-contain shadow-md"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs border-b pb-2.5 border-pink-100/50">
                <div className="flex items-center gap-1.5 font-bold text-gray-400">
                  <Calendar size={13} className="text-primary" />
                  <span>{new Date(zoomPhoto.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <span className={`badge uppercase py-0.5 px-2 text-[9px] ${
                  zoomPhoto.category === 'before' ? 'badge-lavender' : zoomPhoto.category === 'after' ? 'badge-safe' : 'badge-info'
                }`}>
                  {zoomPhoto.category}
                </span>
              </div>
              {zoomPhoto.notes ? (
                <div className="p-4 rounded-2xl bg-pink-50/10 text-xs italic leading-relaxed text-gray-500 font-semibold">
                  "{zoomPhoto.notes}"
                </div>
              ) : (
                <p className="text-xs text-gray-450 italic font-semibold">No notes logged for this photo.</p>
              )}
            </div>
            
            <div className="flex gap-2 border-t pt-3.5 justify-end border-pink-100/50">
              <button
                onClick={() => handleDownload(`http://localhost:5000${zoomPhoto.image}`, `skin_${zoomPhoto.date}.jpg`)}
                className="btn-primary text-xs font-black py-2.5 px-5 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Download size={14} /> Download File
              </button>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="btn-secondary text-xs font-semibold py-2.5 px-5"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default GalleryPage;
