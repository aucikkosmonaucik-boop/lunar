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
  'LIMITOWANA EDYCJA',
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
      setSelectedImageIndex(0);

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
      setImages(['https://images.unsplash.com/photo-1535633302703-b0703af6c35e?auto=format&fit=crop&q=80&w=800']);
      setSelectedImageIndex(0);
      setFeatures(['18k Gold Plated', 'Handcrafted', 'Luxury packaging']);
      setTags(['jewelry', 'ready-to-ship']);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Gallery actions
  const handleAddImage = (urlToAdd?: string) => {
    const url = (urlToAdd || newImageUrl).trim();
    if (!url) return;
    if (images.includes(url)) {
      setError('To zdjęcie jest już w galerii');
      return;
    }
    setImages(prev => [...prev, url]);
    setNewImageUrl('');
    setError(null);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (images.length <= 1) {
      setError('Produkt musi mieć co najmniej jedno zdjęcie w galerii');
      return;
    }
    setImages(prev => prev.filter((_, i) => i !== indexToRemove));
    if (selectedImageIndex >= indexToRemove && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      return [chosen, ...copy];
    });
    setSelectedImageIndex(0);
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    setImages(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Features & tags actions
  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFeatures(prev => [...prev, newFeature.trim()]);
    setNewFeature('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const cleanTag = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tags.includes(cleanTag)) {
      setTags(prev => [...prev, cleanTag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (idx: number) => {
    setTags(prev => prev.filter((_, i) => i !== idx));
  };

  // Price discount calculator
  const calcDiscountPct = (): number | null => {
    if (price && originalPrice && Number(originalPrice) > Number(price)) {
      return Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100);
    }
    return null;
  };

  const discountPercentage = calcDiscountPct();

  // Save form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nazwa produktu jest wymagana');
      setActiveTab('basic');
      return;
    }

    if (price === '' || Number(price) < 0) {
      setError('Cena produktu musi być poprawną liczbą');
      setActiveTab('pricing');
      return;
    }

    if (images.length === 0) {
      setError('Dodaj co najmniej jedno zdjęcie do galerii');
      setActiveTab('gallery');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description.trim(),
        category,
        categorySlug: category,
        subcategory: subcategory.trim() || undefined,
        price: Number(price),
        originalPrice: originalPrice !== '' && Number(originalPrice) > 0 ? Number(originalPrice) : undefined,
        badge: badge || undefined,
        stock: stock !== '' ? Number(stock) : 10,
        isFeatured,
        isAvailable,
        image: images[0],
        images,
        features,
        tags,
      };

      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas zapisywania produktu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 shadow-2xl rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#0d0d0d] text-white">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
            <div>
              <h2 className="text-lg font-serif tracking-wider">
                {product ? 'Edycja i Moderacja Produktu' : 'Dodaj Nowy Produkt do Kolekcji'}
              </h2>
              <p className="text-xs text-gray-400">
                {product ? `ID: ${product.id} • ${product.name}` : 'Uzupełnij galerię, opisy, ceny i promocje'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-4 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all ${
              activeTab === 'basic'
                ? 'border-[#0d0d0d] text-[#0d0d0d] bg-white'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            1. Podstawowe & Opis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`py-3 px-4 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'border-[#0d0d0d] text-[#0d0d0d] bg-white'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            2. Galeria Zdjęć ({images.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-4 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'pricing'
                ? 'border-[#0d0d0d] text-[#0d0d0d] bg-white'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-[#d4af37]" />
            3. Ceny & Promocje
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`py-3 px-4 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'features'
                ? 'border-[#0d0d0d] text-[#0d0d0d] bg-white'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            4. Cechy & Tagi
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
              <span className="font-bold">Błąd:</span> {error}
            </div>
          )}

          {/* TAB 1: BASIC INFO & DESCRIPTION */}
          {activeTab === 'basic' && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                    Nazwa Produktu *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="np. 250. Pink Desire - Perfumy 33ml"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                    Kategoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none text-sm bg-white"
                  >
                    <option value="jewelry">Biżuteria (Ogólna)</option>
                    <option value="earrings">Kolczyki (Earrings)</option>
                    <option value="rings">Pierścionki (Rings)</option>
                    <option value="necklaces">Naszyjniki (Necklaces)</option>
                    <option value="bracelets">Bransoletki (Bracelets)</option>
                    <option value="perfumes">Perfumy (Wszystkie)</option>
                    <option value="perfumes-women">Perfumy Damskie</option>
                    <option value="perfumes-men">Perfumy Męskie</option>
                    <option value="bridal">Kolekcja Ślubna (Bridal)</option>
                    <option value="sets">Zestawy Prezentowe (Gift Sets)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                    Slug URL (opcjonalny)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="np. pink-desire-33ml"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none text-sm font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                    Podkategoria / Seria
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="np. Floral Collection, 18K Gold"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                  Pełny Opis Produktu
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Elegancki, szczegółowy opis zapachu lub kruszcu biżuterii, nut zapachowych i przeznaczenia..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none text-sm leading-relaxed"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Opis jest prezentowany bezpośrednio na karcie produktu w sekcji głównej.
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-black"
                  />
                  <span>Produkt Aktywny i Widoczny w Sklepie</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-black"
                  />
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#d4af37]" /> Wyróżnij na Stronie Głównej
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: GALLERY MODERATION */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-fade-in">
              {/* Add image URL input */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-2">
                  Dodaj Nowe Zdjęcie do Galerii (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... lub bezpośredni link do pliku jpg/png"
                    className="flex-1 px-3.5 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage()}
                    className="bg-[#0d0d0d] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Dodaj
                  </button>
                </div>

                {/* Preset Picker */}
                <div className="mt-3">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-2">
                    Szybki wybór ze zdjęć wzorcowych Lunar:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_GALLERY_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => handleAddImage(preset.url)}
                        className="text-[11px] px-2.5 py-1 bg-white border border-gray-300 rounded hover:border-black hover:bg-gray-100 transition-all"
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
                  <h3 className="text-xs uppercase tracking-widest font-bold text-gray-700">
                    Zdjęcia w Galerii ({images.length})
                  </h3>
                  <span className="text-[11px] text-gray-500">
                    Pierwsze zdjęcie to miniaturka główna (Okładka)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((imgUrl, index) => {
                    const isMain = index === 0;
                    return (
                      <div
                        key={`${imgUrl}-${index}`}
                        className={`relative group border-2 rounded-lg overflow-hidden bg-gray-100 transition-all ${
                          isMain ? 'border-[#d4af37] ring-2 ring-[#d4af37]/20 shadow-md' : 'border-gray-200 hover:border-gray-400'
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
                            <span className="bg-[#d4af37] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded shadow">
                              Główne (Cover)
                            </span>
                          )}
                          <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
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
                              title="Przesuń w lewo"
                              className="p-1 hover:bg-white/20 rounded disabled:opacity-30"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === images.length - 1}
                              onClick={() => handleMoveImage(index, 'right')}
                              title="Przesuń w prawo"
                              className="p-1 hover:bg-white/20 rounded disabled:opacity-30"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex gap-1">
                            {!isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(index)}
                                title="Ustaw jako główne"
                                className="text-[10px] bg-white/20 hover:bg-[#d4af37] hover:text-black px-1.5 py-0.5 rounded font-bold transition-colors"
                              >
                                Ustaw główne
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              title="Usuń zdjęcie"
                              className="p-1 hover:bg-red-500 text-red-200 hover:text-white rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <h3 className="text-xs uppercase tracking-widest font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[#d4af37]" /> Ceny i Promocje
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                      Cena Aktualna (€ / PLN) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded font-semibold text-lg focus:ring-1 focus:ring-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                      Cena Poprzednia / Przekreślona
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="np. 49.90 (dla promocji)"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-500 line-through text-base focus:ring-1 focus:ring-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                      Wyliczony Rabat
                    </label>
                    <div className="px-3.5 py-2.5 border border-gray-200 bg-white rounded font-bold text-base text-green-700 flex items-center justify-between">
                      <span>{discountPercentage ? `-${discountPercentage}%` : 'Brak zniżki'}</span>
                      {discountPercentage && (
                        <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-mono">
                          Auto-Badge SALE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                    Odznaka Promocyjna (Badge)
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none text-sm bg-white font-medium"
                  >
                    <option value="">Brak odznaki</option>
                    {BADGE_OPTIONS.filter(Boolean).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Odznaka wyświetla się na rogu zdjęcia produktu w sklepie i koszyku.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-1.5">
                    Stan Magazynowy (Sztuki)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Wartość 0 automatycznie oznacza produkt jako SOLD OUT.
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
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-2">
                  Punkty / Cechy Produktu (Bullet Points)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                    placeholder="np. 925 Sterling Silver, Handcrafted, Long lasting"
                    className="flex-1 px-3.5 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="bg-[#0d0d0d] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded hover:bg-gray-800 transition-colors"
                  >
                    + Dodaj
                  </button>
                </div>

                <div className="space-y-2">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                        <span>{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Editor */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-700 mb-2">
                  Tagi i Filtry
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="np. silver, earrings, bestseller, spring"
                    className="flex-1 px-3.5 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-[#0d0d0d] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded hover:bg-gray-800 transition-colors"
                  >
                    + Dodaj Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tagItem, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 text-xs uppercase tracking-wider font-medium rounded-full"
                    >
                      #{tagItem}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="hover:text-red-500 font-bold"
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
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <div>
              {product && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Czy na pewno chcesz usunąć produkt "${product.name}"?`)) {
                      onDelete(product.id);
                      onClose();
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-xs uppercase tracking-widest font-bold flex items-center gap-1.5 px-3 py-2 border border-red-200 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Usuń produkt
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs uppercase tracking-widest font-semibold text-gray-700 hover:text-black border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-xs uppercase tracking-widest font-bold bg-[#0d0d0d] text-white rounded hover:bg-[#262626] transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {saving ? (
                  <span>Zapisywanie...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#d4af37]" />
                    <span>Zapisz Zmiany</span>
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
