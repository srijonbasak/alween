'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { CheckoutDrawer } from '../../components/CheckoutDrawer';
import { useCart } from '../../context/CartContext';
import { API_URL } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, CheckCircle2, ChevronRight, HelpCircle, PackageOpen, Cpu, Database } from 'lucide-react';

interface Perfume {
  _id: string;
  name: string;
  internalFormulaKey: string;
  description: string;
  imageUrls: string[];
  pricePerMl: number;
  topNotes: string;
  baseNotes: string;
}

interface CustomSlot {
  perfumeId: string;
  name: string;
  selectedSizeMl: number;
  price: number;
  internalFormulaKey: string;
}

export default function ComboBuilderPage() {
  const { addToCart, setIsDrawerOpen } = useCart();
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  
  // Custom slots configs
  const [boxSize, setBoxSize] = useState<number>(3); // default 3 slots Discovery Box
  const [slots, setSlots] = useState<(CustomSlot | null)[]>(new Array(3).fill(null));
  const [activeSlotIdx, setActiveSlotIdx] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<number>(10); // default size selection
  const [loading, setLoading] = useState(true);

  // Fetch list of perfumes
  useEffect(() => {
    // ponytail: cache-first stale-while-revalidate for unstable network
    const cachedData = localStorage.getItem('alween_perfumes_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPerfumes(parsed);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetch(`${API_URL}/api/perfumes`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setPerfumes(data);
          localStorage.setItem('alween_perfumes_cache', JSON.stringify(data));
        }
      })
      .catch(err => {
        console.log('No active perfumes found.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Update box size slots count dynamically without losing existing slot items
  const handleBoxSizeChange = (newSize: number) => {
    if (newSize < 1 || newSize > 12) return;
    setBoxSize(newSize);
    setSlots(prev => {
      const nextSlots = [...prev];
      if (newSize > prev.length) {
        const diff = newSize - prev.length;
        return [...nextSlots, ...new Array(diff).fill(null)];
      } else if (newSize < prev.length) {
        return nextSlots.slice(0, newSize);
      }
      return nextSlots;
    });
    setActiveSlotIdx(prev => prev >= newSize ? newSize - 1 : prev);
  };

  const handleSelectPerfumeForActiveSlot = (perfume: Perfume) => {
    const updated = [...slots];
    updated[activeSlotIdx] = {
      perfumeId: perfume._id,
      name: perfume.name,
      selectedSizeMl: selectedSize,
      price: perfume.pricePerMl * selectedSize,
      internalFormulaKey: perfume.internalFormulaKey
    };
    setSlots(updated);

    // Automatically shift to next unfilled slot if any
    const nextUnfilled = updated.findIndex(slot => slot === null);
    if (nextUnfilled !== -1) {
      setActiveSlotIdx(nextUnfilled);
    }
  };

  const clearSlot = (idx: number) => {
    const updated = [...slots];
    updated[idx] = null;
    setSlots(updated);
    setActiveSlotIdx(idx);
  };

  // Check if all custom slots are filled
  const allSlotsFilled = slots.every(slot => slot !== null);

  // Calculate pricing
  const totalBoxPrice = slots.reduce((sum, slot) => {
    if (!slot) return sum;
    return sum + slot.price;
  }, 0);

  const handleProceedToCheckout = () => {
    if (!allSlotsFilled) return;

    const comboName = `${boxSize}-Bottle Custom Combo Pack`;
    
    addToCart({
      id: `combo-${Date.now()}`,
      perfumeId: 'custom-combo-bundle',
      name: comboName,
      selectedSizeMl: slots.reduce((sum, s) => sum + (s?.selectedSizeMl || 0), 0),
      price: totalBoxPrice,
      internalFormulaKey: 'CUSTOM-COMBO',
      isCustomCombo: true,
      comboItems: slots.map(s => ({
        perfumeId: s!.perfumeId,
        name: s!.name,
        selectedSizeMl: s!.selectedSizeMl,
        internalFormulaKey: s!.internalFormulaKey
      }))
    });

    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Header />

      <main className="flex-1 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Headline */}
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase font-mono">CUSTOM BUNDLING</span>
            <h1 className="font-sans text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mt-2">
              SCENT COMBO BUILDER
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-light tracking-wide max-w-md mx-auto mt-3">
              Choose your favorite perfumes, pick bottle sizes, and compile your own custom scent combo pack.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Box Slots & Builder (Left) */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8">
              
              {/* Select size limits */}
              <div>
                <h3 className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-4">
                  1. CHOOSE BUNDLE SIZE
                </h3>
                <div className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl max-w-sm shadow-sm">
                  <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">BOTTLES IN BUNDLE:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleBoxSizeChange(boxSize - 1)}
                      disabled={boxSize <= 2}
                      className="h-8 w-8 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-black text-slate-900 w-6 text-center">{boxSize}</span>
                    <button
                      type="button"
                      onClick={() => handleBoxSizeChange(boxSize + 1)}
                      disabled={boxSize >= 12}
                      className="h-8 w-8 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Sizing extractions toggle for slots */}
              <div>
                <h3 className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-3">
                  2. SELECT BOTTLE SIZE
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {[6, 10, 15, 30, 50].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded py-2 text-center text-xs font-bold transition ${
                        selectedSize === size
                          ? 'border border-primary text-primary bg-blue-50'
                          : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {size}ml
                    </button>
                  ))}
                </div>
              </div>

              {/* The Active Slots Display */}
              <div>
                <h3 className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-4">
                  3. CHOSEN FRAGRANCES
                </h3>
                
                <div className="space-y-4">
                  {slots.map((slot, idx) => (
                    <motion.div
                      key={idx}
                      onClick={() => setActiveSlotIdx(idx)}
                      className={`relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                        activeSlotIdx === idx
                          ? 'border-primary bg-blue-50/10'
                          : slot
                          ? 'border-slate-200 bg-white'
                          : 'border-dashed border-slate-300 bg-slate-50/30 hover:border-slate-400'
                      }`}
                      whileHover={{ scale: 1.002 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          activeSlotIdx === idx
                            ? 'bg-primary text-white'
                            : slot
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-white border border-slate-200 text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>

                        {slot ? (
                          <div>
                            <div className="font-sans text-sm font-bold text-slate-800">{slot.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {slot.selectedSizeMl}ml decant • Product Code: {slot.internalFormulaKey}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 font-medium">
                            Select a fragrance from the list to populate this slot.
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {slot && (
                          <>
                            <span className="text-xs font-bold text-primary font-mono">{slot.price} BDT</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearSlot(idx);
                              }}
                              className="text-slate-400 hover:text-red-500 rounded p-1 hover:bg-slate-100"
                              title="Clear Slot"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {!slot && activeSlotIdx === idx && (
                          <span className="text-[9px] font-bold text-blue-500 tracking-wider font-mono">ACTIVE SLOT</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>

            {/* Fragrance selector & validation checkout (Right) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Select list */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h3 className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-4">
                  4. OUR COLLECTION
                </h3>
                
                {perfumes.length === 0 ? (
                  <div className="text-slate-400 text-xs py-8 text-center flex flex-col items-center justify-center">
                    <Database className="h-8 w-8 text-slate-300 mb-2" />
                    <span>No perfumes available in the catalog.</span>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    {perfumes.map((perfume) => (
                      <div
                        key={perfume._id}
                        onClick={() => handleSelectPerfumeForActiveSlot(perfume)}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-primary/50 transition cursor-pointer group"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-50 border border-slate-100">
                          <img src={perfume.imageUrls[0]} alt={perfume.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-sans text-xs font-bold text-slate-800 group-hover:text-primary truncate">
                            {perfume.name}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">
                            {perfume.topNotes}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-primary shrink-0">
                          {perfume.pricePerMl} BDT/ml
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkout validation card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-6">
                  <PackageOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-sans text-sm font-bold text-slate-850 uppercase tracking-wide">
                      CUSTOM BUNDLE PACK
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Your custom scent items will be compiled into a single custom bundle package. Fill all slots to proceed.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Filled Slots:</span>
                    <span className="font-bold text-slate-700">
                      {slots.filter(s => s !== null).length} / {boxSize}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Estimated Price:</span>
                    <span className="font-bold text-primary font-mono">{totalBoxPrice} BDT</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  disabled={!allSlotsFilled}
                  className="w-full rounded-xl py-3.5 text-xs font-bold tracking-widest text-white bg-primary hover:bg-blue-700 transition flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:hover:bg-primary disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
                >
                  {allSlotsFilled ? (
                    <>
                      PROCEED TO CHECKOUT <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    `FILL ALL SLOTS (${slots.filter(s => s !== null).length}/${boxSize})`
                  )}
                </button>
              </div>

            </div>

          </div>

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

      {/* Slide-out Checkout Drawer */}
      <CheckoutDrawer />
    </div>
  );
}
