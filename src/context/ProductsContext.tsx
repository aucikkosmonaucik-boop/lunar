import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Product } from '../types';
import { products as initialProducts } from '../data/products';

export interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (data: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  duplicateProduct: (id: string) => Promise<Product>;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
}

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'lunar_custom_products_v2';

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load products from localStorage', e);
    }
    return initialProducts;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state to localStorage whenever products change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn('Failed to save products to localStorage', e);
    }
  }, [products]);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products?includeHidden=true&limit=100');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          // Normalize API products
          const mapped: Product[] = data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description || '',
            price: Number(p.price),
            originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
            image: p.image,
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image],
            category: p.category?.slug || p.categorySlug || 'jewelry',
            categorySlug: p.categorySlug || 'jewelry',
            subcategory: p.subcategory || undefined,
            badge: p.badge || undefined,
            rating: p.rating !== undefined ? Number(p.rating) : 5.0,
            reviewCount: p.reviewCount !== undefined ? Number(p.reviewCount) : 0,
            stock: p.stock !== undefined ? Number(p.stock) : 10,
            tags: Array.isArray(p.tags) ? p.tags : [],
            features: Array.isArray(p.features) ? p.features : [],
            isAvailable: p.isAvailable !== false,
            isFeatured: Boolean(p.isFeatured),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          }));
          setProducts(mapped);
        }
      }
    } catch (err: unknown) {
      console.warn('Could not sync products from API, using local store:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const addProduct = async (data: Partial<Product>): Promise<Product> => {
    const newId = `prod-${Date.now()}`;
    const primaryImg = data.image || (data.images && data.images[0]) || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800';
    const allImgs = data.images && data.images.length > 0 ? data.images : [primaryImg];

    const newProduct: Product = {
      id: newId,
      name: data.name || 'Nowy Produkt',
      slug: data.slug || (data.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: data.description || '',
      price: Number(data.price || 0),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      image: primaryImg,
      images: allImgs,
      category: data.category || 'jewelry',
      categorySlug: data.category || 'jewelry',
      subcategory: data.subcategory || undefined,
      badge: data.badge || undefined,
      rating: data.rating !== undefined ? Number(data.rating) : 5.0,
      reviewCount: data.reviewCount !== undefined ? Number(data.reviewCount) : 0,
      stock: data.stock !== undefined ? Number(data.stock) : 10,
      tags: data.tags || [],
      features: data.features || [],
      isAvailable: data.isAvailable !== false,
      isFeatured: Boolean(data.isFeatured),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update state
    setProducts(prev => [newProduct, ...prev]);

    // Async backend save
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.product) {
          setProducts(prev => prev.map(p => p.id === newId ? { ...newProduct, id: json.product.id } : p));
          return { ...newProduct, id: json.product.id };
        }
      }
    } catch (e) {
      console.warn('Backend product creation skipped/failed:', e);
    }

    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    let updatedItem: Product | undefined;

    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const mainImg = updates.image || (updates.images && updates.images[0]) || p.image;
          const allImgs = updates.images && updates.images.length > 0 ? updates.images : (p.images || [mainImg]);

          updatedItem = {
            ...p,
            ...updates,
            image: mainImg,
            images: allImgs,
            updatedAt: new Date().toISOString(),
          };
          return updatedItem;
        }
        return p;
      })
    );

    if (!updatedItem) {
      throw new Error(`Product with ID ${id} not found`);
    }

    // Async backend update
    try {
      await fetch(`/api/products?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
    } catch (e) {
      console.warn('Backend product update skipped/failed:', e);
    }

    return updatedItem;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Backend product deletion skipped/failed:', e);
    }

    return true;
  };

  const duplicateProduct = async (id: string): Promise<Product> => {
    const existing = products.find(p => p.id === id);
    if (!existing) throw new Error('Product not found');

    const copyData: Partial<Product> = {
      ...existing,
      name: `${existing.name} (Kopia)`,
      slug: `${existing.slug || 'copy'}-${Date.now().toString().slice(-4)}`,
    };
    delete (copyData as any).id;

    return await addProduct(copyData);
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const getProductBySlug = (slug: string): Product | undefined => {
    return products.find(p => p.slug === slug || p.id === slug);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        getProductById,
        getProductBySlug,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};
