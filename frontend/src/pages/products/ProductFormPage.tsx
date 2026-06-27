import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload } from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';
import { productService, categoryService } from '../../api/services';
import type { Category } from '../../types';

interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  skinType: string;
  ingredients: string;
  quantity: number;
  purchaseDate: string;
  openingDate: string;
  expiryDate: string;
  notes: string;
}

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProductFormData>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    categoryService.getAll().then((res: any) => setCategories(res.data.data)).catch(() => {});

    if (isEdit && id) {
      productService.getOne(id).then((res: any) => {
        const p = res.data.data;
        setValue('name', p.name);
        setValue('brand', p.brand);
        setValue('category', p.category);
        setValue('skinType', p.skinType);
        setValue('ingredients', p.ingredients.join(', '));
        setValue('quantity', p.quantity);
        if (p.purchaseDate) setValue('purchaseDate', p.purchaseDate.split('T')[0]);
        if (p.openingDate) setValue('openingDate', p.openingDate.split('T')[0]);
        if (p.expiryDate) setValue('expiryDate', p.expiryDate.split('T')[0]);
        setValue('notes', p.notes);
        if (p.image) setImagePreview(`http://localhost:5000${p.image}`);
      }).catch(() => showToast('Failed to load product', 'error'));
    }
  }, [id, isEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => { if (val) formData.append(key, String(val)); });
      if (imageFile) formData.append('image', imageFile);

      if (isEdit && id) {
        await productService.update(id, formData);
        showToast('Product updated! ✨', 'success');
      } else {
        await productService.create(formData);
        showToast('Product added! 🎉', 'success');
      }
      navigate('/inventory');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save', 'error');
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="btn-secondary mb-4 text-sm">
        <FiArrowLeft /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">{isEdit ? 'Edit Product ✏️' : 'Add Product 🧴'}</h1>
        <p className="page-subtitle mb-6">{isEdit ? 'Update product details' : 'Add a new product to your inventory'}</p>

        <div className="glass-card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">Product Image</label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-2xl object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: 'rgba(200, 182, 255, 0.1)', border: '2px dashed var(--color-lavender)' }}>📷</div>
                )}
                <label className="btn-secondary cursor-pointer text-sm">
                  <FiUpload size={14} /> {imagePreview ? 'Change' : 'Upload'}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Product Name *</label>
                <input {...register('name', { required: 'Required' })} className="input-field" placeholder="e.g. CeraVe Cleanser" />
                {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--color-coral)' }}>{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Brand *</label>
                <input {...register('brand', { required: 'Required' })} className="input-field" placeholder="e.g. CeraVe" />
                {errors.brand && <p className="text-xs mt-1" style={{ color: 'var(--color-coral)' }}>{errors.brand.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Category *</label>
                <select {...register('category', { required: 'Required' })} className="input-field">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Skin Type</label>
                <select {...register('skinType')} className="input-field">
                  {['All', 'Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Ingredients</label>
              <input {...register('ingredients')} className="input-field"
                placeholder="Comma-separated: Niacinamide, Hyaluronic Acid, Ceramides" />
              <p className="text-xs mt-1" style={{ color: '#888' }}>Separate ingredients with commas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Quantity (%)</label>
                <input {...register('quantity', { valueAsNumber: true })} type="number" min="0" max="100"
                  className="input-field" placeholder="100" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Purchase Date</label>
                <input {...register('purchaseDate')} type="date" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                <input {...register('expiryDate')} type="date" className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Opening Date</label>
              <input {...register('openingDate')} type="date" className="input-field max-w-xs" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Notes</label>
              <textarea {...register('notes')} className="input-field" rows={3} placeholder="Any additional notes..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                {isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductFormPage;
