import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquarePlus,
  SlidersHorizontal,
  ChevronDown,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  User,
} from 'lucide-react';
import type { Review, ReviewStats } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchProductReviews,
  submitProductReview,
  voteReviewHelpful,
} from '../../lib/api';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  onReviewAdded?: (newRating: number, newCount: number) => void;
}

type SortType = 'recent' | 'highest' | 'lowest' | 'helpful';

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName,
  onReviewAdded,
}) => {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 5.0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);

  // Filter & Sort State
  const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortType>('recent');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Helpful votes tracked locally per session
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.name && !authorName) {
      setAuthorName(user.name);
    }
  }, [user, authorName]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchProductReviews(productId);
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (err) {
      console.warn('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!authorName.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      setFormError('Please write your review comments.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setFormError('Please select a star rating between 1 and 5.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitProductReview({
        productId,
        authorName: authorName.trim(),
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        userId: user?.id || null,
        verified: true,
      });

      // Update state locally
      const updatedReviews = [res.review, ...reviews.filter((r) => r.id !== res.review.id)];
      setReviews(updatedReviews);

      // Recompute stats
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let sum = 0;
      for (const r of updatedReviews) {
        const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
        dist[star] = (dist[star] || 0) + 1;
        sum += r.rating;
      }
      const newAvg = Number((sum / updatedReviews.length).toFixed(1));
      const newStats: ReviewStats = {
        averageRating: newAvg,
        totalReviews: updatedReviews.length,
        distribution: dist,
      };
      setStats(newStats);

      if (onReviewAdded) {
        onReviewAdded(newAvg, updatedReviews.length);
      }

      setSubmitSuccess(true);
      setTitle('');
      setComment('');
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsFormOpen(false);
      }, 3000);
    } catch {
      setFormError('An error occurred while submitting your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Helpful vote
  const handleVoteHelpful = async (reviewId: string) => {
    if (votedReviews[reviewId]) return;

    setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
      )
    );

    try {
      await voteReviewHelpful(reviewId);
    } catch (e) {
      console.warn('Failed to register vote', e);
    }
  };

  // Filtered & Sorted list
  const filteredAndSortedReviews = useMemo(() => {
    let list = [...reviews];

    if (filterRating !== 'ALL') {
      list = list.filter((r) => Math.round(r.rating) === filterRating);
    }

    list.sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      if (sortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      // 'recent'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [reviews, filterRating, sortBy]);

  const ratingDescriptions: Record<number, string> = {
    5: '5 Stars — Exceptional quality & craftsmanship',
    4: '4 Stars — Very Good, exceeded expectations',
    3: '3 Stars — Average, satisfactory piece',
    2: '2 Stars — Below expectations',
    1: '1 Star — Unsatisfactory',
  };

  return (
    <section id="reviews" className="pt-20 border-t border-[#EAE3D9] max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF7F2] border border-[#D4AF37]/40 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1A1A1A]">
            Verified Customer Feedback
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.15em] text-[#1A1A1A]">
          Reviews & <span className="font-bold">Ratings</span>
        </h2>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
          Read authentic testimonials from collectors and luxury enthusiasts
        </p>
      </div>

      {/* Summary Score & Breakdown Card */}
      <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-sm p-6 sm:p-10 mb-12 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left: Overall Rating */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center md:border-r border-[#EAE3D9] md:pr-8">
            <div className="text-5xl md:text-6xl font-light tracking-tight text-[#1A1A1A] mb-2 font-serif">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.averageRating)
                      ? 'text-[#D4AF37] fill-[#D4AF37]'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">
              {stats.totalReviews} {stats.totalReviews === 1 ? 'Customer Review' : 'Customer Reviews'}
            </p>
            <p className="text-[11px] text-gray-500 flex items-center gap-1 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              100% Verified Purchases
            </p>
          </div>

          {/* Middle: 5-Star Distribution Bars */}
          <div className="md:col-span-5 space-y-2.5 px-0 sm:px-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
              const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
              const isSelected = filterRating === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFilterRating(filterRating === star ? 'ALL' : star)}
                  className={`w-full flex items-center gap-3 text-left group transition-opacity ${
                    filterRating !== 'ALL' && !isSelected ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] w-12 flex items-center gap-1 shrink-0">
                    {star} <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 w-12 text-right shrink-0">
                    {count} ({pct}%)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Write Review CTA Button */}
          <div className="md:col-span-3 flex flex-col items-center justify-center text-center md:pl-6 border-t md:border-t-0 border-[#EAE3D9] pt-6 md:pt-0">
            <p className="text-xs text-gray-600 mb-4 font-medium">
              Have you experienced this piece?
            </p>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(!isFormOpen);
                setSubmitSuccess(false);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs uppercase tracking-[0.2em] rounded-full transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isFormOpen ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Close Form</span>
                </>
              ) : (
                <>
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Write a Review</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Review Submission Form (Collapsible) */}
      {isFormOpen && (
        <div className="bg-white border-2 border-[#D4AF37]/50 rounded-sm p-6 sm:p-10 mb-12 shadow-lg animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-xl uppercase tracking-widest font-light text-[#1A1A1A]">
                  Review <span className="font-bold">{productName}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Share your genuine experience with other connoisseurs
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded text-emerald-800 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold uppercase tracking-wider mb-2">
                  Thank You For Your Review!
                </h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Your feedback has been published and will help other customers make exquisite choices.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-6">
                {formError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs">
                    {formError}
                  </div>
                )}

                {/* Rating Selector */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-gray-700 mb-2">
                    Overall Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating !== null ? hoverRating : rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(star)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              active
                                ? 'text-[#D4AF37] fill-[#D4AF37] drop-shadow-sm'
                                : 'text-gray-300 hover:text-gray-400'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[#D4AF37] font-medium mt-1">
                    {ratingDescriptions[hoverRating !== null ? hoverRating : rating]}
                  </p>
                </div>

                {/* Author Name */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-gray-700 mb-2">
                    Your Name / Display Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Charlotte Vance"
                      required
                      className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#D5CCC1] focus:border-[#1A1A1A] focus:bg-white focus:outline-none text-[#1A1A1A] text-sm rounded-sm transition-colors"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Review Headline / Title */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-gray-700 mb-2">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Exquisite craftsmanship and breathtaking shine"
                    className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#D5CCC1] focus:border-[#1A1A1A] focus:bg-white focus:outline-none text-[#1A1A1A] text-sm rounded-sm transition-colors"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-bold text-gray-700 mb-2">
                    Your Review Comments <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe the aesthetic, quality, weight, scent projection, or unboxing experience..."
                    required
                    className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#D5CCC1] focus:border-[#1A1A1A] focus:bg-white focus:outline-none text-[#1A1A1A] text-sm rounded-sm transition-colors"
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-6 py-3 border border-gray-300 hover:border-black rounded text-xs uppercase tracking-widest text-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9] mb-8">
        {/* Rating Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterRating('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              filterRating === 'ALL'
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFilterRating(star)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all whitespace-nowrap ${
                filterRating === star
                  ? 'bg-[#D4AF37] text-black shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{star}</span>
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] opacity-75">
                ({stats.distribution[star as 1 | 2 | 3 | 4 | 5] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <span className="text-xs uppercase tracking-wider font-bold text-gray-500">Sort:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="appearance-none bg-white border border-[#D5CCC1] rounded px-3 py-1.5 pr-8 text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#D4AF37] rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-widest">Loading reviews...</p>
        </div>
      ) : filteredAndSortedReviews.length === 0 ? (
        <div className="py-16 text-center bg-gray-50 border border-gray-200 rounded-sm p-8">
          <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-1">
            No reviews match your selected filter
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            Be the first to share your thoughts on this exquisite piece.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterRating('ALL');
              setIsFormOpen(true);
            }}
            className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest rounded-sm hover:bg-[#D4AF37] hover:text-black transition-all font-bold"
          >
            Write a Review
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAndSortedReviews.map((rev) => {
            const dateStr = new Date(rev.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const initials = rev.authorName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const hasVoted = votedReviews[rev.id];

            return (
              <div
                key={rev.id}
                className="bg-white border border-[#EAE3D9] rounded-sm p-6 sm:p-8 hover:shadow-xs transition-shadow"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  {/* Author Information */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/50 text-[#1A1A1A] font-bold text-xs flex items-center justify-center shadow-xs">
                      {initials || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1A1A1A]">
                          {rev.authorName}
                        </span>
                        {rev.verified !== false && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">{dateStr}</p>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rev.rating
                            ? 'text-[#D4AF37] fill-[#D4AF37]'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Headline & Body */}
                {rev.title && (
                  <h4 className="text-base font-bold text-[#1A1A1A] mb-2 font-serif tracking-wide">
                    {rev.title}
                  </h4>
                )}
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                  {rev.comment}
                </p>

                {/* Helpful voting button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">Was this review helpful?</span>
                    <button
                      type="button"
                      disabled={hasVoted}
                      onClick={() => handleVoteHelpful(rev.id)}
                      className={`px-3 py-1 rounded-full border flex items-center gap-1.5 text-xs transition-all ${
                        hasVoted
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default'
                          : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'text-emerald-600' : ''}`} />
                      <span>{hasVoted ? 'Helpful' : 'Yes'} ({rev.helpfulCount || 0})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
