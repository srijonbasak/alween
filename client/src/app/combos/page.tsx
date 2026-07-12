'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/Header';
import { CheckoutDrawer } from '../../components/CheckoutDrawer';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Eye, X, ChevronLeft, ChevronRight, Package, Cpu, ArrowLeft, Database } from 'lucide-react';

interface SinglePerfumeRef {
  _id: string;
  name: string;
  internalFormulaKey: string;
}

interface Combo {
  _id: string;
  name: string;
  internalFormulaKey: string;
  description: string;
  imageUrls: string[];
  pricePerMl: number; // Used as flat price BDT for combos
  type: 'combo';
  comboBottleCount: number;
  comboBottleSizeMl: number;
  comboPerfumes: SinglePerfumeRef[];
  isExcludedFromDiscounts: boolean;
}

export default function CombosPage() {
  const { addToCart, setIsDrawerOpen } = useCart();
  const router = useRouter();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  // Details Modal States
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    // ponytail: cache-first stale-while-revalidate for unstable network
    const cachedData = localStorage.getItem('alween_perfumes_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((item: any) => item.type === 'combo');
          setCombos(filtered);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetch('http://localhost:5000/api/perfumes')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const filtered = data.filter((item: any) => item.type === 'combo');
        setCombos(filtered);
        localStorage.setItem('alween_perfumes_cache', JSON.stringify(data));
      })
      .catch((err) => {
        console.error('Failed to load combos catalog.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddComboToCart = (combo: Combo) => {
    addToCart({
      id: `${combo._id}-combo`,
      perfumeId: combo._id,
      name: combo.name,
      selectedSizeMl: (combo.comboBottleCount || 1) * (combo.comboBottleSizeMl || 10),
      price: combo.pricePerMl,
      internalFormulaKey: combo.internalFormulaKey,
      isExcludedFromDiscounts: combo.isExcludedFromDiscounts
    });
    setIsDrawerOpen(true);
  };

  const handleOpenDetails = (combo: Combo) => {
    router.push(`/combos/${combo.internalFormulaKey}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Header />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase font-mono">PRE-COMPILED BUNDLES</span>
            <h1 className="font-sans text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mt-2">
              EXQUISITE SCENT COMBOS
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-light tracking-wide max-w-lg mx-auto mt-3">
              Explore pre-compiled luxury decant sets designed by our master blenders, curated to express unified fragrance journeys.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : combos.length === 0 ? (
            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <Database className="h-10 w-10 text-slate-350 mb-4" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">No Combos Listed</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mt-2 leading-relaxed">
                Our specialists have not created any pre-made combo packages yet. Please check back later.
              </p>
            </div>
          ) : (
            /* Combo Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {combos.map((combo) => (
                <motion.div
                  key={combo._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-[#EAE5DB] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-4 group-hover:border-primary/20 transition-colors">
                      <img
                        src={combo.imageUrls && combo.imageUrls.length > 0
                          ? combo.imageUrls[0]
                          : 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'}
                        alt={combo.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {combo.isExcludedFromDiscounts && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[7px] font-bold tracking-widest px-2 py-0.5 rounded border border-red-600 font-mono uppercase">
                          Excluded
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[8px] font-bold font-mono tracking-wider px-2 py-1 rounded border border-slate-150 shadow-sm">
                        {combo.comboBottleCount} Bottles × {combo.comboBottleSizeMl}ml
                      </div>

                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetails(combo)}
                          className="bg-white hover:bg-slate-550 text-slate-800 p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                          title="Quick View"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-sans text-lg font-bold text-slate-850 uppercase tracking-wide mb-1 flex items-center justify-between">
                      <span>{combo.name}</span>
                      <span className="text-primary font-mono text-sm">{combo.pricePerMl} BDT</span>
                    </h3>
                    <p className="text-slate-500 text-[11px] font-light leading-relaxed mb-4 line-clamp-2">
                      {combo.description}
                    </p>

                    {/* Included Single Perfumes List */}
                    {combo.comboPerfumes && combo.comboPerfumes.length > 0 && (
                      <div className="mb-6 bg-slate-50 border border-slate-150 p-3 rounded-xl">
                        <span className="block text-[8px] font-mono font-bold tracking-wider text-slate-405 uppercase mb-1.5">
                          PACKAGE DETAILS
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {combo.comboPerfumes.map((perf, i) => (
                            <span
                              key={perf._id || i}
                              className="text-[9px] bg-white border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded"
                            >
                              {perf.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddComboToCart(combo)}
                    className="w-full rounded-lg bg-primary py-3 text-xs font-bold tracking-widest text-slate-900 hover:bg-primary/80 transition-all duration-300 shadow-sm shadow-primary/10 hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" /> ADD COMBO TO BASKET
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Combo Details Modal */}
      <AnimatePresence>
        {selectedCombo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white border border-slate-200 text-slate-900 p-6 sm:p-8 shadow-2xl"
            >
              <button
                onClick={() => setSelectedCombo(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 rounded-full p-1 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                {/* Left side: Images */}
                <div>
                  <div className="relative aspect-square w-full overflow-hidden rounded bg-slate-50 border border-slate-100 shadow-sm">
                    <img
                      src={selectedCombo.imageUrls && selectedCombo.imageUrls.length > 0
                        ? selectedCombo.imageUrls[activeImageIdx]
                        : 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'}
                      alt={selectedCombo.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Thumbnail lists */}
                  {selectedCombo.imageUrls && selectedCombo.imageUrls.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto py-1">
                      {selectedCombo.imageUrls.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIdx(index)}
                          className={`h-11 w-11 rounded overflow-hidden border-2 shrink-0 transition ${
                            activeImageIdx === index ? 'border-primary' : 'border-slate-200'
                          }`}
                        >
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>COMBO SKU CODE</span>
                    <span className="font-bold text-slate-700">{selectedCombo.internalFormulaKey}</span>
                  </div>
                </div>

                {/* Right side: Specifications */}
                <div className="flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[8px] font-extrabold tracking-widest px-2 py-0.5 rounded font-mono uppercase">
                        {selectedCombo.comboBottleCount} Bottle Combo ({selectedCombo.comboBottleSizeMl}ml each)
                      </span>
                    </div>

                    <h3 className="font-sans text-xl font-bold text-slate-900 mb-2 uppercase tracking-wide">
                      {selectedCombo.name}
                    </h3>
                    <p className="text-slate-500 text-xs font-light leading-relaxed mb-6">
                      {selectedCombo.description}
                    </p>

                    <div className="border-t border-slate-100 pt-4 mb-6">
                      <span className="block text-[10px] font-mono font-bold tracking-widest text-primary uppercase mb-3">
                        COMBO PACKAGE ITEMS
                      </span>
                      <div className="space-y-2">
                        {selectedCombo.comboPerfumes && selectedCombo.comboPerfumes.map((perf, i) => (
                          <div key={perf._id || i} className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-medium">
                            <Package className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{perf.name} ({selectedCombo.comboBottleSizeMl}ml Decant)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-baseline mb-4 font-mono">
                      <span className="text-[10px] font-bold tracking-wider text-slate-400">FLAT BUNDLE PRICE</span>
                      <span className="text-primary font-bold text-lg">{selectedCombo.pricePerMl.toFixed(2)} BDT</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        handleAddComboToCart(selectedCombo);
                        setSelectedCombo(null);
                      }}
                      className="w-full rounded bg-primary py-3 text-xs font-bold tracking-widest text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                    >
                      <ShoppingBag className="h-4 w-4" /> ADD COMBO TO BASKET
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CheckoutDrawer />
    </div>
  );
}
