import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowRight, Check, AlertTriangle, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService, routineService } from '../api/services';
import { generateSkinRecommendations, generateRoutineSteps } from '../utils/recommendationEngine';
import type { RecommendedProduct } from '../utils/recommendationEngine';

const SkinReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  // Load choices from localStorage (with fallbacks)
  const skinType = localStorage.getItem('glowcare_user_skin_type') || 'normal';
  const acne = localStorage.getItem('glowcare_user_acne') || 'None';
  const pigmentation = localStorage.getItem('glowcare_user_pigmentation') || 'None';
  const darkCircles = localStorage.getItem('glowcare_user_dark_circles') || 'None';
  const dryness = localStorage.getItem('glowcare_user_dryness') || 'None';
  const oiliness = localStorage.getItem('glowcare_user_oiliness') || 'None';
  const isSensitive = localStorage.getItem('glowcare_user_sensitive') || 'No';
  const mainConcern = localStorage.getItem('glowcare_user_main_concern') || 'acne';
  const mainGoal = localStorage.getItem('glowcare_user_main_goal') || 'glow';

  // Generate the report programmatically based on the precise rules
  const report = user?.skinReport || calculateReport();

  function calculateReport() {
    return generateSkinRecommendations({
      skinType: skinType || 'normal',
      acne: acne,
      pigmentation: pigmentation,
      darkCircles,
      dryness,
      oiliness,
      isSensitive,
      mainConcern,
      mainGoal
    });
  }

  const saveRoutinesToDatabase = async (r: any) => {
    try {
      const dryVal = r.drynessLevel || dryness;
      const oilVal = r.oilinessLevel || oiliness;
      const acneVal = r.acneLevel || acne;
      const pigVal = r.pigmentationLevel || pigmentation;
      const dcVal = r.darkCircles || darkCircles;
      const sensVal = r.isSensitive || isSensitive;

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

      // Save morning routine
      const morningSteps = morning.map(step => ({
        order: step.order,
        stepType: step.category,
        productName: `${step.brand} ${step.name}`,
        completed: false
      }));

      // Save night routine
      const nightSteps = night.map(step => ({
        order: step.order,
        stepType: step.category === 'Eye Care' ? 'Eye Cream' : step.category === 'Lip Care' ? 'Lip Balm' : step.category,
        productName: `${step.brand} ${step.name}`,
        completed: false
      }));

      await Promise.all([
        routineService.create({ type: 'morning', steps: morningSteps }),
        routineService.create({ type: 'night', steps: nightSteps })
      ]);
    } catch (error) {
      console.error('Failed to auto-generate and save routines:', error);
    }
  };

  const handleSaveReport = async () => {
    setSaving(true);
    try {
      const response = await authService.updateProfile({ skinReport: report });
      if (response.data.success) {
        updateUser(response.data.user);
        await saveRoutinesToDatabase(report);
        showToast('Skin Report and routines saved successfully! 💾', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save skin report', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    localStorage.setItem('glowcare_onboarding_completed', 'true');
    try {
      const response = await authService.updateProfile({ skinReport: report });
      if (response.data.success) {
        updateUser(response.data.user);
      }
      await saveRoutinesToDatabase(report);
    } catch (err) {
      console.error('Failed to auto-save skin report and routines:', err);
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 relative overflow-hidden">
      {/* Floating Background Blobs Layer */}
      <div className="glow-bg-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-black gradient-text tracking-tight flex items-center justify-center gap-2.5">
            <Sparkles size={26} className="text-primary animate-pulse" /> Your Skin Diagnostic Report
          </h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            We analyzed your skin metrics and compiled this customized skincare guide.
          </p>
        </div>

        {/* Warnings */}
        {report.warnings && report.warnings.length > 0 && (
          <div className="space-y-3">
            {report.warnings.map((warn: string, i: number) => (
              <div
                key={i}
                className="glass-card p-4.5 flex items-start gap-3 border-l-4 border-l-amber-400"
                style={{ background: 'rgba(255, 244, 229, 0.5)' }}
              >
                <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-xs font-semibold text-amber-900 leading-relaxed">{warn}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left panel: Score & Metrics */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Skin Score Ring */}
            <div className="glass-card p-6 text-center space-y-4">
              <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">Skin Health Score</h3>
              <div className="relative w-36 h-36 mx-auto flex flex-col items-center justify-center rounded-full bg-pink-50/50 border-2 border-dashed border-primary/40 shadow-inner">
                <span className="text-5xl font-black gradient-text">{report.skinScore}</span>
                <span className="text-[10px] text-gray-400 font-bold mt-1">/ 100</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Your skin diagnostic baseline. Let's start tracking routines!
              </p>
            </div>

            {/* Diagnostics details */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-extrabold text-[10px] border-b pb-2 uppercase tracking-wider text-gray-400 border-pink-100/50">Skin Diagnostics</h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Skin Type:</span>
                  <span className="badge badge-lavender text-[9px] font-black uppercase">{report.skinType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Acne:</span>
                  <span className={`badge text-[9px] font-black uppercase ${
                    report.acneLevel === 'Severe' ? 'badge-danger' : report.acneLevel === 'Moderate' ? 'badge-warning' : 'badge-safe'
                  }`}>{report.acneLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Pigmentation:</span>
                  <span className={`badge text-[9px] font-black uppercase ${
                    report.pigmentationLevel === 'Severe' ? 'badge-danger' : report.pigmentationLevel === 'Moderate' ? 'badge-warning' : 'badge-safe'
                  }`}>{report.pigmentationLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Dryness:</span>
                  <span className={`badge text-[9px] font-black uppercase ${
                    report.drynessLevel === 'Severe' ? 'badge-danger' : report.drynessLevel === 'Moderate' ? 'badge-warning' : 'badge-safe'
                  }`}>{report.drynessLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Oiliness:</span>
                  <span className={`badge text-[9px] font-black uppercase ${
                    report.oilinessLevel === 'Severe' ? 'badge-danger' : report.oilinessLevel === 'Moderate' ? 'badge-warning' : 'badge-safe'
                  }`}>{report.oilinessLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Sensitivity:</span>
                  <span className="badge badge-lavender text-[9px] font-black uppercase">
                    {report.isSensitive === 'Yes' ? 'Sensitive' : 'Resilient'}
                  </span>
                </div>
              </div>
            </div>

            {/* Target & Concern */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-extrabold text-[10px] border-b pb-2 uppercase tracking-wider text-gray-400 border-pink-100/50">Focus Areas</h3>
              <div className="space-y-3.5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Main Concern</span>
                  <span className="badge badge-lavender text-xs py-1.5 self-start font-bold">{report.mainConcern}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Primary Goal</span>
                  <span className="badge badge-safe text-xs py-1.5 self-start font-bold">{report.mainGoal}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right panel: Recommendations */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Daily Routines */}
            <div className="glass-card p-6 space-y-5">
              <h3 className="font-extrabold text-sm flex items-center gap-2"><BookOpen className="text-primary" size={16} /> Recommended Routine Steps</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Morning */}
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/50">
                  <h4 className="font-extrabold text-xs text-amber-800 mb-3.5 flex items-center gap-1.5">☀️ Morning Steps</h4>
                  <div className="space-y-2.5">
                    {report.generatedRoutine.morning.map((step: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Check className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                        <span className="font-semibold text-amber-950">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Night */}
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/50">
                  <h4 className="font-extrabold text-xs text-indigo-800 mb-3.5 flex items-center gap-1.5">🌙 Night Steps</h4>
                  <div className="space-y-2.5">
                    {report.generatedRoutine.night.map((step: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Check className="text-indigo-600 flex-shrink-0 mt-0.5" size={14} />
                        <span className="font-semibold text-indigo-950">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Products */}
            {report.recommendedProducts && report.recommendedProducts.length > 0 && (
              <div className="glass-card p-6 space-y-5 text-left">
                <h3 className="font-extrabold text-sm flex items-center gap-2 text-gray-700">
                  <Sparkles className="text-primary" size={16} /> Recommended Skincare Products
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {report.recommendedProducts.map((prod: RecommendedProduct, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/50 border border-pink-100/30 flex flex-col justify-between space-y-3.5 shadow-sm hover:shadow-md transition-all">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-black text-xs text-gray-800 leading-tight">{prod.name}</h4>
                          <span className="text-[9px] bg-pink-50 text-primary px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider flex-shrink-0">{prod.brand}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{prod.category} • {prod.timeOfDay}</p>
                        <div className="space-y-1 text-left">
                          <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                            <span className="text-gray-400 font-black">Actives:</span> {prod.ingredients}
                          </p>
                          <p className="text-[11px] text-gray-600 leading-relaxed italic">
                            "{prod.whyRecommended}"
                          </p>
                        </div>
                      </div>
                      <div className="bg-pink-50/20 p-2.5 rounded-xl border border-pink-100/10 text-[10px] text-gray-500 leading-normal font-semibold">
                        <span className="font-bold text-primary block uppercase tracking-wider text-[8px] mb-0.5">How to use:</span>
                        {prod.howToUse}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skincare Tips */}
            {report.skincareTips && report.skincareTips.length > 0 && (
              <div className="glass-card p-6 space-y-4 text-left">
                <h3 className="font-extrabold text-sm flex items-center gap-2 text-gray-700">
                  <Sparkles className="text-primary animate-pulse" size={16} /> Personalized Skincare Tips
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {report.skincareTips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span className="font-semibold leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Habits */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-extrabold text-sm flex items-center gap-2">🌿 Skin-Supportive Habits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.healthyHabits.map((habit: string, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl border flex items-center gap-2 text-xs font-semibold bg-white/40 border-pink-100/30"
                  >
                    {habit}
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly goals */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-extrabold text-sm">📈 Weekly Commitments</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
                <div className="p-3 rounded-2xl bg-pink-50/30 border border-pink-100/30">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Morning</p>
                  <p className="font-black text-sm text-primary mt-1">{report.weeklyGoals.morningRoutine}</p>
                </div>
                <div className="p-3 rounded-2xl bg-pink-50/30 border border-pink-100/30">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Night</p>
                  <p className="font-black text-sm text-primary mt-1">{report.weeklyGoals.nightRoutine}</p>
                </div>
                <div className="p-3 rounded-2xl bg-pink-50/30 border border-pink-100/30">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Water Goal</p>
                  <p className="font-black text-sm text-primary mt-1">{report.weeklyGoals.drinkWater}</p>
                </div>
                <div className="p-3 rounded-2xl bg-pink-50/30 border border-pink-100/30">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sleep Goal</p>
                  <p className="font-black text-sm text-primary mt-1">{report.weeklyGoals.sleepHours}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Educational Disclaimer */}
        {report.disclaimer && (
          <div className="glass-card p-4.5 bg-red-50/10 border border-primary/20 text-left">
            <p className="text-[11px] font-semibold text-gray-500 leading-relaxed">
              <span className="font-black text-primary uppercase tracking-wider text-[9px] block mb-1">Medical Disclaimer</span>
              {report.disclaimer}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3.5 pt-4">
          <button
            onClick={handleSaveReport}
            disabled={saving}
            className="btn-secondary py-3.5 px-8 text-xs font-bold flex items-center justify-center gap-2 flex-1 shadow-md bg-white border-none text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Save size={15} /> Save Report to Profile
          </button>
          <button
            onClick={handleContinue}
            className="btn-primary py-3.5 px-8 text-xs font-black flex items-center justify-center gap-2 flex-1 shadow-lg cursor-pointer"
          >
            Continue to Dashboard <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default SkinReportPage;
