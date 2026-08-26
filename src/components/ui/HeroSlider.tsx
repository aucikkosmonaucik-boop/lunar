import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const extendedSlides = useMemo(() => {
    if (slides.length <= 1) return slides;
    return [
      slides[slides.length - 1], // Clone of last slide at start
      ...slides,                 // Original slides
      slides[0],                 // Clone of first slide at end
    ];
  }, [slides]);

  // Index starts at 1 (the first real slide) if multiple slides exist
  const [currentIndex, setCurrentIndex] = useState(slides.length > 1 ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef<boolean>(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isMouseDown = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);

  // Active real slide index for dots and counters (0 to slides.length - 1)
  const activeRealIndex = useMemo(() => {
    if (slides.length <= 1) return 0;
    if (currentIndex === 0) return slides.length - 1;
    if (currentIndex === extendedSlides.length - 1) return 0;
    return (currentIndex - 1 + slides.length) % slides.length;
  }, [currentIndex, extendedSlides.length, slides.length]);

  // Smooth slide to left (next slide)
  const nextSlide = useCallback(() => {
    if (slides.length <= 1 || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [slides.length]);

  // Smooth slide to right (previous slide)
  const prevSlide = useCallback(() => {
    if (slides.length <= 1 || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [slides.length]);

  // Go directly to a specific slide
  const goToSlide = (index: number) => {
    if (slides.length <= 1 || isAnimatingRef.current) return;
    if (index === activeRealIndex) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex(index + 1);
  };

  // Seamless infinite wrap on transition end
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current) return;
    isAnimatingRef.current = false;

    if (slides.length <= 1) return;

    if (currentIndex === extendedSlides.length - 1) {
      // Arrived at cloned first slide -> instantly snap to real first slide (index 1) without transition
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      // Arrived at cloned last slide -> instantly snap to real last slide (index slides.length) without transition
      setIsTransitioning(false);
      setCurrentIndex(slides.length);
    }
  };

  // Re-enable smooth transition once the instant position reset has been painted
  useEffect(() => {
    if (!isTransitioning) {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [isTransitioning]);

  // Autoplay effect (cycles smoothly to left)
  useEffect(() => {
    if (isPaused || isDragging || slides.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [nextSlide, isPaused, isDragging, autoPlayInterval, slides.length]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (slides.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
    setIsPaused(true);
    hasDraggedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Only drag horizontally if horizontal movement exceeds vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 6) {
        hasDraggedRef.current = true;
      }
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const threshold = 50;

    if (dragOffset < -threshold) {
      nextSlide();
    } else if (dragOffset > threshold) {
      prevSlide();
    } else {
      setIsTransitioning(true);
    }

    setDragOffset(0);
    setIsDragging(false);
    setIsPaused(false);
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Mouse Drag Handlers for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (slides.length <= 1 || e.button !== 0) return;
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
    setIsDragging(true);
    setIsPaused(true);
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || mouseStartX.current === null) return;
    const diffX = e.clientX - mouseStartX.current;
    if (Math.abs(diffX) > 6) {
      hasDraggedRef.current = true;
    }
    setDragOffset(diffX);
  };

  const handleMouseUp = () => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    const threshold = 50;

    if (dragOffset < -threshold) {
      nextSlide();
    } else if (dragOffset > threshold) {
      prevSlide();
    } else {
      setIsTransitioning(true);
    }

    setDragOffset(0);
    setIsDragging(false);
    setIsPaused(false);
    mouseStartX.current = null;
  };

  const handleMouseLeave = () => {
    if (isMouseDown.current) {
      handleMouseUp();
    }
    setIsPaused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  const getTransform = () => {
    if (slides.length <= 1) return 'translateX(0%)';
    if (dragOffset !== 0) {
      return `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`;
    }
    return `translateX(-${currentIndex * 100}%)`;
  };

  return (
    <section
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative h-[80vh] min-h-[560px] max-h-[920px] w-full overflow-hidden bg-black select-none group focus:outline-none cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Product Showcase"
    >
      {/* Slider Track with Smooth Leftward Sliding Physics */}
      <div
        ref={trackRef}
        onTransitionEnd={handleTransitionEnd}
        className="flex w-full h-full will-change-transform"
        style={{
          transform: getTransform(),
          transition:
            isTransitioning && !isDragging
              ? 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
        }}
      >
        {extendedSlides.map((slide, index) => {
          const isCurrentActive =
            (slides.length <= 1 && index === 0) ||
            (slides.length > 1 &&
              (index === currentIndex ||
                (currentIndex === 0 && index === slides.length) ||
                (currentIndex === extendedSlides.length - 1 && index === 1)));

          return (
            <div
              key={`${slide.id}-${index}`}
              className="relative min-w-full h-full flex items-center justify-center flex-shrink-0"
              aria-hidden={!isCurrentActive}
            >
              {/* Background Image with subtle zoom dynamics */}
              <img
                src={slide.image}
                alt={slide.title}
                draggable={false}
                className={`absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none transition-transform duration-1000 ease-out ${
                  isCurrentActive ? 'scale-105' : 'scale-100'
                }`}
                loading={index <= 2 ? 'eager' : 'lazy'}
              />

              {/* Gradient & Dark Overlays for optimal readability and luxury look */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/75 pointer-events-none" />
              <div className="absolute inset-0 bg-black/15 pointer-events-none" />

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

                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-serif italic mb-4 sm:mb-6 leading-[0.95] text-white tracking-tight drop-shadow-md">
                  {slide.title}
                </h1>

                <p className="text-sm sm:text-lg md:text-xl uppercase tracking-[0.25em] mb-8 sm:mb-10 text-gray-100 font-light max-w-2xl drop-shadow">
                  {slide.subtitle}
                </p>

                <Link
                  to={slide.ctaLink}
                  onClick={(e) => {
                    if (hasDraggedRef.current) {
                      e.preventDefault();
                    }
                  }}
                  className="inline-flex items-center justify-center bg-white text-black px-10 sm:px-14 py-4 sm:py-5 text-xs sm:text-sm uppercase tracking-[0.2em] font-bold hover:bg-black hover:text-white border border-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] select-none cursor-pointer"
                >
                  {slide.ctaText}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/35 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg group/btn cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover/btn:-translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/35 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg group/btn cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </>
      )}

      {/* Bottom Bar: Slide indicators + Luxury Counter */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-3 pointer-events-none">
          {/* Pagination Dots / Bars */}
          <div className="flex items-center gap-2.5 pointer-events-auto bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
            {slides.map((slide, index) => {
              const isActive = index === activeRealIndex;
              return (
                <button
                  type="button"
                  key={slide.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                  aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                  className={`group/dot relative transition-all duration-500 rounded-full cursor-pointer ${
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
          <div className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/80 select-none">
            <span className="text-white font-bold">
              {String(activeRealIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-white/40 mx-1.5">/</span>
            <span className="text-white/60">
              {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
