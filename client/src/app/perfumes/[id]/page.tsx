'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../components/Header';
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
                    {perfume.perfumeCategory === 'original' ? 'Original Bottle' : 'Inspired Scent'}
                  </span>
                  {perfume.perfumeCategory !== 'original' && perfume.oilConcentration && (
                    <span className="bg-[#FAF8F5] border border-[#EAE5DB] text-slate-700 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded font-mono uppercase">
                      Concentration: {perfume.oilConcentration}
                    </span>
                  )}
                  {perfume.isExcludedFromDiscounts && (
                    <span className="bg-red-50 border border-red-150 text-red-650 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded font-mono uppercase">
                      No Discounts
                    </span>
                  )}
                </div>

                <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
                  {perfume.name}
                </h1>
                
                <div className="text-[10px] text-slate-400 font-mono tracking-widest mt-1.5 mb-6 uppercase flex justify-between max-w-[200px]">
                  <span>Product SKU:</span>
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
                      SELECT BOTTLE SIZE
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
                    {perfume.perfumeCategory === 'original' ? 'PRICE PER ML' : 'PRICE'}
                  </span>
                  <span className="text-primary font-bold text-2xl">
                    {currentPrice.toFixed(2)} BDT
                  </span>
                </div>
                <button
                  onClick={handleAddToBasket}
                  className="w-full rounded-lg bg-primary py-3.5 text-xs font-bold tracking-widest text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-2 shadow-md shadow-primary/10 hover:shadow-lg"
                >
                  <ShoppingCart className="h-4.5 w-4.5" /> ADD TO CART
                </button>
              </div>

            </div>
          </div>

          {/* Vimeo Presentation Panel */}
          {perfume.vimeoUrl && (
            <div className="mt-20 border-t border-slate-100 pt-16 max-w-4xl mx-auto text-center">
              <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase font-mono">BRAND VIDEO</span>
              <h2 className="font-sans text-2xl font-black tracking-tight text-slate-900 mt-2 mb-6 uppercase">
                SCENT INSPIRATION STORY
              </h2>
              <VimeoVideo url={perfume.vimeoUrl} />
            </div>
          )}

        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 font-sans mt-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-xs">
          {/* Brand column */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider text-sm">ALWEEN LUXURY</h4>
            <p className="text-slate-500 font-light leading-relaxed">
              Premium designer perfume decants in Bangladesh. Experience authentic high-end fragrances in affordable bottle sizes.
            </p>
          </div>
          {/* Support column */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider text-sm">CUSTOMER SUPPORT</h4>
            <p className="text-slate-500 font-light">Email: support@alween.com</p>
            <p className="text-slate-500 font-light">Helpline: +880 1322-309746</p>
            <p className="text-slate-500 font-light">Dhaka, Bangladesh</p>
          </div>
          {/* Policies column */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider text-sm">LEGAL & POLICIES</h4>
            <div className="flex flex-col gap-1.5 text-slate-500">
              <button type="button" onClick={() => alert('PRIVACY POLICY\n\nYour privacy is important to us. We secure your personal credentials and order history. We do not sell or lease customer information to third parties.')} className="text-left hover:text-white transition">Privacy Policy</button>
              <button type="button" onClick={() => alert('RETURN & REFUND POLICY\n\nDue to the hygiene nature of decanted fragrances, we do not accept returns. However, if your order arrives damaged, leaking, or incorrect, please email support@alween.com with photos within 24 hours of delivery for a replacement.')} className="text-left hover:text-white transition">Return & Refund Policy</button>
              <button type="button" onClick={() => alert('SHIPPING & DELIVERY POLICY\n\nWe ship nationwide across Bangladesh. Delivery inside Dhaka takes 2-3 business days (60 BDT). Delivery outside Dhaka takes 3-5 business days (120 BDT). Free shipping applies on orders above 3000 BDT.')} className="text-left hover:text-white transition">Shipping Policy</button>
              <button type="button" onClick={() => alert('TERMS OF SERVICE\n\nBy placing an order, you agree to our terms. Scent decants are hand-poured from original authentic bottles into sterile glass vials. We are an independent decanter and not affiliated with the brand owners.')} className="text-left hover:text-white transition">Terms of Service</button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 border-t border-slate-800 mt-8 pt-6 text-center text-[10px] text-slate-600 font-mono flex flex-col sm:flex-row justify-between gap-4">
          <p>© 2026 ALWEEN LUXURY SCENTS. ALL RIGHTS RESERVED.</p>
          <p>DECLARATION: Independent decanter, not affiliated with perfume design houses.</p>
        </div>
      </footer>

      <CheckoutDrawer />
    </div>
  );
}
