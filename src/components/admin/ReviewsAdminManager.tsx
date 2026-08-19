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
          className={`p-4 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#EAE3D9] p-6 rounded-sm shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-gray-500">
              Total Reviews
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/40 flex items-center justify-center">
              <Award className="w-4 h-4 text-[#D4AF37]" />
            </div>
          </div>
          <div className="text-3xl font-serif text-[#1A1A1A] font-light">{stats.total}</div>
          <p className="text-[11px] text-gray-400 mt-1">Across entire catalog</p>
        </div>

        <div className="bg-white border border-[#EAE3D9] p-6 rounded-sm shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-gray-500">
              Average Store Rating
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center">
              <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
            </div>
          </div>
          <div className="text-3xl font-serif text-[#1A1A1A] font-light flex items-center gap-2">
            {stats.avg.toFixed(1)}
            <span className="text-xs font-sans text-gray-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">Customer satisfaction</p>
        </div>

        <div className="bg-white border border-[#EAE3D9] p-6 rounded-sm shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-gray-500">
              5-Star Ratio
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-serif text-[#1A1A1A] font-light">{stats.fiveStarPct}%</div>
          <p className="text-[11px] text-gray-400 mt-1">Top-tier ratings</p>
        </div>

        <div className="bg-white border border-[#EAE3D9] p-6 rounded-sm shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-gray-500">
              Helpful Votes
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-300 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-serif text-[#1A1A1A] font-light">{stats.totalHelpful}</div>
          <p className="text-[11px] text-gray-400 mt-1">Community engagement</p>
        </div>
      </div>

      {/* Main Reviews Management Card */}
      <div className="bg-white border border-[#EAE3D9] rounded-sm shadow-xs overflow-hidden">
        {/* Header & Controls */}
        <div className="p-6 border-b border-[#EAE3D9] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl text-[#1A1A1A] uppercase tracking-wider font-light">
              Customer Reviews Moderation ({filteredReviews.length})
            </h2>
            <p className="text-xs text-gray-500">
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
                className="w-full sm:w-64 px-4 py-2 pl-9 bg-[#FAF8F5] border border-[#D5CCC1] focus:border-black rounded text-xs text-[#1A1A1A] focus:outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-3 py-2 bg-[#FAF8F5] border border-[#D5CCC1] focus:border-black rounded text-xs font-medium text-[#1A1A1A] focus:outline-none cursor-pointer"
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
          <div className="py-16 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No reviews found matching criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EAE3D9] text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">Reviewer</th>
                  <th className="py-3.5 px-6">Rating</th>
                  <th className="py-3.5 px-6">Review Content</th>
                  <th className="py-3.5 px-6 text-center">Helpful</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredReviews.map((rev) => {
                  const prod = productMap[rev.productId];
                  const dateStr = new Date(rev.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={rev.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Product Info */}
                      <td className="py-4 px-6 max-w-[200px]">
                        <div className="flex items-center gap-3">
                          {prod?.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-10 h-12 object-cover rounded border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-12 bg-gray-100 rounded border border-gray-200 shrink-0 flex items-center justify-center text-[10px] text-gray-400">
                              N/A
                            </div>
                          )}
                          <div className="truncate">
                            <Link
                              to={`/product/${rev.productId}`}
                              target="_blank"
                              className="font-medium text-xs text-[#1A1A1A] hover:text-[#D4AF37] transition-colors truncate flex items-center gap-1"
                            >
                              <span className="truncate">{prod?.name || `Product #${rev.productId}`}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 text-gray-400" />
                            </Link>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                              {prod?.category || 'Catalog item'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Reviewer */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-bold text-xs text-[#1A1A1A]">{rev.authorName}</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                          {rev.verified !== false && (
                            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                            </span>
                          )}
                          <span>•</span>
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating
                                  ? 'text-[#D4AF37] fill-[#D4AF37]'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold ml-1.5 text-[#1A1A1A]">
                            {rev.rating}
                          </span>
                        </div>
                      </td>

                      {/* Content */}
                      <td className="py-4 px-6 max-w-[340px]">
                        {rev.title && (
                          <p className="text-xs font-bold text-[#1A1A1A] mb-1 truncate">
                            {rev.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {rev.comment}
                        </p>
                      </td>

                      {/* Helpful votes */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                          <ThumbsUp className="w-3 h-3 text-gray-500" />
                          {rev.helpfulCount || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={deletingId === rev.id}
                          onClick={() => handleDelete(rev.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
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
