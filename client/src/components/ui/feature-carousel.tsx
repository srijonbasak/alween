"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Helper to extract Vimeo ID
const getVimeoId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:videos\/|video\/|\b|^)([0-9]+)/);
  return match ? match[1] : null;
};

// --- TYPES ---
export interface CarouselItem {
  src: string;
  alt: string;
  vimeoUrl?: string;
  title?: string;
  description?: string;
  id?: string;
}

export interface HeroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle: string;
  images: CarouselItem[];
  onItemClick?: (item: CarouselItem, index: number) => void;
}

// --- ZERO-BLANK VIDEO PLAYER CARD SUB-COMPONENT ---
const VimeoHeroCard: React.FC<{ 
  videoId: string; 
  image: CarouselItem; 
  isAudioActive: boolean;
  isCenter: boolean;
  onVideoEnd?: () => void;
}> = ({ 
  videoId, 
  image, 
  isAudioActive,
  isCenter,
  onVideoEnd
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Audio is ONLY active if sound button is ON AND this card is the active front-center card
  const isAudioPlaying = isAudioActive && isCenter;

  // Listen to Vimeo postMessage events when video finishes playing
  useEffect(() => {
    if (!isCenter || !onVideoEnd) return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('vimeo.com')) return;
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        if (data && (data.event === 'ended' || data.event === 'finish')) {
          onVideoEnd();
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isCenter, onVideoEnd]);

  return (
    <div className="w-full h-full bg-stone-900 relative overflow-hidden pointer-events-none">
      {/* 1. Instant Luxury Poster Image (Visible IMMEDIATELY, 0ms Delay) */}
      <img
        src={image.src || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'}
        alt={image.alt || 'Alween Luxury Video'}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
      />

      {/* Ambient Gold Shimmer Pulse Loader */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 bg-stone-950/30 backdrop-blur-[1px] flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-amber-400/80 border-t-transparent animate-spin" />
        </div>
      )}

      {/* 2. Vimeo Video Stream Iframe (only mounted when card is active/adjacent for 4x faster load) */}
      {(isCenter || isAudioPlaying) ? (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1&loop=0&muted=${isAudioPlaying ? 0 : 1}&volume=${isAudioPlaying ? 0.10 : 0}&autopause=0&background=1&quality=540p&dnt=1&playsinline=1&api=1`}
          className={cn(
            "absolute inset-0 w-full h-full scale-[1.12] transition-opacity duration-700 ease-in-out",
            isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
          frameBorder="0"
          allow="autoplay; fullscreen"
          loading="eager"
          onLoad={() => setIsVideoLoaded(true)}
        />
      ) : null}

      {/* Subtle luxury gradient edge vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20 opacity-60 pointer-events-none" />
    </div>
  );
};

// --- HERO SECTION COMPONENT ---
export const HeroSection = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ title, subtitle, images, onItemClick, children, className, ...props }, ref) => {
    // Initial index starts at 0 (Video 1) so videos play in natural sequence 1 -> 2 -> 3
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isAudioActive, setIsAudioActive] = useState(false);
    
    // Set initial index to 0 for Video 1 priority
    useEffect(() => {
      if (images && images.length > 0) {
        setCurrentIndex(0);
      }
    }, [images]);

    // Handle responsiveness
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNext = useCallback(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const handlePrev = useCallback(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length]);

    // Advance to next video when active video finishes playing completely
    const handleVideoEnd = useCallback(() => {
      handleNext();
    }, [handleNext]);

    // Full video clip duration fallback (13s): Ensures carousel advances seamlessly once video finishes playing
    useEffect(() => {
      if (!images || images.length <= 1) return;
      const timer = setInterval(() => {
        handleNext();
      }, 13000); // 13 seconds full clip playback duration
      return () => clearInterval(timer);
    }, [handleNext, images, currentIndex]);

    const handleCardClick = (index: number, item: CarouselItem) => {
      if (index === currentIndex) {
        if (onItemClick) {
          onItemClick(item, index);
        }
      } else {
        // Slide to this item
        setCurrentIndex(index);
      }
    };

    // Touch Swipe Support for Mobile
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (!touchStartX.current || !touchEndX.current) return;
      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50; // swipe threshold in px
      if (diff > threshold) {
        handleNext();
      } else if (diff < -threshold) {
        handlePrev();
      }
      touchStartX.current = null;
      touchEndX.current = null;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center overflow-x-hidden bg-white text-slate-900 px-4 py-8 sm:py-12 border-b border-slate-100',
          className
        )}
        {...props}
      >
        {/* Elegant warm brand background gradient overlay */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(197,168,128,0.12),rgba(255,255,255,0))]"></div>
          <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(212,175,55,0.08),rgba(255,255,255,0))]"></div>
        </div>

        {/* Content Container */}
        <div className="z-10 flex w-full flex-col items-center text-center space-y-6 md:space-y-10">
          {/* Header Section */}
          <div className="space-y-3 sm:space-y-4 w-full max-w-7xl px-2 sm:px-4 flex flex-col items-center justify-center">
            <h1 className="w-full text-center font-black tracking-tight text-slate-900 uppercase leading-none overflow-hidden">
              {title}
            </h1>
            <p className="max-w-2xl mx-auto text-stone-500 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase font-sans">
              {subtitle}
            </p>
          </div>

          {/* Main Showcase 3D Carousel Section */}
          <div 
            className="relative w-full h-[380px] sm:h-[420px] md:h-[460px] lg:h-[490px] flex items-center justify-center select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Ambient Soft Sound Toggle Control Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAudioActive(!isAudioActive);
              }}
              className="absolute bottom-1 right-4 sm:right-12 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-[10px] font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
              title={isAudioActive ? "Mute Ambient Soundtrack" : "Play Soft Ambient Music (10%)"}
            >
              {isAudioActive ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  <span>SOFT MUSIC (10%)</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-stone-400" />
                  <span>ENABLE SOUND</span>
                </>
              )}
            </button>

            {/* Carousel Wrapper */}
            <div className="relative w-full h-full flex items-center justify-center [perspective:1000px]">
              {images.map((image, index) => {
                const offset = index - currentIndex;
                const total = images.length;
                let pos = (offset + total) % total;
                if (pos > Math.floor(total / 2)) {
                  pos = pos - total;
                }

                const isCenter = pos === 0;
                const isAdjacent = Math.abs(pos) === 1;
                const videoId = image.vimeoUrl ? getVimeoId(image.vimeoUrl) : null;

                return (
                  <div
                    key={index}
                    onClick={() => handleCardClick(index, image)}
                    className={cn(
                      'absolute transition-all duration-500 ease-in-out cursor-pointer',
                      'w-[210px] h-[370px] sm:w-[240px] sm:h-[410px] md:w-[260px] md:h-[450px] rounded-[24px] sm:rounded-[32px] overflow-hidden',
                      'flex items-center justify-center border border-slate-100/50 shadow-xl'
                    )}
                    style={{
                      transform: `
                        translateX(${(pos) * (isMobile ? 32 : 45)}%) 
                        scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7})
                        rotateY(${(pos) * -10}deg)
                      `,
                      zIndex: isCenter ? 20 : isAdjacent ? 10 : 1,
                      opacity: isCenter ? 1 : isAdjacent ? 0.45 : 0.15,
                      filter: isCenter ? 'blur(0px)' : 'blur(4px)',
                      visibility: Math.abs(pos) > (isMobile ? 1 : 2) ? 'hidden' : 'visible',
                    }}
                  >
                    {videoId ? (
                      <VimeoHeroCard 
                        videoId={videoId} 
                        image={image} 
                        isAudioActive={isAudioActive} 
                        isCenter={isCenter}
                        onVideoEnd={handleVideoEnd}
                      />
                    ) : (
                      <div className="relative w-full h-full group/card overflow-hidden bg-stone-50">
                        {/* Perfume Image Cover (Fallback) */}
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="object-cover w-full h-full transition-transform duration-700 group-hover/card:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-50" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons (Hidden on mobile for cleaner swiping) */}
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-30 bg-white/75 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 transition-all hover:scale-105 active:scale-95 shadow-md"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-30 bg-white/75 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 transition-all hover:scale-105 active:scale-95 shadow-md"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {children}
        </div>
      </div>
    );
  }
);

HeroSection.displayName = 'HeroSection';
