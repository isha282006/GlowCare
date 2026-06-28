import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, DollarSign, Clock, Calendar, Box, Filter } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { productService, categoryService } from '../../api/services';
import { LoadingSkeleton, EmptyState, Pagination, SearchInput } from '../../components/ui';
import type { Product, Category } from '../../types';

const InventoryPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: '12', sort };
      if (search) params.search = search;
      if (category) params.category = category;

      const res = await productService.getAll(params);
      setProducts(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (error) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sort, category]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchProducts(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    categoryService.getAll().then((res: any) => setCategories(res.data.data)).catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.delete(id);
      showToast('Product deleted from inventory', 'success');
      fetchProducts();
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  const getStatusBadge = (product: Product) => {
    const map: Record<string, { cls: string; label: string }> = {
      active: { cls: 'badge-safe', label: 'Active' },
      expired: { cls: 'badge-danger', label: 'Expired' },
      expiring: { cls: 'badge-warning', label: 'Expiring Soon' },
      low: { cls: 'badge-info', label: 'Running Low' },
    };
    const s = map[product.status] || map.active;
    return <span className={`badge ${s.cls} text-[9px] uppercase font-black`}>{s.label}</span>;
  };

  const getRoutineUsageText = (usage?: string) => {
    switch (usage) {
      case 'morning': return '☀️ Morning';
      case 'night': return '🌙 Night';
      case 'both': return '🌓 Morning & Night';
      default: return '🚫 None';
    }
  };

  return (
    <div className="page-container relative z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title flex items-center gap-2">
            Product Inventory 🧴
          </h1>
          <p className="page-subtitle">Manage, categorize, and track chemical expiration dates for your skincare arsenal</p>
        </div>
        <Link to="/inventory/add" className="btn-primary no-underline text-xs font-black py-2.5 px-6 shadow-md self-start sm:self-center">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters Section */}
      <div className="glass-card p-5 mb-8 border border-white/45 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or brand..." />
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Filter size={16} />
            </span>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="input-field text-xs pl-11 font-bold text-gray-600 appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Clock size={16} />
            </span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input-field text-xs pl-11 font-bold text-gray-600 appearance-none"
            >
              <option value="newest">Newest Added</option>
              <option value="oldest">Oldest Added</option>
              <option value="name">Alphabetical (Name)</option>
              <option value="expiry">Expiration Date</option>
              <option value="brand">Alphabetical (Brand)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No products found in inventory"
          description="Build your skincare collection to monitor ingredients, routine schedules, and expiration dates."
          action={<Link to="/inventory/add" className="btn-primary no-underline text-xs"><Plus size={14} /> Add Product</Link>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {products.map((product, i) => {
                const isNearExpiry = product.status === 'expiring' || product.status === 'expired';
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    className={`glass-card overflow-hidden flex flex-col justify-between border shadow-sm ${
                      isNearExpiry 
                        ? 'border-coral/40 ring-1 ring-coral/10' 
                        : 'border-white/40'
                    }`}
                  >
                    <div>
                      {/* Product Image Header */}
                      <div className="h-44 overflow-hidden relative bg-pink-50/20 flex items-center justify-center border-b border-pink-100/30">
                        {product.image ? (
                          <img
                            src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                          />
                        ) : (
                          <span className="text-5xl filter grayscale opacity-25">🧴</span>
                        )}
                        <div className="absolute top-3.5 right-3.5 z-10">
                          {getStatusBadge(product)}
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-5.5 text-left space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">{product.brand}</span>
                          <h3 className="font-extrabold text-sm text-gray-800 leading-tight line-clamp-1">{product.name}</h3>
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-extrabold">
                          <span className="badge badge-lavender uppercase">{product.category}</span>
                          <span className="badge badge-info uppercase">{product.skinType} skin</span>
                          <span className="badge badge-warning uppercase">{getRoutineUsageText(product.routineUsage)}</span>
                        </div>

                        {/* Price & Quantity */}
                        <div className="grid grid-cols-2 gap-4 border-t border-b border-pink-100/30 py-3 text-xs">
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold block mb-0.5 uppercase tracking-wider">Price</span>
                            <span className="font-black text-gray-700 flex items-center">
                              <DollarSign size={11} className="mr-0.5 text-primary" />
                              {(product.price || 0).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold block mb-0.5 uppercase tracking-wider">Quantity Left</span>
                            <span className="font-black text-gray-700 flex items-center gap-1">
                              <Box size={11} className="text-primary" />
                              {product.quantity}%
                            </span>
                          </div>
                        </div>

                        {/* Quantity indicator bar */}
                        <div className="space-y-1.5">
                          <div className="h-2 rounded-full overflow-hidden bg-pink-100/35 border border-white/20 shadow-inner">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${product.quantity}%`,
                                background: product.quantity > 50 ? 'linear-gradient(90deg, #A7F3D0 0%, #34D399 100%)' : product.quantity > 20 ? 'linear-gradient(90deg, #FDE68A 0%, #F59E0B 100%)' : 'linear-gradient(90deg, #FCA5A5 0%, #EF4444 100%)',
                              }}
                            />
                          </div>
                        </div>

                        {/* Expiry / Ingredients */}
                        <div className="space-y-3 text-[11px] pt-1">
                          {product.expiryDate && (
                            <div className="flex items-center gap-2 text-gray-500 font-medium">
                              <Calendar size={13} className="text-primary" />
                              <span>Expires: <b className={isNearExpiry ? 'text-coral' : ''}>{new Date(product.expiryDate).toLocaleDateString()}</b></span>
                            </div>
                          )}
                          
                          {product.ingredients && product.ingredients.filter(Boolean).length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Actives</span>
                              <div className="flex flex-wrap gap-1.5">
                                {product.ingredients.map((ing, idx) => (
                                  <span key={idx} className="bg-white/60 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-pink-100/40">
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {product.notes && (
                            <p className="text-gray-400 leading-relaxed line-clamp-2 italic bg-pink-50/20 p-2.5 rounded-2xl border border-pink-100/10">
                              "{product.notes}"
                            </p>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-5.5 pt-0 flex gap-2.5">
                      <button
                        onClick={() => navigate(`/inventory/edit/${product._id}`)}
                        className="btn-secondary text-[11px] font-bold flex-1 py-2 flex items-center justify-center gap-2 bg-white border-none shadow-sm cursor-pointer"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="btn-danger text-[11px] font-bold py-2 px-3.5 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default InventoryPage;
