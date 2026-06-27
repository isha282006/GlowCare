import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { routineService, productService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSkeleton, EmptyState } from '../components/ui';
import type { Routine, Product, RoutineStep, CompatibilityWarning } from '../types';

const stepCategories = [
  'Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen',
  'Eye Cream', 'Lip Balm', 'Face Mask', 'Exfoliator', 'Treatment', 'Other'
];

const RoutineBuilderPage: React.FC = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'morning' | 'night'>('morning');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warnings, setWarnings] = useState<CompatibilityWarning[]>([]);

  // Local state for editing the current active routine steps
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [routinesRes, productsRes] = await Promise.all([
        routineService.getAll(),
        productService.getAll({ limit: '100' })
      ]);
      setRoutines(routinesRes.data.data);
      setProducts(productsRes.data.data);
      
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
      .filter((p): p is string => typeof p === 'string' || (p !== undefined && p !== null));
    
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
    setSteps([...steps, newStep]);
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

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...steps];
    
    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate order
    const finalized = updated.map((step, i) => ({
      ...step,
      order: i + 1
    }));

    setSteps(finalized);
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
      showToast('Step status updated!', 'success');
    } catch {
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
      showToast('Routine reset for today!', 'success');
    } catch {
      showToast('Failed to reset routine', 'error');
    }
  };

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Routine Builder 🧴✨</h1>
          <p className="page-subtitle">Design your personalized morning and night routines</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          {activeRoutineId && (
            <button onClick={resetDailyRoutine} className="btn-secondary text-sm">
              Reset Progress
            </button>
          )}
          <button onClick={saveRoutine} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6" style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)' }}>
        <button
          onClick={() => setActiveTab('morning')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 cursor-pointer transition-all ${
            activeTab === 'morning'
              ? 'border-lavender text-lavender-dark dark:text-lavender-light'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          style={{ background: 'transparent' }}
        >
          ☀️ Morning Routine
        </button>
        <button
          onClick={() => setActiveTab('night')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 cursor-pointer transition-all ${
            activeTab === 'night'
              ? 'border-lavender text-lavender-dark dark:text-lavender-light'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          style={{ background: 'transparent' }}
        >
          🌙 Night Routine
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step list builder */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Routine Steps</h2>
              <button onClick={addStep} className="btn-secondary text-xs flex items-center gap-1">
                <FiPlus /> Add Step
              </button>
            </div>

            {loading ? (
              <LoadingSkeleton type="list" count={4} />
            ) : steps.length === 0 ? (
              <EmptyState
                icon="✨"
                title="No routines created yet."
                description="Get started by designing your first morning or night routine."
                action={<button onClick={addStep} className="btn-primary text-sm"><FiPlus /> Create Your First Routine</button>}
              />
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {steps.map((step, index) => {
                    // Find suitable products for this step category
                    const categoryProducts = products.filter(
                      p => p.category.toLowerCase() === step.stepType.toLowerCase()
                    );
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 rounded-2xl border"
                        style={{
                          background: isDark ? 'rgba(26, 26, 46, 0.5)' : 'white',
                          borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)'
                        }}
                      >
                        {/* Step Number & Order Controls */}
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                            style={{ background: 'linear-gradient(135deg, var(--color-lavender), var(--color-soft-pink))', color: '#1a1a2e' }}>
                            {step.order}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              disabled={index === 0}
                              onClick={() => moveStep(index, 'up')}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-border disabled:opacity-30 border-none cursor-pointer"
                              style={{ background: 'transparent', color: isDark ? 'var(--color-dark-text)' : '#555' }}
                            >
                              <FiChevronUp size={14} />
                            </button>
                            <button
                              disabled={index === steps.length - 1}
                              onClick={() => moveStep(index, 'down')}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-border disabled:opacity-30 border-none cursor-pointer"
                              style={{ background: 'transparent', color: isDark ? 'var(--color-dark-text)' : '#555' }}
                            >
                              <FiChevronDown size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Step Type Selector */}
                        <div className="w-full md:w-40">
                          <select
                            value={step.stepType}
                            onChange={(e) => updateStepField(index, 'stepType', e.target.value)}
                            className="input-field py-2 text-sm"
                          >
                            {stepCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Product Selector */}
                        <div className="flex-1 w-full">
                          <select
                            value={step.product || ''}
                            onChange={(e) => updateStepField(index, 'product', e.target.value)}
                            className="input-field py-2 text-sm"
                          >
                            <option value="">Select product (optional)</option>
                            {categoryProducts.map(p => (
                              <option key={p._id} value={p._id}>{p.brand} - {p.name}</option>
                            ))}
                            {/* Fallback to show all products if none in this category */}
                            {categoryProducts.length === 0 && products.map(p => (
                              <option key={p._id} value={p._id}>{p.brand} - {p.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Completion / Actions */}
                        <div className="flex items-center gap-2 self-end md:self-center">
                          {activeRoutineId && step._id && (
                            <button
                              onClick={() => toggleStepComplete(step._id!)}
                              className={`p-2 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                                step.completed
                                  ? 'bg-mint text-green-800 border-mint-dark'
                                  : 'bg-transparent border-gray-300 text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              <FiCheck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => removeStep(index)}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer border-none"
                            style={{ background: 'transparent' }}
                          >
                            <FiTrash2 size={16} />
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

        {/* Compatibility Checker Panel */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              🛡️ Compatibility Check
            </h2>
            {warnings.length === 0 ? (
              <div className="p-4 rounded-2xl bg-mint-light border border-mint text-green-800 text-sm">
                <p className="font-semibold mb-1">✅ Safe Combo!</p>
                <p className="text-xs">No active conflicts detected among selected ingredients in this routine.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {warnings.map((w, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border text-sm ${
                      w.status === 'avoid'
                        ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-300'
                        : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FiAlertTriangle className="flex-shrink-0" />
                      <span className="font-bold">
                        {w.ingredientA} + {w.ingredientB} ({w.status.toUpperCase()})
                      </span>
                    </div>
                    <p className="text-xs">{w.warningMessage}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t text-xs text-gray-500 space-y-1" style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)' }}>
              <p className="font-bold mb-1">Skincare Chemistry Tips:</p>
              <p>• Avoid layering Retinol with exfoliating acids (AHA/BHA).</p>
              <p>• Vitamin C is best in the morning; Retinol is best at night.</p>
              <p>• Niacinamide & Hyaluronic Acid are safe with almost everything!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineBuilderPage;
