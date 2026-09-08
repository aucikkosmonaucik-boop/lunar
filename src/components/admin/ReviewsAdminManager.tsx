import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Star,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Review } from '../../types';
import { useProducts } from '../../hooks/useProducts';
import { fetchAllReviews, deleteProductReview } from '../../lib/api';

export const ReviewsAdminManager: React.FC = () => {
  const { products } = useProducts();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllReviews();
      setReviews(data.reviews);
    } catch (err) {
      console.warn('Failed to load all reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Product Map for fast name/image lookup
  const productMap = useMemo(() => {
    const map: Record<string, { name: string; image: string; category: string }> = {};
    for (const p of products) {
      map[p.id] = { name: p.name, image: p.image, category: p.category };
      if (p.slug) {
        map[p.slug] = { name: p.name, image: p.image, category: p.category };
      }
    }
    return map;
  }, [products]);

  // KPI calculations
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { total: 0, avg: 5.0, fiveStarPct: 100, totalHelpful: 0 };
    }
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const fiveStars = reviews.filter((r) => Math.round(r.rating) === 5).length;
    const helpful = reviews.reduce((acc, r) => acc + (r.helpfulCount || 0), 0);

    return {
      total,
      avg: Number((sum / total).toFixed(1)),
      fiveStarPct: Math.round((fiveStars / total) * 100),
      totalHelpful: helpful,
    };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter !== 'ALL' && Math.round(r.rating) !== ratingFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const prod = productMap[r.productId];
        const prodName = prod ? prod.name.toLowerCase() : '';
        const author = r.authorName.toLowerCase();
        const title = (r.title || '').toLowerCase();
        const comment = r.comment.toLowerCase();

        return (
          author.includes(q) ||
          title.includes(q) ||
          comment.includes(q) ||
          prodName.includes(q) ||
          r.productId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reviews, ratingFilter, search, productMap]);

  // Handle Delete Review
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteProductReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showNotification('Review deleted successfully and product score recalculated.');
    } catch {
      showNotification('Failed to delete review.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded text-sm font-bold uppercase tracking-wider flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 stroke-[2.5]" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] p-6 rounded-sm shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300">
              Total Reviews
            </span>
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] dark:bg-[#252525] border border-[#D4AF37]/40 flex items-center justify-center">
              <Award className="w-4 h-4 text-[#D4AF37]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-serif text-[#1A1A1A] dark:text-white font-normal">{stats.total}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Across entire catalog</p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] p-6 rounded-sm shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300">
              Average Store Rating
            </span>
            <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-center">
              <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-serif text-[#1A1A1A] dark:text-white font-normal flex items-center gap-2">
            {stats.avg.toFixed(1)}
            <span className="text-sm font-sans text-gray-500 dark:text-gray-400 font-semibold">/ 5.0</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">Customer satisfaction</p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] p-6 rounded-sm shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300">
              5-Star Ratio
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-serif text-[#1A1A1A] dark:text-white font-normal">{stats.fiveStarPct}%</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Top-tier ratings</p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] p-6 rounded-sm shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300">
              Helpful Votes
            </span>
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-serif text-[#1A1A1A] dark:text-white font-normal">{stats.totalHelpful}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Community engagement</p>
        </div>
      </div>

      {/* Main Reviews Management Card */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-sm shadow-xs overflow-hidden transition-colors">
        {/* Header & Controls */}
        <div className="p-6 border-b border-[#EAE3D9] dark:border-[#2E2E2E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl sm:text-3xl text-[#1A1A1A] dark:text-white uppercase tracking-wider font-normal">
              Customer Reviews Moderation ({filteredReviews.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-1">
              Inspect, moderate, and manage customer reviews and ratings across all items
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews, authors..."
                className="w-full sm:w-64 px-4 py-2.5 pl-10 bg-[#FAF8F5] dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] text-[#1A1A1A] dark:text-white rounded text-sm font-medium focus:ring-2 focus:ring-[#D4AF37] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#252525] border border-[#D5CCC1] dark:border-[#3E3E3E] text-[#1A1A1A] dark:text-white rounded text-sm font-semibold focus:ring-2 focus:ring-[#D4AF37] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars only</option>
              <option value="3">3 Stars only</option>
              <option value="2">2 Stars only</option>
              <option value="1">1 Star only</option>
            </select>
          </div>
        </div>

        {/* Reviews Table */}
        {loading ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest font-bold">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Star className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No reviews found matching criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] dark:bg-[#252525] border-b border-[#EAE3D9] dark:border-[#333333] text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 font-bold">
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">Reviewer</th>
                  <th className="py-3.5 px-6">Rating</th>
                  <th className="py-3.5 px-6">Review Content</th>
                  <th className="py-3.5 px-6 text-center">Helpful</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A] text-sm">
                {filteredReviews.map((rev) => {
                  const prod = productMap[rev.productId];
                  const dateStr = new Date(rev.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={rev.id} className="hover:bg-gray-50/70 dark:hover:bg-[#252525]/60 transition-colors">
                      {/* Product Info */}
                      <td className="py-4 px-6 max-w-[220px]">
                        <div className="flex items-center gap-3">
                          {prod?.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-11 h-14 object-cover rounded border border-gray-200 dark:border-[#3E3E3E] shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-14 bg-gray-100 dark:bg-[#252525] rounded border border-gray-200 dark:border-[#3E3E3E] shrink-0 flex items-center justify-center text-xs text-gray-400 font-bold">
                              N/A
                            </div>
                          )}
                          <div className="truncate">
                            <Link
                              to={`/product/${rev.productId}`}
                              target="_blank"
                              className="font-semibold text-sm text-[#1A1A1A] dark:text-white hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-colors truncate flex items-center gap-1.5"
                            >
                              <span className="truncate">{prod?.name || `Product #${rev.productId}`}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-gray-400 hover:text-[#D4AF37]" />
                            </Link>
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                              {prod?.category || 'Catalog item'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Reviewer */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-white">{rev.authorName}</div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                          {rev.verified !== false && (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Verified
                            </span>
                          )}
                          <span>•</span>
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= rev.rating
                                  ? 'text-[#D4AF37] fill-[#D4AF37]'
                                  : 'text-gray-200 dark:text-gray-600'
                              }`}
                            />
                          ))}
                          <span className="text-sm font-bold ml-1.5 text-[#1A1A1A] dark:text-white">
                            {rev.rating}
                          </span>
                        </div>
                      </td>

                      {/* Content */}
                      <td className="py-4 px-6 max-w-[360px]">
                        {rev.title && (
                          <p className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-1 truncate">
                            {rev.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-2 leading-relaxed">
                          {rev.comment}
                        </p>
                      </td>

                      {/* Helpful votes */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#2A2A2A] border border-gray-200 dark:border-[#3E3E3E] px-3 py-1 rounded-full">
                          <ThumbsUp className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                          {rev.helpfulCount || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={deletingId === rev.id}
                          onClick={() => handleDelete(rev.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
