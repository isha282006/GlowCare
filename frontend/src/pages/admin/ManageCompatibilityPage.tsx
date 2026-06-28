import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Plus, Trash2, Edit2, AlertOctagon } from 'lucide-react';
import { compatibilityService } from '../../api/services';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSkeleton, Modal } from '../../components/ui';
import type { CompatibilityRule } from '../../types';

const ManageCompatibilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [rules, setRules] = useState<CompatibilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CompatibilityRule | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Partial<CompatibilityRule>>();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await compatibilityService.getRules();
      setRules(res.data.data);
    } catch {
      showToast('Failed to fetch compatibility rules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Partial<CompatibilityRule>) => {
    try {
      if (editingItem) {
        await compatibilityService.updateRule(editingItem._id, data);
        showToast('Rule updated!', 'success');
      } else {
        await compatibilityService.createRule(data);
        showToast('Rule created!', 'success');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      reset();
      fetchRules();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save rule', 'error');
    }
  };

  const handleEditClick = (item: CompatibilityRule) => {
    setEditingItem(item);
    setValue('ingredientA', item.ingredientA);
    setValue('ingredientB', item.ingredientB);
    setValue('status', item.status);
    setValue('warningMessage', item.warningMessage);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this compatibility rule?')) return;
    try {
      await compatibilityService.deleteRule(id);
      showToast('Rule deleted', 'success');
      fetchRules();
    } catch {
      showToast('Failed to delete rule', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'avoid': return 'badge-danger';
      case 'warning': return 'badge-warning';
      default: return 'badge-safe';
    }
  };

  return (
    <div className="page-container max-w-4xl relative z-10">
      <button onClick={() => navigate('/admin')} className="btn-secondary mb-5 text-xs font-semibold flex items-center gap-2">
        <ArrowLeft size={14} /> Back to Admin
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 text-left">
        <div>
          <h1 className="page-title flex items-center gap-2">Manage Compatibility Rules 🛡️</h1>
          <p className="page-subtitle">Configure ingredient interactions to alert users of hazardous layer collisions</p>
        </div>
        <button onClick={() => { setEditingItem(null); reset(); setIsModalOpen(true); }} className="btn-primary flex items-center gap-1.5 text-xs font-black py-2.5 px-6 shadow-md cursor-pointer self-start sm:self-center">
          <Plus size={15} /> New Rule
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : rules.length === 0 ? (
        <div className="text-center py-12 bg-white/20 rounded-3xl border border-pink-100 border-dashed font-semibold text-xs text-gray-400">No compatibility rules registered.</div>
      ) : (
        <div className="space-y-4 text-left">
          {rules.map(rule => (
            <div
              key={rule._id}
              className="glass-card p-5.5 flex items-start justify-between gap-4 border border-white/40 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <AlertOctagon size={24} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-extrabold text-sm text-gray-800">
                      {rule.ingredientA} + {rule.ingredientB}
                    </span>
                    <span className={`badge text-[9px] uppercase py-0.5 px-2 font-black ${getStatusBadge(rule.status)}`}>
                      {rule.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-550 leading-relaxed font-semibold">{rule.warningMessage}</p>
                </div>
              </div>
              
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleEditClick(rule)}
                  className="p-2 text-gray-400 hover:text-primary rounded-xl cursor-pointer border-none bg-transparent"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(rule._id)}
                  className="p-2 text-coral rounded-xl cursor-pointer border-none bg-transparent"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Compatibility Rule' : 'Create Compatibility Rule'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Ingredient A *</label>
              <input {...register('ingredientA', { required: 'Required' })} className="input-field" placeholder="e.g. Retinol" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Ingredient B *</label>
              <input {...register('ingredientB', { required: 'Required' })} className="input-field" placeholder="e.g. Vitamin C" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Status / Action Type</label>
            <select {...register('status')} className="input-field text-xs font-semibold text-gray-600 appearance-none">
              <option value="avoid">Avoid (High Risk conflict)</option>
              <option value="warning">Warning (Medium risk, use with caution)</option>
              <option value="safe">Safe (Synergistic or completely fine)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Warning Message *</label>
            <textarea {...register('warningMessage', { required: 'Required' })} className="input-field" rows={3} placeholder="Retinol and Vitamin C can cause irritation when used together..." />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-pink-100/50">
            <button type="submit" className="btn-primary flex-1 text-xs font-black py-3.5 shadow-md cursor-pointer">Save Rule</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-3.5 px-6">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCompatibilityPage;
