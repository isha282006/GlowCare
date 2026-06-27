import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
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
    <div className="page-container max-w-4xl">
      <button onClick={() => navigate('/admin')} className="btn-secondary mb-4 text-sm flex items-center gap-1">
        <FiArrowLeft /> Back to Admin
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Manage Categories 🏷️</h1>
          <p className="page-subtitle">Add or edit product categories that users map their products into</p>
        </div>
        <button onClick={() => { setEditingItem(null); reset(); setIsModalOpen(true); }} className="btn-primary flex items-center gap-1">
          <FiPlus /> New Category
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : categories.length === 0 ? (
        <div className="text-center py-12">No categories found. Click add to create one.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(c => (
            <div
              key={c._id}
              className="glass-card p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{c.icon || '🧴'}</span>
                <div>
                  <h3 className="font-bold text-sm">{c.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{c.description || 'No description'}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(c)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer border-none"
                  style={{ background: 'transparent' }}
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-semibold mb-2">Icon (Emoji)</label>
              <input {...register('icon', { required: 'Required' })} className="input-field text-center" placeholder="🧴" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-2">Category Name *</label>
              <input {...register('name', { required: 'Required' })} className="input-field" placeholder="Cleanser" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea {...register('description')} className="input-field" rows={3} placeholder="Facial cleansers and wash products" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Category</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCategoriesPage;
