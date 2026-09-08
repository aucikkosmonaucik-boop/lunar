import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Star, Sparkles, ArrowLeft, ArrowRight, Check, Percent, Tag } from 'lucide-react';
import type { Product } from '../../types';

interface ProductEditorModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
  onDelete?: (productId: string) => Promise<void>;
  categories?: string[];
}

const PRESET_GALLERY_IMAGES = [
  { label: 'Perfume Rosa', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800' },
  { label: 'Perfume Elegance', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800' },
  { label: 'Perfume Blossom', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800' },
  { label: 'Perfume Noir', url: 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&q=80&w=800' },
  { label: 'Silver Earrings', url: 'https://images.unsplash.com/photo-1535633302703-b0703af6c35e?auto=format&fit=crop&q=80&w=800' },
  { label: 'Gold Necklace', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800' },
  { label: 'Solitaire Ring', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800' },
  { label: 'Gold Bracelet', url: 'https://images.unsplash.com/photo-1611591475822-4a00cb59f0f9?auto=format&fit=crop&q=80&w=800' },
];

const BADGE_OPTIONS = [
  '',
  'NEW',
  'SALE',
  'BESTSELLER',
  'READY TO SHIP',
  'SOLD OUT',
  'GIFT SET',
  'BRIDAL',
  'LIMITED EDITION',
];

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'gallery' | 'pricing' | 'features'>('basic');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('jewelry');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState<number | ''>(29.90);
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [badge, setBadge] = useState('');
  const [stock, setStock] = useState<number | ''>(10);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  // Gallery state
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Features and tags
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Populate data when product changes
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSlug(product.slug || '');
      setDescription(product.description || '');
      setCategory(product.category || 'jewelry');
      setSubcategory(product.subcategory || '');
      setPrice(product.price);
      setOriginalPrice(product.originalPrice !== undefined ? product.originalPrice : '');
      setBadge(product.badge || '');
      setStock(product.stock !== undefined ? product.stock : 10);
      setIsFeatured(Boolean(product.isFeatured));
      setIsAvailable(product.isAvailable !== false);

      const allImgs = product.images && product.images.length > 0 ? product.images : [product.image || ''];
      setImages(allImgs.filter(Boolean));

      setFeatures(product.features || []);
      setTags(product.tags || []);
    } else {
      // New product defaults
      setName('');
      setSlug('');
      setDescription('');
      setCategory('jewelry');
      setSubcategory('');
      setPrice(49.00);
      setOriginalPrice('');
      setBadge('NEW');
      setStock(15);
      setIsFeatured(false);
      setIsAvailable(true);
      setImages(['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800']);
      setFeatures(['Artisan craftsmanship', '18K Gold Finish', 'Hypoallergenic luxury alloy']);
      setTags(['new', 'jewelry', 'luxury']);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Gallery operations
  const handleAddImage = (urlToAdd?: string) => {
    const url = (urlToAdd || newImageUrl).trim();
    if (!url) return;
    if (!images.includes(url)) {
      setImages(prev => [...prev, url]);
    }
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (images.length <= 1) {
      alert('Product must have at least one main image.');
      return;
    }
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (indexToMakePrimary: number) => {
    if (indexToMakePrimary === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const [chosen] = copy.splice(indexToMakePrimary, 1);
      return [chosen, ...copy];
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setImages(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Features operations
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures(prev => [...prev, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, idx) => idx !== index));
  };

  // Tags operations
  const handleAddTag = () => {
    if (newTag.trim()) {
      const formatted = newTag.trim().toLowerCase().replace(/^#/, '');
      if (!tags.includes(formatted)) {
        setTags(prev => [...prev, formatted]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(prev => prev.filter((_, idx) => idx !== index));
  };

  // Auto calculate discount percentage
  const discountPercentage =
    originalPrice && typeof price === 'number' && typeof originalPrice === 'number' && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  // Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product title is required.');
      return;
    }

    if (price === '' || price < 0) {
      setError('Please provide a valid regular price.');
      return;
    }

    if (images.length === 0) {
      setError('Please add at least one image to the gallery.');
      return;
    }

    setSaving(true);

    try {
      const productPayload: Partial<Product> = {
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description.trim(),
        category,
        categorySlug: category,
        subcategory: subcategory.trim() || undefined,
        price: Number(price),
        originalPrice: originalPrice !== '' && typeof originalPrice === 'number' && originalPrice > 0 ? Number(originalPrice) : undefined,
        badge: badge || (discountPercentage ? 'SALE' : undefined),
        stock: stock === '' ? 10 : Number(stock),
        isFeatured,
        isAvailable,
        image: images[0],
        images,
        features,
        tags,
      };

      await onSave(productPayload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save product changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] shadow-2xl rounded-sm w-full max-w-4xl max-h-[92vh] flex flex-col animate-fade-in overflow-hidden text-[#1A1A1A] dark:text-[#F5F5F5] transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE3D9] dark:border-[#2E2E2E] bg-[#FAF8F5] dark:bg-[#252525] text-[#1A1A1A] dark:text-white transition-colors">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl uppercase tracking-wider font-normal text-[#1A1A1A] dark:text-white">
                {product ? 'Edit & Moderate Product' : 'Add New Boutique Item'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {product ? `ID: ${product.id} • ${product.name}` : 'Curate images, descriptions, pricing, and promotional badges'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-[#2E2E2E] bg-[#FAF8F5] dark:bg-[#252525] px-6 overflow-x-auto transition-colors">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3.5 px-4 text-sm uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'basic'
                ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white dark:bg-[#1E1E1E] dark:text-white dark:border-[#D4AF37]'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
            }`}
          >
            1. Title & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`py-3.5 px-4 text-sm uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'gallery'
                ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white dark:bg-[#1E1E1E] dark:text-white dark:border-[#D4AF37]'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            2. Photo Gallery ({images.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`py-3.5 px-4 text-sm uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'pricing'
                ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white dark:bg-[#1E1E1E] dark:text-white dark:border-[#D4AF37]'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <Percent className="w-4 h-4 text-[#D4AF37]" />
            3. Pricing & Sale
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`py-3.5 px-4 text-sm uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'features'
                ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white dark:bg-[#1E1E1E] dark:text-white dark:border-[#D4AF37]'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            4. Features & Tags
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-sm font-medium rounded flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* TAB 1: BASIC INFO & DESCRIPTION */}
          {activeTab === 'basic' && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Classic Gold Chain - 18K Solid Gold"
                    className="w-full px-4 py-3 bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3E3E3E] rounded focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3E3E3E] rounded focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none text-base"
                  >
                    <option value="jewelry">Fine Jewelry (General)</option>
                    <option value="earrings">Earrings</option>
                    <option value="rings">Rings</option>
                    <option value="necklaces">Necklaces</option>
                    <option value="bracelets">Bracelets</option>
                    <option value="perfumes">Perfumes (All)</option>
                    <option value="perfumes-women">Women's Perfumes</option>
                    <option value="perfumes-men">Men's Perfumes</option>
                    <option value="bridal">Bridal Collection</option>
                    <option value="sets">Luxury Gift Sets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Custom URL Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. classic-gold-chain-18k"
                    className="w-full px-4 py-3 bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3E3E3E] rounded focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none text-base font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Subcategory / Series
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. Floral Extrait, 18K Solid Gold"
                    className="w-full px-4 py-3 bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3E3E3E] rounded focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Product Description
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed, elegant description of the materials, fragrance notes, styling guidance..."
                  className="w-full px-4 py-3 bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3E3E3E] rounded focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none text-base leading-relaxed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  Presented directly on the product detail page and in search highlights.
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-black dark:accent-[#D4AF37] cursor-pointer"
                  />
                  <span>Active &amp; Visible in Boutique</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-black dark:accent-[#D4AF37] cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#D4AF37]" /> Feature on Homepage
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: GALLERY MODERATION */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-fade-in">
              {/* Add image URL input */}
              <div className="bg-[#FAF8F5] dark:bg-[#252525] border border-[#EAE3D9] dark:border-[#333333] p-5 rounded-sm transition-colors">
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Add Image URL to Gallery
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or direct image link"
                    className="flex-1 px-4 py-3 bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3E3E3E] rounded focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none text-base font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage()}
                    className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] px-5 py-3 text-xs uppercase tracking-wider font-bold rounded transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Photo
                  </button>
                </div>

                {/* Preset Picker */}
                <div className="mt-4">
                  <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider font-bold mb-2">
                    Quick Preset Gallery Images:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_GALLERY_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => handleAddImage(preset.url)}
                        className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-[#1E1E1E] text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-[#3E3E3E] rounded hover:border-black dark:hover:border-[#D4AF37] hover:bg-gray-100 dark:hover:bg-[#282828] transition-all cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gallery Items Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200">
                    Active Gallery Photos ({images.length})
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    The first photo is the primary store thumbnail cover
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((imgUrl, index) => {
                    const isMain = index === 0;
                    return (
                      <div
                        key={`${imgUrl}-${index}`}
                        className={`relative group border-2 rounded-sm overflow-hidden bg-gray-100 dark:bg-[#252525] transition-all ${
                          isMain ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20 shadow-md' : 'border-gray-200 dark:border-[#383838] hover:border-gray-400 dark:hover:border-[#D4AF37]/60'
                        }`}
                      >
                        <div className="aspect-[4/5] overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400';
                            }}
                          />
                        </div>

                        {/* Top Badge */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          {isMain && (
                            <span className="bg-[#D4AF37] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-xs shadow-xs">
                              Cover (Main)
                            </span>
                          )}
                          <span className="bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                            #{index + 1}
                          </span>
                        </div>

                        {/* Action buttons overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-2 flex items-center justify-between text-white opacity-95 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveImage(index, 'left')}
                              title="Move Left"
                              className="p-1 hover:bg-white/20 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={index === images.length - 1}
                              onClick={() => handleMoveImage(index, 'right')}
                              title="Move Right"
                              className="p-1 hover:bg-white/20 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex gap-1">
                            {!isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(index)}
                                title="Set as primary cover"
                                className="text-xs bg-white/20 hover:bg-[#D4AF37] hover:text-black px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              title="Remove image"
                              className="p-1 hover:bg-rose-500 text-rose-200 hover:text-white rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & PROMOTIONS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#FAF8F5] dark:bg-[#252525] border border-[#EAE3D9] dark:border-[#333333] p-5 rounded-sm transition-colors">
                <h3 className="text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[#D4AF37]" /> Pricing &amp; Promotional Discounts
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                      Current Price (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3E3E3E] rounded font-bold text-lg focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                      Original / Crossed-out Price (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="e.g. 49.90 (for sale discount)"
                      className="w-full px-4 py-3 bg-white dark:bg-[#1E1E1E] text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-[#3E3E3E] rounded line-through text-base focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                      Calculated Discount
                    </label>
                    <div className="px-4 py-3 border border-gray-200 dark:border-[#3E3E3E] bg-white dark:bg-[#1E1E1E] rounded font-bold text-base text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                      <span>{discountPercentage ? `-${discountPercentage}%` : 'No discount'}</span>
                      {discountPercentage && (
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded font-mono font-bold">
                          Auto-Badge SALE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Promotional Badge
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3E3E3E] rounded focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none text-base font-semibold"
                  >
                    <option value="">No Badge</option>
                    {BADGE_OPTIONS.filter(Boolean).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                    Badge is highlighted over product cards in the store and checkout.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Inventory Stock (Units)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-4 py-3 bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3E3E3E] rounded focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none text-base font-semibold"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                    Setting 0 automatically sets product status as SOLD OUT.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURES & TAGS */}
          {activeTab === 'features' && (
            <div className="space-y-6 animate-fade-in">
              {/* Features Editor */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Bullet Points &amp; Features
                </label>
                <div className="flex gap-2.5 mb-3">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                    placeholder="e.g. 925 Sterling Silver, Handcrafted, 18K Solid Gold"
                    className="flex-1 px-4 py-3 bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3E3E3E] rounded focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none text-base"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] px-5 py-3 text-xs uppercase tracking-wider font-bold rounded transition-colors cursor-pointer shrink-0"
                  >
                    + Add Feature
                  </button>
                </div>

                <div className="space-y-2">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#FAF8F5] dark:bg-[#252525] border border-[#EAE3D9] dark:border-[#333333] rounded-sm text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 bg-[#D4AF37] rounded-full shrink-0" />
                        <span>{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Editor */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Search Tags &amp; Filters
                </label>
                <div className="flex gap-2.5 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="e.g. silver, earrings, bestseller, gift"
                    className="flex-1 px-4 py-3 bg-white dark:bg-[#252525] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3E3E3E] rounded focus:ring-1 focus:ring-black dark:focus:ring-[#D4AF37] focus:outline-none text-base"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] px-5 py-3 text-xs uppercase tracking-wider font-bold rounded transition-colors cursor-pointer shrink-0"
                  >
                    + Add Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tagItem, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 dark:bg-[#252525] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#3E3E3E] text-xs uppercase tracking-wider font-semibold rounded-full"
                    >
                      #{tagItem}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="hover:text-rose-600 dark:hover:text-rose-400 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-[#2E2E2E] mt-6">
            <div>
              {product && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                      onDelete(product.id);
                      onClose();
                    }
                  }}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 px-4 py-2.5 border border-rose-200 dark:border-rose-800/60 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete Product
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs uppercase tracking-wider font-bold text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white border border-gray-300 dark:border-[#404040] rounded hover:bg-gray-100 dark:hover:bg-[#282828] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-xs uppercase tracking-wider font-bold bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E8DCCF] rounded transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#D4AF37] dark:text-black" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditorModal;
