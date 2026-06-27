import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiShoppingBag } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { wishlistService, categoryService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSkeleton, EmptyState, Modal } from '../components/ui';
import type { WishlistItem, Category } from '../types';

interface WishlistFormData {
  productName: string;
  brand: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
}

const WishlistPage: React.FC = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<WishlistFormData>({
    defaultValues: {
      productName: '',
      brand: '',
      category: 'Other',
      priority: 'medium',
      notes: ''
    }
  });

  useEffect(() => {
    fetchWishlist();
    categoryService.getAll().then((res: any) => setCategories(res.data.data)).catch(() => {});
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistService.getAll();
      setItems(res.data.data);
    } catch {
      showToast('Failed to fetch wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: WishlistFormData) => {
    try {
      if (editingItem) {
        await wishlistService.update(editingItem._id, data);
        showToast('Wishlist item updated!', 'success');
      } else {
        await wishlistService.add(data);
        showToast('Added to wishlist! 💖', 'success');
      }
      setIsAddOpen(false);
      setEditingItem(null);
      reset();
      fetchWishlist();
    } catch {
      showToast('Failed to save wishlist item', 'error');
    }
  };

  const handleEditClick = (item: WishlistItem) => {
    setEditingItem(item);
    setValue('productName', item.productName);
    setValue('brand', item.brand);
    setValue('category', item.category);
    setValue('priority', item.priority);
    setValue('notes', item.notes);
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove from wishlist?')) return;
    try {
      await wishlistService.delete(id);
      showToast('Removed from wishlist', 'success');
      fetchWishlist();
    } catch {
      showToast('Failed to remove item', 'error');
    }
  };

  const handleMoveToInventory = async (id: string) => {
    try {
      await wishlistService.moveToInventory(id);
      showToast('Moved to product inventory! 🧴🎉', 'success');
      fetchWishlist();
    } catch {
      showToast('Failed to move item to inventory', 'error');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'badge-danger';
      case 'medium': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Skincare Wishlist 💖</h1>
          <p className="page-subtitle">Save products you want to buy and move them to inventory once bought</p>
        </div>
        <button onClick={() => { setEditingItem(null); reset(); setIsAddOpen(true); }} className="btn-primary flex items-center gap-1">
          <FiPlus /> Add Item
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title="Your wishlist is empty"
          description="Keep track of skincare products you wish to acquire next."
          action={<button onClick={() => setIsAddOpen(true)} className="btn-primary"><FiPlus /> Add First Item</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-sm">{item.productName}</h3>
                      <p className="text-xs" style={{ color: '#888' }}>{item.brand || 'No Brand'}</p>
                    </div>
                    <span className={`badge ${getPriorityColor(item.priority)}`}>
                      {item.priority} priority
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge badge-lavender">{item.category}</span>
                  </div>

                  {item.notes && (
                    <p className="text-xs mb-4" style={{ color: '#666' }}>{item.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.1)' }}>
                  <button
                    onClick={() => handleMoveToInventory(item._id)}
                    className="btn-primary text-xs flex-1 py-2 flex items-center justify-center gap-1"
                  >
                    <FiShoppingBag size={12} /> Owned
                  </button>
                  <button
                    onClick={() => handleEditClick(item)}
                    className="btn-secondary text-xs py-2 px-3 flex items-center justify-center"
                  >
                    <FiEdit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn-danger text-xs py-2 px-3 flex items-center justify-center"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={editingItem ? 'Edit Wishlist Item' : 'Add to Wishlist'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Product Name *</label>
            <input {...register('productName', { required: 'Name is required' })} className="input-field" placeholder="e.g. Hydro Boost Water Gel" />
            {errors.productName && <p className="text-xs mt-1 text-red-500">{errors.productName.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Brand</label>
              <input {...register('brand')} className="input-field" placeholder="e.g. Neutrogena" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select {...register('category')} className="input-field">
                {categories.map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Priority</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map(p => (
                <label
                  key={p}
                  className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                    watch('priority') === p
                      ? 'bg-lavender border-lavender text-lavender-dark'
                      : 'bg-transparent border-gray-300 text-gray-500'
                  }`}
                >
                  <input
                    {...register('priority')}
                    type="radio"
                    value={p}
                    className="hidden"
                  />
                  {p.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Notes / Details</label>
            <textarea {...register('notes')} className="input-field" rows={3} placeholder="Price, store location, why you want it..." />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Item</button>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WishlistPage;
