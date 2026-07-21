'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ShoppingCart, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { API_URL } from '../lib/api';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, addToCart, setIsDrawerOpen } = useCart();
  const [query, setQuery] = useState('');
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch perfumes or read from localStorage cache on mount/open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);

      const cachedData = localStorage.getItem('alween_perfumes_cache');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPerfumes(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }

      setLoading(true);
      fetch(`${API_URL}/api/perfumes`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPerfumes(data);
            localStorage.setItem('alween_perfumes_cache', JSON.stringify(data));
          }
        })
        .catch(err => console.error('Failed to load perfumes for search:', err))
        .finally(() => setLoading(false));
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Filter perfumes based on query
  const filteredPerfumes = perfumes.filter(p => {
    if (!query.trim()) return false;
    const q = query.toLowerCase().trim();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.internalFormulaKey?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.topNotes?.toLowerCase().includes(q) ||
      p.heartNotes?.toLowerCase().includes(q) ||
      p.baseNotes?.toLowerCase().includes(q) ||
      p.perfumeCategory?.toLowerCase().includes(q)
    );
  });

  const handleQuickAdd = (perfume: any) => {
    const size = 10;
    const price = perfume.price10ml || (perfume.pricePerMl ? perfume.pricePerMl * 10 : 850);
    addToCart({
      id: `${perfume._id}-${size}`,
      perfumeId: perfume._id,
      name: perfume.name,
      selectedSizeMl: size,
      price,
      internalFormulaKey: perfume.internalFormulaKey,
      isExcludedFromDiscounts: perfume.isExcludedFromDiscounts
    });
    setIsSearchOpen(false);
    setIsDrawerOpen(true);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-md"
            onClick={() => setIsSearchOpen(false)}
          />

          {/* Search Box Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-stone-100 bg-white">
              <Search className="h-5 w-5 text-stone-400 shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search luxury perfumes, notes (citrus, oud), inspired scents..."
                className="w-full text-sm sm:text-base font-sans text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
              />
              {query ? (
                <button 
                  onClick={() => setQuery('')}
                  className="p-1 text-stone-400 hover:text-stone-900 transition mr-1"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-xs font-bold text-stone-400 hover:text-stone-900 px-2 py-1 rounded bg-stone-100"
              >
                ESC
              </button>
            </div>

            {/* Results Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {!query.trim() ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  <Sparkles className="h-6 w-6 mx-auto mb-2 text-amber-500 opacity-60" />
                  Type perfume name, brand inspiration, or fragrance notes to search.
                </div>
              ) : filteredPerfumes.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs font-medium">
                  {loading ? (
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> Searching...
                    </div>
                  ) : (
                    `No perfumes found matching "${query}"`
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">
                    Found {filteredPerfumes.length} matching fragrance{filteredPerfumes.length > 1 ? 's' : ''}
                  </div>
                  {filteredPerfumes.map((perfume, idx) => {
                    const mainImage = perfume.imageUrls && perfume.imageUrls.length > 0
                      ? perfume.imageUrls[0]
                      : 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=300';
                    const displayPrice = perfume.price10ml || (perfume.pricePerMl ? perfume.pricePerMl * 10 : 850);

                    return (
                      <motion.div
                        key={perfume._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.2 }}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between gap-4 p-3 bg-stone-50/70 hover:bg-stone-100/90 rounded-xl border border-stone-200/80 transition shadow-sm hover:shadow-md group cursor-pointer"
                      >
                        <Link
                          href={`/perfumes/${perfume._id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3.5 flex-1 min-w-0"
                        >
                          <div className="h-14 w-14 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-white">
                            <img src={mainImage} alt={perfume.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate font-sans uppercase group-hover:text-amber-600 transition-colors">
                              {perfume.name}
                            </h4>
                            <div className="text-[10px] text-stone-500 flex items-center gap-2 mt-0.5">
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                                {perfume.perfumeCategory === 'original' ? 'Original Bottle' : 'Inspired Scent'}
                              </span>
                              <span>{displayPrice.toFixed(2)} BDT (10ml)</span>
                            </div>
                          </div>
                        </Link>

                        <div className="flex items-center gap-2 shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleQuickAdd(perfume)}
                            className="bg-stone-900 text-white p-2 rounded-lg hover:bg-stone-800 transition cursor-pointer shadow-sm"
                            title="Add 10ml to Cart"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </motion.button>
                          <Link
                            href={`/perfumes/${perfume._id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="text-stone-400 hover:text-stone-900 p-2 transition cursor-pointer"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
