import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiSearch } from 'react-icons/fi';
import { ingredientService } from '../../api/services';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSkeleton, Modal } from '../../components/ui';
import type { Ingredient } from '../../types';

const ManageIngredientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { register, handleSubmit, reset, setValue } = useForm<Partial<Ingredient>>();

  useEffect(() => {
    fetchIngredients();
  }, [searchQuery]);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      const res = await ingredientService.getAll(params);
      setIngredients(res.data.data);
    } catch {
      showToast('Failed to fetch ingredients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Partial<Ingredient>) => {
    try {
      if (editingItem) {
        await ingredientService.update(editingItem._id, data);
        showToast('Ingredient updated!', 'success');
      } else {
        await ingredientService.create(data);
        showToast('Ingredient created!', 'success');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      reset();
      fetchIngredients();
    } catch {
      showToast('Failed to save ingredient', 'error');
    }
  };

  const handleEditClick = (item: Ingredient) => {
    setEditingItem(item);
    setValue('name', item.name);
    setValue('description', item.description);
    setValue('category', item.category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this ingredient?')) return;
    try {
      await ingredientService.delete(id);
      showToast('Ingredient deleted', 'success');
      fetchIngredients();
    } catch {
      showToast('Failed to delete ingredient', 'error');
    }
  };

  return (
    <div className="page-container max-w-4xl">
      <button onClick={() => navigate('/admin')} className="btn-secondary mb-4 text-sm flex items-center gap-1">
        <FiArrowLeft /> Back to Admin
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Manage Ingredients 🔬</h1>
          <p className="page-subtitle">Configure ingredients database to track definitions and categories</p>
        </div>
        <button onClick={() => { setEditingItem(null); reset(); setIsModalOpen(true); }} className="btn-primary flex items-center gap-1">
          <FiPlus /> New Ingredient
        </button>
      </div>

      {/* Search Input bar */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ingredients..."
          className="input-field pl-10"
        />
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : ingredients.length === 0 ? (
        <div className="text-center py-12">No ingredients found. Click add to register.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ingredients.map(ing => (
            <div
              key={ing._id}
              className="glass-card p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm">{ing.name}</h3>
                  <span className="badge badge-info text-[9px] py-0">{ing.category}</span>
                </div>
                <p className="text-xs text-gray-400">{ing.description || 'No description'}</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(ing)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer border-none"
                  style={{ background: 'transparent' }}
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(ing._id)}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Ingredient' : 'Create Ingredient'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Ingredient Name *</label>
              <input {...register('name', { required: 'Required' })} className="input-field" placeholder="e.g. Retinol" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select {...register('category')} className="input-field">
                {['Active', 'Humectant', 'Exfoliant', 'Soothing', 'Moisturizer', 'Sunscreen', 'Natural', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea {...register('description')} className="input-field" rows={3} placeholder="Vitamin A derivative for skin turnover..." />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Ingredient</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageIngredientsPage;
