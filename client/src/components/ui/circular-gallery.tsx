import React, { useState, useEffect, useRef, HTMLAttributes } from 'react';

// A simple utility for conditional class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
}

// Define the type for a single gallery item
export interface GalleryItem {
  common: string;
  binomial: string;
  photo: {
    url: string; 
    text: string;
    pos?: string;
    by: string;
  };
}

// Define the props for the CircularGallery component
interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Controls how far the items are from the center. */
  radius?: number;
  /** Controls the speed of auto-rotation when not scrolling. */
  autoRotateSpeed?: number;
  /** Optional click handler for gallery items. */
  onItemClick?: (item: GalleryItem, index: number) => void;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 600, autoRotateSpeed = 0.02, onItemClick, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isDraggingState, setIsDraggingState] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Refs for drag rotation
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const startRotationRef = useRef(0);
    const hasDraggedRef = useRef(false);

    // Effect to handle scroll-based rotation
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        const scrollRotation = scrollProgress * 360;
        setRotation(scrollRotation);

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    // Effect for auto-rotation when not scrolling or dragging
    useEffect(() => {
      const autoRotate = () => {
        if (!isScrolling && !isDraggingRef.current) {
          setRotation(prev => prev + autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isScrolling, autoRotateSpeed]);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
      isDraggingRef.current = true;
      setIsDraggingState(true);
      hasDraggedRef.current = false;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      startXRef.current = clientX;
      startRotationRef.current = rotation;
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - startXRef.current;

      if (Math.abs(deltaX) > 5) {
        hasDraggedRef.current = true;
      }

      // Convert deltaX pixels to degree rotation (e.g. 1px = 0.25 degrees)
      const newRotation = startRotationRef.current - deltaX * 0.25;
      setRotation(newRotation);
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
      setIsDraggingState(false);
      // Reset drag reference shortly after mouseUp to allow click event detection
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 50);
    };

    const anglePerItem = 360 / items.length;
    
    return (
      <div
        ref={ref}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn("relative w-full h-full flex items-center justify-center select-none", className)}
        style={{ perspective: '2000px', cursor: isDraggingState ? 'grabbing' : 'grab' }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        {...props}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            const totalRotation = rotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
            const opacity = Math.max(0.3, 1 - (normalizedAngle / 180));

            // Add a slow floating wave translation to make the carousel feel alive and organic
            const floatY = Math.sin((rotation * 0.05) + i) * 10;

            return (
              <div
                key={`${item.photo.url}-${i}`} 
                role="group"
                aria-label={item.common}
                onClick={(e) => {
                  if (hasDraggedRef.current) {
                    e.preventDefault();
                    return;
                  }
                  if (onItemClick) {
                    onItemClick(item, i);
                  }
                }}
                className={cn("absolute w-[160px] h-[220px] md:w-[260px] md:h-[360px] -ml-[80px] -mt-[110px] md:-ml-[130px] md:-mt-[180px]", onItemClick ? "cursor-pointer" : "")}
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px) translateY(${floatY}px)`,
                  left: '50%',
                  top: '50%',
                  opacity: opacity,
                  transition: 'opacity 0.3s linear'
                }}
              >
                {/* Premium Obsidian & Gold Card Container */}
                <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden group border border-stone-800/80 bg-stone-950/40 backdrop-blur-xl transition-all duration-500 hover:border-amber-500/40 hover:shadow-amber-950/20">
                  
                  {/* Image container with slow smooth zoom animation */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-950">
                    <img
                      src={item.photo.url}
                      alt={item.photo.text}
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ objectPosition: item.photo.pos || 'center' }}
                    />
                    {/* Shadow overlay to improve text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-40" />
                  </div>

                  {/* Floating Obsidian Frosted Glass Text Overlay with Gold Accent */}
                  <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 p-2.5 md:p-4 rounded-xl border border-white/10 bg-stone-950/80 backdrop-blur-md shadow-lg text-white transition-all duration-300 group-hover:border-amber-500/30 group-hover:shadow-amber-950/30">
                    <h2 className="text-[10px] md:text-sm font-extrabold tracking-widest text-white uppercase leading-snug font-sans">
                      {item.common}
                    </h2>
                    
                    <div className="flex items-center gap-1 md:gap-1.5 mt-1.5 md:mt-2">
                      <span className="h-1 w-1 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
                      <p className="text-[7.5px] md:text-[9px] font-bold tracking-[0.2em] text-amber-400 uppercase">
                        {item.binomial}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
