import type { Product } from '../types';
import { products as fallbackProducts, categories as fallbackCategories } from '../data/products';

export async function fetchProducts(params?: {
  category?: string;
  subcategory?: string;
  tag?: string;
  search?: string;
  sort?: string;
  limit?: number;
}): Promise<{ products: Product[]; totalCount: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.subcategory) query.set('subcategory', params.subcategory);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    return {
      products: data.products,
      totalCount: data.totalCount,
    };
  } catch {
    // Fallback to local catalog if offline or in static preview
    let filtered = [...fallbackProducts];
    if (params?.category && params.category.toLowerCase() !== 'all') {
      const cat = params.category.toLowerCase();
      filtered = filtered.filter(p => p.category.toLowerCase().includes(cat) || p.tags.includes(cat));
    }
    if (params?.tag) {
      filtered = filtered.filter(p => p.tags.includes(params.tag!) || p.badge?.toLowerCase().replace(/\s+/g, '-') === params.tag);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return {
      products: filtered,
      totalCount: filtered.length,
    };
  }
}

export async function fetchCategories(): Promise<any[]> {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    return data.categories;
  } catch {
    return fallbackCategories.map((name, index) => ({
      id: String(index + 1),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }));
  }
}
