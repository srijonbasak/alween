'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../components/Header';
import { CheckoutDrawer } from '../../../components/CheckoutDrawer';
import { useCart } from '../../../context/CartContext';
import { API_URL } from '../../../lib/api';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, X, ChevronLeft, ChevronRight, Package, Cpu, ArrowLeft, Loader2 } from 'lucide-react';

interface SinglePerfumeRef {
  _id: string;
  name: string;
  internalFormulaKey: string;
  imageUrls?: string[];
  image6ml?: string;
  image10ml?: string;
  image15ml?: string;
  image30ml?: string;
  image50ml?: string;
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

export default function ComboProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { addToCart, setIsDrawerOpen } = useCart();
  const [combo, setCombo] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);
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
            setCombo(found);
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
        setCombo(data);
      })
      .catch(err => {
        console.error('Failed to load combo details:', err);
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

  if (!combo || combo.type !== 'combo') {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white text-center p-4">
        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest font-mono">Combo Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The selected combo product page could not be located in our catalog.</p>
        <Link href="/combos" className="mt-6 text-xs text-primary font-bold hover:underline flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> RETURN TO COMBOS
        </Link>
      </div>
    );
  }

  const getComboImages = (): string[] => {
    if (!combo) return [];
    const images = [...(combo.imageUrls || [])];
    
    if (combo.comboPerfumes) {
      combo.comboPerfumes.forEach((perf: any) => {
        const sizeKey = `image${combo.comboBottleSizeMl}ml` as keyof typeof perf;
        const sizeImage = perf[sizeKey] as string | undefined;
        if (sizeImage && sizeImage.trim() !== '') {
          images.push(sizeImage);
        } else if (perf.imageUrls && perf.imageUrls.length > 0) {
          images.push(perf.imageUrls[0]);
        }
      });
    }
    
    return images.length > 0 ? images : ['https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'];
  };

  const activeImages = getComboImages();
  const mainImage = activeImages[activeImageIdx] || activeImages[0];

  const handleAddComboToCart = () => {
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

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Header />

      <main className="flex-1 py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Back Navigation Link */}
          <div className="mb-8">
            <Link href="/combos" className="text-[10px] font-bold tracking-widest text-slate-400 hover:text-slate-900 transition flex items-center gap-1.5 uppercase font-mono">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Combos List
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Image Gallery Viewer */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <img
                  src={mainImage}
                  alt={combo.name}
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
                  <span className="bg-blue-50 border border-blue-200 text-blue-750 text-[8px] font-extrabold tracking-widest px-2 py-0.5 rounded font-mono uppercase">
                    {combo.comboBottleCount} Bottle Combo Box
                  </span>
                  {combo.isExcludedFromDiscounts && (
                    <span className="bg-red-50 border border-red-150 text-red-650 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded font-mono uppercase">
                      Excluded
                    </span>
                  )}
                </div>

                <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
                  {combo.name}
                </h1>
                
                <div className="text-[10px] text-slate-400 font-mono tracking-widest mt-1.5 mb-6 uppercase flex justify-between max-w-[200px]">
                  <span>Combo SKU:</span>
                  <span className="font-bold text-slate-800">{combo.internalFormulaKey}</span>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-2">
                      Combo Narrative
                    </h3>
                    <p className="text-slate-650 text-xs sm:text-sm font-light leading-relaxed">
                      {combo.description}
                    </p>
                  </div>

                  {/* Combo specs */}
                  <div className="bg-[#FAF8F5] border border-[#EAE5DB] p-4 rounded-xl space-y-2">
                    <span className="block text-[8px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                      Specifications
                    </span>
                    <div className="text-xs text-slate-700 font-medium">
                      Total Volume: {combo.comboBottleCount * combo.comboBottleSizeMl}ml
                    </div>
                    <div className="text-xs text-slate-500 font-light">
                      Includes {combo.comboBottleCount} decant bottles, each containing {combo.comboBottleSizeMl}ml of extract fluid.
                    </div>
                  </div>

                  {/* Included Single Perfumes List */}
                  {combo.comboPerfumes && combo.comboPerfumes.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-3">
                        Included Scent Items
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {combo.comboPerfumes.map((perf, i) => (
                          <div
                            key={perf._id || i}
                            className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium hover:border-primary/20 transition-colors"
                          >
                            <Package className="h-4 w-4 text-primary shrink-0" />
                            <span>{perf.name} ({combo.comboBottleSizeMl}ml Decant)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Shopping checkout interface */}
              <div className="pt-6 border-t border-slate-100 max-w-md">
                <div className="flex justify-between items-baseline mb-4 font-mono">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    PACKAGE PRICE
                  </span>
                  <span className="text-primary font-bold text-2xl">
                    {combo.pricePerMl.toFixed(2)} BDT
                  </span>
                </div>
                
                <button
                  onClick={handleAddComboToCart}
                  className="w-full rounded-lg bg-primary py-3.5 text-xs font-bold tracking-widest text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-2 shadow-md shadow-primary/10 hover:shadow-lg"
                >
                  <ShoppingBag className="h-4.5 w-4.5" /> ADD COMBO TO CART
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      <footer className="bg-[#FAF8F5] border-t border-[#EAE5DB] py-8 text-center text-xs text-slate-400 font-mono mt-16">
        <p>© 2026 ALWEEN LUXURY SCENTS. ALL RIGHTS RESERVED.</p>
      </footer>

      <CheckoutDrawer />
    </div>
  );
}
