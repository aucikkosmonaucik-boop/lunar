import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';
import { handleCors } from './_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // DELETE: Remove a review (admin or author)
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query as { id?: string };
      const bodyId = req.body?.id;
      const targetId = id || bodyId;

      if (!targetId) {
        return res.status(400).json({ message: 'Review ID is required for deletion' });
      }

      const existing = await (prisma as any).review.findUnique({
        where: { id: targetId },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Review not found' });
      }

      const productId = existing.productId;

      await (prisma as any).review.delete({
        where: { id: targetId },
      });

      // Recalculate product rating and count
      const allProductReviews = await (prisma as any).review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const totalReviews = allProductReviews.length;
      let newRating = 5.0;
      if (totalReviews > 0) {
        const sum = allProductReviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
        newRating = Number((sum / totalReviews).toFixed(1));
      }

      await (prisma as any).product.update({
        where: { id: productId },
        data: {
          rating: newRating,
          reviewCount: totalReviews,
        },
      });

      return res.status(200).json({ success: true, message: 'Review deleted successfully', newRating, totalReviews });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Delete Review Error:', err);
      return res.status(500).json({ message: 'Failed to delete review', error: err.message });
    }
  }

  // POST: Create review or mark review as helpful
  if (req.method === 'POST') {
    try {
      const { action } = req.query as { action?: string };
      const body = req.body || {};

      // Action: Vote Helpful
      if (action === 'helpful' || body.action === 'helpful') {
        const reviewId = (req.query.id as string) || body.id || body.reviewId;
        if (!reviewId) {
          return res.status(400).json({ message: 'Review ID is required' });
        }

        const updatedReview = await (prisma as any).review.update({
          where: { id: reviewId },
          data: {
            helpfulCount: {
              increment: 1,
            },
          },
        });

        return res.status(200).json({ success: true, review: updatedReview });
      }

      // Default POST: Create review
      const {
        productId,
        authorName,
        rating,
        title,
        comment,
        userId,
        verified,
      } = body;

      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      if (!authorName || !authorName.trim()) {
        return res.status(400).json({ message: 'Author name is required' });
      }

      if (!comment || !comment.trim()) {
        return res.status(400).json({ message: 'Review comment is required' });
      }

      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
      }

      const created = await (prisma as any).review.create({
        data: {
          productId,
          authorName: authorName.trim(),
          rating: Math.round(numRating),
          title: title ? title.trim() : null,
          comment: comment.trim(),
          userId: userId || null,
          verified: Boolean(verified ?? true),
          helpfulCount: 0,
        },
      });

      // Recalculate product rating and count
      const allProductReviews = await (prisma as any).review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const totalReviews = allProductReviews.length;
      const sum = allProductReviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
      const newRating = Number((sum / totalReviews).toFixed(1));

      await (prisma as any).product.update({
        where: { id: productId },
        data: {
          rating: newRating,
          reviewCount: totalReviews,
        },
      });

      return res.status(201).json({
        success: true,
        review: created,
        newProductRating: newRating,
        totalReviews,
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Create Review Error:', err);
      return res.status(500).json({ message: 'Failed to create review', error: err.message });
    }
  }

  // GET: Fetch reviews
  try {
    const { productId, all, limit } = req.query as { productId?: string; all?: string; limit?: string };

    // Fetch all reviews (e.g. for Admin portal)
    if (all === 'true' || !productId) {
      const reviews = await (prisma as any).review.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(limit, 10) : 100,
        include: {
          product: {
            select: { id: true, name: true, image: true, categorySlug: true },
          },
        },
      });

      return res.status(200).json({ reviews, total: reviews.length });
    }

    // Fetch reviews for specific product
    const reviews = await (prisma as any).review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
      sum += r.rating;
    }

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 5.0;

    return res.status(200).json({
      reviews,
      stats: {
        averageRating,
        totalReviews,
        distribution,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Get Reviews Error:', err);
    return res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
}
