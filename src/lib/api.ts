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

// ----------------------------------------------------
// Customer Reviews & Star Ratings API
// ----------------------------------------------------
import type { Review, ReviewStats } from '../types';
import { getStoredReviews, saveStoredReviews, calculateReviewStats } from '../data/reviews';

export async function fetchProductReviews(
  productId: string,
  productSlug?: string
): Promise<{ reviews: Review[]; stats: ReviewStats }> {
  try {
    const params = new URLSearchParams();
    if (productId) params.set('productId', productId);
    if (productSlug) params.set('productSlug', productSlug);

    const res = await fetch(`/api/reviews?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.reviews && Array.isArray(data.reviews)) {
        return {
          reviews: data.reviews,
          stats: data.stats || calculateReviewStats(data.reviews),
        };
      }
    }
  } catch (err) {
    console.warn('API fetch for reviews failed, falling back to local store:', err);
  }

  // Fallback to local storage
  const all = getStoredReviews();
  const filtered = all.filter(r => 
    r.productId === productId || 
    r.productId === String(productId) ||
    (productSlug && r.productId === productSlug)
  );
  return {
    reviews: filtered,
    stats: calculateReviewStats(filtered),
  };
}

export async function fetchAllReviews(): Promise<{ reviews: (Review & { product?: { name: string; image: string } })[] }> {
  try {
    const res = await fetch('/api/reviews?all=true');
    if (res.ok) {
      const data = await res.json();
      if (data.reviews && Array.isArray(data.reviews)) {
        return { reviews: data.reviews };
      }
    }
  } catch (err) {
    console.warn('API fetch for all reviews failed, falling back to local store:', err);
  }

  const all = getStoredReviews();
  return { reviews: all };
}

export async function submitProductReview(data: {
  productId: string;
  productSlug?: string;
  authorName: string;
  rating: number;
  title?: string;
  comment: string;
  userId?: string | null;
  verified?: boolean;
}): Promise<{ review: Review; stats?: ReviewStats }> {
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId: data.productId,
    authorName: data.authorName,
    rating: data.rating,
    title: data.title,
    comment: data.comment,
    userId: data.userId || null,
    verified: data.verified ?? true,
    helpfulCount: 0,
    createdAt: new Date().toISOString(),
  };

  // Local storage save first (optimistic)
  const current = getStoredReviews();
  const updated = [newReview, ...current];
  saveStoredReviews(updated);

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.review) {
        // Sync generated ID
        const finalReview = { ...newReview, id: json.review.id };
        const synced = updated.map(r => r.id === newReview.id ? finalReview : r);
        saveStoredReviews(synced);
        return { review: finalReview };
      }
    }
  } catch (e) {
    console.warn('Backend review submission skipped/failed:', e);
  }

  return { review: newReview };
}

export async function voteReviewHelpful(reviewId: string): Promise<boolean> {
  // Update local storage
  const current = getStoredReviews();
  const updated = current.map(r => {
    if (r.id === reviewId) {
      return { ...r, helpfulCount: (r.helpfulCount || 0) + 1 };
    }
    return r;
  });
  saveStoredReviews(updated);

  try {
    await fetch(`/api/reviews?action=helpful&id=${reviewId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reviewId }),
    });
  } catch (e) {
    console.warn('Backend vote helpful skipped/failed:', e);
  }

  return true;
}

export async function deleteProductReview(reviewId: string): Promise<boolean> {
  const current = getStoredReviews();
  const updated = current.filter(r => r.id !== reviewId);
  saveStoredReviews(updated);

  try {
    await fetch(`/api/reviews?id=${reviewId}`, {
      method: 'DELETE',
    });
  } catch (e) {
    console.warn('Backend delete review skipped/failed:', e);
  }

  return true;
}
