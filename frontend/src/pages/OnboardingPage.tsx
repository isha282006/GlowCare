import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Upload, RotateCcw, Camera, Sparkles } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { authService, uploadService } from '../api/services';
import { generateSkinRecommendations } from '../utils/recommendationEngine';

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

const severityLevels = [
  { id: 'None', label: 'None', desc: 'No symptoms or issues' },
  { id: 'Mild', label: 'Mild', desc: 'Slight or occasional symptoms' },
  { id: 'Moderate', label: 'Moderate', desc: 'Noticeable symptoms regularly' },
  { id: 'Severe', label: 'Severe', desc: 'Intense or constant symptoms' }
];

const sensitiveOptions = [
  { id: 'Yes', label: 'Yes, easily irritated', icon: '🛡️' },
  { id: 'No', label: 'No, fairly resilient', icon: '🌿' }
];

const concernsList = [
  { id: 'acne', label: 'Acne & Breakouts', emoji: '🧼' },
  { id: 'pigmentation', label: 'Pigmentation & Dark Spots', emoji: '✨' },
  { id: 'tanning', label: 'Tanning & Sun Damage', emoji: '☀️' },
  { id: 'dehydration', label: 'Dehydration & Dullness', emoji: '💧' },
  { id: 'large_pores', label: 'Large Pores & Blackheads/Whiteheads', emoji: '🌓' },
  { id: 'fine_lines', label: 'Fine Lines & Wrinkles', emoji: '👵' },
  { id: 'redness', label: 'Redness & Uneven Skin Tone', emoji: '🍅' },
  { id: 'lip_pigmentation', label: 'Lip Pigmentation', emoji: '👄' },
  { id: 'dark_circles', label: 'Under-eye Dark Circles', emoji: '🐼' }
];

const goalsList = [
  { id: 'glow', label: 'Achieve Healthy Glow', emoji: '🌟' },
  { id: 'clear', label: 'Clear Up Breakouts', emoji: '🧼' },
  { id: 'hydrate', label: 'Deeply Hydrate Skin', emoji: '💧' },
  { id: 'balance', label: 'Balance Oil & Shine', emoji: '🌓' },
  { id: 'soothe', label: 'Soothe & Calm Redness', emoji: '🛡️' },
  { id: 'prevent', label: 'Prevent Premature Aging', emoji: '⏳' }
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
  const [acneLevel, setAcneLevel] = useState<string>(
    localStorage.getItem('glowcare_user_acne') || 'None'
  );
  const [pigmentationLevel, setPigmentationLevel] = useState<string>(
    localStorage.getItem('glowcare_user_pigmentation') || 'None'
  );
  const [darkCircles, setDarkCircles] = useState<string>(
    localStorage.getItem('glowcare_user_dark_circles') || 'None'
  );
  const [drynessLevel, setDrynessLevel] = useState<string>(
    localStorage.getItem('glowcare_user_dryness') || 'None'
  );
  const [oilinessLevel, setOilinessLevel] = useState<string>(
    localStorage.getItem('glowcare_user_oiliness') || 'None'
  );
  const [isSensitive, setIsSensitive] = useState<string>(
    localStorage.getItem('glowcare_user_sensitive') || 'No'
  );
  const [mainConcern, setMainConcern] = useState<string>(
    localStorage.getItem('glowcare_user_main_concern') || ''
  );
  const [mainGoal, setMainGoal] = useState<string>(
    localStorage.getItem('glowcare_user_main_goal') || ''
  );

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
    if (subStep === 8 && !mainConcern) {
      showToast('Please select your main skin concern!', 'warning');
      return;
    }
    if (subStep === 9 && !mainGoal) {
      showToast('Please select your main skin goal!', 'warning');
      return;
    }

    if (subStep === 9) {
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

  // Rule engine report generation
  const generateSkinReport = () => {
    return generateSkinRecommendations({
      skinType: selectedSkinType || 'normal',
      acne: acneLevel,
      pigmentation: pigmentationLevel,
      darkCircles,
      dryness: drynessLevel,
      oiliness: oilinessLevel,
      isSensitive,
      mainConcern,
      mainGoal
    });
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const calculatedReport = generateSkinReport();

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
          await uploadService.uploadProgressPhoto(formData);
        } catch (imgErr) {
          console.error('Failed to upload baseline selfie:', imgErr);
        }
      }

      // 2. Save report to User profile
      const response = await authService.updateProfile({
        skinReport: calculatedReport,
        onboardingCompleted: true
      });

      if (response.data.success) {
        updateUser(response.data.user);
        
        // 3. Save states in localStorage
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

        {/* STEP 3: Skin Assessment Questionnaire (9-step slider) */}
        {step === 'questionnaire' && (
          <div className="w-full max-w-2xl space-y-6">
            
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
              <span>Question {subStep} of 9</span>
              <span className="text-primary font-black">{Math.round((subStep / 9) * 100)}% Complete</span>
            </div>
            <div className="h-2 w-full bg-pink-100/40 rounded-full overflow-hidden border border-white/50 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${(subStep / 9) * 100}%` }}
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

                {/* Q2: Acne Severity */}
                {subStep === 2 && (
                  <motion.div
                    key="q2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full space-y-6 max-w-lg mx-auto"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-800">Acne & Breakouts 🧼</h2>
                      <p className="text-xs text-gray-500">How frequently do you notice blemishes or acne inflammation?</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {severityLevels.map((lvl) => {
                        const isSelected = acneLevel === lvl.id;
                        return (
                          <div
                            key={lvl.id}
                            onClick={() => {
                              setAcneLevel(lvl.id);
                              localStorage.setItem('glowcare_user_acne', lvl.id);
                            }}
                            className={`glass-card p-4 flex justify-between items-center cursor-pointer border transition-all ${
                              isSelected ? 'border-primary bg-primary-light/30' : 'border-transparent'
                            }`}
                          >
                            <div className="text-left">
                              <h4 className="font-extrabold text-xs text-gray-700">{lvl.label}</h4>
                              <p className="text-[10px] text-gray-400 mt-1 font-semibold">{lvl.desc}</p>
                            </div>
                            {isSelected && <Check className="text-primary text-lg flex-shrink-0" size={18} />}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Q3: Pigmentation Severity */}
                {subStep === 3 && (
                  <motion.div
                    key="q3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full space-y-6 max-w-lg mx-auto"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-800">Pigmentation & Sunspots ☀️</h2>
                      <p className="text-xs text-gray-500">Do you notice dark marks, post-acne blemishes, or melasma?</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {severityLevels.map((lvl) => {
                        const isSelected = pigmentationLevel === lvl.id;
                        return (
                          <div
                            key={lvl.id}
                            onClick={() => {
                              setPigmentationLevel(lvl.id);
                              localStorage.setItem('glowcare_user_pigmentation', lvl.id);
                            }}
                            className={`glass-card p-4 flex justify-between items-center cursor-pointer border transition-all ${
                              isSelected ? 'border-primary bg-primary-light/30' : 'border-transparent'
                            }`}
                          >
                            <div className="text-left">
                              <h4 className="font-extrabold text-xs text-gray-700">{lvl.label}</h4>
                              <p className="text-[10px] text-gray-400 mt-1 font-semibold">{lvl.desc}</p>
                            </div>
                            {isSelected && <Check className="text-primary text-lg flex-shrink-0" size={18} />}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Q4: Dark Circles */}
                {subStep === 4 && (
                  <motion.div
                    key="q4"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full space-y-6 max-w-lg mx-auto"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-800">Dark Circles & Puffiness 🐼</h2>
                      <p className="text-xs text-gray-500">Do you experience shadows or swelling around the eye area?</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {severityLevels.map((lvl) => {
                        const isSelected = darkCircles === lvl.id;
                        return (
                          <div
                            key={lvl.id}
                            onClick={() => {
                              setDarkCircles(lvl.id);
                              localStorage.setItem('glowcare_user_dark_circles', lvl.id);
                            }}
                            className={`glass-card p-4 flex justify-between items-center cursor-pointer border transition-all ${
                              isSelected ? 'border-primary bg-primary-light/30' : 'border-transparent'
                            }`}
                          >
                            <div className="text-left">
                              <h4 className="font-extrabold text-xs text-gray-700">{lvl.label}</h4>
                              <p className="text-[10px] text-gray-400 mt-1 font-semibold">{lvl.desc}</p>
                            </div>
                            {isSelected && <Check className="text-primary text-lg flex-shrink-0" size={18} />}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Q5: Dryness */}
                {subStep === 5 && (
                  <motion.div
                    key="q5"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full space-y-6 max-w-lg mx-auto"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-800">Skin Dryness & Tightness 💧</h2>
                      <p className="text-xs text-gray-500">Does your skin feel dehydrated, tight, or show dry flakes?</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {severityLevels.map((lvl) => {
                        const isSelected = drynessLevel === lvl.id;
                        return (
                          <div
                            key={lvl.id}
                            onClick={() => {
                              setDrynessLevel(lvl.id);
                              localStorage.setItem('glowcare_user_dryness', lvl.id);
                            }}
                            className={`glass-card p-4 flex justify-between items-center cursor-pointer border transition-all ${
                              isSelected ? 'border-primary bg-primary-light/30' : 'border-transparent'
                            }`}
                          >
                            <div className="text-left">
                              <h4 className="font-extrabold text-xs text-gray-700">{lvl.label}</h4>
                              <p className="text-[10px] text-gray-400 mt-1 font-semibold">{lvl.desc}</p>
                            </div>
                            {isSelected && <Check className="text-primary text-lg flex-shrink-0" size={18} />}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Q6: Oiliness */}
                {subStep === 6 && (
                  <motion.div
                    key="q6"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full space-y-6 max-w-lg mx-auto"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-800">Excessive Oil & Sebum 🍳</h2>
                      <p className="text-xs text-gray-500">How would you describe your skin's grease or shine levels?</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {severityLevels.map((lvl) => {
                        const isSelected = oilinessLevel === lvl.id;
                        return (
                          <div
                            key={lvl.id}
                            onClick={() => {
                              setOilinessLevel(lvl.id);
                              localStorage.setItem('glowcare_user_oiliness', lvl.id);
                            }}
                            className={`glass-card p-4 flex justify-between items-center cursor-pointer border transition-all ${
                              isSelected ? 'border-primary bg-primary-light/30' : 'border-transparent'
                            }`}
                          >
                            <div className="text-left">
                              <h4 className="font-extrabold text-xs text-gray-700">{lvl.label}</h4>
                              <p className="text-[10px] text-gray-400 mt-1 font-semibold">{lvl.desc}</p>
                            </div>
                            {isSelected && <Check className="text-primary text-lg flex-shrink-0" size={18} />}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Q7: Sensitive Skin */}
                {subStep === 7 && (
                  <motion.div
                    key="q7"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full space-y-6 max-w-lg mx-auto"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-800">Sensitive Skin Tendencies 🛡️</h2>
                      <p className="text-xs text-gray-500">Does your face burn, itch, or turn red easily when applying skincare?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {sensitiveOptions.map((opt) => {
                        const isSelected = isSensitive === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              setIsSensitive(opt.id);
                              localStorage.setItem('glowcare_user_sensitive', opt.id);
                            }}
                            className={`glass-card p-6 flex flex-col items-center justify-center cursor-pointer border h-36 gap-2 text-center transition-all ${
                              isSelected ? 'border-primary bg-primary-light/30' : 'border-transparent'
                            }`}
                          >
                            <span className="text-4xl">{opt.icon}</span>
                            <span className="font-extrabold text-xs text-gray-700">{opt.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Q8: Main Skin Concern */}
                {subStep === 8 && (
                  <motion.div
                    key="q8"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-800">Main Skin Concern 🎯</h2>
                      <p className="text-xs text-gray-500">What is the #1 issue you would like to target and solve?</p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center max-w-xl mx-auto">
                      {concernsList.map((con) => {
                        const isSelected = mainConcern === con.id;
                        return (
                          <button
                            key={con.id}
                            type="button"
                            onClick={() => {
                              setMainConcern(con.id);
                              localStorage.setItem('glowcare_user_main_concern', con.id);
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

                {/* Q9: Skin Goal */}
                {subStep === 9 && (
                  <motion.div
                    key="q9"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-800">What is your Ultimate Goal? 🌸</h2>
                      <p className="text-xs text-gray-500">Define the core success state you want to achieve</p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center max-w-xl mx-auto">
                      {goalsList.map((gl) => {
                        const isSelected = mainGoal === gl.id;
                        return (
                          <button
                            key={gl.id}
                            type="button"
                            onClick={() => {
                              setMainGoal(gl.id);
                              localStorage.setItem('glowcare_user_main_goal', gl.id);
                            }}
                            className={`px-5 py-3.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-primary border-primary text-white shadow-md'
                                : 'bg-white/40 border-pink-100/70 text-gray-500 hover:border-pink-200'
                            }`}
                          >
                            <span>{gl.emoji}</span>
                            <span>{gl.label}</span>
                            {isSelected && <Check className="text-white ml-1.5" size={13} />}
                          </button>
                        );
                      })}
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
                {isSaving ? 'Processing...' : subStep === 9 ? 'Complete & Analyze' : 'Next'} <ArrowRight size={14} />
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
