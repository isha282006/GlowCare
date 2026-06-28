import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { categoryService } from '../../api/services';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSkeleton, Modal } from '../../components/ui';
import type { Category } from '../../types';

const ManageCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Partial<Category>>();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      setCategories(res.data.data);
    } catch {
      showToast('Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Partial<Category>) => {
    try {
      if (editingItem) {
        await categoryService.update(editingItem._id, data);
        showToast('Category updated!', 'success');
      } else {
        await categoryService.create(data);
        showToast('Category created!', 'success');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      reset();
      fetchCategories();
    } catch {
      showToast('Failed to save category', 'error');
    }
  };

  const handleEditClick = (item: Category) => {
    setEditingItem(item);
    setValue('name', item.name);
    setValue('icon', item.icon);
    setValue('description', item.description);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category? Products using this category will remain unchanged but won\'t be categorizable.')) return;
    try {
      await categoryService.delete(id);
      showToast('Category deleted', 'success');
      fetchCategories();
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  return (
    <div className="page-container max-w-4xl relative z-10">
      <button onClick={() => navigate('/admin')} className="btn-secondary mb-5 text-xs font-semibold flex items-center gap-2">
        <ArrowLeft size={14} /> Back to Admin
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 text-left">
        <div>
          <h1 className="page-title flex items-center gap-2">Manage Categories 🏷️</h1>
          <p className="page-subtitle">Add or edit product categories that users map their products into</p>
        </div>
        <button onClick={() => { setEditingItem(null); reset(); setIsModalOpen(true); }} className="btn-primary flex items-center gap-1.5 text-xs font-black py-2.5 px-6 shadow-md cursor-pointer self-start sm:self-center">
          <Plus size={15} /> New Category
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white/20 rounded-3xl border border-pink-100 border-dashed font-semibold text-xs text-gray-400">No categories found. Click add to create one.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          {categories.map(c => (
            <div
              key={c._id}
              className="glass-card p-5.5 flex items-center justify-between gap-4 border border-white/40 shadow-sm"
            >
              <div className="flex items-center gap-4.5">
                <span className="text-3.5xl filter drop-shadow-sm">{c.icon || '🧴'}</span>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-800">{c.name}</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5 leading-relaxed">{c.description || 'No description'}</p>
                </div>
              </div>
              
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleEditClick(c)}
                  className="p-2 text-gray-400 hover:text-primary rounded-xl cursor-pointer border-none bg-transparent"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5 text-left">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Icon (Emoji)</label>
              <input {...register('icon', { required: 'Required' })} className="input-field text-center font-bold text-lg" placeholder="🧴" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Category Name *</label>
              <input {...register('name', { required: 'Required' })} className="input-field" placeholder="Cleanser" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Description</label>
            <textarea {...register('description')} className="input-field" rows={3} placeholder="Facial cleansers and wash products" />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-pink-100/50">
            <button type="submit" className="btn-primary flex-1 text-xs font-black py-3.5 shadow-md cursor-pointer">Save Category</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-3.5 px-6">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCategoriesPage;
