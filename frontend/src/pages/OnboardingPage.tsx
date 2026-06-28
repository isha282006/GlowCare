import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Upload, RotateCcw, Camera, Sparkles } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { authService, uploadService, recommendationService } from '../api/services';

interface OnboardingPageProps {
  step: 'welcome' | 'camera' | 'questionnaire';
}

const skinTypes = [
  { id: 'oily', title: 'Oily', icon: '✨', desc: 'Excess shine, enlarged pores, acne-prone.' },
  { id: 'dry', title: 'Dry', icon: '🧴', desc: 'Tightness, scaling, flakiness, dullness.' },
  { id: 'combination', title: 'Combination', icon: '🌓', desc: 'Oily T-zone, normal or dry cheeks.' },
  { id: 'sensitive', title: 'Sensitive', icon: '🛡️', desc: 'Redness, burning, easily irritated.' },
  { id: 'normal', title: 'Normal', icon: '🌿', desc: 'Balanced hydration, small pores.' }
];

const concernsList = [
  { id: 'Acne', label: 'Acne', emoji: '🧼' },
  { id: 'Pigmentation', label: 'Pigmentation', emoji: '✨' },
  { id: 'Dark Spots', label: 'Dark Spots', emoji: '☀️' },
  { id: 'Dry Lips', label: 'Dry Lips', emoji: '👄' },
  { id: 'Blackheads', label: 'Blackheads', emoji: '🌓' },
  { id: 'Whiteheads', label: 'Whiteheads', emoji: '⚪' },
  { id: 'Large Pores', label: 'Large Pores', emoji: '🔍' },
  { id: 'Redness', label: 'Redness', emoji: '🍅' },
  { id: 'Fine Lines', label: 'Fine Lines', emoji: '⏳' },
  { id: 'Wrinkles', label: 'Wrinkles', emoji: '👵' },
  { id: 'Dullness', label: 'Dullness', emoji: '💧' },
  { id: 'Under-eye Dark Circles', label: 'Under-eye Dark Circles', emoji: '🐼' }
];

const OnboardingPage: React.FC<OnboardingPageProps> = ({ step }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { updateUser } = useAuth();

  // Onboarding answers state
  const [selectedSkinType, setSelectedSkinType] = useState<string | null>(
    localStorage.getItem('glowcare_user_skin_type') || null
  );
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    JSON.parse(localStorage.getItem('glowcare_user_concerns') || '[]')
  );
  const [lifestyle, setLifestyle] = useState({
    waterIntake: localStorage.getItem('glowcare_user_water_intake') || '2-3L',
    sleepDuration: localStorage.getItem('glowcare_user_sleep_duration') || '7-9 hours',
    sunscreenUsage: localStorage.getItem('glowcare_user_sunscreen_usage') || 'Daily',
    makeupUsage: localStorage.getItem('glowcare_user_makeup_usage') || 'Occasional',
    smoking: localStorage.getItem('glowcare_user_smoking') || 'No',
    stressLevel: localStorage.getItem('glowcare_user_stress_level') || 'Low'
  });

  // Resume unfinished steps handler
  useEffect(() => {
    const lastPath = localStorage.getItem('glowcare_onboarding_last_path');
    if (lastPath && lastPath !== location.pathname) {
      navigate(lastPath);
    } else if (!lastPath) {
      localStorage.setItem('glowcare_onboarding_last_path', location.pathname);
    }
  }, [location.pathname, navigate]);

  const updateLastPath = (path: string) => {
    localStorage.setItem('glowcare_onboarding_last_path', path);
    navigate(path);
  };

  // Questionnaire sub-steps (1 to 9)
  const [subStep, setSubStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Camera states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(
    localStorage.getItem('glowcare_user_baseline_photo') || null
  );
  const [isSaving, setIsSaving] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start/Stop camera for camera step
  useEffect(() => {
    if (step === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, capturedImage]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setCameraError('Camera access unavailable. You can upload a selfie from your gallery instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        localStorage.setItem('glowcare_user_baseline_photo', dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    localStorage.removeItem('glowcare_user_baseline_photo');
    startCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('Please upload a valid image file (JPG, JPEG, PNG, or WEBP).', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5 MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
        localStorage.setItem('glowcare_user_baseline_photo', dataUrl);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleNextSubStep = () => {
    // Validation for question sub-steps
    if (subStep === 1 && !selectedSkinType) {
      showToast('Please select your skin type!', 'warning');
      return;
    }
    if (subStep === 2 && selectedConcerns.length === 0) {
      showToast('Please select at least one skin concern!', 'warning');
      return;
    }

    if (subStep === 3) {
      handleFinish();
    } else {
      setDirection(1);
      setSubStep((prev) => prev + 1);
    }
  };

  const handleBackSubStep = () => {
    if (subStep === 1) {
      updateLastPath('/onboarding/camera');
    } else {
      setDirection(-1);
      setSubStep((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      let selfieUrl = '';

      // 1. Upload baseline photo
      if (capturedImage && capturedImage.startsWith('data:')) {
        try {
          const blob = dataURLtoBlob(capturedImage);
          const file = new File([blob], 'baseline_selfie.jpg', { type: 'image/jpeg' });
          const formData = new FormData();
          formData.append('image', file);
          formData.append('category', 'before');
          formData.append('date', new Date().toISOString().split('T')[0]);
          formData.append('notes', 'Baseline Selfie (Onboarding)');
          const uploadRes = await uploadService.uploadProgressPhoto(formData);
          if (uploadRes.data?.success) {
            selfieUrl = uploadRes.data.imageUrl;
          }
        } catch (imgErr) {
          console.error('Failed to upload baseline selfie:', imgErr);
        }
      }

      // 2. Generate Assessment Report via Backend API
      const recResponse = await recommendationService.generate({
        skinType: selectedSkinType || 'Normal',
        concerns: selectedConcerns,
        lifestyle: lifestyle
      });

      const calculatedReport: any = recResponse.data.data;

      // Save selfie image inside report data
      calculatedReport.selfieImage = selfieUrl;

      // 3. Save report to User profile
      const response = await authService.updateProfile({
        skinReport: calculatedReport,
        skinType: selectedSkinType || 'Normal',
        skinConcerns: selectedConcerns,
        skinScore: calculatedReport.assessment?.skinScore || 80,
        onboardingCompleted: true
      });

      if (response.data.success) {
        updateUser(response.data.user);
        
        // 4. Save states in localStorage
        localStorage.setItem('glowcare_onboarding_completed', 'true');
        localStorage.removeItem('glowcare_onboarding_last_path');
        
        showToast('Skin Report generated successfully! 🌟', 'success');
        navigate('/onboarding/report');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to complete profile onboarding', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Slider animation configs
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' as any }
    })
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Floating Background Blobs Layer */}
      <div className="glow-bg-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>

      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between z-10 py-3 relative">
        <div className="flex items-center gap-2.5">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 10 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-primary to-secondary shadow-sm"
          >
            <Sparkles className="text-white" size={16} />
          </motion.div>
          <span className="font-black text-lg tracking-tight gradient-text">GlowCare</span>
        </div>
        
        {step !== 'welcome' && (
          <div className="flex items-center gap-2.5 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assessment progress</span>
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 'camera' ? 'w-16 bg-primary' : 'w-5 bg-pink-100'}`} />
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 'questionnaire' ? 'w-24 bg-primary' : 'w-5 bg-pink-100'}`} />
          </div>
        )}
      </div>

      {/* Main slider body */}
      <div className="flex-1 max-w-4xl w-full mx-auto flex items-center justify-center my-6 z-10 relative">
        
        {/* STEP 1: Welcome page */}
        {step === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full"
          >
            <div className="space-y-6 text-left">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(255, 95, 162, 0.08)',
                  color: '#FF5FA2',
                  border: '1px solid rgba(255, 95, 162, 0.25)'
                }}
              >
                <Sparkles size={11} /> Premium Diagnostic Portal
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-gray-800">
                Reveal Your <br />
                <span className="gradient-text">Best Skin</span>
              </h1>
              <p className="text-sm leading-relaxed text-gray-500">
                Welcome to GlowCare. Start your journey with a customized skin health assessment, routine recommendation, conflict checker, and daily consistency tracker.
              </p>
              <div className="flex items-center gap-4 pt-3">
                <button
                  onClick={() => updateLastPath('/onboarding/camera')}
                  className="btn-primary py-3.5 px-8 text-xs font-black flex items-center gap-2 shadow-md"
                >
                  Start Assessment <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => updateLastPath('/onboarding/camera')}
                  className="btn-secondary py-3.5 px-6 text-xs font-bold"
                >
                  Skip
                </button>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center relative">
              <div
                className="w-80 h-80 rounded-[40px] relative flex items-center justify-center shadow-xl animate-float border border-white/50"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 199, 222, 0.3) 0%, rgba(200, 182, 255, 0.2) 100%)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div className="w-48 h-48 rounded-[30px] bg-white/70 flex items-center justify-center text-7xl shadow-inner border border-pink-100">
                  🌸
                </div>
                <div className="absolute top-6 left-6 w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center shadow-md text-xl border border-white">✨</div>
                <div className="absolute bottom-6 right-6 w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center shadow-md text-2xl border border-white">🧴</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Camera Capture */}
        {step === 'camera' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-6 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-gray-800">Upload baseline selfie 📸</h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                Take a clear selfie in natural light. We use this photo as your baseline starting point in the Progress Gallery.
              </p>
            </div>

            <div className="glass-card p-4.5 flex flex-col items-center justify-center relative aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-pink-100 shadow-xl">
              {capturedImage ? (
                <div className="w-full h-full relative">
                  <img src={capturedImage} alt="Baseline capture" className="w-full h-full object-cover rounded-2xl" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <button
                      onClick={handleRetake}
                      className="btn-secondary py-2 px-4.5 text-xs font-semibold flex items-center gap-2 shadow-md bg-white border-none text-gray-700"
                    >
                      <RotateCcw size={13} /> Retake
                    </button>
                  </div>
                </div>
              ) : cameraError ? (
                <div className="p-6 text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center text-primary border border-pink-100 mx-auto">
                    <Camera size={28} />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold max-w-xs mx-auto">{cameraError}</p>
                  <button onClick={triggerFileSelect} className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2 mx-auto">
                    <Upload size={14} /> Upload Selfie File
                  </button>
                </div>
              ) : (
                <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black shadow-inner">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <button
                      onClick={capturePhoto}
                      className="w-14 h-14 rounded-full bg-white border-4 border-pink-200 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title="Take Snapshot"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!capturedImage && (
              <div className="space-y-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider text-[9px]">or</span>
                <div>
                  <button
                    onClick={triggerFileSelect}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5 mx-auto border-none cursor-pointer bg-transparent"
                  >
                    <Upload size={13} /> Select from Gallery
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-pink-100/50">
              <button
                onClick={() => updateLastPath('/onboarding')}
                className="btn-secondary py-2.5 px-6 text-xs font-semibold flex items-center gap-2"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={() => updateLastPath('/onboarding/questionnaire')}
                className="btn-primary py-2.5 px-8 text-xs font-bold flex items-center gap-2 shadow-md"
              >
                Continue {capturedImage ? '' : '(Skip photo)'} <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Skin Assessment Questionnaire (3-step slider) */}
        {step === 'questionnaire' && (
          <div className="w-full max-w-2xl space-y-6">
            
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
              <span>Step {subStep} of 3</span>
              <span className="text-primary font-black">{Math.round((subStep / 3) * 100)}% Complete</span>
            </div>
            <div className="h-2 w-full bg-pink-100/40 rounded-full overflow-hidden border border-white/50 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${(subStep / 3) * 100}%` }}
              />
            </div>

            <div className="min-h-[350px] flex items-center justify-center">
              <AnimatePresence custom={direction} mode="wait">
                
                {/* Q1: Skin Type */}
                {subStep === 1 && (
                  <motion.div
                    key="q1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-800">What is your Skin Type? 🌿</h2>
                      <p className="text-xs text-gray-500">Pick the category that best matches your daily skin characteristics</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                      {skinTypes.map((type) => {
                        const isSelected = selectedSkinType === type.id;
                        return (
                          <motion.div
                            key={type.id}
                            whileHover={{ y: -3 }}
                            onClick={() => {
                              setSelectedSkinType(type.id);
                              localStorage.setItem('glowcare_user_skin_type', type.id);
                            }}
                            className={`glass-card p-4 text-center cursor-pointer flex flex-col justify-between h-44 border transition-all ${
                              isSelected
                                ? 'border-primary bg-primary-light/30 shadow-md ring-1 ring-primary/20'
                                : 'border-transparent'
                            }`}
                          >
                            <div>
                              <span className="text-3xl mb-2.5 block">{type.icon}</span>
                              <h4 className="font-extrabold text-xs mb-1.5 text-gray-800">{type.title}</h4>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">{type.desc}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Q2: Skin Concerns (Multi-Select) */}
                {subStep === 2 && (
                  <motion.div
                    key="q2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-800">Select Skin Concerns 🎯</h2>
                      <p className="text-xs text-gray-500">Pick one or more areas you would like to target (selected items turn pink)</p>
                    </div>

                    <div className="flex flex-wrap gap-3.5 justify-center max-w-xl mx-auto">
                      {concernsList.map((con) => {
                        const isSelected = selectedConcerns.includes(con.id);
                        return (
                          <button
                            key={con.id}
                            type="button"
                            onClick={() => {
                              let updated = [];
                              if (isSelected) {
                                updated = selectedConcerns.filter(c => c !== con.id);
                              } else {
                                updated = [...selectedConcerns, con.id];
                              }
                              setSelectedConcerns(updated);
                              localStorage.setItem('glowcare_user_concerns', JSON.stringify(updated));
                            }}
                            className={`px-5 py-3.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-primary border-primary text-white shadow-md'
                                : 'bg-white/40 border-pink-100/70 text-gray-500 hover:border-pink-200'
                            }`}
                          >
                            <span>{con.emoji}</span>
                            <span>{con.label}</span>
                            {isSelected && <Check className="text-white ml-1.5" size={13} />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Q3: Lifestyle Profile */}
                {subStep === 3 && (
                  <motion.div
                    key="q3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full space-y-6 max-w-xl mx-auto"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-800">Skincare & Lifestyle Habits 🌿</h2>
                      <p className="text-xs text-gray-500">Your daily habits play a key role in formulation recommendations</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">💧 Water Intake (Daily)</label>
                        <select
                          value={lifestyle.waterIntake}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLifestyle(prev => ({ ...prev, waterIntake: val }));
                            localStorage.setItem('glowcare_user_water_intake', val);
                          }}
                          className="w-full bg-white/50 border border-pink-100/50 rounded-xl p-3 text-xs text-gray-700 outline-none focus:border-primary"
                        >
                          <option value="< 1L">&lt; 1 Liter (Dehydrated)</option>
                          <option value="1-2L">1 - 2 Liters (Moderate)</option>
                          <option value="2-3L">2 - 3 Liters (Optimal)</option>
                          <option value="> 3L">&gt; 3 Liters (High)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">😴 Sleep Duration</label>
                        <select
                          value={lifestyle.sleepDuration}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLifestyle(prev => ({ ...prev, sleepDuration: val }));
                            localStorage.setItem('glowcare_user_sleep_duration', val);
                          }}
                          className="w-full bg-white/50 border border-pink-100/50 rounded-xl p-3 text-xs text-gray-700 outline-none focus:border-primary"
                        >
                          <option value="< 5 hours">&lt; 5 hours (Low)</option>
                          <option value="5-7 hours">5 - 7 hours (Moderate)</option>
                          <option value="7-9 hours">7 - 9 hours (Healthy)</option>
                          <option value="> 9 hours">&gt; 9 hours (High)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">☀️ Sunscreen Usage</label>
                        <select
                          value={lifestyle.sunscreenUsage}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLifestyle(prev => ({ ...prev, sunscreenUsage: val }));
                            localStorage.setItem('glowcare_user_sunscreen_usage', val);
                          }}
                          className="w-full bg-white/50 border border-pink-100/50 rounded-xl p-3 text-xs text-gray-700 outline-none focus:border-primary"
                        >
                          <option value="Daily">Daily (Highly Protected)</option>
                          <option value="Occasional">Occasional (Partially Protected)</option>
                          <option value="Never">Never (Exposed)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">💄 Makeup Usage</label>
                        <select
                          value={lifestyle.makeupUsage}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLifestyle(prev => ({ ...prev, makeupUsage: val }));
                            localStorage.setItem('glowcare_user_makeup_usage', val);
                          }}
                          className="w-full bg-white/50 border border-pink-100/50 rounded-xl p-3 text-xs text-gray-700 outline-none focus:border-primary"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Occasional">Occasional</option>
                          <option value="Never">Never</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">🚬 Smoking Status</label>
                        <select
                          value={lifestyle.smoking}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLifestyle(prev => ({ ...prev, smoking: val }));
                            localStorage.setItem('glowcare_user_smoking', val);
                          }}
                          className="w-full bg-white/50 border border-pink-100/50 rounded-xl p-3 text-xs text-gray-700 outline-none focus:border-primary"
                        >
                          <option value="No">No (Non-smoker)</option>
                          <option value="Yes">Yes (Smoker)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">🧠 Stress Levels</label>
                        <select
                          value={lifestyle.stressLevel}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLifestyle(prev => ({ ...prev, stressLevel: val }));
                            localStorage.setItem('glowcare_user_stress_level', val);
                          }}
                          className="w-full bg-white/50 border border-pink-100/50 rounded-xl p-3 text-xs text-gray-700 outline-none focus:border-primary"
                        >
                          <option value="Low">Low Stress</option>
                          <option value="Medium">Medium Stress</option>
                          <option value="High">High Stress</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-pink-100/50">
              <button
                onClick={handleBackSubStep}
                disabled={isSaving}
                className="btn-secondary py-2.5 px-6 text-xs font-semibold flex items-center gap-2"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={handleNextSubStep}
                disabled={isSaving}
                className="btn-primary py-2.5 px-8 text-xs font-bold flex items-center gap-2 shadow-md"
              >
                {isSaving ? 'Processing...' : subStep === 3 ? 'Complete & Analyze' : 'Next'} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Footer info */}
      <div className="max-w-5xl w-full mx-auto flex justify-between text-[10px] font-bold text-gray-400 z-10 pt-4 border-t border-pink-100/50">
        <span>GlowCare Smart Skincare Wizard</span>
        <span className="uppercase tracking-wider">
          {step === 'welcome' && 'Welcome Portal'}
          {step === 'camera' && 'Baseline Photography'}
          {step === 'questionnaire' && `Assessment Wizard (${subStep}/9)`}
        </span>
      </div>
    </div>
  );
};

export default OnboardingPage;
