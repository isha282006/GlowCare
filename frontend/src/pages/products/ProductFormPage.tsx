import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { productService, categoryService } from '../../api/services';
import { BACKEND_URL } from '../../api/axios';
import type { Category } from '../../types';

interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  skinType: string;
  ingredients: string;
  quantity: number;
  price: number;
  routineUsage: 'morning' | 'night' | 'both' | 'none';
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
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    defaultValues: {
      quantity: 100,
      price: 0,
      routineUsage: 'both',
      skinType: 'All'
    }
  });
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
        setValue('price', p.price || 0);
        setValue('routineUsage', p.routineUsage || 'both');
        if (p.purchaseDate) setValue('purchaseDate', p.purchaseDate.split('T')[0]);
        if (p.openingDate) setValue('openingDate', p.openingDate.split('T')[0]);
        if (p.expiryDate) setValue('expiryDate', p.expiryDate.split('T')[0]);
        setValue('notes', p.notes);
        if (p.image) setImagePreview(p.image.startsWith('http') ? p.image : `${BACKEND_URL}${p.image}`);
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
      Object.entries(data).forEach(([key, val]) => { 
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, String(val)); 
        }
      });
      if (imageFile) formData.append('image', imageFile);

      if (isEdit && id) {
        await productService.update(id, formData);
        showToast('Product updated successfully! ✨', 'success');
      } else {
        await productService.create(formData);
        showToast('Product added to inventory! 🎉', 'success');
      }
      navigate('/inventory');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  return (
    <div className="page-container max-w-3xl relative z-10">
      <button onClick={() => navigate(-1)} className="btn-secondary mb-5 text-xs font-semibold flex items-center gap-2">
        <ArrowLeft size={14} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="page-title">{isEdit ? 'Edit Skincare Product ✏️' : 'Add Skincare Product 🧴'}</h1>
        <p className="page-subtitle mb-8">{isEdit ? 'Modify details of your skincare item' : 'Register a new cosmetic product into your local shelves'}</p>

        <div className="glass-card p-7 border border-white/40 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Product Cover Image</label>
              <div className="flex items-center gap-5">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-pink-100" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-pink-50/40 text-primary border border-dashed border-pink-200 shadow-inner">
                    <ImageIcon size={28} />
                  </div>
                )}
                <label className="btn-secondary cursor-pointer text-xs flex items-center gap-2 border-pink-200">
                  <Upload size={14} /> {imagePreview ? 'Replace Image' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Name *</label>
                <input {...register('name', { required: 'Required' })} className="input-field" placeholder="e.g. Hydro Boost Water Gel" />
                {errors.name && <p className="text-xs mt-1 text-coral font-semibold">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brand *</label>
                <input {...register('brand', { required: 'Required' })} className="input-field" placeholder="e.g. Neutrogena" />
                {errors.brand && <p className="text-xs mt-1 text-coral font-semibold">{errors.brand.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category *</label>
                <select {...register('category', { required: 'Required' })} className="input-field text-xs font-semibold text-gray-600 appearance-none">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c.name}>{c.icon} {c.name}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Skin Type</label>
                <select {...register('skinType')} className="input-field text-xs font-semibold text-gray-600 appearance-none">
                  {['All', 'Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'].map((t) => (
                    <option key={t} value={t}>{t} Skin</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price ($)</label>
                <input {...register('price', { valueAsNumber: true })} type="number" min="0" step="0.01" className="input-field" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Routine Usage</label>
                <select {...register('routineUsage')} className="input-field text-xs font-semibold text-gray-600 appearance-none">
                  <option value="morning">☀️ Morning Only</option>
                  <option value="night">🌙 Night Only</option>
                  <option value="both">🌓 Both (Morning & Night)</option>
                  <option value="none">🚫 None / As Needed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ingredients List</label>
              <input {...register('ingredients')} className="input-field"
                placeholder="Comma-separated: Niacinamide, Hyaluronic Acid, Ceramide NP" />
              <p className="text-[10px] mt-2 text-gray-400 font-semibold">Add actives separated by commas to activate routine chemistry warnings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Volume Quantity (%)</label>
                <input {...register('quantity', { valueAsNumber: true })} type="number" min="0" max="100"
                  className="input-field text-center font-bold" placeholder="100" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Purchase Date</label>
                <input {...register('purchaseDate')} type="date" className="input-field font-semibold text-gray-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Expiry Date</label>
                <input {...register('expiryDate')} type="date" className="input-field font-semibold text-gray-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Opening Date</label>
                <input {...register('openingDate')} type="date" className="input-field font-semibold text-gray-600" />
              </div>
              <div className="hidden md:block"></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personal Notes</label>
              <textarea {...register('notes')} className="input-field" rows={3} placeholder="Texture, fragrance, pH levels, skin reactions, etc." />
            </div>

            <div className="flex gap-3 pt-3 border-t border-pink-100/50">
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-3.5 shadow-md">
                {isSubmitting ? 'Saving changes...' : isEdit ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary py-3.5 px-6">Cancel</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductFormPage;
