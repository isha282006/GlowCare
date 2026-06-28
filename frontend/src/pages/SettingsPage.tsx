import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, UploadCloud, Moon, Sun, RefreshCw, Palette, Sparkles, Database } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { dataService, authService } from '../api/services';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { showToast } = useToast();
  const { updateUser } = useAuth();
  
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resettingQuiz, setResettingQuiz] = useState(false);

  const handleRetakeAssessment = async () => {
    if (!window.confirm('Are you sure you want to retake your skin assessment? This will overwrite your current Skin Score and recommendations.')) return;
    try {
      setResettingQuiz(true);
      const res = await authService.updateProfile({ onboardingCompleted: false });
      if (res.data.success) {
        updateUser(res.data.user);
        localStorage.removeItem('glowcare_onboarding_completed');
        localStorage.removeItem('glowcare_onboarding_last_path');
        
        // Remove locally saved variables to ensure a clean start
        localStorage.removeItem('glowcare_user_skin_type');
        localStorage.removeItem('glowcare_user_acne');
        localStorage.removeItem('glowcare_user_pigmentation');
        localStorage.removeItem('glowcare_user_sunscreen');
        localStorage.removeItem('glowcare_user_routine_consistency');
        localStorage.removeItem('glowcare_user_concerns');
        localStorage.removeItem('glowcare_user_water_goal');
        localStorage.removeItem('glowcare_user_sleep_goal');
        localStorage.removeItem('glowcare_user_baseline_photo');

        showToast('Skin assessment reset successfully! Redirecting to welcome step... 🚀', 'success');
        navigate('/onboarding');
      }
    } catch {
      showToast('Failed to reset skin assessment', 'error');
    } finally {
      setResettingQuiz(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await dataService.exportData();
      
      // Generate downloadable JSON blob
      const jsonStr = JSON.stringify(res.data.data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `glowcare_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast('Data exported successfully! 💾', 'success');
    } catch {
      showToast('Failed to export backup data', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        
        // Basic schema check
        if (!parsedData.products && !parsedData.routines && !parsedData.journal) {
          throw new Error('Invalid backup file schema');
        }

        const res = await dataService.importData(parsedData);
        showToast(`Imported: ${res.data.data.products} products, ${res.data.data.routines} routines, ${res.data.data.journal} journal logs! 🎉`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to parse/import file data', 'error');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page-container max-w-3xl relative z-10">
      <div className="mb-8 text-left">
        <h1 className="page-title flex items-center gap-2">Platform Settings ⚙️</h1>
        <p className="page-subtitle">Configure application settings, theme configurations, database backups and data migration transfers</p>
      </div>

      <div className="space-y-6 text-left">
        
        {/* Theme Settings */}
        <div className="glass-card p-6.5 border border-white/40 shadow-sm">
          <h3 className="font-black text-sm mb-4.5 flex items-center gap-2 text-gray-700">
            <Palette size={16} className="text-primary" /> App Customization
          </h3>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs font-bold text-gray-650">Theme Radiance Variation</p>
              <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">Toggle dashboard colors between Blush Glow and Rose Gold Radiance.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="btn-secondary py-2.5 px-5 flex items-center gap-2 font-bold cursor-pointer text-xs"
            >
              {isDark ? (
                <>
                  <Sun className="text-amber-500" size={14} /> Blush Glow Light Mode
                </>
              ) : (
                <>
                  <Moon className="text-indigo-500" size={14} /> Rose Gold Radiance Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skin Assessment Settings */}
        <div className="glass-card p-6.5 border border-white/40 shadow-sm">
          <h3 className="font-black text-sm mb-4.5 flex items-center gap-2 text-gray-700">
            <Sparkles size={16} className="text-primary" /> Skincare Quiz & Profile
          </h3>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs font-bold text-gray-650">Retake Skin Assessment</p>
              <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">Reset your diagnostics score, routine recommendations, and questionnaire variables.</p>
            </div>
            <button
              onClick={handleRetakeAssessment}
              disabled={resettingQuiz}
              className="btn-danger py-2.5 px-5 flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <RefreshCw className={resettingQuiz ? 'animate-spin' : ''} size={13} /> {resettingQuiz ? 'Resetting...' : 'Retake Quiz'}
            </button>
          </div>
        </div>

        {/* Data Sync & Migrations */}
        <div className="glass-card p-6.5 border border-white/40 shadow-sm">
          <h3 className="font-black text-sm mb-4.5 flex items-center gap-2 text-gray-700">
            <Database size={16} className="text-primary" /> Backups & Migrations
          </h3>
          <p className="text-[10px] text-gray-400 mb-6 font-semibold leading-relaxed">
            Export all of your profile inventory, wishlist products, morning/night routines, daily notes, and journals. You can restore them anytime using the import function.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Export */}
            <div className="p-5 rounded-2xl border border-pink-100/35 flex flex-col justify-between bg-white/40">
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-650">Export Data</p>
                <p className="text-[10px] text-gray-450 mt-1 font-semibold leading-relaxed">Download a full JSON database backup containing all of your platform progress.</p>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer shadow-sm"
              >
                <Download size={13} /> {exporting ? 'Exporting...' : 'Download JSON Backup'}
              </button>
            </div>

            {/* Import */}
            <div className="p-5 rounded-2xl border border-pink-100/35 flex flex-col justify-between bg-white/40">
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-650">Import Data</p>
                <p className="text-[10px] text-gray-450 mt-1 font-semibold leading-relaxed">Restore or populate items by uploading a previously exported JSON backup file.</p>
              </div>
              <label className="btn-secondary py-2.5 flex items-center justify-center gap-2 text-xs cursor-pointer text-center font-bold">
                <UploadCloud size={13} className="text-primary" /> {importing ? 'Importing...' : 'Restore JSON Backup'}
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImport}
                  className="hidden"
                  disabled={importing}
                />
              </label>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
