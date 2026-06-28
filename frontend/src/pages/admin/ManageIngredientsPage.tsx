import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Plus, Trash2, Edit2, Search } from 'lucide-react';
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
    <div className="page-container max-w-4xl relative z-10">
      <button onClick={() => navigate('/admin')} className="btn-secondary mb-5 text-xs font-semibold flex items-center gap-2">
        <ArrowLeft size={14} /> Back to Admin
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 text-left">
        <div>
          <h1 className="page-title flex items-center gap-2">Manage Ingredients 🔬</h1>
          <p className="page-subtitle">Configure ingredients database to track definitions and categories</p>
        </div>
        <button onClick={() => { setEditingItem(null); reset(); setIsModalOpen(true); }} className="btn-primary flex items-center gap-1.5 text-xs font-black py-2.5 px-6 shadow-md cursor-pointer self-start sm:self-center">
          <Plus size={15} /> New Ingredient
        </button>
      </div>

      {/* Search Input bar */}
      <div className="relative mb-8 text-left">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ingredients..."
          className="input-field pl-11 text-xs"
        />
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : ingredients.length === 0 ? (
        <div className="text-center py-12 bg-white/20 rounded-3xl border border-pink-100 border-dashed font-semibold text-xs text-gray-400">No ingredients found. Click add to register.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          {ingredients.map(ing => (
            <div
              key={ing._id}
              className="glass-card p-5.5 flex items-center justify-between gap-4 border border-white/40 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h3 className="font-extrabold text-sm text-gray-800 truncate">{ing.name}</h3>
                  <span className="badge badge-info text-[9px] py-0.5 px-2 font-black uppercase">{ing.category}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-semibold line-clamp-2">{ing.description || 'No description'}</p>
              </div>
              
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleEditClick(ing)}
                  className="p-2 text-gray-400 hover:text-primary rounded-xl cursor-pointer border-none bg-transparent"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(ing._id)}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Ingredient' : 'Create Ingredient'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Ingredient Name *</label>
              <input {...register('name', { required: 'Required' })} className="input-field" placeholder="e.g. Retinol" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Category</label>
              <select {...register('category')} className="input-field text-xs font-semibold text-gray-650 appearance-none">
                {['Active', 'Humectant', 'Exfoliant', 'Soothing', 'Moisturizer', 'Sunscreen', 'Natural', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Description</label>
            <textarea {...register('description')} className="input-field" rows={3} placeholder="Vitamin A derivative for skin turnover..." />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-pink-100/50">
            <button type="submit" className="btn-primary flex-1 text-xs font-black py-3.5 shadow-md cursor-pointer">Save Ingredient</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-3.5 px-6">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageIngredientsPage;
