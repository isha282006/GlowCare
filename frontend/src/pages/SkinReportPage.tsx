import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiArrowRight, FiCheck, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../api/services';

const SkinReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const [saving, setSaving] = useState(false);

  // Load choices from localStorage (with fallbacks)
  const skinType = localStorage.getItem('glowcare_user_skin_type') || 'normal';
  const acne = localStorage.getItem('glowcare_user_acne') || 'none';
  const pigmentation = localStorage.getItem('glowcare_user_pigmentation') || 'none';
  const sunscreen = localStorage.getItem('glowcare_user_sunscreen') || 'daily';
  const routineConsistency = localStorage.getItem('glowcare_user_routine_consistency') || 'always';
  const waterGoal = Number(localStorage.getItem('glowcare_user_water_goal') || '2.0'); // In Liters
  const sleepHours = Number(localStorage.getItem('glowcare_user_sleep_goal') || '8');
  
  const concernsStr = localStorage.getItem('glowcare_user_concerns') || '[]';
  const concerns: string[] = JSON.parse(concernsStr);

  // Generate the report programmatically based on the precise rules
  const report = user?.skinReport || calculateReport();

  function calculateReport() {
    // 1. Skin Score Calculation
    let score = 100;
    if (acne === 'frequent') score -= 10;
    if (acne === 'severe') score -= 20;
    
    if (pigmentation === 'moderate') score -= 8;
    if (pigmentation === 'severe') score -= 15;
    
    if (sunscreen === 'never') score -= 10;
    if (waterGoal < 1.0) score -= 5;
    if (sleepHours < 6) score -= 5;
    
    if (routineConsistency === 'rarely') score -= 10;
    if (routineConsistency === 'never') score -= 20;
    
    score = Math.max(30, Math.min(100, score));

    // 2. Levels based on choices
    const acneLevel = acne === 'severe' ? 'Severe' : acne === 'frequent' ? 'Moderate' : 'Low';
    const pigmentationLevel = pigmentation === 'severe' ? 'Severe' : pigmentation === 'moderate' ? 'Moderate' : 'Low';
    const hydration = (skinType === 'dry' || waterGoal < 1.0) ? 'Low' : 'Good';
    const oiliness = skinType === 'oily' ? 'High' : skinType === 'combination' ? 'Moderate' : 'Low';
    const sensitivity = skinType === 'sensitive' ? 'High' : 'Low';

    // 3. Rule-based recommendations
    const recs: string[] = [];
    const morningRoutine = ['Gentle Cleanser'];
    const nightRoutine = ['Cleanser'];

    // Skin type rules
    if (skinType === 'oily') {
      morningRoutine[0] = 'Oil-Free Cleanser';
      morningRoutine.push('Gel Moisturizer');
      morningRoutine.push('Niacinamide');
      recs.push('Use light gel-based formulations to prevent pore clogging.');
    }
    if (skinType === 'dry') {
      morningRoutine[0] = 'Cream Cleanser';
      morningRoutine.push('Ceramide Moisturizer');
      morningRoutine.push('Hyaluronic Acid');
      recs.push('Incorporate rich moisturizers to restore lipid balance.');
    }
    if (skinType === 'sensitive') {
      recs.push('Always select fragrance-free skincare products.');
      morningRoutine[0] = 'Gentle Cleanser';
      morningRoutine.push('Ceramide Moisturizer');
    }

    // Acne rules
    if (acne === 'frequent' || acne === 'severe') {
      recs.push('Salicylic Acid (BHA) for deep pore exfoliation.');
      recs.push('Benzoyl Peroxide to kill acne-causing bacteria.');
      nightRoutine.push('Salicylic Acid');
      nightRoutine.push('Benzoyl Peroxide Treatment');
    }

    // Pigmentation rules
    if (pigmentation === 'moderate' || pigmentation === 'severe') {
      recs.push('Vitamin C in the morning to inhibit melanin production.');
      recs.push('Niacinamide to reduce hyperpigmentation transfers.');
      morningRoutine.push('Vitamin C');
      morningRoutine.push('Niacinamide');
    }

    // Always recommend sunscreen
    morningRoutine.push('Sunscreen SPF 50');

    // General night recommendations
    nightRoutine.push('Moisturizer');

    // Healthy habits list
    const healthyHabits = [
      '💧 Drink at least 2L of water',
      '😴 Sleep 7–8 hours',
      '☀️ Apply sunscreen every morning',
      '🥗 Eat fruits and vegetables',
      '🧘 Reduce stress'
    ];

    // Weekly goals template
    const weeklyGoals = {
      morningRoutine: '0/7',
      nightRoutine: '0/7',
      drinkWater: '0/7',
      sleepHours: '0/7'
    };

    // Warnings and reminders
    const warnings: string[] = [];
    if (sunscreen === 'never') {
      warnings.push('Daily sunscreen is highly recommended to prevent pigmentation and premature aging.');
    }
    if (waterGoal < 1.0) {
      warnings.push('You should drink more water to keep your skin hydrated.');
    }
    if (sleepHours < 6) {
      warnings.push('Better sleep improves skin repair and reduces dark circles.');
    }

    return {
      skinScore: score,
      skinType: skinType.charAt(0).toUpperCase() + skinType.slice(1),
      acneLevel,
      pigmentationLevel,
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
      waterGoal: waterGoal,
      sleepGoal: sleepHours
    };
  }

  const handleSaveReport = async () => {
    setSaving(true);
    try {
      const response = await authService.updateProfile({ skinReport: report });
      if (response.data.success) {
        updateUser(response.data.user);
        showToast('Skin Report saved successfully! 💾', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save skin report', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    localStorage.setItem('glowcare_onboarding_completed', 'true');
    if (!user?.skinReport) {
      try {
        const response = await authService.updateProfile({ skinReport: report });
        if (response.data.success) {
          updateUser(response.data.user);
        }
      } catch (err) {
        console.error('Failed to auto-save skin report:', err);
      }
    }
    navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen py-10 px-4 md:px-8"
      style={{
        background: isDark
          ? 'radial-gradient(circle at 10% 20%, #1A1A2E 0%, #0F0F1A 100%)'
          : 'linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #FFF5F7 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-black gradient-text tracking-tight flex items-center justify-center gap-2">
            ✨ Your Personalized Skin Report
          </h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            Based on your responses, we've created a skincare profile to help you stay consistent.
          </p>
        </div>

        {/* Warnings & Reminders block */}
        {report.warnings && report.warnings.length > 0 && (
          <div className="space-y-2.5">
            {report.warnings.map((warn: string, i: number) => (
              <div
                key={i}
                className="glass-card p-4 flex items-start gap-3 border-l-4 border-l-amber-400"
                style={{ background: 'rgba(255, 244, 229, 0.4)' }}
              >
                <FiAlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-semibold text-amber-900 leading-relaxed">{warn}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* COLUMN 1: Score & Diagnostics */}
          <div className="md:col-span-1 space-y-6">
            
            {/* CARD 1: Skin Score */}
            <div className="glass-card p-6 text-center space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Overall Skin Score</h3>
              <div className="relative w-36 h-36 mx-auto flex flex-col items-center justify-center rounded-full bg-lavender/10 border-4 border-dashed border-lavender animate-pulse">
                <span className="text-4xl font-black gradient-text">{report.skinScore}</span>
                <span className="text-[10px] text-gray-400 font-bold">/ 100</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Your skin is healthy but can improve with consistency.
              </p>
            </div>

            {/* CARD 2: Skin Summary */}
            <div className="glass-card p-6 space-y-3">
              <h3 className="font-bold text-xs border-b pb-2 uppercase tracking-wider text-gray-400">Skin Summary</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Skin Type:</span>
                  <span className="badge badge-lavender text-[10px] font-extrabold uppercase">{report.skinType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Acne Level:</span>
                  <span className={`badge text-[10px] font-extrabold uppercase ${
                    report.acneLevel === 'Severe' ? 'badge-danger' : report.acneLevel === 'Moderate' ? 'badge-warning' : 'badge-safe'
                  }`}>{report.acneLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Oiliness:</span>
                  <span className="badge badge-info text-[10px] font-extrabold uppercase">{report.oiliness}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Pigmentation:</span>
                  <span className="badge badge-warning text-[10px] font-extrabold uppercase">{report.pigmentationLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Hydration:</span>
                  <span className={`badge text-[10px] font-extrabold uppercase ${
                    report.hydration === 'Good' ? 'badge-safe' : 'badge-danger'
                  }`}>{report.hydration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Sensitivity:</span>
                  <span className="badge badge-lavender text-[10px] font-extrabold uppercase">{report.sensitivity}</span>
                </div>
              </div>
            </div>

            {/* CARD 3: Main Skin Concerns */}
            <div className="glass-card p-6 space-y-3">
              <h3 className="font-bold text-xs border-b pb-2 uppercase tracking-wider text-gray-400">Main Skin Concerns</h3>
              <div className="flex flex-wrap gap-1.5">
                {concerns.length > 0 ? (
                  concerns.map((con, i) => (
                    <span key={i} className="badge badge-lavender text-[10px] py-1 px-2.5 font-semibold">
                      ✓ {con.charAt(0).toUpperCase() + con.slice(1).replace('_', ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No primary concerns selected</span>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Recommendations, Habits & Goals */}
          <div className="md:col-span-2 space-y-6">
            
            {/* CARD 4: Daily Recommendations */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-1.5"><FiBookOpen className="text-lavender-dark" /> Daily Recommendations</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Morning */}
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/50">
                  <h4 className="font-bold text-xs text-amber-800 mb-3 flex items-center gap-1">☀️ Morning Routine</h4>
                  <div className="space-y-2">
                    {report.generatedRoutine.morning.map((step: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <FiCheck className="text-amber-600 flex-shrink-0" />
                        <span className="font-medium text-amber-900">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Night */}
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/50">
                  <h4 className="font-bold text-xs text-indigo-800 mb-3 flex items-center gap-1">🌙 Night Routine</h4>
                  <div className="space-y-2">
                    {report.generatedRoutine.night.map((step: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <FiCheck className="text-indigo-600 flex-shrink-0" />
                        <span className="font-medium text-indigo-900">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text suggestions list */}
              {report.recommendations.length > 0 && (
                <div className="mt-2 pt-2 border-t text-xs space-y-1 text-gray-500">
                  {report.recommendations.map((rec: string, i: number) => (
                    <p key={i}>• {rec}</p>
                  ))}
                </div>
              )}
            </div>

            {/* CARD 5: Healthy Habits */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-1.5"><FiCheck className="text-mint-dark" /> Healthy Habits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.healthyHabits.map((habit: string, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold bg-white/40 border-gray-100"
                  >
                    <span>{habit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 6: Weekly Goals progress indicators */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-1.5">📈 Weekly Skincare Goals</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-dark-bg/20 space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Morning</p>
                  <p className="font-black text-sm text-lavender-dark">{report.weeklyGoals.morningRoutine}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-dark-bg/20 space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Night</p>
                  <p className="font-black text-sm text-lavender-dark">{report.weeklyGoals.nightRoutine}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-dark-bg/20 space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Water 2L</p>
                  <p className="font-black text-sm text-lavender-dark">{report.weeklyGoals.drinkWater}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-dark-bg/20 space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Sleep 8H</p>
                  <p className="font-black text-sm text-lavender-dark">{report.weeklyGoals.sleepHours}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={handleSaveReport}
            disabled={saving}
            className="btn-secondary py-3 px-8 text-sm flex items-center justify-center gap-2 flex-1 shadow-md"
            style={{ background: 'white' }}
          >
            <FiSave /> {saving ? 'Saving Skincare Report...' : 'Save Report to Profile'}
          </button>
          <button
            onClick={handleContinue}
            className="btn-primary py-3 px-8 text-sm flex items-center justify-center gap-2 flex-1 shadow-md"
          >
            Continue to Dashboard <FiArrowRight />
          </button>
        </div>

      </div>
    </div>
  );
};

export default SkinReportPage;
