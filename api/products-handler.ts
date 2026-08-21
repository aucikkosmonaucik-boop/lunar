import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';
import { handleCors } from './_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // DELETE method
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query as { id?: string };
      const bodyId = req.body?.id;
      const targetId = id || bodyId;

      if (!targetId) {
        return res.status(400).json({ message: 'Product ID is required for deletion' });
      }

      await (prisma as any).product.delete({
        where: { id: targetId },
      });

      return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Delete Product Error:', err);
      return res.status(500).json({ message: 'Failed to delete product', error: err.message });
    }
  }

  // PUT / PATCH: Update existing product
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { id } = req.query as { id?: string };
      const body = req.body || {};
      const targetId = id || body.id;

      if (!targetId) {
        return res.status(400).json({ message: 'Product ID is required for update' });
      }

      const {
        name,
        slug,
        description,
        price,
        originalPrice,
        image,
        images,
        categorySlug,
        categoryId,
        subcategory,
        badge,
        rating,
        reviewCount,
        stock,
        tags,
        features,
        isAvailable,
        isFeatured,
      } = body;

      const updated = await (prisma as any).product.update({
        where: { id: targetId },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(slug !== undefined ? { slug } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(price !== undefined ? { price: Number(price) } : {}),
          ...(originalPrice !== undefined ? { originalPrice: originalPrice ? Number(originalPrice) : null } : {}),
          ...(image !== undefined ? { image } : {}),
          ...(images !== undefined ? { images: Array.isArray(images) ? images : [] } : {}),
          ...(categorySlug !== undefined ? { categorySlug } : {}),
          ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
          ...(subcategory !== undefined ? { subcategory } : {}),
          ...(badge !== undefined ? { badge: badge || null } : {}),
          ...(rating !== undefined ? { rating: Number(rating) } : {}),
          ...(reviewCount !== undefined ? { reviewCount: Number(reviewCount) } : {}),
          ...(stock !== undefined ? { stock: Number(stock) } : {}),
          ...(tags !== undefined ? { tags: Array.isArray(tags) ? tags : [] } : {}),
          ...(features !== undefined ? { features: Array.isArray(features) ? features : [] } : {}),
          ...(isAvailable !== undefined ? { isAvailable: Boolean(isAvailable) } : {}),
          ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : {}),
        },
      });

      return res.status(200).json({ success: true, product: updated });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Update Product Error:', err);
      return res.status(500).json({ message: 'Failed to update product', error: err.message });
    }
  }

  // POST: Create product (or single action if needed)
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const {
        name,
        slug,
        description,
        price,
        originalPrice,
        image,
        images,
        categorySlug,
        categoryId,
        subcategory,
        badge,
        rating,
        reviewCount,
        stock,
        tags,
        features,
        isAvailable,
        isFeatured,
      } = body;

      if (!name || price === undefined) {
        return res.status(400).json({ message: 'Name and price are required' });
      }

      const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

      const created = await (prisma as any).product.create({
        data: {
          name,
          slug: generatedSlug,
          description: description || '',
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : null,
          image: image || (images && images[0]) || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
          images: Array.isArray(images) ? images : [],
          categorySlug: categorySlug || 'jewelry',
          categoryId: categoryId || null,
          subcategory: subcategory || null,
          badge: badge || null,
          rating: rating !== undefined ? Number(rating) : 5.0,
          reviewCount: reviewCount !== undefined ? Number(reviewCount) : 0,
          stock: stock !== undefined ? Number(stock) : 10,
          tags: Array.isArray(tags) ? tags : [],
          features: Array.isArray(features) ? features : [],
          isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
          isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
        },
      });

      return res.status(201).json({ success: true, product: created });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Create Product Error:', err);
      return res.status(500).json({ message: 'Failed to create product', error: err.message });
    }
  }

  // GET: List or Single Product
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
    includeHidden,
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
    const where: any = {};
    if (includeHidden !== 'true') {
      where.isAvailable = true;
    }

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
