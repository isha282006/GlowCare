import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, ShoppingBag, Search, Calendar, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { wishlistService, categoryService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { LoadingSkeleton, EmptyState, Modal } from '../components/ui';
import type { WishlistItem, Category } from '../types';

interface WishlistFormData {
  productName: string;
  brand: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  price: number;
  reminderDate: string;
  notes: string;
}

const WishlistPage: React.FC = () => {
  const { showToast } = useToast();
  
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<WishlistFormData>({
    defaultValues: {
      productName: '',
      brand: '',
      category: 'Other',
      priority: 'medium',
      price: 0,
      reminderDate: '',
      notes: ''
    }
  });

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

  useEffect(() => {
    fetchWishlist();
    categoryService.getAll().then((res: any) => setCategories(res.data.data)).catch(() => {});
  }, []);

  const onSubmit = async (data: WishlistFormData) => {
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        reminderDate: data.reminderDate ? new Date(data.reminderDate).toISOString() : undefined
      };

      if (editingItem) {
        await wishlistService.update(editingItem._id, payload);
        showToast('Wishlist item updated! 💾', 'success');
      } else {
        await wishlistService.add(payload);
        showToast('Added to skincare wishlist! 💖', 'success');
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
    setValue('price', item.price || 0);
    setValue('reminderDate', item.reminderDate ? item.reminderDate.split('T')[0] : '');
    setValue('notes', item.notes);
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this product from wishlist?')) return;
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
      showToast('Moved to owned inventory! 🧴🎉', 'success');
      fetchWishlist();
    } catch {
      showToast('Failed to move item to inventory', 'error');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'badge-danger';
      case 'medium': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  // Filtered and Searched wishlist items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(search.toLowerCase()) || 
                          (item.brand && item.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = filterPriority ? item.priority === filterPriority : true;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="page-container relative z-10">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            Skincare Wishlist 💖
          </h1>
          <p className="page-subtitle">Add products you plan to acquire, set alerts, and transfer them once owned</p>
        </div>
        <button onClick={() => { setEditingItem(null); reset(); setIsAddOpen(true); }} className="btn-primary flex items-center gap-1.5 text-xs font-black py-2.5 px-6 shadow-md cursor-pointer">
          <Plus size={15} /> Add Item
        </button>
      </div>

      {/* Search & filters */}
      <div className="glass-card p-5 mb-8 border border-white/40 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wishlist by product or brand name..."
              className="input-field pl-11 text-xs"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field text-xs font-semibold text-gray-600 appearance-none"
          >
            <option value="">All Priorities</option>
            <option value="high">🔥 High Priority</option>
            <option value="medium">⚡ Medium Priority</option>
            <option value="low">🌿 Low Priority</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title="Wishlist is empty"
          description="Build your wishlist of skincare targets and set alerts to follow sales."
          action={<button onClick={() => setIsAddOpen(true)} className="btn-primary text-xs cursor-pointer"><Plus size={14} /> Add First Item</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-5.5 flex flex-col justify-between border border-white/40 shadow-sm"
              >
                <div className="text-left">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm text-gray-800 truncate">{item.productName}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{item.brand || 'Generic / Unknown'}</p>
                    </div>
                    <span className={`badge uppercase text-[8px] font-black py-0.5 px-2.5 ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="badge badge-lavender text-[9px] uppercase font-bold">{item.category}</span>
                  </div>

                  {/* Pricing and reminder date */}
                  <div className="grid grid-cols-2 gap-3 border-t border-b border-pink-100/35 py-3 mb-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={13} className="text-primary" />
                      <span>Price: <b className="text-gray-700">${(item.price || 0).toFixed(2)}</b></span>
                    </div>
                    {item.reminderDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-primary" />
                        <span className="truncate">Alert: <b className="text-gray-700">{new Date(item.reminderDate).toLocaleDateString()}</b></span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-gray-400 italic leading-relaxed line-clamp-3 bg-pink-50/15 p-2.5 rounded-2xl border border-pink-100/10 mb-4 font-semibold">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="flex gap-2.5 pt-4.5 border-t border-pink-100/35">
                  <button
                    onClick={() => handleMoveToInventory(item._id)}
                    className="btn-primary text-xs flex-1 py-2 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <ShoppingBag size={13} /> Owned
                  </button>
                  <button
                    onClick={() => handleEditClick(item)}
                    className="btn-secondary text-xs py-2 px-3 flex items-center justify-center bg-white border-none shadow-sm cursor-pointer"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn-danger text-xs py-2 px-3 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={editingItem ? 'Edit Wishlist Item' : 'Add Skincare Target to Wishlist'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5 text-left">
          
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Product Name *</label>
            <input {...register('productName', { required: 'Product name is required' })} className="input-field" placeholder="e.g. CeraVe Moisturizing Lotion" />
            {errors.productName && <p className="text-xs mt-1 text-coral font-semibold">{errors.productName.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Brand</label>
              <input {...register('brand')} className="input-field" placeholder="e.g. CeraVe" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Category</label>
              <select {...register('category')} className="input-field text-xs font-semibold text-gray-650 appearance-none">
                {categories.map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Target Price ($)</label>
              <input {...register('price', { valueAsNumber: true })} type="number" min="0" step="0.01" className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Calendar Alert Date</label>
              <input {...register('reminderDate')} type="date" className="input-field font-semibold text-gray-600" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Wishlist Priority</label>
            <div className="flex gap-2.5">
              {['low', 'medium', 'high'].map(p => (
                <label
                  key={p}
                  className={`flex-1 text-center py-2.5 rounded-full text-xs font-black cursor-pointer border transition-all uppercase tracking-wider ${
                    watch('priority') === p
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : 'bg-white/40 border-pink-100/50 text-gray-450 hover:border-pink-200'
                  }`}
                >
                  <input
                    {...register('priority')}
                    type="radio"
                    value={p}
                    className="hidden"
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Diagnostic Notes</label>
            <textarea {...register('notes')} className="input-field" rows={3} placeholder="Scent, shop link, ingredient tags, reasons for wishing..." />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-pink-100/50">
            <button type="submit" className="btn-primary flex-1 text-xs font-black py-3.5 shadow-md cursor-pointer">Save Wishlist Item</button>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary text-xs py-3.5 px-6">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WishlistPage;
