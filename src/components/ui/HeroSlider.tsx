import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export interface HeroSlide {
  id: string;
  tag?: string;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  price?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    tag: 'NEW COLLECTION',
    title: 'Discover True Elegance',
    subtitle: 'The New Lunar Collection',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=2000',
    ctaText: 'Shop the Collection',
    ctaLink: '/shop',
  },
  {
    id: 'slide-2',
    tag: 'BESTSELLER',
    title: 'Celestial Solitaire',
    subtitle: '18K Solid Gold & Emerald-Cut Stones',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=2000',
    ctaText: 'Explore Rings',
    ctaLink: '/shop?category=rings',
    price: 'From $129.00',
  },
  {
    id: 'slide-3',
    tag: 'FEATURED PIECES',
    title: 'Golden Solar Necklace',
    subtitle: 'Handcrafted Chains Radiating Warmth & Style',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=2000',
    ctaText: 'View Chains',
    ctaLink: '/shop?category=necklaces',
    price: 'From $249.00',
  },
  {
    id: 'slide-4',
    tag: 'ICONIC DESIGNS',
    title: 'Luna Pearl & Cable Bangles',
    subtitle: 'Artisan Crafted Freshwater Pearls & Solid Vermeil',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=2000',
    ctaText: 'Shop Bracelets',
    ctaLink: '/shop?category=bracelets',
  },
  {
    id: 'slide-5',
    tag: 'HAUTE PARFUMERIE',
    title: 'Signature Fragrances',
    subtitle: 'Sensual Blends of Amber, Jasmine & Vanilla',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=2000',
    ctaText: 'Discover Scents',
    ctaLink: '/shop?category=perfumes-women',
    price: '$29.90',
  },
];

interface HeroSliderProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Autoplay effect
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [nextSlide, isPaused, autoPlayInterval]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      // Swiped left -> next slide
      nextSlide();
    } else if (diff < -threshold) {
      // Swiped right -> prev slide
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative h-[80vh] min-h-[550px] max-h-[900px] w-full overflow-hidden bg-black select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Product Showcase"
    >
      {/* Slider Track with Leftward Sliding Motion */}
      <div
        className="flex w-full h-full transition-transform duration-700 ease-in-out will-change-transform"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="relative min-w-full h-full flex items-center justify-center flex-shrink-0"
            aria-hidden={index !== currentIndex}
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
              loading={index === 0 ? 'eager' : 'lazy'}
            />

            {/* Gradient & Dark Overlays for optimal readability and luxury look */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60" />
            <div className="absolute inset-0 bg-black/15" />

            {/* Content Container */}
            <div className="relative z-10 text-center text-white px-6 sm:px-12 max-w-4xl mx-auto flex flex-col items-center">
              {slide.tag && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[11px] tracking-[0.25em] uppercase font-semibold text-white/95 mb-5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{slide.tag}</span>
                  {slide.price && (
                    <span className="font-normal text-amber-200 border-l border-white/30 pl-2">
                      {slide.price}
                    </span>
                  )}
                </div>
              )}

              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-serif italic mb-4 sm:mb-6 shadow-sm leading-[0.95] text-white tracking-tight drop-shadow-md">
                {slide.title}
              </h1>

              <p className="text-sm sm:text-lg md:text-xl uppercase tracking-[0.25em] mb-8 sm:mb-10 text-gray-100 font-light max-w-2xl drop-shadow">
                {slide.subtitle}
              </p>

              <Link
                to={slide.ctaLink}
                className="inline-flex items-center justify-center bg-white text-black px-10 sm:px-14 py-4 sm:py-5 text-xs sm:text-sm uppercase tracking-[0.2em] font-bold hover:bg-black hover:text-white border border-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {slide.ctaText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/30 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg group/btn"
      >
        <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover/btn:-translate-x-0.5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/30 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg group/btn"
      >
        <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover/btn:translate-x-0.5" />
      </button>

      {/* Bottom Bar: Slide indicators + Counter */}
      <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-3 pointer-events-none">
        {/* Pagination Dots / Progress Bars */}
        <div className="flex items-center gap-2.5 pointer-events-auto bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                className={`group/dot relative transition-all duration-500 rounded-full ${
                  isActive
                    ? 'w-8 sm:w-10 h-2 bg-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              >
                <span className="sr-only">{slide.title}</span>
              </button>
            );
          })}
        </div>

        {/* Slide Counter */}
        <div className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/70">
          0{currentIndex + 1} <span className="text-white/30">/</span> 0{slides.length}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
