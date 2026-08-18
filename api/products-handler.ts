import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    id,
    slug,
    category,
    subcategory,
    tag,
    search,
    sort,
    badge,
    featured,
    limit,
    offset,
  } = req.query as Record<string, string>;

  try {
    // Single product by ID or Slug
    if (id || slug) {
      const product = await (prisma as any).product.findFirst({
        where: {
          ...(id ? { id } : {}),
          ...(slug ? { slug } : {}),
        },
        include: {
          category: true,
        },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({ product });
    }

    // Build filter where-clause
    const where: any = {
      isAvailable: true,
    };

    if (category && category.toLowerCase() !== 'all') {
      const normalizedCat = category.toLowerCase().trim();
      if (normalizedCat === 'jewelry') {
        where.categorySlug = {
          in: ['earrings', 'rings', 'necklaces', 'bracelets', 'bridal'],
        };
      } else if (normalizedCat === 'perfumes') {
        where.categorySlug = {
          in: ['perfumes', 'perfumes-women', 'perfumes-men'],
        };
      } else {
        where.OR = [
          { categorySlug: { equals: normalizedCat, mode: 'insensitive' } },
          { tags: { has: normalizedCat } },
        ];
      }
    }

    if (subcategory) {
      where.subcategory = { equals: subcategory, mode: 'insensitive' };
    }

    if (badge) {
      where.badge = { equals: badge, mode: 'insensitive' };
    }

    if (tag) {
      if (tag === 'new-arrivals') {
        where.OR = [
          { badge: 'NEW' },
          { tags: { has: 'new-arrivals' } },
        ];
      } else {
        where.tags = { has: tag };
      }
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
      ];
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const take = limit ? Math.min(Math.max(1, parseInt(limit, 10)), 100) : 50;
    const skip = offset ? Math.max(0, parseInt(offset, 10)) : 0;

    const [products, totalCount] = await Promise.all([
      (prisma as any).product.findMany({
        where,
        orderBy,
        take,
        skip,
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
      }),
      (prisma as any).product.count({ where }),
    ]);

    return res.status(200).json({
      products,
      totalCount,
      limit: take,
      offset: skip,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Products Handler Error:', err);
    return res.status(500).json({
      message: 'Failed to fetch products',
      error: err.message,
    });
  }
}
