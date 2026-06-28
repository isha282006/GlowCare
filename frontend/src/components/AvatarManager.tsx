import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, Eye, Upload, RefreshCw, ZoomIn, RotateCw, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { profileService } from '../api/services';
import { BACKEND_URL } from '../api/axios';

interface AvatarManagerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

const AvatarManager: React.FC<AvatarManagerProps> = ({ size = 'md', editable = true }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // States
  const [showMenu, setShowMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [uploading, setUploading] = useState(false);

  const profilePicUrl = user?.profilePhoto || user?.profilePicture;
  const avatarUrl = profilePicUrl 
    ? (profilePicUrl.startsWith('http') ? profilePicUrl : `${BACKEND_URL}${profilePicUrl}`) 
    : null;

  // Size mapping
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm border-2',
    md: 'w-16 h-16 text-xl border-4',
    lg: 'w-24 h-24 text-3xl border-4',
    xl: 'w-32 h-32 text-4xl border-4'
  };

  // Initials fallback
  const getInitials = () => {
    if (!user?.name) return '👤';
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Close menu on click outside
  useEffect(() => {
    const handleOutsideClick = () => setShowMenu(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editable) {
      setShowMenu(!showMenu);
    } else if (avatarUrl) {
      setShowLightbox(true);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('Invalid File Type. Please upload JPG, JPEG, PNG, or WEBP.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('File Too Large. Limit is 5 MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
        setZoom(1);
        setRotation(0);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera capture methods
  const startCamera = async () => {
    try {
      setShowCameraModal(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { aspectRatio: 1 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      showToast('Could not access camera', 'error');
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const size = Math.min(video.videoWidth, video.videoHeight) || 480;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Center crop snapshot
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        setPreviewImage(canvas.toDataURL('image/jpeg'));
        setZoom(1);
        setRotation(0);
        stopCamera();
        setShowCropModal(true);
      }
    }
  };

  // Crop & Rotate & Zoom confirmations
  const handleConfirmCrop = () => {
    if (!previewImage) return;
    setUploading(true);
    showToast('Uploading...', 'info');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setUploading(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = previewImage;
    img.onload = () => {
      const canvasSize = 400;
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.translate(canvasSize / 2, canvasSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Center fit draw
      const imgWidth = img.width;
      const imgHeight = img.height;
      const minDimension = Math.min(imgWidth, imgHeight);
      const renderWidth = (imgWidth / minDimension) * canvasSize;
      const renderHeight = (imgHeight / minDimension) * canvasSize;

      ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const croppedFile = new File([blob], 'profile_avatar.jpg', { type: 'image/jpeg' });
          const formData = new FormData();
          formData.append('image', croppedFile);

          try {
            const res = await profileService.uploadPhoto(formData);
            updateUser(res.data.user);
            showToast('Upload Successful', 'success');
            setShowCropModal(false);
          } catch (err) {
            showToast('Upload Failed', 'error');
          } finally {
            setUploading(false);
          }
        } else {
          setUploading(false);
        }
      }, 'image/jpeg', 0.92);
    };
  };

  const handleRemovePhoto = async () => {
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      try {
        setUploading(true);
        const res = await profileService.removePhoto();
        updateUser(res.data.user);
        showToast('Image Removed', 'success');
      } catch (err) {
        showToast('Failed to remove profile photo', 'error');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="relative inline-block select-none">
      
      {/* Avatar Container */}
      <div 
        onClick={handleAvatarClick}
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-white shadow-md bg-gradient-to-tr from-pink-100 to-rose-200 cursor-pointer group transition-all duration-300 hover:scale-102 hover:shadow-lg`}
      >
        {uploading ? (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <RefreshCw size={size === 'sm' ? 14 : 20} className="text-primary animate-spin" />
          </div>
        ) : avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="User Avatar" 
            className="w-full h-full object-cover transition-opacity duration-300 animate-fadeIn" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-primary-dark">
            {getInitials()}
          </div>
        )}

        {/* Hover Camera Overlay */}
        {editable && !uploading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
            <Camera size={size === 'sm' ? 14 : size === 'md' ? 18 : 24} />
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg,image/jpg,image/png,image/webp" 
        className="hidden" 
      />

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-pink-100/50 rounded-2xl shadow-xl z-50 p-1.5 animate-fadeIn">
          {avatarUrl ? (
            <button 
              onClick={() => setShowLightbox(true)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-pink-50/50 text-xs font-bold text-gray-700 rounded-xl flex items-center gap-2"
            >
              <Eye size={14} className="text-gray-400" /> 🖼 View Photo
            </button>
          ) : null}
          <button 
            onClick={triggerFileSelect}
            className="w-full text-left px-3.5 py-2.5 hover:bg-pink-50/50 text-xs font-bold text-gray-700 rounded-xl flex items-center gap-2"
          >
            <Upload size={14} className="text-gray-400" /> 📷 Upload New Photo
          </button>
          <button 
            onClick={startCamera}
            className="w-full text-left px-3.5 py-2.5 hover:bg-pink-50/50 text-xs font-bold text-gray-700 rounded-xl flex items-center gap-2"
          >
            <Camera size={14} className="text-gray-400" /> 📸 Take Photo
          </button>
          {avatarUrl ? (
            <>
              <button 
                onClick={triggerFileSelect}
                className="w-full text-left px-3.5 py-2.5 hover:bg-pink-50/50 text-xs font-bold text-gray-700 rounded-xl flex items-center gap-2"
              >
                <RefreshCw size={14} className="text-gray-400" /> ✏ Change Photo
              </button>
              <div className="border-t border-pink-50/70 my-1"></div>
              <button 
                onClick={handleRemovePhoto}
                className="w-full text-left px-3.5 py-2.5 hover:bg-red-50 text-xs font-bold text-red-500 rounded-xl flex items-center gap-2"
              >
                <Trash2 size={14} className="text-red-400" /> 🗑 Remove Photo
              </button>
            </>
          ) : null}
        </div>
      )}

      {/* Lightbox / View Modal */}
      {showLightbox && avatarUrl && (
        <div 
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-9999 animate-fadeIn p-4 cursor-pointer"
        >
          <button 
            onClick={() => setShowLightbox(false)} 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-white cursor-pointer"
          >
            <X size={20} />
          </button>
          <img 
            src={avatarUrl} 
            alt="Full size Profile Pic" 
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10" 
          />
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6.5 max-w-sm w-full space-y-5 border border-pink-100/30 shadow-2xl relative text-center">
            <button 
              onClick={stopCamera}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-gray-800">📸 Take Profile Photo</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Center your face inside the circle guide</p>
            </div>

            <div className="relative w-72 h-72 mx-auto rounded-2xl overflow-hidden border border-pink-100 bg-black shadow-inner">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover" 
              />
              {/* Circular Cutout overlay */}
              <div className="absolute inset-0 border-[28px] border-black/50 rounded-full pointer-events-none ring-1 ring-white/10" />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={stopCamera}
                className="btn-secondary py-2.5 px-5 text-xs font-bold flex-1 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={capturePhoto}
                className="btn-primary py-2.5 px-6 text-xs font-bold flex-1 cursor-pointer"
              >
                Snap Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop / Zoom / Rotate Modal */}
      {showCropModal && previewImage && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6.5 max-w-sm w-full space-y-5 border border-pink-100/30 shadow-2xl relative text-center">
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-gray-800">✏ Preview & Crop</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Adjust position by zooming and rotating</p>
            </div>

            {/* Adjust Container */}
            <div className="relative w-72 h-72 mx-auto rounded-2xl overflow-hidden border border-pink-100 bg-gray-50 flex items-center justify-center shadow-inner">
              <div 
                className="transition-transform duration-75"
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom})`
                }}
              >
                <img 
                  src={previewImage} 
                  alt="Crop Preview" 
                  className="w-64 h-64 object-cover" 
                />
              </div>
              {/* Circle Cutout Guideline Overlay */}
              <div className="absolute inset-0 border-[32px] border-white/70 rounded-full pointer-events-none ring-1 ring-primary/25" />
            </div>

            {/* Controls */}
            <div className="space-y-3.5 text-left">
              {/* Zoom control */}
              <div className="flex items-center gap-3">
                <ZoomIn size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-[10px] font-bold text-gray-400 uppercase w-10">Zoom</span>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.05" 
                  value={zoom} 
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1 bg-pink-100 rounded-lg appearance-none" 
                />
              </div>

              {/* Rotate control */}
              <div className="flex items-center gap-3">
                <RotateCw size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-[10px] font-bold text-gray-400 uppercase w-10">Rotate</span>
                <button 
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-1.5 rounded-lg border border-pink-100 bg-pink-50/20 text-[10px] font-bold text-primary flex items-center gap-1.5 cursor-pointer hover:bg-pink-100/50"
                >
                  <RotateCw size={10} /> Rotate 90°
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCropModal(false)}
                disabled={uploading}
                className="btn-secondary py-2.5 px-5 text-xs font-bold flex-1 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmCrop}
                disabled={uploading}
                className="btn-primary py-2.5 px-6 text-xs font-black flex-1 cursor-pointer"
              >
                {uploading ? 'Uploading...' : 'Save Photo'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AvatarManager;
