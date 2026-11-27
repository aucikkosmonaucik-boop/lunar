import type { Review, ReviewStats } from '../types';

export const initialReviews: Review[] = [];

const LOCAL_STORAGE_REVIEWS_KEY = 'lunar_custom_reviews_v1';

export function getStoredReviews(): Review[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse reviews from localStorage', e);
  }
  return initialReviews;
}

export function saveStoredReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.warn('Failed to save reviews to localStorage', e);
  }
}

export function calculateReviewStats(reviews: Review[]): ReviewStats {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const rev of reviews) {
    const r = Math.min(5, Math.max(1, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[r] = (distribution[r] || 0) + 1;
    sum += rev.rating;
  }

  const avg = Number((sum / reviews.length).toFixed(1));

  return {
    averageRating: avg,
    totalReviews: reviews.length,
    distribution,
  };
}
