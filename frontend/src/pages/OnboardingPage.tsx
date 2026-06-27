import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiCheck, FiUpload, FiRefreshCw } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { photoService, authService } from '../api/services';

interface OnboardingPageProps {
  step: 'welcome' | 'camera' | 'questionnaire';
}

const skinTypes = [
  { id: 'oily', title: 'Oily Skin', icon: '✨', desc: 'Larger pores, excess sebum, and shiny appearance.' },
  { id: 'dry', title: 'Dry Skin', icon: '🧴', desc: 'Feels tight, rough, and might flake or scale.' },
  { id: 'combination', title: 'Combination Skin', icon: '🌓', desc: 'Oily T-zone (forehead, nose) but dry cheeks.' },
  { id: 'sensitive', title: 'Sensitive Skin', icon: '🛡️', desc: 'Easily irritated, prone to redness or burning.' },
  { id: 'normal', title: 'Normal Skin', icon: '🌿', desc: 'Balanced hydration, small pores, and minimal concerns.' }
];

const skinConcerns = [
  { id: 'acne', label: 'Acne & Breakouts', emoji: '🧼' },
  { id: 'pigmentation', label: 'Pigmentation & Spots', emoji: '✨' },
  { id: 'oiliness', label: 'Oil Control', emoji: '💧' },
  { id: 'redness', label: 'Redness & Rosacea', emoji: '🍅' },
  { id: 'aging', label: 'Aging & Fine Lines', emoji: '👵' },
  { id: 'pores', label: 'Enlarged Pores', emoji: '🔍' },
  { id: 'dullness', label: 'Dullness', emoji: '💡' }
];

const OnboardingPage: React.FC<OnboardingPageProps> = ({ step }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { updateUser } = useAuth();

  // Resume unfinished steps handler
  useEffect(() => {
    const lastPath = localStorage.getItem('glowcare_onboarding_last_path');
    if (lastPath && lastPath !== location.pathname) {
      navigate(lastPath);
    } else if (!lastPath) {
      localStorage.setItem('glowcare_onboarding_last_path', location.pathname);
    }
  }, [location.pathname, navigate]);

  // Set local state paths
  const updateLastPath = (path: string) => {
    localStorage.setItem('glowcare_onboarding_last_path', path);
    navigate(path);
  };

  // Questionnaire Sub-steps state (1 to 5)
  const [subStep, setSubStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Onboarding answers state
  const [selectedSkinType, setSelectedSkinType] = useState<string | null>(
    localStorage.getItem('glowcare_user_skin_type') || null
  );
  const [acneLevel, setAcneLevel] = useState<string>(
    localStorage.getItem('glowcare_user_acne') || 'none'
  );
  const [pigmentationLevel, setPigmentationLevel] = useState<string>(
    localStorage.getItem('glowcare_user_pigmentation') || 'none'
  );
  const [sunscreenUse, setSunscreenUse] = useState<string>(
    localStorage.getItem('glowcare_user_sunscreen') || 'daily'
  );
  const [routineConsistency, setRoutineConsistency] = useState<string>(
    localStorage.getItem('glowcare_user_routine_consistency') || 'always'
  );
  
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    JSON.parse(localStorage.getItem('glowcare_user_concerns') || '[]')
  );
  const [waterGoal, setWaterGoal] = useState<number>(
    Number(localStorage.getItem('glowcare_user_water_goal') || '2.0')
  );
  const [sleepGoal, setSleepGoal] = useState<number>(
    Number(localStorage.getItem('glowcare_user_sleep_goal') || '8')
  );

  // Camera state
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
      setCameraError('Camera access is required for progress tracking. You can also upload a photo from your device.');
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

  const handleSkip = () => {
    updateLastPath('/onboarding/camera');
  };

  const handleNextSubStep = () => {
    if (subStep === 1 && !selectedSkinType) {
      showToast('Please select your skin type!', 'warning');
      return;
    }
    setDirection(1);
    setSubStep((prev) => prev + 1);
  };

  const handleBackSubStep = () => {
    setDirection(-1);
    setSubStep((prev) => prev - 1);
  };

  const toggleConcern = (id: string) => {
    setSelectedConcerns((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('glowcare_user_concerns', JSON.stringify(updated));
      return updated;
    });
  };

  // Helper to generate the exact rule-based skin report
  const generateSkinReport = () => {
    let score = 100;
    if (acneLevel === 'frequent') score -= 10;
    if (acneLevel === 'severe') score -= 20;
    if (pigmentationLevel === 'moderate') score -= 8;
    if (pigmentationLevel === 'severe') score -= 15;
    if (sunscreenUse === 'never') score -= 10;
    if (waterGoal < 1.0) score -= 5;
    if (sleepGoal < 6) score -= 5;
    if (routineConsistency === 'rarely') score -= 10;
    if (routineConsistency === 'never') score -= 20;
    score = Math.max(30, Math.min(100, score));

    const finalAcneLevel = acneLevel === 'severe' ? 'Severe' : acneLevel === 'frequent' ? 'Moderate' : 'Low';
    const finalPigmentationLevel = pigmentationLevel === 'severe' ? 'Severe' : pigmentationLevel === 'moderate' ? 'Moderate' : 'Low';
    const hydration = (selectedSkinType === 'dry' || waterGoal < 1.0) ? 'Low' : 'Good';
    const oiliness = selectedSkinType === 'oily' ? 'High' : selectedSkinType === 'combination' ? 'Moderate' : 'Low';
    const sensitivity = selectedSkinType === 'sensitive' ? 'High' : 'Low';

    const recs: string[] = [];
    const morningRoutine = ['Gentle Cleanser'];
    const nightRoutine = ['Cleanser'];

    if (selectedSkinType === 'oily') {
      morningRoutine[0] = 'Oil-Free Cleanser';
      morningRoutine.push('Gel Moisturizer');
      morningRoutine.push('Niacinamide');
      recs.push('Use light gel-based formulations to prevent pore clogging.');
    }
    if (selectedSkinType === 'dry') {
      morningRoutine[0] = 'Cream Cleanser';
      morningRoutine.push('Ceramide Moisturizer');
      morningRoutine.push('Hyaluronic Acid');
      recs.push('Incorporate rich moisturizers to restore lipid balance.');
    }
    if (selectedSkinType === 'sensitive') {
      recs.push('Always select fragrance-free skincare products.');
      morningRoutine[0] = 'Gentle Cleanser';
      morningRoutine.push('Ceramide Moisturizer');
    }

    if (acneLevel === 'frequent' || acneLevel === 'severe') {
      recs.push('Salicylic Acid (BHA) for deep pore exfoliation.');
      recs.push('Benzoyl Peroxide to kill acne-causing bacteria.');
      nightRoutine.push('Salicylic Acid');
      nightRoutine.push('Benzoyl Peroxide Treatment');
    }

    if (pigmentationLevel === 'moderate' || pigmentationLevel === 'severe') {
      recs.push('Vitamin C in the morning to inhibit melanin production.');
      recs.push('Niacinamide to reduce hyperpigmentation transfers.');
      morningRoutine.push('Vitamin C');
      morningRoutine.push('Niacinamide');
    }

    morningRoutine.push('Sunscreen SPF 50');
    nightRoutine.push('Moisturizer');

    const healthyHabits = [
      '💧 Drink at least 2L of water',
      '😴 Sleep 7–8 hours',
      '☀️ Apply sunscreen every morning',
      '🥗 Eat fruits and vegetables',
      '🧘 Reduce stress'
    ];

    const weeklyGoals = {
      morningRoutine: '0/7',
      nightRoutine: '0/7',
      drinkWater: '0/7',
      sleepHours: '0/7'
    };

    const warnings: string[] = [];
    if (sunscreenUse === 'never') {
      warnings.push('Daily sunscreen is highly recommended to prevent pigmentation and premature aging.');
    }
    if (waterGoal < 1.0) {
      warnings.push('You should drink more water to keep your skin hydrated.');
    }
    if (sleepGoal < 6) {
      warnings.push('Better sleep improves skin repair and reduces dark circles.');
    }

    return {
      skinScore: score,
      skinType: (selectedSkinType || 'normal').charAt(0).toUpperCase() + (selectedSkinType || 'normal').slice(1),
      acneLevel: finalAcneLevel,
      pigmentationLevel: finalPigmentationLevel,
      hydration,
      oiliness,
      sensitivity,
      recommendations: recs,
      generatedRoutine: {
        morning: Array.from(new Set(morningRoutine)),
        night: Array.from(new Set(nightRoutine))
      },
      healthyHabits,
      weeklyGoals,
      warnings,
      waterGoal,
      sleepGoal
    };
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      // 1. Calculate skin report
      const calculatedReport = generateSkinReport();

      // 2. Upload captured image if available
      if (capturedImage && capturedImage.startsWith('data:')) {
        try {
          const blob = dataURLtoBlob(capturedImage);
          const file = new File([blob], 'baseline_selfie.jpg', { type: 'image/jpeg' });
          const formData = new FormData();
          formData.append('image', file);
          formData.append('category', 'before');
          formData.append('date', new Date().toISOString().split('T')[0]);
          formData.append('notes', 'Baseline Skincare Selfie (Onboarding)');
          await photoService.upload(formData);
        } catch (imgErr) {
          console.error('Failed to upload onboarding image:', imgErr);
        }
      }

      // 3. Save everything to backend User document
      const response = await authService.updateProfile({
        skinReport: calculatedReport,
        onboardingCompleted: true
      });

      if (response.data.success) {
        updateUser(response.data.user);
        
        // 4. Update localStorage parameters
        localStorage.setItem('glowcare_onboarding_completed', 'true');
        localStorage.removeItem('glowcare_onboarding_last_path');
        
        showToast('Onboarding completed successfully! 🌟', 'success');
        navigate('/onboarding/report');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to complete onboarding profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Slide animation config
  const slideVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeInOut' }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    })
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between p-6 relative overflow-hidden"
      style={{
        background: isDark
          ? 'radial-gradient(circle at 10% 20%, #1A1A2E 0%, #0F0F1A 100%)'
          : 'linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #FFF5F7 100%)'
      }}
    >
      {/* Background shape overlays */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-soft-pink/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-lavender/25 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-bold text-lg gradient-text">GlowCare</span>
        </div>
        
        {step !== 'welcome' && (
          <div className="flex items-center gap-1.5">
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 'camera' ? 'w-8 bg-lavender' : 'w-2 bg-lavender/30'}`} />
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 'questionnaire' ? 'w-8 bg-lavender' : 'w-2 bg-lavender/30'}`} />
          </div>
        )}
      </div>

      {/* Main slider body */}
      <div className="flex-1 max-w-5xl w-full mx-auto flex items-center justify-center my-6 z-10">
        
        {/* STEP 1: Welcome page */}
        {step === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full"
          >
            <div className="space-y-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: 'rgba(200, 182, 255, 0.2)',
                  color: 'var(--color-lavender-dark)',
                  border: '1px solid rgba(200, 182, 255, 0.4)'
                }}
              >
                🧴 Personal Skincare Management Platform
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                Welcome to <br />
                <span className="gradient-text">GlowCare</span>
              </h1>
              <p className="text-sm md:text-base leading-relaxed text-gray-500 dark:text-dark-muted">
                Let's understand your skin before creating your personalized skincare journey.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <button onClick={() => updateLastPath('/onboarding/camera')} className="btn-primary py-3 px-8 text-sm flex items-center gap-2">
                  Get Started <FiArrowRight />
                </button>
                <button onClick={handleSkip} className="btn-secondary py-3 px-6 text-sm">
                  Skip for Now
                </button>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center relative">
              <div
                className="w-72 h-72 rounded-full relative flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(200, 182, 255, 0.2) 0%, rgba(255, 214, 231, 0.2) 100%)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="w-40 h-40 rounded-full bg-white/70 dark:bg-dark-card/70 flex items-center justify-center text-6xl shadow-inner border border-lavender/30">
                  ✨
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Camera Capture */}
        {step === 'camera' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-6 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold">Capture Your Skin 📸</h2>
              <p className="text-xs text-gray-500">Take a clear selfie in natural lighting to keep track of your skincare journey.</p>
            </div>

            <div className="glass-card p-4 flex flex-col items-center justify-center relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-lavender/30">
              {capturedImage ? (
                <div className="w-full h-full relative">
                  <img src={capturedImage} alt="Skin capture" className="w-full h-full object-cover rounded-2xl" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <button
                      onClick={handleRetake}
                      className="btn-secondary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-md"
                      style={{ background: 'white' }}
                    >
                      <FiRefreshCw size={12} /> Retake Photo
                    </button>
                  </div>
                </div>
              ) : cameraError ? (
                <div className="p-6 text-center space-y-4">
                  <span className="text-4xl">⚠️</span>
                  <p className="text-xs text-red-500 leading-relaxed font-semibold">{cameraError}</p>
                  <button onClick={triggerFileSelect} className="btn-primary py-2 px-5 text-xs flex items-center gap-2 mx-auto">
                    <FiUpload size={14} /> Upload From Gallery
                  </button>
                </div>
              ) : (
                <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <button
                      onClick={capturePhoto}
                      className="w-14 h-14 rounded-full bg-white border-4 border-lavender flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title="Capture Selfie"
                    >
                      <div className="w-8 h-8 rounded-full bg-soft-pink" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!capturedImage && (
              <div className="space-y-2">
                <span className="text-xs text-gray-400">or</span>
                <div>
                  <button
                    onClick={triggerFileSelect}
                    className="text-xs text-lavender-dark font-extrabold hover:underline flex items-center gap-1.5 mx-auto border-none cursor-pointer bg-transparent"
                  >
                    <FiUpload size={13} /> Upload From Gallery
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button onClick={() => updateLastPath('/onboarding')} className="btn-secondary py-2.5 px-6 text-sm flex items-center gap-1">
                <FiArrowLeft /> Back
              </button>
              <button
                onClick={() => updateLastPath('/onboarding/questionnaire')}
                disabled={!capturedImage}
                className="btn-primary py-2.5 px-8 text-sm flex items-center gap-1"
              >
                Continue <FiArrowRight />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Skin Assessment Questionnaire (with 5 sub-steps) */}
        {step === 'questionnaire' && (
          <div className="w-full max-w-2xl space-y-6">
            <AnimatePresence custom={direction} mode="wait">
              
              {/* SubStep 1: Skin Type */}
              {subStep === 1 && (
                <motion.div
                  key="substep1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold">What is your Skin Type? 🌿</h2>
                    <p className="text-xs text-gray-500">Choose the option that matches your skin's daily behavior</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {skinTypes.map((type) => {
                      const isSelected = selectedSkinType === type.id;
                      return (
                        <motion.div
                          key={type.id}
                          whileHover={{ y: -2 }}
                          onClick={() => {
                            setSelectedSkinType(type.id);
                            localStorage.setItem('glowcare_user_skin_type', type.id);
                          }}
                          className={`glass-card p-4 text-center cursor-pointer flex flex-col justify-between h-44 ${
                            isSelected ? 'border-lavender bg-lavender/10 shadow-sm' : 'border-transparent'
                          }`}
                        >
                          <div>
                            <span className="text-3xl mb-2 block">{type.icon}</span>
                            <h4 className="font-bold text-xs mb-1">{type.title}</h4>
                          </div>
                          <p className="text-[10px] text-gray-500 leading-relaxed">{type.desc}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button onClick={() => updateLastPath('/onboarding/camera')} className="btn-secondary py-2.5 px-6 text-sm flex items-center gap-1">
                      <FiArrowLeft /> Back
                    </button>
                    <button onClick={handleNextSubStep} className="btn-primary py-2.5 px-8 text-sm flex items-center gap-1">
                      Next <FiArrowRight />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SubStep 2: Skincare Habits Diagnostics */}
              {subStep === 2 && (
                <motion.div
                  key="substep2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 max-w-md mx-auto"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold">Skincare Diagnostics Questions 🔬</h2>
                    <p className="text-xs text-gray-500">Fill in details to calculate your overall health stats</p>
                  </div>

                  <div className="glass-card p-6 space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500">Acne Frequency:</label>
                      <select
                        value={acneLevel}
                        onChange={(e) => {
                          setAcneLevel(e.target.value);
                          localStorage.setItem('glowcare_user_acne', e.target.value);
                        }}
                        className="input-field py-2 text-xs"
                      >
                        <option value="none">None (Clear skin)</option>
                        <option value="occasional">Occasional breakout</option>
                        <option value="frequent">Frequent blemishes</option>
                        <option value="severe">Severe / Inflammatory breakouts</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500">Pigmentation & Spots:</label>
                      <select
                        value={pigmentationLevel}
                        onChange={(e) => {
                          setPigmentationLevel(e.target.value);
                          localStorage.setItem('glowcare_user_pigmentation', e.target.value);
                        }}
                        className="input-field py-2 text-xs"
                      >
                        <option value="none">None (Even skin tone)</option>
                        <option value="mild">Mild (Slight sunspots)</option>
                        <option value="moderate">Moderate hyperpigmentation</option>
                        <option value="severe">Severe / Dark pigment clusters</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500">Sunscreen Application Frequency:</label>
                      <select
                        value={sunscreenUse}
                        onChange={(e) => {
                          setSunscreenUse(e.target.value);
                          localStorage.setItem('glowcare_user_sunscreen', e.target.value);
                        }}
                        className="input-field py-2 text-xs"
                      >
                        <option value="daily">Daily SPF 50 application</option>
                        <option value="occasionally">Occasionally when going outdoors</option>
                        <option value="never">Never use sunscreen</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500">Skincare Routine Consistency:</label>
                      <select
                        value={routineConsistency}
                        onChange={(e) => {
                          setRoutineConsistency(e.target.value);
                          localStorage.setItem('glowcare_user_routine_consistency', e.target.value);
                        }}
                        className="input-field py-2 text-xs"
                      >
                        <option value="always">Always consistent (Morning & Night)</option>
                        <option value="sometimes">Sometimes consistent</option>
                        <option value="rarely">Rarely follows routine steps</option>
                        <option value="never">Never follows routine steps</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button onClick={handleBackSubStep} className="btn-secondary py-2.5 px-6 text-sm flex items-center gap-1">
                      <FiArrowLeft /> Back
                    </button>
                    <button onClick={handleNextSubStep} className="btn-primary py-2.5 px-8 text-sm flex items-center gap-1">
                      Next <FiArrowRight />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SubStep 3: Skin Concerns */}
              {subStep === 3 && (
                <motion.div
                  key="substep3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 max-w-xl mx-auto"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold">Select Skin Concerns 🎯</h2>
                    <p className="text-xs text-gray-500">Select any target elements you want to prioritize (select multiple)</p>
                  </div>

                  <div className="flex flex-wrap gap-2.5 justify-center">
                    {skinConcerns.map((concern) => {
                      const isSelected = selectedConcerns.includes(concern.id);
                      return (
                        <button
                          key={concern.id}
                          type="button"
                          onClick={() => toggleConcern(concern.id)}
                          className={`px-4 py-3 rounded-2xl text-xs font-semibold cursor-pointer border transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-lavender border-lavender text-lavender-dark'
                              : 'bg-white/70 dark:bg-dark-card/70 border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                          style={{ background: isSelected ? undefined : 'rgba(255,255,255,0.7)' }}
                        >
                          <span>{concern.emoji}</span>
                          {concern.label}
                          {isSelected && <FiCheck className="text-lavender-dark ml-1" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button onClick={handleBackSubStep} className="btn-secondary py-2.5 px-6 text-sm flex items-center gap-1">
                      <FiArrowLeft /> Back
                    </button>
                    <button onClick={handleNextSubStep} className="btn-primary py-2.5 px-8 text-sm flex items-center gap-1">
                      Next <FiArrowRight />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SubStep 4: Target Goals */}
              {subStep === 4 && (
                <motion.div
                  key="substep4"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 max-w-md mx-auto"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold">Set Daily Habits Targets 💧</h2>
                    <p className="text-xs text-gray-500">Configure daily goals to correlate with skincare regeneration cycles</p>
                  </div>

                  <div className="space-y-6 glass-card p-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span>💧 Daily Water Intake target</span>
                        <span className="text-lavender-dark font-extrabold">{waterGoal.toFixed(1)} Liters</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="4.0"
                        step="0.1"
                        value={waterGoal}
                        onChange={(e) => {
                          setWaterGoal(Number(e.target.value));
                          localStorage.setItem('glowcare_user_water_goal', e.target.value);
                        }}
                        className="w-full accent-lavender"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span>😴 Daily Sleep Hours target</span>
                        <span className="text-lavender-dark font-extrabold">{sleepGoal} Hours</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="10"
                        value={sleepGoal}
                        onChange={(e) => {
                          setSleepGoal(Number(e.target.value));
                          localStorage.setItem('glowcare_user_sleep_goal', e.target.value);
                        }}
                        className="w-full accent-lavender"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button onClick={handleBackSubStep} className="btn-secondary py-2.5 px-6 text-sm flex items-center gap-1">
                      <FiArrowLeft /> Back
                    </button>
                    <button onClick={handleNextSubStep} className="btn-primary py-2.5 px-8 text-sm flex items-center gap-1">
                      Next <FiArrowRight />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SubStep 5: Completion Summary */}
              {subStep === 5 && (
                <motion.div
                  key="substep5"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 max-w-sm mx-auto text-center glass-card p-8"
                >
                  <div className="text-6xl animate-bounce">✨🎉</div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold">Form Completed!</h2>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      We are ready to compile and save your skincare diagnostics report to your user profile document.
                    </p>
                  </div>

                  <button
                    onClick={handleFinish}
                    disabled={isSaving}
                    className="btn-primary w-full py-3 text-sm font-extrabold flex items-center justify-center gap-1"
                  >
                    {isSaving ? 'Saving & Generating Report...' : 'Generate Skincare Report'} <FiArrowRight />
                  </button>

                  <div className="pt-2">
                    <button
                      onClick={handleBackSubStep}
                      disabled={isSaving}
                      className="text-xs text-gray-400 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Go Back & Review Answers
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="max-w-5xl w-full mx-auto flex justify-between text-[10px] text-gray-400 z-10 pt-4 border-t border-gray-100/10">
        <span>GlowCare Skincare Wizard</span>
        <span>
          {step === 'welcome' && 'Welcome step'}
          {step === 'camera' && 'Selfie Capture step'}
          {step === 'questionnaire' && `Questionnaire step (${subStep}/5)`}
        </span>
      </div>
    </div>
  );
};

export default OnboardingPage;
