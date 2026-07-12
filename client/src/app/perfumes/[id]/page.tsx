'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../components/Header';
import { CheckoutDrawer } from '../../../components/CheckoutDrawer';
import { useCart } from '../../../context/CartContext';
import { VimeoVideo } from '../../../components/VimeoVideo';
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

    fetch(`http://localhost:5000/api/perfumes/${id}`)
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
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Header />

      <main className="flex-1 py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Back Navigation Link */}
          <div className="mb-8">
            <Link href="/" className="text-[10px] font-bold tracking-widest text-slate-400 hover:text-slate-900 transition flex items-center gap-1.5 uppercase font-mono">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Collections
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Image Gallery Viewer */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <img
                  src={perfume.imageUrls && perfume.imageUrls.length > 0
                    ? perfume.imageUrls[activeImageIdx]
                    : 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'}
                  alt={perfume.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Thumbnails list */}
              {perfume.imageUrls && perfume.imageUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {perfume.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIdx(index)}
                      className={`h-14 w-14 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                        activeImageIdx === index ? 'border-primary' : 'border-slate-200 hover:border-slate-350'
                      }`}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Scent Specifications Form */}
            <div className="lg:col-span-6 flex flex-col justify-between text-left space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-stone-50 border border-stone-200 text-stone-700 text-[8px] font-extrabold tracking-widest px-2 py-0.5 rounded font-mono uppercase">
                    Single Fragrance
                  </span>
                  {perfume.isExcludedFromDiscounts && (
                    <span className="bg-red-50 border border-red-150 text-red-600 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded font-mono uppercase">
                      Excluded
                    </span>
                  )}
                </div>

                <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
                  {perfume.name}
                </h1>
                
                <div className="text-[10px] text-slate-400 font-mono tracking-widest mt-1.5 mb-6 uppercase flex justify-between max-w-[200px]">
                  <span>Formula SKU:</span>
                  <span className="font-bold text-slate-800">{perfume.internalFormulaKey}</span>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-2">
                      Olfactory Description
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm font-light leading-relaxed">
                      {perfume.description}
                    </p>
                  </div>

                  {/* Extract Decant Bottle Size Selector */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-3">
                      EXTRACT DECANT SIZE (ML)
                    </label>
                    <div className="grid grid-cols-5 gap-2 max-w-md">
                      {[6, 10, 15, 30, 50].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`rounded-lg py-2.5 text-center text-xs font-bold transition focus:outline-none ${
                            selectedSize === size
                              ? 'bg-primary text-slate-900 shadow-md shadow-primary/10'
                              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {size}ml
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fragrance Notes Matrix */}
                  <div className="space-y-4 border-t border-slate-100 pt-6">
                    <h3 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                      Olfactory Notes Profile
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-xl">
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

              {/* Shopping checkout interface */}
              <div className="pt-6 border-t border-slate-100 max-w-md">
                <div className="flex justify-between items-baseline mb-4 font-mono">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    CALCULATED PRICE
                  </span>
                  <span className="text-primary font-bold text-2xl">
                    {currentPrice.toFixed(2)} BDT
                  </span>
                </div>
                <button
                  onClick={handleAddToBasket}
                  className="w-full rounded-lg bg-primary py-3.5 text-xs font-bold tracking-widest text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-2 shadow-md shadow-primary/10 hover:shadow-lg"
                >
                  <ShoppingCart className="h-4.5 w-4.5" /> ADD TO SCENT BASKET
                </button>
              </div>

            </div>
          </div>

          {/* Vimeo Presentation Panel */}
          {perfume.vimeoUrl && (
            <div className="mt-20 border-t border-slate-100 pt-16 max-w-4xl mx-auto text-center">
              <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase font-mono">ATMOSPHERIC FILM</span>
              <h2 className="font-sans text-2xl font-black tracking-tight text-slate-900 mt-2 mb-6 uppercase">
                SCENT MOLECULAR STORY
              </h2>
              <VimeoVideo url={perfume.vimeoUrl} />
            </div>
          )}

        </div>
      </main>

      <footer className="bg-[#FAF8F5] border-t border-[#EAE5DB] py-8 text-center text-xs text-slate-400 font-mono mt-16">
        <p>© 2026 ALWEEN LUXURY SCENTS. ALL RIGHTS RESERVED.</p>
      </footer>

      <CheckoutDrawer />
    </div>
  );
}
