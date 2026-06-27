import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { productService, categoryService } from '../../api/services';
import { LoadingSkeleton, EmptyState, Pagination, SearchInput } from '../../components/ui';
import type { Product, Category } from '../../types';

const InventoryPage: React.FC = () => {
  const { isDark } = useTheme();
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
    if (!window.confirm('Delete this product?')) return;
    try {
      await productService.delete(id);
      showToast('Product deleted', 'success');
      fetchProducts();
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      active: { cls: 'badge-safe', label: 'Active' },
      expired: { cls: 'badge-danger', label: 'Expired' },
      expiring: { cls: 'badge-warning', label: 'Expiring Soon' },
      low: { cls: 'badge-info', label: 'Running Low' },
    };
    const s = map[status] || map.active;
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Product Inventory 🧴</h1>
          <p className="page-subtitle">Manage all your skincare products</p>
        </div>
        <Link to="/inventory/add" className="btn-primary no-underline">
          <FiPlus /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search products..." />
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="input-field">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c.name}>{c.icon} {c.name}</option>)}
          </select>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="input-field">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Alphabetical</option>
            <option value="expiry">Expiry Date</option>
            <option value="brand">Brand</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={6} />
      ) : products.length === 0 ? (
        <EmptyState icon="📦" title="No skincare products added yet."
          description="Start building your skincare inventory to track product usage and expiration dates."
          action={<Link to="/inventory/add" className="btn-primary no-underline"><FiPlus /> Add Product</Link>} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, i) => (
              <motion.div key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden">
                {product.image && (
                  <div className="h-40 overflow-hidden">
                    <img src={`http://localhost:5000${product.image}`} alt={product.name}
                      className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm">{product.name}</h3>
                      <p className="text-xs" style={{ color: '#888' }}>{product.brand}</p>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs mb-3" style={{ color: '#888' }}>
                    <span className="badge badge-lavender">{product.category}</span>
                    <span>{product.skinType}</span>
                  </div>

                  {/* Quantity bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: '#888' }}>Quantity</span>
                      <span className="font-semibold">{product.quantity}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? 'var(--color-dark-border)' : '#f0f0f5' }}>
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${product.quantity}%`,
                        background: product.quantity > 50 ? 'var(--color-mint-dark)' : product.quantity > 20 ? 'var(--color-peach)' : 'var(--color-coral)',
                      }} />
                    </div>
                  </div>

                  {product.expiryDate && (
                    <p className="text-xs mb-3" style={{ color: '#888' }}>
                      Expires: {new Date(product.expiryDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/inventory/edit/${product._id}`)}
                      className="btn-secondary text-xs flex-1 py-2">
                      <FiEdit2 size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(product._id)}
                      className="btn-danger text-xs py-2 px-3">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default InventoryPage;
