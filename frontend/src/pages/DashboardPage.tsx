import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  Sun, Book, Plus, FileText, Award, Package, AlertTriangle,
  CheckSquare, Sparkles, Calendar, Droplet, Moon,
  TrendingUp, Compass, ArrowRight, Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { analyticsService, routineService, photoService, productService, journalService, authService } from '../api/services';
import AvatarManager from '../components/AvatarManager';
import { BACKEND_URL } from '../api/axios';
import { LoadingSkeleton } from '../components/ui';
import type { DashboardStats, WeeklyActivity, Routine, Product, JournalEntry, Photo } from '../types';
import { generateRoutineSteps, productDatabase } from '../utils/recommendationEngine';
import type { RecommendedProduct } from '../utils/recommendationEngine';

const COLORS = ['#FFC7DE', '#E8DBFF', '#D8F3DC', '#CAF0F8', '#FFD6E7', '#F472B6'];

const skincareTips = [
  { title: "Double Cleansing", text: "Start with an oil-based cleanser to dissolve sebum, followed by a gentle gel cleanser to wash away impurities." },
  { title: "Sunscreen is Non-Negotiable", text: "Apply SPF 30+ daily, even indoors. UV rays penetrate window glass and accelerate skin aging." },
  { title: "Layering Active Ingredients", text: "Apply your skincare from thinnest consistency (toner, serum) to thickest (moisturizer, facial oils)." },
  { title: "Hydration vs. Moisture", text: "Dehydrated skin lacks water and needs hyaluronic acid. Dry skin lacks oil and needs ceramide barrier creams." },
  { title: "Don't Forget the Neck", text: "The neck and chest show signs of aging just as quickly as the face. Extend your entire routine downwards." }
];

const SkincareIllustration = () => (
  <svg className="w-52 h-52 hidden md:block select-none drop-shadow-md" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#FEF08A" />
      </linearGradient>
      <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.75)" />
        <stop offset="100%" stopColor="rgba(255, 199, 222, 0.25)" />
      </linearGradient>
      <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FF5FA2" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#F472B6" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    {/* Floating leaf 1 */}
    <motion.path
      d="M30 60 C35 45, 55 45, 60 55 C50 65, 35 65, 30 60 Z"
      fill="#B7E4BE"
      opacity="0.85"
      animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Floating leaf 2 */}
    <motion.path
      d="M140 140 C145 125, 165 125, 170 135 C160 145, 145 145, 140 140 Z"
      fill="#B7E4BE"
      opacity="0.7"
      animate={{ y: [0, 8, 0], rotate: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />
    {/* Sparkles */}
    <motion.path
      d="M25 110 L28 113 L33 114 L28 115 L25 118 L24 115 L19 114 L24 113 Z"
      fill="url(#goldGrad)"
      animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.path
      d="M165 45 L167 47 L171 48 L167 49 L165 52 L163 49 L159 48 L163 47 Z"
      fill="url(#goldGrad)"
      animate={{ scale: [1.2, 0.8, 1.2], opacity: [1, 0.4, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
    />
    {/* Bottle */}
    <g transform="translate(55, 15)">
      <ellipse cx="45" cy="150" rx="30" ry="7" fill="rgba(255, 95, 162, 0.08)" />
      <rect x="20" y="70" width="50" height="65" rx="10" fill="url(#liquidGrad)" />
      <rect x="16" y="65" width="58" height="78" rx="15" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <path d="M17 102 C 28 98, 40 105, 52 101 C 64 97, 73 102, 73 102 L 73 133 C 73 137, 68 141, 62 141 L 28 141 C 22 141, 17 137, 17 133 Z" fill="url(#liquidGrad)" opacity="0.35" />
      <rect x="33" y="48" width="24" height="17" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.7)" />
      <rect x="30" y="40" width="30" height="8" rx="2" fill="url(#goldGrad)" />
      <path d="M34 40 C 34 26, 56 26, 56 40 Z" fill="#FFF0F6" stroke="rgba(255, 199, 222, 0.5)" />
      <rect x="43" y="58" width="4" height="58" rx="1" fill="rgba(255, 255, 255, 0.85)" />
      <motion.circle
        cx="45"
        cy="122"
        r="4"
        fill="#FF5FA2"
        animate={{ y: [0, 32, 0], scale: [1, 1.3, 0.6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <path d="M45 88 L47 91 L51 92 L47 93 L45 96 L43 93 L39 92 L43 91 Z" fill="url(#goldGrad)" opacity="0.9" />
    </g>
  </svg>
);

const EmptySkincareRoutineIllustration = () => (
  <svg className="w-24 h-24 mx-auto mb-4 drop-shadow-sm select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="rgba(255, 199, 222, 0.15)" stroke="rgba(255, 95, 162, 0.15)" strokeWidth="1.5" />
    <motion.path
      d="M50 20 L53 28 L61 30 L53 32 L50 40 L47 32 L39 30 L47 28 Z"
      fill="#FF5FA2"
      animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <circle cx="50" cy="65" r="12" fill="rgba(255, 255, 255, 0.8)" stroke="#FF5FA2" strokeWidth="1.5" />
    <path d="M46 62 C48 64, 52 64, 54 62" stroke="#FF5FA2" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M30 65 C32 50, 42 45, 50 45 C58 45, 68 50, 70 65" stroke="#C8B6FF" strokeWidth="1.5" strokeDasharray="3 3" />
  </svg>
);

const DashboardPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weekly, setWeekly] = useState<WeeklyActivity[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [latestPhoto, setLatestPhoto] = useState<string | null>(null);
  const [progressPhotos, setProgressPhotos] = useState<Photo[]>([]);
  const [productsOwnedCount, setProductsOwnedCount] = useState(0);
  const [expiringProducts, setExpiringProducts] = useState<Product[]>([]);
  const [nextExpiringProduct, setNextExpiringProduct] = useState<string | null>(null);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [productCategoryData, setProductCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChecklistTab, setActiveChecklistTab] = useState<'morning' | 'night'>('morning');
  const [progressNotes, setProgressNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (user?.skinReport?.progressNotes) {
      setProgressNotes(user.skinReport.progressNotes);
    }
  }, [user]);

  const handleSaveNotes = async () => {
    if (!user?.skinReport) return;
    setSavingNotes(true);
    try {
      const updatedReport = {
        ...user.skinReport,
        progressNotes: progressNotes
      };
      const res = await authService.updateProfile({ skinReport: updatedReport });
      if (res.data.success) {
        updateUser(res.data.user);
        showToast('Progress notes saved successfully! 📝', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save progress notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const handleReplaceProduct = async (routineId: string, stepId: string, newProductName: string) => {
    try {
      const targetRoutine = routines.find(r => r._id === routineId);
      if (!targetRoutine) return;
      const updatedSteps = targetRoutine.steps.map(s => {
        if (s._id === stepId) {
          return { ...s, productName: newProductName };
        }
        return s;
      });
      const res = await routineService.update(routineId, { steps: updatedSteps });
      if (res.data.success) {
        setRoutines(prev => prev.map(r => r._id === routineId ? res.data.data : r));
        showToast('Routine step product updated successfully! 🧴', 'success');
      }
    } catch (err) {
      console.error('Failed to update product in routine:', err);
      showToast('Failed to update product in routine', 'error');
    } finally {
      setEditingStepId(null);
    }
  };

  const handleRegenerateRoutine = async () => {
    if (!user?.skinReport) {
      showToast('Please complete skin diagnostics onboarding first!', 'warning');
      return;
    }
    setRegenerating(true);
    try {
      const r = user.skinReport;
      let morningSteps = [];
      let nightSteps = [];

      if (r.routine) {
        morningSteps = r.routine.morning.map((step: any) => ({
          order: step.order,
          stepType: step.category || step.stepType,
          productName: `${step.brand} ${step.name || step.productName}`,
          completed: false
        }));

        nightSteps = r.routine.night.map((step: any) => ({
          order: step.order,
          stepType: step.category === 'Eye Care' ? 'Eye Cream' : step.category === 'Lip Care' ? 'Lip Balm' : (step.category || step.stepType),
          productName: `${step.brand} ${step.name || step.productName}`,
          completed: false
        }));
      } else {
        const dryVal = r.drynessLevel || 'None';
        const oilVal = r.oilinessLevel || 'None';
        const acneVal = r.acneLevel || 'None';
        const pigVal = r.pigmentationLevel || 'None';
        const dcVal = r.darkCircles || 'None';
        const sensVal = r.isSensitive || 'No';

        const { morning, night } = generateRoutineSteps(
          r.skinType.toLowerCase(),
          acneVal === 'None' ? 'No' : 'Yes',
          pigVal === 'None' ? 'No' : 'Yes',
          r.mainConcern === 'pigmentation' || r.mainConcern === 'dark_spots' ? 'Yes' : 'No',
          r.mainConcern === 'lip_pigmentation' ? 'Yes' : 'No',
          dcVal === 'None' ? 'No' : 'Yes',
          r.mainConcern === 'fine_lines' ? 'Yes' : 'No',
          dryVal,
          oilVal,
          sensVal
        );

        morningSteps = morning.map(step => ({
          order: step.order,
          stepType: step.category,
          productName: `${step.brand} ${step.name}`,
          completed: false
        }));

        nightSteps = night.map(step => ({
          order: step.order,
          stepType: step.category === 'Eye Care' ? 'Eye Cream' : step.category === 'Lip Care' ? 'Lip Balm' : step.category,
          productName: `${step.brand} ${step.name}`,
          completed: false
        }));
      }

      await Promise.all([
        routineService.create({ type: 'morning', steps: morningSteps }),
        routineService.create({ type: 'night', steps: nightSteps })
      ]);

      await fetchDashboardData();
      showToast('Skincare routine regenerated successfully! 🔄', 'success');
    } catch (err) {
      console.error('Failed to regenerate routine:', err);
      showToast('Failed to regenerate routine', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, weeklyRes, routinesRes, photosRes, productsRes, journalRes] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getWeekly(),
        routineService.getAll(),
        photoService.getAll(),
        productService.getAll({ limit: '100' }),
        journalService.getAll({ limit: '3' })
      ]);
      
      setStats(statsRes.data.data);
      setWeekly(weeklyRes.data.data);
      setRoutines(routinesRes.data.data);
      setRecentEntries(journalRes.data.data);
      
      if (photosRes.data?.data) {
        const sortedPhotos = [...photosRes.data.data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setProgressPhotos(sortedPhotos);
        if (sortedPhotos.length > 0) {
          setLatestPhoto(sortedPhotos[0].image);
        }
      }

      if (productsRes.data?.data) {
        setProductsOwnedCount(productsRes.data.data.length);
        
        const expiring = productsRes.data.data.filter(
          p => p.status === 'expiring' || p.status === 'expired'
        );
        setExpiringProducts(expiring);

        const activeProducts = productsRes.data.data.filter(p => p.status !== 'expired' && p.expiryDate);
        if (activeProducts.length > 0) {
          activeProducts.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
          const soonest = activeProducts[0];
          const daysLeft = Math.ceil((new Date(soonest.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          setNextExpiringProduct(`${soonest.name} (${daysLeft > 0 ? `${daysLeft} days` : 'today'})`);
        } else {
          setNextExpiringProduct('None expiring');
        }

        // Categorized products breakdown
        const countMap: Record<string, number> = {};
        productsRes.data.data.forEach((p: any) => {
          const cat = p.category || 'Other';
          countMap[cat] = (countMap[cat] || 0) + 1;
        });
        const pieData = Object.keys(countMap).map(key => ({
          name: key,
          value: countMap[key]
        }));
        setProductCategoryData(pieData);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleToggleChecklistStep = async (routineId: string, stepId: string) => {
    try {
      await routineService.toggleStep(routineId, stepId);
      const [statsRes, routinesRes, weeklyRes] = await Promise.all([
        analyticsService.getDashboard(),
        routineService.getAll(),
        analyticsService.getWeekly()
      ]);
      setStats(statsRes.data.data);
      setRoutines(routinesRes.data.data);
      setWeekly(weeklyRes.data.data);
    } catch (error) {
      console.error('Failed to toggle step completion:', error);
    }
  };

  const scrollToRoutine = () => {
    const element = document.getElementById('today-routine-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="page-container space-y-6">
        <LoadingSkeleton type="text" count={2} />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-24" style={{ borderRadius: 'var(--radius-card)' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <LoadingSkeleton type="chart" />
          </div>
          <div className="space-y-6">
            <LoadingSkeleton type="list" count={3} />
          </div>
        </div>
      </div>
    );
  }

  const morningRoutine = routines.find(r => r.type === 'morning');
  const nightRoutine = routines.find(r => r.type === 'night');
  const morningStepsCount = morningRoutine?.steps.length || 0;
  const nightStepsCount = nightRoutine?.steps.length || 0;
  const morningCompletedSteps = morningRoutine?.steps.filter(s => s.completed).length || 0;
  const nightCompletedSteps = nightRoutine?.steps.filter(s => s.completed).length || 0;

  const currentChecklistRoutine = activeChecklistTab === 'morning' ? morningRoutine : nightRoutine;

  const quickActions = [
    { icon: <Plus size={16} />, label: 'Add Product', path: '/inventory/add', color: '#FF5FA2' },
    { icon: <Camera size={16} />, label: 'Skin Analysis', path: '/onboarding', color: '#C8B6FF' },
    { icon: <Sun size={16} />, label: 'Build Routine', path: '/routines', color: '#FFCBA4' },
    { icon: <Book size={16} />, label: 'Journal Entry', path: '/journal', color: '#B7E4BE' },
    { icon: <FileText size={16} />, label: 'View Analytics', path: '/analytics', color: '#CAF0F8' },
  ];

  const dailyTip = skincareTips[new Date().getDay() % skincareTips.length];

  // Combine logs for custom timeline
  const timelineEvents = [
    ...(stats?.currentStreak && stats.currentStreak > 0 ? [{
      title: 'Skincare Streak Active!',
      desc: `You have maintained an active consistency streak of ${stats.currentStreak} days. Keep up the good work!`,
      date: 'Today',
      icon: <Sparkles className="text-amber-500" size={14} />,
      color: 'bg-amber-100'
    }] : []),
    ...(latestPhoto ? [{
      title: 'Logged Daily Progress Selfie',
      desc: 'Added a new progress picture to your baseline skin calendar folder.',
      date: 'Recently',
      icon: <Camera className="text-primary" size={14} />,
      color: 'bg-pink-100'
    }] : []),
    ...recentEntries.slice(0, 2).map((entry) => ({
      title: `Logged Skin Mood: ${entry.mood}`,
      desc: entry.notes ? `"${entry.notes}"` : `Logged sleep (${entry.sleepHours} hours) and water intake (${entry.waterIntake} glasses).`,
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      icon: <Book className="text-green-500" size={14} />,
      color: 'bg-green-100'
    }))
  ];

  const totalSteps = morningStepsCount + nightStepsCount;
  const completedSteps = morningCompletedSteps + nightCompletedSteps;
  const pendingSteps = Math.max(0, totalSteps - completedSteps);
  const completionDoughnutData = [
    { name: 'Completed', value: completedSteps || 1, color: '#FF5FA2' },
    { name: 'Pending', value: pendingSteps, color: '#FFEBF3' }
  ];

  const waterIntakeData = recentEntries.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
    glasses: entry.waterIntake || 0
  })).reverse();

  return (
    <div className="page-container max-w-5xl space-y-12 relative z-10">
      
      {/* 1. HERO BANNER SECTION */}
      <div className="hero-glow-effect w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-glass-card p-8 relative overflow-hidden"
        >
          {/* Glow circles */}
          <div className="absolute top-[-30%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-pink-100/35 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-5%] w-[25vw] h-[25vw] rounded-full bg-indigo-50/20 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-left space-y-4 max-w-xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <AvatarManager size="md" />
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-800">
                    {getGreeting()}, {user?.name?.split(' ')[0]} 👋
                  </h1>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    ✨ {dailyTip.title} Tip of the day
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 leading-relaxed italic">
                "{dailyTip.text}"
              </p>
  
              <div className="p-4 rounded-2xl bg-white/60 border border-white/60 text-xs text-primary font-bold shadow-sm inline-block">
                📈 Your skin health consistency index has improved by 8% this week. Keep following your daily routine!
              </div>
  
              <div className="pt-2">
                <button 
                  onClick={scrollToRoutine} 
                  className="btn-primary py-3 px-6 text-xs shadow-md border-none cursor-pointer flex items-center gap-2 group"
                >
                  Start Today's Routine <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            
            <SkincareIllustration />
          </div>
        </motion.div>
      </div>

      {/* 2. STATISTICS CARDS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <motion.div whileHover={{ y: -4 }} className="glass-card p-5 border border-white/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-12 h-12 rounded-full bg-pink-100/30 blur-md pointer-events-none" />
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100/60 flex items-center justify-center text-primary"><Award size={16} /></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Skin Health</p>
          </div>
          <p className="text-2xl font-black text-gray-800">{user?.skinReport?.assessment?.skinScore || user?.skinReport?.skinScore || 'N/A'}<span className="text-xs font-semibold text-gray-400">/100</span></p>
          <p className="text-[9px] text-primary font-black uppercase mt-1">Type: {user?.skinReport?.assessment?.skinType || user?.skinReport?.skinType || 'N/A'}</p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass-card p-5 border border-white/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-12 h-12 rounded-full bg-blue-100/30 blur-md pointer-events-none" />
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><Droplet size={16} /></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Water Intake</p>
          </div>
          <p className="text-2xl font-black text-gray-800">{(user?.skinReport?.waterGoal || 2.0).toFixed(1)}L</p>
          <p className="text-[10px] text-blue-500 font-bold mt-1">Goal achieved</p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass-card p-5 border border-white/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-12 h-12 rounded-full bg-amber-100/30 blur-md pointer-events-none" />
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><Sun size={16} /></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Morning Routine</p>
          </div>
          <p className="text-2xl font-black text-gray-800">{morningCompletedSteps}<span className="text-xs font-semibold text-gray-400">/{morningStepsCount}</span></p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">
            {morningStepsCount > 0 ? Math.round((morningCompletedSteps / morningStepsCount) * 100) : 0}% Done
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass-card p-5 border border-white/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-12 h-12 rounded-full bg-indigo-100/30 blur-md pointer-events-none" />
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500"><Moon size={16} /></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Night Routine</p>
          </div>
          <p className="text-2xl font-black text-gray-800">{nightCompletedSteps}<span className="text-xs font-semibold text-gray-400">/{nightStepsCount}</span></p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">
            {nightStepsCount > 0 ? Math.round((nightCompletedSteps / nightStepsCount) * 100) : 0}% Done
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass-card p-5 border border-white/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-12 h-12 rounded-full bg-emerald-100/30 blur-md pointer-events-none" />
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><Package size={16} /></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Products</p>
          </div>
          <p className="text-2xl font-black text-gray-800">{productsOwnedCount}</p>
          <p className="text-[10px] text-emerald-500 font-bold mt-1">Track Expiration</p>
        </motion.div>

      </div>

      {/* 3. WEEKLY PROGRESS CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Weekly Consistency Progress */}
        <div className="glass-card p-6 border border-white/40 shadow-sm">
          <h3 className="font-bold text-sm mb-5 flex items-center gap-2 text-gray-700">
            <TrendingUp className="text-primary" size={16} /> Weekly Skincare Consistency Index
          </h3>
          {weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="routineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5FA2" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#FF5FA2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 199, 222, 0.15)" />
                <XAxis dataKey="day" stroke="#9E9E9E" fontSize={10} />
                <YAxis stroke="#9E9E9E" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(255, 199, 222, 0.45)',
                    borderRadius: 16,
                    fontSize: 10,
                    boxShadow: '0 10px 30px -10px rgba(255, 95, 162, 0.1)'
                  }}
                />
                <Area type="monotone" dataKey="routineCompletion" stroke="#FF5FA2" strokeWidth={2.5} fillOpacity={1} fill="url(#routineGrad)" name="Completion %" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-xs text-gray-400 font-semibold">No activity logs recorded for this week.</p>
            </div>
          )}
        </div>

        {/* Product Categories Breakdown */}
        <div className="glass-card p-6 border border-white/40 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-gray-700">
            <Compass className="text-primary" size={16} /> Product Categories
          </h3>
          {productCategoryData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {productCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 199, 222, 0.35)',
                      borderRadius: 12,
                      fontSize: 10
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-3 max-h-16 overflow-y-auto">
                {productCategoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span>{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 flex-1 flex flex-col justify-center">
              <p className="text-xs text-gray-400 font-semibold">No products registered yet.</p>
            </div>
          )}
        </div>

        {/* Daily Routine Completion Doughnut */}
        <div className="glass-card p-6 border border-white/40 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-gray-700">
            <CheckSquare className="text-primary" size={16} /> Steps Completed Today
          </h3>
          <div className="flex-1 flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={completionDoughnutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {completionDoughnutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(255, 199, 222, 0.35)',
                    borderRadius: 12,
                    fontSize: 10
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-3 justify-center mt-2.5">
              <div className="flex items-center gap-1 text-[8px] font-bold text-gray-500 uppercase">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Done ({completedSteps})</span>
              </div>
              <div className="flex items-center gap-1 text-[8px] font-bold text-gray-500 uppercase">
                <span className="w-2 h-2 rounded-full bg-pink-100" />
                <span>Left ({pendingSteps})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Water Intake Log */}
        {waterIntakeData.length > 0 && (
          <div className="glass-card p-6 border border-white/40 shadow-sm md:col-span-3">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-gray-700">
              <Droplet className="text-blue-400" size={16} /> Hydration Logs (Glasses of Water)
            </h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={waterIntakeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 199, 222, 0.1)" />
                <XAxis dataKey="date" stroke="#9E9E9E" fontSize={10} />
                <YAxis stroke="#9E9E9E" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(255, 199, 222, 0.35)',
                    borderRadius: 12,
                    fontSize: 10
                  }}
                />
                <Bar dataKey="glasses" fill="#60A5FA" radius={[4, 4, 0, 0]} name="Glasses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>

      {/* 3.5 SKIN PROGRESS PHOTOS PERSISTENCE GRID */}
      {progressPhotos.length > 0 && (
        <div className="glass-card p-7 border border-white/40 shadow-sm text-left space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2 text-gray-800">
                <Camera size={18} className="text-primary" /> Your Skin Progress Photos
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Your daily baseline tracking selfies, safely stored in MongoDB.</p>
            </div>
            <Link to="/gallery" className="px-4 py-2 rounded-full text-[10px] font-black uppercase bg-pink-50 text-primary border border-pink-100/50 hover:bg-pink-100 transition-all no-underline">
              Compare Gallery
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {progressPhotos.slice(0, 6).map((photo) => (
              <div key={photo._id} className="relative group overflow-hidden rounded-2xl border border-pink-100/30 bg-white/40 shadow-sm p-1.5 flex flex-col space-y-1.5 hover:scale-102 transition-transform">
                <img
                  src={photo.image.startsWith('http') ? photo.image : `${BACKEND_URL}${photo.image}`}
                  alt="Skin Progress"
                  className="w-full aspect-square object-cover rounded-xl"
                  loading="lazy"
                />
                <div className="px-1 text-center">
                  <span className="text-[9px] font-bold text-gray-400">
                    {new Date(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3.6 SMART ASSESSMENT SKIN SUMMARY */}
      {user?.skinReport && (
        <div className="glass-card p-7 border border-white/40 shadow-sm text-left grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Latest Selfie */}
          <div className="md:col-span-1 space-y-3.5">
            <h3 className="font-bold text-sm flex items-center gap-2 text-gray-800">
              📸 Latest Selfie
            </h3>
            {user.skinReport.selfieImage ? (
              <img 
                src={user.skinReport.selfieImage.startsWith('http') ? user.skinReport.selfieImage : `${BACKEND_URL}${user.skinReport.selfieImage}`} 
                alt="Baseline Skin Selfie" 
                className="w-full aspect-[4/3] object-cover rounded-2xl border border-pink-100/50 shadow-sm"
              />
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-pink-50/30 border border-dashed border-pink-200/50 flex flex-col items-center justify-center text-gray-400 gap-1.5">
                <Camera size={24} />
                <span className="text-[10px] font-bold uppercase">No baseline selfie</span>
              </div>
            )}
          </div>

          {/* Skin Profile Summary */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2 text-gray-800">
              🌿 Skin Profile
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Skin Type:</span>
                <span className="badge badge-lavender text-[9px] font-black uppercase">
                  {user.skinReport.assessment?.skinType || user.skinReport.skinType || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Hydration:</span>
                <span className={`badge text-[9px] font-black uppercase ${
                  user.skinReport.assessment?.hydration === 'High' ? 'badge-safe' : 'badge-warning'
                }`}>
                  {user.skinReport.assessment?.hydration || 'Medium'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Oil Level:</span>
                <span className="badge badge-safe text-[9px] font-black uppercase">
                  {user.skinReport.assessment?.oilLevel || 'Moderate'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Sensitivity:</span>
                <span className="badge badge-lavender text-[9px] font-black uppercase">
                  {user.skinReport.assessment?.skinSensitivity || 'Low'}
                </span>
              </div>
            </div>
          </div>

          {/* Skin Concerns & Disclaimer */}
          <div className="md:col-span-1 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2 text-gray-800">
                🎯 Target Concerns
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(user.skinReport.assessment?.primaryConcerns || user.skinReport.assessment?.skinConcerns || []).length > 0 ? (
                  (user.skinReport.assessment?.primaryConcerns || user.skinReport.assessment?.skinConcerns || []).map((c: string, idx: number) => (
                    <span key={idx} className="badge badge-lavender text-[9px] font-bold">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-400 italic">No concerns selected</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-red-50/10 border border-primary/20 rounded-2xl">
              <p className="text-[9px] text-gray-500 leading-normal font-semibold">
                <span className="font-black text-primary uppercase tracking-wider block mb-0.5">Skincare Disclaimer</span>
                This assessment is based on your questionnaire and photo, intended for guidance only. Consult a dermatologist.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 4. TODAY'S ROUTINE CHECKLIST */}
      <div id="today-routine-section" className="glass-card p-7 border border-white/40 shadow-sm scroll-mt-24">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2 text-gray-800">
              <CheckSquare size={18} className="text-primary" /> Today's Smart Routine Checklist
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Track your morning and night steps. Tap checkboxes to log, or click 'Replace' to change products.</p>
          </div>
          
          <div className="flex flex-wrap gap-2.5 items-center self-start">
            {user?.skinReport && (
              <button
                onClick={handleRegenerateRoutine}
                disabled={regenerating}
                className="px-4 py-2 rounded-full text-[10px] font-black uppercase bg-white border border-pink-100 hover:border-primary text-gray-600 hover:text-primary transition-all cursor-pointer disabled:opacity-50"
              >
                {regenerating ? 'Regenerating...' : '🔄 Regenerate'}
              </button>
            )}

            <div className="flex gap-1 bg-pink-50/50 p-1 rounded-full border border-pink-100/35">
              <button
                onClick={() => setActiveChecklistTab('morning')}
                className={`px-4.5 py-2 rounded-full text-[10px] font-black uppercase transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                  activeChecklistTab === 'morning'
                    ? 'btn-primary py-2 shadow-sm text-white'
                    : 'bg-transparent text-gray-400 hover:text-primary'
                }`}
              >
                <Sun size={12} /> Morning
              </button>
              <button
                onClick={() => setActiveChecklistTab('night')}
                className={`px-4.5 py-2 rounded-full text-[10px] font-black uppercase transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                  activeChecklistTab === 'night'
                    ? 'btn-primary py-2 shadow-sm text-white'
                    : 'bg-transparent text-gray-400 hover:text-primary'
                }`}
              >
                <Moon size={12} /> Night
              </button>
            </div>
          </div>
        </div>

        {currentChecklistRoutine && currentChecklistRoutine.steps.length > 0 ? (
          <div className="space-y-6 text-left">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase mb-2">
                <span>Routine Progress</span>
                <span>{Math.round((currentChecklistRoutine.steps.filter(s => s.completed).length / currentChecklistRoutine.steps.length) * 100)}% Completed</span>
              </div>
              <div className="w-full bg-pink-100/30 rounded-full h-2 overflow-hidden border border-pink-100/10">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentChecklistRoutine.steps.filter(s => s.completed).length / currentChecklistRoutine.steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="relative pl-6 border-l-2 border-dashed border-pink-200/50 space-y-8 ml-3 py-2">
              {currentChecklistRoutine.steps.map((step) => {
                const pName = step.productName || '';
                const dbProduct = productDatabase.find(p => {
                  const fullName = `${p.brand} ${p.name}`.toLowerCase();
                  return fullName.includes(pName.toLowerCase()) || pName.toLowerCase().includes(fullName);
                }) || productDatabase.find(p => pName.toLowerCase().includes(p.name.toLowerCase()));

                const estTime = step.stepType.toLowerCase().includes('cleanser') ? '1 Min' 
                            : step.stepType.toLowerCase().includes('serum') ? '2 Mins'
                            : step.stepType.toLowerCase().includes('moisturizer') ? '1 Min'
                            : '1 Min';

                const isEditing = editingStepId === step._id;
                const matchedCategoryProducts = dbProduct ? productDatabase.filter(p => p.category.toLowerCase().includes(dbProduct.category.toLowerCase().split(' ')[0])) : productDatabase;

                return (
                  <div key={step._id} className="relative group">
                    {/* Circle Dot Marker */}
                    <div
                      onClick={() => handleToggleChecklistStep(currentChecklistRoutine._id, step._id!)}
                      className={`absolute -left-[33px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 cursor-pointer transition-all ${
                        step.completed
                          ? 'bg-green-500 border-green-500 text-white shadow-sm'
                          : 'bg-white border-pink-300 text-transparent hover:border-primary'
                      }`}
                    >
                      {step.completed && <CheckSquare size={12} />}
                    </div>

                    <div className="glass-card p-5 border border-white/50 hover:border-pink-200/40 transition-all flex flex-col md:flex-row gap-5 items-start justify-between shadow-sm">
                      <div className="flex gap-4 items-start flex-1">
                        {/* Dynamic Product Type Icon Image */}
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-pink-50 border border-pink-100/45 shadow-inner flex-shrink-0">
                          {step.stepType.toLowerCase().includes('cleanser') ? '🧼' 
                           : step.stepType.toLowerCase().includes('serum') ? '🧴'
                           : step.stepType.toLowerCase().includes('moisturizer') ? '🧴'
                           : step.stepType.toLowerCase().includes('sunscreen') ? '☀️'
                           : step.stepType.toLowerCase().includes('lip') ? '👄'
                           : '🌿'}
                        </div>

                        <div className="space-y-1 text-left flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-[10px] font-black text-primary uppercase tracking-wider">Step {step.order} • {step.stepType}</span>
                            <span className="text-[9px] text-gray-400 font-bold">• Est: {estTime}</span>
                          </div>

                          {/* Product Detail Card fields */}
                          {isEditing ? (
                            <div className="mt-2 space-y-2 max-w-xs">
                              <label className="block text-[9px] font-bold text-gray-400 uppercase">Select Product Replacement</label>
                              <select
                                onChange={(e) => handleReplaceProduct(currentChecklistRoutine._id, step._id!, e.target.value)}
                                className="w-full p-2 text-xs border border-pink-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white/90"
                                defaultValue={step.productName}
                              >
                                <option value="" disabled>Choose a product</option>
                                {matchedCategoryProducts.map((p, idx) => (
                                  <option key={idx} value={`${p.brand} ${p.name}`}>
                                    [{p.brand}] {p.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => setEditingStepId(null)}
                                className="text-[9px] text-gray-400 font-bold hover:text-gray-600 block mt-1 bg-transparent border-none cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-xs font-black text-gray-800 ${step.completed ? 'line-through opacity-45' : ''}`}>
                                  {step.productName || 'Custom Product'}
                                </h4>
                                {dbProduct && (
                                  <span className="text-[8px] bg-pink-50 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{dbProduct.brand}</span>
                                )}
                              </div>

                              {dbProduct ? (
                                <div className="space-y-1.5 text-xs text-gray-500 font-semibold leading-relaxed max-w-xl">
                                  <p className="text-[9px]"><span className="text-gray-400 font-bold uppercase">Ingredients:</span> {dbProduct.ingredients}</p>
                                  <p className="text-[10px] text-gray-600 italic">"{dbProduct.whyRecommended}"</p>
                                  <div className="bg-pink-50/15 p-2.5 rounded-xl border border-pink-100/10 text-[10px] mt-1 leading-normal text-gray-500">
                                    <span className="font-bold text-primary block uppercase tracking-wider text-[7px] mb-0.5">Instructions:</span>
                                    {dbProduct.howToUse}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[10px] text-gray-400 font-semibold italic">Custom skincare product. Tap replace to choose a branded formula.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Replace Button */}
                      {!isEditing && (
                        <button
                          onClick={() => setEditingStepId(step._id!)}
                          className="px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase bg-white border border-pink-100 hover:border-primary text-gray-500 hover:text-primary transition-all cursor-pointer flex-shrink-0"
                        >
                          Replace
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Disclaimer at the bottom of the routine checklist */}
            <div className="p-4 bg-red-50/5 border border-primary/10 rounded-2xl mt-4">
              <p className="text-[9px] font-semibold text-gray-400 leading-relaxed text-center">
                These recommendations are personalized based on the information you provided. They are intended for skincare management and educational purposes only and are not a substitute for professional medical advice. Consult a dermatologist for persistent or severe skin conditions.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-pink-100 rounded-3xl bg-white/20">
            <EmptySkincareRoutineIllustration />
            <h4 className="font-bold text-sm text-gray-700">✨ Build Your Personalized Routine</h4>
            <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Healthy skin starts with consistency. Generate your daily cleanser, serum, and moisturizer steps instantly from your skin profile diagnostics.
            </p>
            <button
              onClick={handleRegenerateRoutine}
              disabled={regenerating}
              className="btn-primary py-2.5 px-6 text-xs mt-4.5 shadow-sm cursor-pointer"
            >
              {regenerating ? 'Generating Routine...' : 'Generate AI Skincare Routine'}
            </button>
          </div>
        )}
      </div>

      {/* 4.5 SMART SKINCARE RECOMMENDATIONS */}
      <div className="glass-card p-7 border border-white/40 shadow-sm text-left space-y-6">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2 text-gray-800">
            <Sparkles size={18} className="text-primary animate-pulse" /> Personalized Skincare Recommendations
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Customized routines, branded product recommendations, and tips based on your skin diagnostics report.</p>
        </div>

        {user?.skinReport ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4.5 rounded-2xl bg-pink-50/20 border border-pink-100/30">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Your Skin Profile</span>
                <div className="flex flex-wrap gap-2.5 items-center mt-1.5">
                  <span className="text-xs font-bold text-gray-600">Skin Type:</span>
                  <span className="badge badge-lavender text-[9px] font-black uppercase">{user.skinReport.skinType}</span>
                  {user.skinReport.isSensitive === 'Yes' && (
                    <span className="badge badge-danger text-[9px] font-black uppercase">Sensitive</span>
                  )}
                </div>
                {user.skinReport.mainConcern && (
                  <div className="mt-2.5 text-xs font-bold text-gray-600 flex items-center gap-1.5">
                    <span>Main Concern:</span>
                    <span className="badge badge-lavender text-[9px] font-black uppercase">
                      {user.skinReport.mainConcern.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4.5 rounded-2xl bg-amber-50/20 border border-amber-100/30">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Skin Health Index</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black gradient-text">{user.skinReport.skinScore}</span>
                  <span className="text-xs text-gray-400 font-bold">/ 100</span>
                </div>
              </div>
            </div>

            {/* Routines Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/40">
                <h4 className="font-extrabold text-xs text-amber-800 mb-2.5 flex items-center gap-1.5">☀️ morning recommended routine</h4>
                <div className="space-y-1.5">
                  {user.skinReport.generatedRoutine?.morning?.map((step: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-amber-950">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/40">
                <h4 className="font-extrabold text-xs text-indigo-800 mb-2.5 flex items-center gap-1.5">🌙 night recommended routine</h4>
                <div className="space-y-1.5">
                  {user.skinReport.generatedRoutine?.night?.map((step: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-indigo-950">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Products */}
            {user.skinReport.recommendedProducts && user.skinReport.recommendedProducts.length > 0 && (
              <div className="space-y-3.5">
                <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">Suggested Branded Products</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {user.skinReport.recommendedProducts.map((prod: RecommendedProduct, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/40 border border-pink-100/20 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition-all">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-1">
                          <h5 className="font-black text-xs text-gray-800 leading-tight">{prod.name}</h5>
                          <span className="text-[8px] bg-pink-50 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex-shrink-0">{prod.brand}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{prod.category} • {prod.timeOfDay}</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed italic">"{prod.whyRecommended}"</p>
                      </div>
                      <div className="bg-pink-50/20 p-2 rounded-xl text-[9px] text-gray-500 leading-snug font-medium">
                        <span className="font-bold text-primary block uppercase tracking-wider text-[7px] mb-0.5">Application:</span>
                        {prod.howToUse}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips list */}
            {user.skinReport.skincareTips && user.skinReport.skincareTips.length > 0 && (
              <div className="p-4.5 rounded-2xl bg-pink-50/15 border border-pink-100/25 space-y-2">
                <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider">Personalized Skincare Tips</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {user.skinReport.skincareTips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span className="font-semibold leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Notes */}
            <div className="space-y-3 text-left flex flex-col">
              <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-primary" /> Daily Skincare Progress Notes
              </h4>
              <p className="text-[10px] text-gray-400 font-semibold">Track how your skin feels and reacts to recommended routines over time.</p>
              <textarea
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                placeholder="Write your daily skincare diary or progress notes here..."
                rows={3}
                className="w-full p-4.5 text-xs text-gray-700 border border-pink-100/50 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary/40 bg-white/45 placeholder-gray-400"
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="btn-primary py-2 px-5 text-xs font-black shadow-sm flex items-center gap-2 cursor-pointer self-start"
              >
                {savingNotes ? 'Saving Notes...' : 'Save Notes'}
              </button>
            </div>

            {/* Medical Disclaimer */}
            {user.skinReport.disclaimer && (
              <div className="p-4 bg-red-50/10 border border-primary/10 rounded-2xl">
                <p className="text-[10px] font-semibold text-gray-400 leading-relaxed">
                  <span className="font-black text-primary uppercase tracking-wider text-[8px] block mb-0.5">Medical Disclaimer</span>
                  {user.skinReport.disclaimer}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-pink-100 rounded-3xl bg-white/20">
            <h4 className="font-bold text-sm text-gray-700">🔍 No Skincare Recommendations Yet</h4>
            <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Complete the skin diagnostic assessment quiz to generate a tailored skincare routine and select suited branded products.
            </p>
            <Link to="/onboarding" className="btn-primary py-2 px-5 text-xs mt-4 no-underline inline-block shadow-sm">
              Start Skin Diagnostics
            </Link>
          </div>
        )}
      </div>

      {/* 5. QUICK ACTIONS */}
      <div className="glass-card p-6 border border-white/40 shadow-sm text-left">
        <h3 className="font-bold text-sm mb-4 text-gray-700 flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary" /> Premium Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {quickActions.map(({ icon, label, path, color }, i) => (
            <Link key={i} to={path} className="no-underline">
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-2xl flex flex-col items-center justify-center border border-white/40 hover:border-pink-200/50 transition-all bg-white/50 shadow-sm cursor-pointer text-center space-y-2 h-24"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm text-white"
                  style={{ background: `linear-gradient(135deg, ${color === '#CAF0F8' ? '#60A5FA' : '#FF5FA2'}, ${color})` }}>
                  {icon}
                </div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-wide">{label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* 6. RECENT ACTIVITY TIMELINE */}
      <div className="glass-card p-6 border border-white/40 shadow-sm text-left">
        <h3 className="font-bold text-sm mb-5 text-gray-700 flex items-center gap-1.5">
          <Calendar size={14} className="text-primary" /> Recent Skincare Log Activity
        </h3>
        {timelineEvents.length > 0 ? (
          <div className="relative pl-6 border-l border-pink-100/50 space-y-6">
            {timelineEvents.map((evt, idx) => (
              <div key={idx} className="relative">
                <span className={`absolute left-[-31px] top-0 w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${evt.color}`}>
                  {evt.icon}
                </span>
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <h4 className="font-black text-gray-700 uppercase tracking-wider">{evt.title}</h4>
                    <span className="text-gray-400 font-semibold">{evt.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{evt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-gray-400 font-semibold">
            No recent logs recorded. Update your journal daily to populate your activity feed!
          </div>
        )}
      </div>

      {/* 7. DAILY SKINCARE TIPS CARD */}
      <motion.div
        whileHover={{ scale: 1.008 }}
        className="glass-card p-6 border relative overflow-hidden shadow-sm text-left"
        style={{
          background: 'linear-gradient(135deg, rgba(200,182,255,0.15) 0%, rgba(255,199,222,0.1) 100%)',
          borderColor: 'rgba(200, 182, 255, 0.25)'
        }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/20 blur-xl pointer-events-none" />
        <h4 className="font-black text-xs uppercase tracking-wider text-lavender-dark mb-2 flex items-center gap-1.5">
          🌿 Skincare Lesson: {dailyTip.title}
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed font-medium">
          {dailyTip.text} Consistent application of these basic active rules guarantees visible improvement in texture and brightness.
        </p>
      </motion.div>

      {/* 8. UPCOMING PRODUCT EXPIRY */}
      {expiringProducts.length > 0 && (
        <div className="glass-card p-6 space-y-4 border border-white/40 shadow-sm text-left">
          <h3 className="font-bold text-sm text-coral flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <span className="flex items-center gap-1.5"><AlertTriangle size={16} /> Expiring Skincare Products</span>
            {nextExpiringProduct && <span className="text-[9px] bg-red-50 text-coral px-2.5 py-1 rounded-full uppercase font-black">Soonest: {nextExpiringProduct}</span>}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expiringProducts.map((p) => {
              const daysLeft = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isExpired = daysLeft <= 0;
              return (
                <div
                  key={p._id}
                  className="p-3.5 rounded-2xl flex items-center gap-3.5 border bg-white/50 border-pink-100/40"
                >
                  {p.image ? (
                    <img src={p.image.startsWith('http') ? p.image : `${BACKEND_URL}${p.image}`} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-coral flex items-center justify-center text-lg border border-red-100 shadow-sm">⚠️</div>
                  )}
                  <div className="text-left min-w-0 flex-1">
                    <h4 className="font-bold text-xs truncate text-gray-800">{p.name}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{p.brand}</p>
                    <p className={`text-[10px] font-black mt-1.5 ${isExpired ? 'text-red-500' : 'text-amber-500'}`}>
                      {isExpired ? 'Expired' : `Expires in ${daysLeft} days`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 9. FOOTER */}
      <footer className="pt-6 pb-2 border-t border-pink-100/20 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        <p>© {new Date().getFullYear()} GlowCare SaaS. Your Partner in Healthy, Glowing Skin.</p>
      </footer>

    </div>
  );
};

export default DashboardPage;
