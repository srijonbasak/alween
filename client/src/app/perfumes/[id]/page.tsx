'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../components/Header';
import { Footerdemo } from '../../../components/ui/footer-section';
import { CheckoutDrawer } from '../../../components/CheckoutDrawer';
import { useCart } from '../../../context/CartContext';
import { VimeoVideo } from '../../../components/VimeoVideo';
import { API_URL } from '../../../lib/api';
import { motion } from 'framer-motion';
import { ShoppingCart, Award, Sparkles, X, Heart, Eye, ArrowLeft, Loader2 } from 'lucide-react';

interface Perfume {
  _id: string;
  name: string;
  internalFormulaKey: string;
  description: string;
  imageUrls: string[];
  vimeoUrl?: string;
  current_volume_ml: number;
  reorder_threshold_ml: number;
  loss_margin_factor: number;
  pricePerMl: number;
  isExcludedFromDiscounts: boolean;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  type: 'single' | 'combo';
  price6ml?: number;
  price10ml?: number;
  price15ml?: number;
  price30ml?: number;
  price50ml?: number;
  perfumeCategory?: 'inspired' | 'original';
  oilConcentration?: string;
  image6ml?: string;
  image10ml?: string;
  image15ml?: string;
  image30ml?: string;
  image50ml?: string;
  originalBottleImage?: string;
  packagingImage?: string;
}

export default function PerfumeProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { addToCart, setIsDrawerOpen } = useCart();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<number>(10);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    // ponytail: check cache first to load instantly and handle unstable internet
    const cachedData = localStorage.getItem('alween_perfumes_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed)) {
          const found = parsed.find(
            (p: any) => p._id === id || p.internalFormulaKey === id
          );
          if (found) {
            setPerfume(found);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetch(`${API_URL}/api/perfumes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setPerfume(data);
      })
      .catch(err => {
        console.error('Failed to load perfume product details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!perfume || perfume.type === 'combo') {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white text-center p-4">
        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest font-mono">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The individual perfume product page could not be located in our catalog.</p>
        <Link href="/" className="mt-6 text-xs text-primary font-bold hover:underline flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> RETURN TO COLLECTIONS
        </Link>
      </div>
    );
  }

  // Calculate pricing based on variants or base per ml fallback
  const getCalculatedPrice = (): number => {
    if (selectedSize === 6 && perfume.price6ml && perfume.price6ml > 0) return perfume.price6ml;
    if (selectedSize === 10 && perfume.price10ml && perfume.price10ml > 0) return perfume.price10ml;
    if (selectedSize === 15 && perfume.price15ml && perfume.price15ml > 0) return perfume.price15ml;
    if (selectedSize === 30 && perfume.price30ml && perfume.price30ml > 0) return perfume.price30ml;
    if (selectedSize === 50 && perfume.price50ml && perfume.price50ml > 0) return perfume.price50ml;
    
    // Linear fallback pricing
    return perfume.pricePerMl * selectedSize;
  };

  // Dynamic images logic based on size selected
  const getPerfumeImages = (): string[] => {
    if (!perfume) return [];
    if (perfume.perfumeCategory === 'original') {
      return perfume.imageUrls && perfume.imageUrls.length > 0 ? perfume.imageUrls : ['https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'];
    }
    
    const images: string[] = [];
    
    // Size-specific image
    const sizeKey = `image${selectedSize}ml` as keyof typeof perfume;
    const sizeImage = perfume[sizeKey] as string | undefined;
    if (sizeImage && sizeImage.trim() !== '') {
      images.push(sizeImage);
    }
    
    // Original bottle
    if (perfume.originalBottleImage && perfume.originalBottleImage.trim() !== '') {
      images.push(perfume.originalBottleImage);
    }
    
    // Packaging
    if (perfume.packagingImage && perfume.packagingImage.trim() !== '') {
      images.push(perfume.packagingImage);
    }
    
    // Fallback to primary image URL
    if (images.length === 0 && perfume.imageUrls && perfume.imageUrls.length > 0) {
      images.push(perfume.imageUrls[0]);
    }
    
    // Append remaining images
    if (perfume.imageUrls) {
      perfume.imageUrls.forEach(url => {
        if (!images.includes(url)) images.push(url);
      });
    }
    
    return images;
  };

  const activeImages = getPerfumeImages();
  const mainImage = activeImages[activeImageIdx] || activeImages[0] || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600';

  const currentPrice = getCalculatedPrice();

  const handleAddToBasket = () => {
    addToCart({
      id: `${perfume._id}-${selectedSize}`,
      perfumeId: perfume._id,
      name: perfume.name,
      selectedSizeMl: selectedSize,
      price: currentPrice,
      internalFormulaKey: perfume.internalFormulaKey,
      isExcludedFromDiscounts: perfume.isExcludedFromDiscounts
    });
  };

  const handleBuyNow = () => {
    handleAddToBasket();
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Header />

      <main className="flex-1 py-6 sm:py-10 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Back Navigation Link */}
          <div className="mb-4">
            <Link href="/" className="text-[10px] font-bold tracking-widest text-slate-400 hover:text-slate-900 transition flex items-center gap-1.5 uppercase font-mono">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Collections
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Image Gallery Viewer */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                {/* Category Overlay Badge on Image */}
                <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md border border-stone-200/80 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest text-stone-900 shadow-sm font-sans uppercase">
                  {perfume.perfumeCategory === 'original' ? 'Original Bottle' : 'Inspired Scent'}
                </div>

                <img
                  src={mainImage}
                  alt={perfume.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Thumbnails list */}
              {activeImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {activeImages.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIdx(index)}
                      className={`h-12 w-12 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                        activeImageIdx === index ? 'border-primary' : 'border-slate-200 hover:border-slate-350'
                      }`}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Scent Specifications & Purchase Interface */}
            <div className="lg:col-span-6 flex flex-col justify-between text-left space-y-4">
              <div>
                <h1 className="font-sans text-2xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
                  {perfume.name}
                </h1>
                
                <div className="text-[10px] text-slate-400 font-mono tracking-widest mt-1 mb-4 uppercase flex justify-between max-w-[200px]">
                  <span>Product SKU:</span>
                  <span className="font-bold text-slate-800">{perfume.internalFormulaKey}</span>
                </div>

                {/* --- 1. COMPACT PRICE, BOTTLE SIZE SELECTOR & DUAL CTAs ABOVE THE FOLD --- */}
                <div className="border border-slate-200/80 py-4 px-4 sm:px-5 mb-5 space-y-4 bg-stone-50/50 rounded-2xl shadow-2xs">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                      {perfume.perfumeCategory === 'original' ? 'PRICE PER ML' : 'PRICE'}
                    </span>
                    <span className="text-stone-900 font-black text-2xl sm:text-3xl">
                      {currentPrice.toFixed(2)} BDT
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase font-sans mb-2">
                      SELECT BOTTLE SIZE
                    </label>
                    <div className="grid grid-cols-5 gap-2 max-w-md">
                      {[6, 10, 15, 30, 50].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`rounded-xl py-2 text-center text-xs font-bold transition focus:outline-none cursor-pointer ${
                            selectedSize === size
                              ? 'bg-stone-900 text-white shadow-md'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-slate-100'
                          }`}
                        >
                          {size}ml
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dual Action Buttons: ADD TO CART & BUY NOW */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={handleAddToBasket}
                      className="w-full rounded-xl bg-stone-100 border border-stone-300 py-3 text-xs font-bold tracking-wider text-stone-900 hover:bg-stone-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="h-4 w-4" /> ADD TO CART
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="w-full rounded-xl bg-stone-900 py-3 text-xs font-bold tracking-wider text-white hover:bg-stone-800 transition flex items-center justify-center gap-1.5 shadow-md shadow-stone-900/10 cursor-pointer"
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>

                {/* --- 2. DESCRIPTION & OLFACTORY NOTES (PLACED AFTER PRICE & CTAs) --- */}
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase font-sans mb-1.5">
                      Olfactory Description
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm font-light leading-relaxed">
                      {perfume.description}
                    </p>
                  </div>

                  {/* Fragrance Notes Matrix */}
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase font-sans">
                      Olfactory Notes Profile
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                      <div>
                        <span className="block text-[9px] font-bold tracking-widest text-primary uppercase font-mono">
                          Top Notes
                        </span>
                        <span className="text-slate-700 text-xs font-medium leading-relaxed">{perfume.topNotes || 'Citrus accords'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold tracking-widest text-primary uppercase font-mono">
                          Heart Notes
                        </span>
                        <span className="text-slate-700 text-xs font-medium leading-relaxed">{perfume.heartNotes || 'Floral blends'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold tracking-widest text-primary uppercase font-mono">
                          Base Notes
                        </span>
                        <span className="text-slate-700 text-xs font-medium leading-relaxed">{perfume.baseNotes || 'Woody base'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vimeo Presentation Panel */}
          {perfume.vimeoUrl && (
            <div className="mt-16 border-t border-slate-100 pt-12 max-w-4xl mx-auto text-center">
              <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase font-mono">BRAND VIDEO</span>
              <h2 className="font-sans text-2xl font-black tracking-tight text-slate-900 mt-2 mb-6 uppercase">
                SCENT INSPIRATION STORY
              </h2>
              <VimeoVideo url={perfume.vimeoUrl} />
            </div>
          )}

        </div>
      </main>

      <Footerdemo />

      {/* Mobile Sticky Bottom Purchase Bar (Visible on phones md:hidden) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 p-2.5 px-4 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div>
          <span className="block text-[9px] font-bold tracking-wider text-slate-400 font-mono uppercase">
            {selectedSize}ml Bottled Scent
          </span>
          <span className="text-stone-900 font-black text-base font-mono">
            {currentPrice.toFixed(2)} BDT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToBasket}
            className="rounded-xl bg-stone-100 border border-stone-300 px-3 py-2 text-xs font-bold tracking-wider text-stone-900 hover:bg-stone-200 transition flex items-center gap-1 cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> CART
          </button>
          <button
            onClick={handleBuyNow}
            className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold tracking-wider text-white hover:bg-stone-800 transition shadow-md cursor-pointer"
          >
            BUY NOW
          </button>
        </div>
      </div>

      <CheckoutDrawer />
    </div>
  );
}
