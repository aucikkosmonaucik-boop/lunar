import type { Review, ReviewStats } from '../types';

export const initialReviews: Review[] = [
  // 1. 250. Pink Desire - Women's Perfume
  {
    id: 'rev-101',
    productId: '1',
    authorName: 'Charlotte Vance',
    rating: 5,
    title: 'Pure springtime elegance',
    comment: 'The scent opens with subtle fresh peony and settles into a dreamy, velvety floral aroma. I receive compliments every single day at the gallery. Lasts over 8 hours on my pulse points!',
    verified: true,
    helpfulCount: 24,
    createdAt: '2025-10-18T14:32:00.000Z',
  },
  {
    id: 'rev-102',
    productId: '1',
    authorName: 'Elena Rostova',
    rating: 5,
    title: 'Compact luxury at its finest',
    comment: 'The 33ml size is ideal for travel and evening clutches. The glass bottle feels weightless yet substantial. A warm, feminine and delightfully romantic aroma.',
    verified: true,
    helpfulCount: 15,
    createdAt: '2025-11-04T09:15:00.000Z',
  },
  {
    id: 'rev-103',
    productId: '1',
    authorName: 'Sophie Bennett',
    rating: 4,
    title: 'Delicate and uplifting',
    comment: 'Very pleasant day fragrance. It is not overpowering, making it wonderful for the office. Would love a 100ml flacon in the future!',
    verified: true,
    helpfulCount: 8,
    createdAt: '2025-12-12T16:45:00.000Z',
  },

  // 2. 265. Butterfly Kiss - Women's Perfume
  {
    id: 'rev-201',
    productId: '2',
    authorName: 'Genevieve Monet',
    rating: 5,
    title: 'Crisp white lilies and ethereal jasmine',
    comment: 'So fresh and uplifting. It gives an immediate aura of clean sophistication. Packaging and atomiser spray dispersion are top-tier.',
    verified: true,
    helpfulCount: 31,
    createdAt: '2025-09-29T11:20:00.000Z',
  },
  {
    id: 'rev-202',
    productId: '2',
    authorName: 'Victoria Sterling',
    rating: 5,
    title: 'My new signature scent',
    comment: 'Sensational dry down. It begins sparkling and airy, then becomes a soft skin scent that stays with you all day. Highly recommended.',
    verified: true,
    helpfulCount: 19,
    createdAt: '2025-11-19T13:40:00.000Z',
  },

  // 3. 247. Blossom Kiss - Women's Perfume
  {
    id: 'rev-301',
    productId: '3',
    authorName: 'Amara Sinclair',
    rating: 5,
    title: 'Sweet cherry blossom with decadent vanilla undertones',
    comment: 'Warm, inviting, and truly captivating. It strikes the perfect balance between fruity floral freshness and sweet warmth.',
    verified: true,
    helpfulCount: 14,
    createdAt: '2025-12-05T18:10:00.000Z',
  },
  {
    id: 'rev-302',
    productId: '3',
    authorName: 'Isabella Cruz',
    rating: 4,
    title: 'Lovely evening perfume',
    comment: 'The scent develops remarkably well on skin. Arrived in a very neat luxury presentation box within 2 days.',
    verified: true,
    helpfulCount: 6,
    createdAt: '2026-01-14T10:05:00.000Z',
  },

  // 4. 249. Sombra Seda - Women's Perfume
  {
    id: 'rev-401',
    productId: '4',
    authorName: 'Natalia Duprès',
    rating: 5,
    title: 'Intense, mysterious, and captivating',
    comment: 'A magnificent blend of dark Turkish rose and warm amber resin. It exudes quiet confidence and elegance. A true head-turner.',
    verified: true,
    helpfulCount: 42,
    createdAt: '2025-08-14T20:11:00.000Z',
  },
  {
    id: 'rev-402',
    productId: '4',
    authorName: 'Camilla Hayes',
    rating: 5,
    title: 'Masterpiece fragrance',
    comment: 'Rich projection without ever being suffocating. Perfect for autumn and winter evenings. Sillage is unbelievable!',
    verified: true,
    helpfulCount: 27,
    createdAt: '2025-10-25T17:30:00.000Z',
  },

  // 5. Silver Orbit Earrings
  {
    id: 'rev-501',
    productId: '5',
    authorName: 'Madeleine Thorne',
    rating: 5,
    title: 'Architectural minimalism done to perfection',
    comment: 'The polished 925 sterling silver has a mirror-like sheen. They catch the light effortlessly without pulling down on my earlobes. Featherlight and exceptionally well crafted.',
    verified: true,
    helpfulCount: 38,
    createdAt: '2025-10-02T15:20:00.000Z',
  },
  {
    id: 'rev-502',
    productId: '5',
    authorName: 'Chloe Dupont',
    rating: 5,
    title: 'Flawless silver shine',
    comment: 'The post closure is secure and comfortable for all-day wear. Received so many compliments at a formal dinner.',
    verified: true,
    helpfulCount: 16,
    createdAt: '2025-11-15T12:00:00.000Z',
  },

  // 6. Golden Solar Necklace
  {
    id: 'rev-601',
    productId: '6',
    authorName: 'Julianne Ward',
    rating: 5,
    title: 'Warm radiance and breathtaking details',
    comment: 'The sun pendant has intricate tactile rays that radiate luxury. The 18k gold tone is rich and warm, not brassy. The adjustable chain makes it versatile for different necklines.',
    verified: true,
    helpfulCount: 29,
    createdAt: '2025-09-17T14:45:00.000Z',
  },
  {
    id: 'rev-602',
    productId: '6',
    authorName: 'Aurelia Rossi',
    rating: 4,
    title: 'Stunning statement piece',
    comment: 'High quality gold plating that has not tarnished after months of frequent wear. Beautiful velvet gift pouch included.',
    verified: true,
    helpfulCount: 11,
    createdAt: '2025-11-28T16:15:00.000Z',
  },

  // 7. Celestial Solitaire Ring
  {
    id: 'rev-701',
    productId: '7',
    authorName: 'Seraphina Leighton',
    rating: 5,
    title: 'Mesmerizing brilliance and timeless design',
    comment: 'The emerald-cut zirconia has astonishing clarity and fire. The prong setting feels sturdy and snag-free against knitwear. Truly a staple in my fine jewelry collection.',
    verified: true,
    helpfulCount: 52,
    createdAt: '2025-08-30T10:14:00.000Z',
  },
  {
    id: 'rev-702',
    productId: '7',
    authorName: 'Evelyn Hart',
    rating: 5,
    title: 'Looks like high-jewelry heirloom',
    comment: 'The gold finish is deep and opulent. Fits true to size and feels very comfortable on the finger throughout the day.',
    verified: true,
    helpfulCount: 23,
    createdAt: '2025-10-11T13:22:00.000Z',
  },

  // 8. Eternity Stacking Band
  {
    id: 'rev-801',
    productId: '8',
    authorName: 'Lillian Mercer',
    rating: 5,
    title: 'Dainty, sparkling, and flawless for stacking',
    comment: 'I stack two of these with my solitaire ring and the look is magical. The micro-pavé stones are set seamlessly with zero rough edges.',
    verified: true,
    helpfulCount: 33,
    createdAt: '2025-10-09T18:05:00.000Z',
  },

  // 9. Aura Gold Signet Ring
  {
    id: 'rev-901',
    productId: '9',
    authorName: 'Marcus Vance',
    rating: 5,
    title: 'Sculptural masterpiece',
    comment: 'Solid weight and high-polish finish. It has that modern Italian jewelry aesthetic that elevates any tailoring or casual outfit.',
    verified: true,
    helpfulCount: 18,
    createdAt: '2025-11-21T11:50:00.000Z',
  },

  // 10. Luna Pearl Drop Earrings
  {
    id: 'rev-1001',
    productId: '10',
    authorName: 'Gwendolyn Frost',
    rating: 5,
    title: 'Natural baroque luster is extraordinary',
    comment: 'Each pearl has its own organic contour and stunning orient. The gold huggie clasp snaps securely with a satisfying click. Ideal for special celebrations and daily understated luxury.',
    verified: true,
    helpfulCount: 47,
    createdAt: '2025-07-22T09:40:00.000Z',
  },
  {
    id: 'rev-1002',
    productId: '10',
    authorName: 'Clara Oswald',
    rating: 5,
    title: 'Timeless heirloom quality',
    comment: 'Wore these for our wedding day and they photographed exquisitely. Light on the ears and very comfortable all evening long.',
    verified: true,
    helpfulCount: 30,
    createdAt: '2025-09-08T15:30:00.000Z',
  },

  // 11. Twisted Cable Bangle
  {
    id: 'rev-1101',
    productId: '11',
    authorName: 'Adriana Silva',
    rating: 5,
    title: 'The magnetic clasp is ingenious',
    comment: 'Putting on a bangle single-handedly is usually tricky, but this magnetic clasp is seamless and remarkably strong. Gorgeous twisted texture.',
    verified: true,
    helpfulCount: 22,
    createdAt: '2025-10-14T14:10:00.000Z',
  },

  // 12. Pearl Link Bracelet
  {
    id: 'rev-1201',
    productId: '12',
    authorName: 'Beatrice Sterling',
    rating: 5,
    title: 'Chic modern twist on classic pearls',
    comment: 'The alternating paperclip links and delicate seed pearls create a chic contrast. Sits comfortably against the wrist and looks fabulous paired with a gold watch.',
    verified: true,
    helpfulCount: 17,
    createdAt: '2025-11-12T17:25:00.000Z',
  },

  // 13. Celestial Glow Gift Set
  {
    id: 'rev-1301',
    productId: '13',
    authorName: 'Harrison Cole',
    rating: 5,
    title: 'The ultimate anniversary present',
    comment: 'Bought this for my wife’s 30th birthday. The unboxing experience was unforgettable with the textured gift box, ribbon, and polishing cloth. She was thrilled beyond words.',
    verified: true,
    helpfulCount: 64,
    createdAt: '2025-08-19T21:00:00.000Z',
  },
  {
    id: 'rev-1302',
    productId: '13',
    authorName: 'Danielle Brooks',
    rating: 5,
    title: 'Phenomenal value and craftsmanship',
    comment: 'Both the necklace and matching studs are showstoppers. Wearing them together gives a cohesive, regal look.',
    verified: true,
    helpfulCount: 25,
    createdAt: '2025-10-05T12:45:00.000Z',
  },

  // 14. Ethereal Bridal Choker & Earring Suite
  {
    id: 'rev-1401',
    productId: '14',
    authorName: 'Vivienne St. Claire',
    rating: 5,
    title: 'Pure fairytale perfection for bridal wear',
    comment: 'I wore this suite on my wedding day in Lake Como. The crystal cascades caught the sunset light magnificently in photos. The craftsmanship is haute couture standard.',
    verified: true,
    helpfulCount: 78,
    createdAt: '2025-06-18T16:20:00.000Z',
  },
  {
    id: 'rev-1402',
    productId: '14',
    authorName: 'Rosalind Bailey',
    rating: 5,
    title: 'Breathtaking clarity and shimmer',
    comment: 'Words cannot describe the sparkle of these Swarovski stones. Truly an investment piece that will remain in our family for generations.',
    verified: true,
    helpfulCount: 36,
    createdAt: '2025-09-14T19:50:00.000Z',
  },
];

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
      averageRating: 5.0,
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
