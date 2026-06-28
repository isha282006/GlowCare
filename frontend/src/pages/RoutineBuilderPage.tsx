import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertTriangle, Check, Clock, Award, Info } from 'lucide-react';
import { routineService, productService, analyticsService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { LoadingSkeleton, EmptyState } from '../components/ui';
import type { Routine, Product, RoutineStep, CompatibilityWarning } from '../types';

const stepCategories = [
  'Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen',
  'Eye Cream', 'Lip Balm', 'Face Mask', 'Exfoliator', 'Treatment', 'Other'
];

const RoutineBuilderPage: React.FC = () => {
  const { showToast } = useToast();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'morning' | 'night'>('morning');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warnings, setWarnings] = useState<CompatibilityWarning[]>([]);
  
  // Dashboard stats for streak & routines
  const [streakDays, setStreakDays] = useState(0);

  // Local state for editing the current active routine steps
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);

  // Drag and Drop drag states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [routinesRes, productsRes, statsRes] = await Promise.all([
        routineService.getAll(),
        productService.getAll({ limit: '100' }),
        analyticsService.getDashboard()
      ]);
      setRoutines(routinesRes.data.data);
      setProducts(productsRes.data.data);
      setStreakDays(statsRes.data.data?.currentStreak || 0);
      
      // Load steps for active tab
      const initialRoutine = routinesRes.data.data.find(r => r.type === activeTab);
      if (initialRoutine) {
        setSteps([...initialRoutine.steps].sort((a, b) => a.order - b.order));
        setActiveRoutineId(initialRoutine._id);
        checkCompatibilityForSteps(initialRoutine.steps);
      } else {
        setSteps([]);
        setActiveRoutineId(null);
        setWarnings([]);
      }
    } catch (error) {
      showToast('Failed to fetch routine data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const routine = routines.find(r => r.type === activeTab);
    if (routine) {
      setSteps([...routine.steps].sort((a, b) => a.order - b.order));
      setActiveRoutineId(routine._id);
      checkCompatibilityForSteps(routine.steps);
    } else {
      setSteps([]);
      setActiveRoutineId(null);
      setWarnings([]);
    }
  }, [activeTab, routines]);

  const checkCompatibilityForSteps = async (routineSteps: RoutineStep[]) => {
    const productIds = routineSteps
      .map(s => s.product)
      .filter((p): p is string => typeof p === 'string' && p !== '');
    
    if (productIds.length < 2) {
      setWarnings([]);
      return;
    }
    try {
      const res = await routineService.checkCompatibility(productIds);
      setWarnings(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addStep = () => {
    const newStep: RoutineStep = {
      order: steps.length + 1,
      stepType: stepCategories[0],
      product: undefined,
      productName: '',
      completed: false
    };
    const updated = [...steps, newStep];
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      order: i + 1
    }));
    setSteps(updated);
    checkCompatibilityForSteps(updated);
  };

  const updateStepField = (index: number, field: keyof RoutineStep, value: any) => {
    const updated = [...steps];
    if (field === 'product') {
      const selectedProd = products.find(p => p._id === value);
      updated[index] = {
        ...updated[index],
        product: value || undefined,
        productName: selectedProd ? selectedProd.name : ''
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value
      };
    }
    setSteps(updated);
    if (field === 'product') {
      checkCompatibilityForSteps(updated);
    }
  };

  // HTML5 Native Drag and Drop ordering handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const updated = [...steps];
    const [removed] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, removed);

    // Recalculate order
    const finalized = updated.map((step, i) => ({
      ...step,
      order: i + 1
    }));

    setSteps(finalized);
    setDraggedIndex(null);
    checkCompatibilityForSteps(finalized);
  };

  const saveRoutine = async () => {
    try {
      setSaving(true);
      const routineData = {
        type: activeTab,
        steps: steps.map(s => ({
          order: s.order,
          stepType: s.stepType,
          product: s.product || null,
          productName: s.productName || '',
          completed: s.completed
        }))
      };

      const res = await routineService.create(routineData);
      
      // Update routines list
      setRoutines(prev => {
        const index = prev.findIndex(r => r.type === activeTab);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = res.data.data;
          return updated;
        } else {
          return [...prev, res.data.data];
        }
      });
      
      showToast('Routine saved successfully! ✨', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save routine', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleStepComplete = async (stepId: string) => {
    if (!activeRoutineId) return;
    try {
      const res = await routineService.toggleStep(activeRoutineId, stepId);
      setRoutines(prev => {
        const index = prev.findIndex(r => r._id === activeRoutineId);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = res.data.data;
          return updated;
        }
        return prev;
      });
      showToast('Step completed status updated!', 'success');
    } catch (error) {
      showToast('Failed to toggle step completion', 'error');
    }
  };

  const resetDailyRoutine = async () => {
    if (!activeRoutineId) return;
    try {
      const res = await routineService.reset(activeRoutineId);
      setRoutines(prev => {
        const index = prev.findIndex(r => r._id === activeRoutineId);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = res.data.data;
          return updated;
        }
        return prev;
      });
      showToast('Routine progress reset for today!', 'success');
    } catch (error) {
      showToast('Failed to reset routine progress', 'error');
    }
  };

  // Calculate estimated routine time (Cleanser 2m, Moisturizer 2m, Face Mask 15m, Exfoliator 5m, Treatment 3m, others 1m)
  const estimatedTime = steps.reduce((total, step) => {
    switch (step.stepType) {
      case 'Cleanser': return total + 2;
      case 'Face Mask': return total + 15;
      case 'Exfoliator': return total + 5;
      case 'Treatment': return total + 3;
      case 'Moisturizer': return total + 2;
      default: return total + 1;
    }
  }, 0);

  const completedCount = steps.filter(s => s.completed).length;
  const totalCount = steps.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // SVG Progress Ring calculations
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * completionPercent) / 100;

  return (
    <div className="page-container relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Routine Manager 🧴✨</h1>
          <p className="page-subtitle">Design, reorder, and log your custom morning and night skincare rituals</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-center">
          {activeRoutineId && (
            <button onClick={resetDailyRoutine} className="btn-secondary text-xs font-bold bg-white border-none cursor-pointer">
              Reset Today's Progress
            </button>
          )}
          <button onClick={saveRoutine} disabled={saving} className="btn-primary text-xs font-black py-2.5 px-6 shadow-md cursor-pointer">
            {saving ? 'Saving...' : 'Save Routine'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-8 border-pink-100/50">
        <button
          onClick={() => setActiveTab('morning')}
          className={`px-6 py-3.5 font-extrabold text-sm border-b-2 cursor-pointer transition-all ${
            activeTab === 'morning'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
          style={{ background: 'transparent' }}
        >
          ☀️ Morning Routine
        </button>
        <button
          onClick={() => setActiveTab('night')}
          className={`px-6 py-3.5 font-extrabold text-sm border-b-2 cursor-pointer transition-all ${
            activeTab === 'night'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
          style={{ background: 'transparent' }}
        >
          🌙 Night Routine
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step list builder */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 border border-white/40 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="text-left">
                <h2 className="text-sm font-black text-gray-700">Routine Steps</h2>
                <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Drag and drop step cards to change execution order</p>
              </div>
              <button onClick={addStep} className="btn-secondary text-xs font-bold flex items-center gap-1 bg-white border-none cursor-pointer">
                <Plus size={14} /> Add Step
              </button>
            </div>

            {loading ? (
              <LoadingSkeleton type="list" count={4} />
            ) : steps.length === 0 ? (
              <EmptyState
                icon="✨"
                title="No steps designed yet"
                description="Get started by laying down cleanser, serum, and moisturizer steps."
                action={<button onClick={addStep} className="btn-primary text-xs cursor-pointer"><Plus size={14} /> Create First Step</button>}
              />
            ) : (
              <div className="space-y-3.5">
                <AnimatePresence initial={false}>
                  {steps.map((step, index) => {
                    const categoryProducts = products.filter(
                      p => p.category.toLowerCase() === step.stepType.toLowerCase()
                    );
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`flex flex-col md:flex-row items-start md:items-center gap-3.5 p-4.5 rounded-2xl border transition-all cursor-move ${
                          draggedIndex === index ? 'opacity-40 border-primary/40 scale-[0.98]' : 'bg-white/50 border-pink-100/35 hover:border-pink-200/50'
                        }`}
                      >
                        {/* Step Order Indicators */}
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm text-white"
                            style={{ background: 'linear-gradient(135deg, #FF5FA2, #F472B6)' }}>
                            {step.order}
                          </span>
                        </div>

                        {/* Step Type Selector */}
                        <div className="w-full md:w-44 text-left">
                          <select
                            value={step.stepType}
                            onChange={(e) => updateStepField(index, 'stepType', e.target.value)}
                            className="input-field py-2 text-xs font-semibold text-gray-600 appearance-none"
                          >
                            {stepCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Product Selector */}
                        <div className="flex-1 w-full text-left">
                          <select
                            value={step.product || ''}
                            onChange={(e) => updateStepField(index, 'product', e.target.value)}
                            className="input-field py-2 text-xs font-semibold text-gray-600 appearance-none"
                          >
                            <option value="">Select product (optional)</option>
                            {categoryProducts.map(p => (
                              <option key={p._id} value={p._id}>{p.brand} - {p.name}</option>
                            ))}
                            {categoryProducts.length === 0 && products.map(p => (
                              <option key={p._id} value={p._id}>{p.brand} - {p.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Completion / Delete actions */}
                        <div className="flex items-center gap-2 self-end md:self-center">
                          {activeRoutineId && step._id && (
                            <button
                              onClick={() => toggleStepComplete(step._id!)}
                              className={`p-2 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                                step.completed
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-transparent border-gray-250 text-gray-400 hover:text-gray-600'
                              }`}
                              title="Toggle step completion"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => removeStep(index)}
                            className="p-2 rounded-xl text-coral hover:bg-red-50 cursor-pointer border-none bg-transparent"
                            title="Remove step"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          
          {/* Routine Performance ring & stats */}
          <div className="glass-card p-6 text-center space-y-4 border border-white/40 shadow-sm">
            <h3 className="font-extrabold text-sm text-left border-b pb-2.5 border-pink-100/50 text-gray-700">Routine Performance</h3>
            
            <div className="flex items-center justify-around gap-2 py-2">
              {/* SVG circular progress ring */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#FFEBF3"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#FF5FA2"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-black text-gray-800">{completionPercent}%</span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Done</span>
                </div>
              </div>

              {/* Text summaries */}
              <div className="text-left space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="text-gray-400" size={15} />
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Estimated Time</p>
                    <p className="font-black text-gray-700">{estimatedTime} minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Award className="text-primary" size={15} />
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Current Streak</p>
                    <p className="font-black text-gray-700">{streakDays} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compatibility Checker Panel */}
          <div className="glass-card p-6 text-left border border-white/40 shadow-sm">
            <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-gray-700">
              🛡️ Chemical Compatibility
            </h3>
            {warnings.length === 0 ? (
              <div className="p-4 rounded-2xl bg-green-50/50 border border-green-200/50 text-green-800 text-xs leading-normal">
                <p className="font-extrabold mb-1">✅ Safe Ingredients Combination</p>
                <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">No conflicts detected among products in this routine.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {warnings.map((w, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      w.status === 'avoid'
                        ? 'bg-red-50/55 border-red-200/60 text-red-800 shadow-sm'
                        : 'bg-amber-50/55 border-amber-200/60 text-amber-850 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 text-[11px]">
                      <AlertTriangle className="flex-shrink-0" size={14} />
                      <span className="font-black">
                        {w.ingredientA} + {w.ingredientB} ({w.status.toUpperCase()})
                      </span>
                    </div>
                    <p className="text-[10px] opacity-90 leading-relaxed font-semibold">{w.warningMessage}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t text-[10px] text-gray-400 space-y-1.5 border-pink-100/50 font-semibold">
              <p className="font-black flex items-center gap-1 text-gray-500"><Info size={12} /> Chemistry Layering Tips:</p>
              <p>• Retinol should not be mixed with Salicylic/Glycolic acids in the same routine step.</p>
              <p>• Apply Vitamin C in the morning SPF routines to boost UVA/UVB shield effectiveness.</p>
              <p>• Order layers by thickness: Toner ➔ Serum ➔ Gel/Moisturizer ➔ Cream/Sunscreen.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoutineBuilderPage;
