import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing in environment variables');
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Lunar Boutique...');

  // 1. Seed Categories & Subcategories (Matching Dropdown Menu)
  console.log('📦 Seeding Categories...');
  
  const mainCategories = [
    { name: 'Shop All', slug: 'all', description: 'Explore our entire curated collection of luxury pieces.', displayOrder: 1 },
    { name: 'Latest Arrivals', slug: 'new-arrivals', description: 'Freshly designed jewelry and newly formulated perfumes.', badge: 'NEW', displayOrder: 2 },
    { name: 'Earrings', slug: 'earrings', description: 'Handcrafted earrings, pearls, hoops, and diamond studs.', displayOrder: 3 },
    { name: 'Rings', slug: 'rings', description: 'Fine artisan rings crafted in 18k solid gold plating and 925 sterling silver.', displayOrder: 4 },
    { name: 'Necklaces', slug: 'necklaces', description: 'Delicate pendants, statement chokers, and radiant gold necklaces.', displayOrder: 5 },
    { name: 'Bracelets', slug: 'bracelets', description: 'Sculpted bangles, tennis bracelets, and delicate pearl links.', displayOrder: 6 },
    { name: 'Perfumes', slug: 'perfumes', description: 'Exclusive niche fragrances and artisanal luxury extrait de parfum.', displayOrder: 7 },
    { name: 'Gift Sets', slug: 'sets', description: 'Curated luxury boxes with signature pairings and complimentary presentation.', badge: 'GIFT SET', displayOrder: 8 },
    { name: 'Bridal', slug: 'bridal', description: 'Breathtaking bridal suites and heirloom jewelry crafted for momentous celebrations.', badge: 'BRIDAL', displayOrder: 9 },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of mainCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        badge: cat.badge || null,
        displayOrder: cat.displayOrder,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        badge: cat.badge || null,
        displayOrder: cat.displayOrder,
      },
    });
    categoryMap[cat.slug] = created.id;
  }

  // Seed Subcategories (Rings and Perfumes)
  const ringsId = categoryMap['rings'];
  if (ringsId) {
    const ringSubcategories = [
      { name: 'Statement Rings', slug: 'statement-rings', displayOrder: 1 },
      { name: 'Stacking & Minimalist', slug: 'stacking-minimalist', displayOrder: 2 },
      { name: '18K Gold Plated Rings', slug: 'rings-18k-gold', displayOrder: 3 },
      { name: '925 Sterling Silver Rings', slug: 'rings-sterling-silver', displayOrder: 4 },
    ];
    for (const sub of ringSubcategories) {
      const createdSub = await prisma.category.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, parentId: ringsId, displayOrder: sub.displayOrder },
        create: { name: sub.name, slug: sub.slug, parentId: ringsId, displayOrder: sub.displayOrder },
      });
      categoryMap[sub.slug] = createdSub.id;
    }
  }

  const perfumesId = categoryMap['perfumes'];
  if (perfumesId) {
    const perfumeSubcategories = [
      { name: "Women's Perfumes", slug: 'perfumes-women', displayOrder: 1 },
      { name: "Men's Perfumes", slug: 'perfumes-men', displayOrder: 2 },
    ];
    for (const sub of perfumeSubcategories) {
      const createdSub = await prisma.category.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, parentId: perfumesId, displayOrder: sub.displayOrder },
        create: { name: sub.name, slug: sub.slug, parentId: perfumesId, displayOrder: sub.displayOrder },
      });
      categoryMap[sub.slug] = createdSub.id;
    }
  }

  // 2. Seed Products (Complete Catalog from Dropdown Menu)
  console.log('💎 Seeding Products...');

  const productsData = [
    // Women's Perfumes
    {
      id: '1',
      name: "250. Pink Desire - Women's Perfume - 33ml",
      slug: '250-pink-desire-womens-perfume-33ml',
      description: 'A delicate and floral fragrance that captures the essence of a spring garden in bloom. Perfect for day wear.',
      price: 29.90,
      originalPrice: 39.90,
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'perfumes-women',
      subcategory: 'women',
      badge: 'SOLD OUT',
      rating: 4.8,
      reviewCount: 124,
      stock: 0,
      tags: ['floral', 'sweet', 'spring', 'perfumes'],
      features: ['Long lasting', 'Elegant bottle', 'Vegan'],
      isAvailable: true,
      isFeatured: true,
    },
    {
      id: '2',
      name: "265. Butterfly Kiss - Women's Perfume - 33ml",
      slug: '265-butterfly-kiss-womens-perfume-33ml',
      description: 'An airy and light scent with notes of jasmine and white lily. Evokes freedom and grace.',
      price: 29.90,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'perfumes-women',
      subcategory: 'women',
      badge: 'READY TO SHIP',
      rating: 4.9,
      reviewCount: 89,
      stock: 15,
      tags: ['jasmine', 'fresh', 'light', 'perfumes', 'ready-to-ship'],
      features: ['Natural ingredients', 'Travel size'],
      isAvailable: true,
      isFeatured: true,
    },
    {
      id: '3',
      name: "247. Blossom Kiss - Women's Perfume - 33ml",
      slug: '247-blossom-kiss-womens-perfume-33ml',
      description: 'Sweet cherry blossom blended with a hint of vanilla. A truly enchanting experience.',
      price: 29.90,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'perfumes-women',
      subcategory: 'women',
      badge: 'NEW',
      rating: 4.7,
      reviewCount: 56,
      stock: 12,
      tags: ['cherry', 'vanilla', 'sweet', 'perfumes', 'ready-to-ship', 'new-arrivals'],
      features: ['Premium quality', 'Gift ready'],
      isAvailable: true,
      isFeatured: false,
    },
    {
      id: '4',
      name: "249. Sombra Seda - Women's Perfume - 33ml",
      slug: '249-sombra-seda-womens-perfume-33ml',
      description: 'A mysterious and seductive blend of amber and dark rose. For the confident woman.',
      price: 29.90,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'perfumes-women',
      subcategory: 'women',
      badge: 'BESTSELLER',
      rating: 5.0,
      reviewCount: 231,
      stock: 5,
      tags: ['amber', 'dark-rose', 'mysterious', 'perfumes', 'ready-to-ship'],
      features: ['Intense fragrance', 'Iconic scent'],
      isAvailable: true,
      isFeatured: true,
    },
    // Men's Perfumes
    {
      id: '15',
      name: "701. Sauvage Night - Men's Cologne - 50ml",
      slug: '701-sauvage-night-mens-cologne-50ml',
      description: 'A magnetic, woody fragrance with bergamot, pepper, and cedarwood notes. Crafted for evening refinement.',
      price: 34.90,
      originalPrice: 45.00,
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'perfumes-men',
      subcategory: 'men',
      badge: 'BESTSELLER',
      rating: 4.9,
      reviewCount: 145,
      stock: 18,
      tags: ['woody', 'bergamot', 'cedarwood', 'perfumes', 'perfumes-men', 'ready-to-ship'],
      features: ['Long lasting 12h+', 'Magnetic cap', 'Cruelty Free'],
      isAvailable: true,
      isFeatured: true,
    },
    {
      id: '16',
      name: "705. Noir Intense - Men's Perfume - 33ml",
      slug: '705-noir-intense-mens-perfume-33ml',
      description: 'Rich dark amber and smoked cardamom combined with leather accords. Sophisticated and memorable.',
      price: 29.90,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'perfumes-men',
      subcategory: 'men',
      badge: 'NEW',
      rating: 4.8,
      reviewCount: 62,
      stock: 20,
      tags: ['leather', 'cardamom', 'amber', 'perfumes', 'perfumes-men', 'new-arrivals'],
      features: ['Artisan blend', 'Pocket size'],
      isAvailable: true,
      isFeatured: false,
    },
    // Earrings
    {
      id: '5',
      name: 'Silver Orbit Earrings',
      slug: 'silver-orbit-earrings',
      description: 'Elegant silver earrings inspired by the lunar path. Minimalist yet striking.',
      price: 249.00,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1535633302703-b0703af6c35e?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1535633302703-b0703af6c35e?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'earrings',
      subcategory: 'sterling-silver',
      badge: 'NEW',
      rating: 4.9,
      reviewCount: 42,
      stock: 10,
      tags: ['silver', 'earrings', 'minimalist', 'jewelry', 'ready-to-ship', 'new-arrivals'],
      features: ['925 Sterling Silver', 'Handcrafted'],
      isAvailable: true,
      isFeatured: true,
    },
    {
      id: '10',
      name: 'Luna Pearl Drop Earrings',
      slug: 'luna-pearl-drop-earrings',
      description: 'Luminous freshwater baroque pearls suspended from polished gold huggie hoops.',
      price: 175.00,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'earrings',
      subcategory: 'pearls',
      badge: 'READY TO SHIP',
      rating: 5.0,
      reviewCount: 53,
      stock: 9,
      tags: ['earrings', 'pearls', 'bridal', 'jewelry', 'ready-to-ship'],
      features: ['Natural Freshwater Pearls', '18k Gold Vermeil'],
      isAvailable: true,
      isFeatured: true,
    },
    // Necklaces
    {
      id: '6',
      name: 'Golden Solar Necklace',
      slug: 'golden-solar-necklace',
      description: 'A golden necklace featuring a central sun-inspired pendant. Radiates warmth and style.',
      price: 399.00,
      originalPrice: 450.00,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'necklaces',
      subcategory: 'gold-plated',
      badge: 'SALE',
      rating: 4.8,
      reviewCount: 67,
      stock: 3,
      tags: ['gold', 'necklace', 'statement', 'jewelry', 'ready-to-ship'],
      features: ['18k Gold Plated', 'Adjustable length'],
      isAvailable: true,
      isFeatured: true,
    },
    // Rings
    {
      id: '7',
      name: 'Celestial Solitaire Ring',
      slug: 'celestial-solitaire-ring',
      description: 'A radiant solitaire ring featuring an emerald-cut zirconia embraced by 18K solid gold plating.',
      price: 189.00,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'rings',
      subcategory: 'statement',
      badge: 'BESTSELLER',
      rating: 4.9,
      reviewCount: 112,
      stock: 8,
      tags: ['rings', 'gold', 'statement', 'jewelry', 'ready-to-ship', 'new-arrivals'],
      features: ['18k Gold Plated', 'Zirconia Crystal', 'Water Resistant'],
      isAvailable: true,
      isFeatured: true,
    },
    {
      id: '8',
      name: 'Eternity Stacking Band',
      slug: 'eternity-stacking-band',
      description: 'Dainty micro-pavé band designed to be worn alone or stacked for everyday refinement.',
      price: 129.00,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'rings',
      subcategory: 'stacking-minimalist',
      badge: 'READY TO SHIP',
      rating: 4.9,
      reviewCount: 78,
      stock: 14,
      tags: ['rings', 'minimalist', 'silver', 'jewelry', 'ready-to-ship'],
      features: ['925 Sterling Silver', 'Hand-set stones', 'Hypoallergenic'],
      isAvailable: true,
      isFeatured: false,
    },
    {
      id: '9',
      name: 'Aura Gold Signet Ring',
      slug: 'aura-gold-signet-ring',
      description: 'A contemporary sculptural signet ring polished to mirror perfection.',
      price: 165.00,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'rings',
      subcategory: 'gold-plated',
      badge: 'NEW',
      rating: 4.8,
      reviewCount: 34,
      stock: 6,
      tags: ['rings', 'statement', 'gold', 'jewelry', 'new-arrivals'],
      features: ['18k Gold Plated', 'Comfort Fit'],
      isAvailable: true,
      isFeatured: false,
    },
    // Bracelets
    {
      id: '11',
      name: 'Twisted Cable Bangle',
      slug: 'twisted-cable-bangle',
      description: 'Artisan twisted cable bracelet with magnetic clasp, embodying eternal grace.',
      price: 210.00,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'bracelets',
      subcategory: 'gold-plated',
      badge: 'READY TO SHIP',
      rating: 4.7,
      reviewCount: 46,
      stock: 11,
      tags: ['bracelets', 'gold', 'jewelry', 'ready-to-ship'],
      features: ['18k Gold Plated', 'Secure Magnetic Clasp'],
      isAvailable: true,
      isFeatured: false,
    },
    {
      id: '12',
      name: 'Pearl Link Bracelet',
      slug: 'pearl-link-bracelet',
      description: 'Alternating gold paperclip links and delicate seed pearls for a refined wrist statement.',
      price: 155.00,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'bracelets',
      subcategory: 'pearls',
      badge: 'NEW',
      rating: 4.9,
      reviewCount: 29,
      stock: 7,
      tags: ['bracelets', 'bridal', 'pearls', 'jewelry', 'new-arrivals', 'ready-to-ship'],
      features: ['18k Gold Vermeil', 'Seed Pearls'],
      isAvailable: true,
      isFeatured: false,
    },
    // Gift Sets
    {
      id: '13',
      name: 'Celestial Glow Gift Set',
      slug: 'celestial-glow-gift-set',
      description: 'A curated gift box with the signature Golden Solar Necklace and matching Orbit Studs in luxury presentation box.',
      price: 499.00,
      originalPrice: 648.00,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'sets',
      subcategory: 'gift-sets',
      badge: 'GIFT SET',
      rating: 5.0,
      reviewCount: 88,
      stock: 4,
      tags: ['sets', 'gift-sets', 'jewelry', 'ready-to-ship'],
      features: ['Luxury Gift Box included', 'Complimentary Polishing Cloth'],
      isAvailable: true,
      isFeatured: true,
    },
    // Bridal
    {
      id: '14',
      name: 'Ethereal Bridal Choker & Earring Suite',
      slug: 'ethereal-bridal-choker-earring-suite',
      description: 'Couture bridal jewelry suite with delicate crystal cascades crafted for momentous occasions.',
      price: 680.00,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'bridal',
      subcategory: 'bridal-suites',
      badge: 'BRIDAL',
      rating: 5.0,
      reviewCount: 31,
      stock: 2,
      tags: ['bridal', 'necklace', 'earrings', 'jewelry'],
      features: ['Swarovski Crystals', '925 Sterling Silver', 'Hand-finished in Dublin'],
      isAvailable: true,
      isFeatured: true,
    },
  ];

  for (const item of productsData) {
    const parentCatId = categoryMap[item.categorySlug] || null;
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        images: item.images,
        categorySlug: item.categorySlug,
        categoryId: parentCatId,
        subcategory: item.subcategory,
        badge: item.badge,
        rating: item.rating,
        reviewCount: item.reviewCount,
        stock: item.stock,
        tags: item.tags,
        features: item.features,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured,
      },
      create: {
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        images: item.images,
        categorySlug: item.categorySlug,
        categoryId: parentCatId,
        subcategory: item.subcategory,
        badge: item.badge,
        rating: item.rating,
        reviewCount: item.reviewCount,
        stock: item.stock,
        tags: item.tags,
        features: item.features,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured,
      },
    });
  }

  // 3. Seed Promo Codes
  console.log('🎟️ Seeding Promo Codes...');
  const promoCodes = [
    { code: 'WELCOME10', discountPct: 10, minOrderValue: 0 },
    { code: 'LUNAR15', discountPct: 15, minOrderValue: 50 },
    { code: 'VIP20', discountPct: 20, minOrderValue: 100 },
  ];

  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {
        discountPct: promo.discountPct,
        minOrderValue: promo.minOrderValue,
        isActive: true,
      },
      create: {
        code: promo.code,
        discountPct: promo.discountPct,
        minOrderValue: promo.minOrderValue,
        isActive: true,
      },
    });
  }

  // 4. Seed Loyalty Rewards
  console.log('🎁 Seeding Loyalty Rewards...');
  const loyaltyRewardsData = [
    {
      title: '€2.50 Discount Voucher',
      description: 'Discount on any fine jewelry or perfume order.',
      pointsCost: 100,
      discountType: 'FIXED',
      discountValue: 2.5,
      minOrderValue: 20,
      isActive: true,
    },
    {
      title: '10% Off Entire Order',
      description: '10% discount on your entire cart with no order limit.',
      pointsCost: 200,
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 30,
      isActive: true,
    },
    {
      title: 'VIP €6.00 Gift Voucher',
      description: 'Exclusive luxury discount for loyal Club patrons.',
      pointsCost: 350,
      discountType: 'FIXED',
      discountValue: 6.0,
      minOrderValue: 40,
      isActive: true,
    },
    {
      title: 'Golden 20% Off Privilege',
      description: 'Maximum 20% discount across the entire Lunar collection.',
      pointsCost: 500,
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderValue: 50,
      isActive: true,
    },
  ];

  for (const item of loyaltyRewardsData) {
    const existing = await prisma.loyaltyReward.findFirst({
      where: { pointsCost: item.pointsCost },
    });
    if (existing) {
      await prisma.loyaltyReward.update({
        where: { id: existing.id },
        data: item,
      });
    } else {
      await prisma.loyaltyReward.create({
        data: item,
      });
    }
  }

  // 5. Seed Master Admin / Owner Account
  console.log('👑 Seeding Master Admin User...');
  const adminHashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'LunarAdmin2026!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@lunar.com' },
    update: {
      role: 'ADMIN',
      name: 'Lunar Boutique Admin',
    },
    create: {
      email: 'admin@lunar.com',
      password: adminHashedPassword,
      name: 'Lunar Boutique Admin',
      role: 'ADMIN',
      loyaltyPoints: 1000,
    },
  });

  console.log('✅ Database seeded successfully with Master Admin!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
