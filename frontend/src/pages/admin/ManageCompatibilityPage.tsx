import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiAlertOctagon } from 'react-icons/fi';
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
    <div className="page-container max-w-4xl">
      <button onClick={() => navigate('/admin')} className="btn-secondary mb-4 text-sm flex items-center gap-1">
        <FiArrowLeft /> Back to Admin
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Manage Compatibility Rules 🛡️</h1>
          <p className="page-subtitle">Configure ingredient interactions to alert users of hazardous layer collisions</p>
        </div>
        <button onClick={() => { setEditingItem(null); reset(); setIsModalOpen(true); }} className="btn-primary flex items-center gap-1">
          <FiPlus /> New Rule
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : rules.length === 0 ? (
        <div className="text-center py-12">No compatibility rules registered.</div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <div
              key={rule._id}
              className="glass-card p-5 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <FiAlertOctagon size={24} className="text-lavender-dark mt-1 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">
                      {rule.ingredientA} + {rule.ingredientB}
                    </span>
                    <span className={`badge text-[9px] uppercase py-0 ${getStatusBadge(rule.status)}`}>
                      {rule.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{rule.warningMessage}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(rule)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer border-none"
                  style={{ background: 'transparent' }}
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(rule._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer border-none"
                  style={{ background: 'transparent' }}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Compatibility Rule' : 'Create Compatibility Rule'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Ingredient A *</label>
              <input {...register('ingredientA', { required: 'Required' })} className="input-field" placeholder="e.g. Retinol" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Ingredient B *</label>
              <input {...register('ingredientB', { required: 'Required' })} className="input-field" placeholder="e.g. Vitamin C" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Status / Action Type</label>
            <select {...register('status')} className="input-field">
              <option value="avoid">Avoid (High Risk conflict)</option>
              <option value="warning">Warning (Medium risk, use with caution)</option>
              <option value="safe">Safe (Synergistic or completely fine)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Warning Message *</label>
            <textarea {...register('warningMessage', { required: 'Required' })} className="input-field" rows={3} placeholder="Retinol and Vitamin C can cause irritation when used together..." />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Rule</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCompatibilityPage;
