'use client';

import React, { useState, useEffect } from 'react';
import { Button as NeonButton } from '../components/ui/neon-button';
import { Footerdemo } from '../components/ui/footer-section';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { CheckoutDrawer } from '../components/CheckoutDrawer';
import { VimeoVideo } from '../components/VimeoVideo';
import { HeroSection } from '../components/ui/feature-carousel';
import { useCart } from '../context/CartContext';
import { API_URL } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ShoppingCart, Award, Sparkles, ChevronRight, ChevronLeft, X, Heart, Eye, Database, Cpu } from 'lucide-react';

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
  type?: 'single' | 'combo';
  perfumeCategory?: 'inspired' | 'original';
  oilConcentration?: string;
  price6ml?: number;
  price10ml?: number;
  price15ml?: number;
  price30ml?: number;
  price50ml?: number;
  image6ml?: string;
  image10ml?: string;
  image15ml?: string;
  image30ml?: string;
  image50ml?: string;
  originalBottleImage?: string;
  packagingImage?: string;
  isFeatured?: boolean;
}

// Statically hardcoded 14 premium perfumes requested for the hero carousel slider
const STATIC_HERO_PERFUMES: Perfume[] = [
  {
    _id: 'ST-WANTED',
    name: 'THE MOST WANTED',
    internalFormulaKey: 'ST-WANTED',
    description: 'An addictive and fiery fragrance blending warm cardamom, sweet toffee, and rich amberwood.',
    imageUrls: ['https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'],
    vimeoUrl: 'https://vimeo.com/1211733718',
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 85,
    isExcludedFromDiscounts: false,
    topNotes: 'Cardamom, Mandarin, Pink Pepper',
    heartNotes: 'Toffee, Lavender, Sage',
    baseNotes: 'Amberwood, Benzoin, Patchouli'
  },
  {
    _id: 'ST-AVENTUS',
    name: 'CREED AVENTUS',
    internalFormulaKey: 'ST-AVENTUS',
    description: 'The iconic representation of strength and success. Features notes of pineapple, blackcurrant, and dry birch.',
    imageUrls: ['/images/creed_aventus.png'],
    vimeoUrl: 'https://vimeo.com/1211735131',
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 120,
    isExcludedFromDiscounts: false,
    topNotes: 'Pineapple, Bergamot, Blackcurrant',
    heartNotes: 'Birch, Jasmine, Patchouli',
    baseNotes: 'Oakmoss, Ambergris, Vanilla'
  },
  {
    _id: 'ST-ADG-PROF',
    name: 'ACQUA DI GIO PROFUMO',
    internalFormulaKey: 'ST-ADG-PROF',
    description: 'An elegant, deep, and airy fragrance merging marine accords, sweet bergamot, and dark incense.',
    imageUrls: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 75,
    isExcludedFromDiscounts: false,
    topNotes: 'Marine Notes, Bergamot, Grapefruit',
    heartNotes: 'Rosemary, Sage, Geranium',
    baseNotes: 'Incense, Patchouli, Vetiver'
  },
  {
    _id: 'ST-BR540',
    name: 'BACCARAT ROUGE 540',
    internalFormulaKey: 'ST-BR540',
    description: 'A highly sophisticated fragrance laying on the skin like an amber, floral, and woody breeze.',
    imageUrls: ['/images/baccarat_rouge.png'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 150,
    isExcludedFromDiscounts: false,
    topNotes: 'Saffron, Jasmine, Tagetes',
    heartNotes: 'Amberwood, Ambergris, Hedione',
    baseNotes: 'Fir Resin, Cedar, Musk'
  },
  {
    _id: 'ST-WULONG',
    name: 'WULONG CHA',
    internalFormulaKey: 'ST-WULONG',
    description: 'A refreshing citrus tea fragrance carrying notes of oolong tea, Mediterranean fig, and warm musk.',
    imageUrls: ['https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 95,
    isExcludedFromDiscounts: false,
    topNotes: 'Bergamot, Orange, Mandarin',
    heartNotes: 'Oolong Tea, Nutmeg, Jasmine',
    baseNotes: 'Musk, Fig, Amber'
  },
  {
    _id: 'ST-MYSLF',
    name: 'YSL MYSLF',
    internalFormulaKey: 'ST-MYSLF',
    description: 'A modern, clean representation of modern masculinity. Blends fresh orange blossom and rich wood accords.',
    imageUrls: ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 90,
    isExcludedFromDiscounts: false,
    topNotes: 'Calabrian Bergamot, Fresh Accord',
    heartNotes: 'Tunisian Orange Blossom, Absolute',
    baseNotes: 'Ambrofix, Patchouli, Wood'
  },
  {
    _id: 'ST-YSL-Y',
    name: 'YSL Y',
    internalFormulaKey: 'ST-YSL-Y',
    description: 'A deep, fresh, and masculine fragrance with notes of sage, geranium, and sensual wood.',
    imageUrls: ['/images/ysl_y.png'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 80,
    isExcludedFromDiscounts: false,
    topNotes: 'Apple, Ginger, Bergamot',
    heartNotes: 'Sage, Juniper Berries, Geranium',
    baseNotes: 'Amberwood, Tonka Bean, Cedar'
  },
  {
    _id: 'ST-212VIP',
    name: '212 VIP MAN',
    internalFormulaKey: 'ST-212VIP',
    description: 'An explosive party cocktail containing caviar lime, frozen mint, and black pepper.',
    imageUrls: ['https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 70,
    isExcludedFromDiscounts: false,
    topNotes: 'Lime Caviar, Frozen Mint, Black Pepper',
    heartNotes: 'Vodka, Ginger, Apple',
    baseNotes: 'Kingwood, Amber, Leather'
  },
  {
    _id: 'ST-LEMALE-ELIX',
    name: 'LA MALE ELIXIR JEAN PAUL',
    internalFormulaKey: 'ST-LEMALE-ELIX',
    description: 'An intense torso-canister fragrance featuring aromatic lavender, warm benzoin, and sweet honey.',
    imageUrls: ['/images/le_male_elixir.png'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 85,
    isExcludedFromDiscounts: false,
    topNotes: 'Lavender, Mint, Bergamot',
    heartNotes: 'Vanilla, Benzoin, Honey',
    baseNotes: 'Tonka Bean, Tobacco, Sandalwood'
  },
  {
    _id: 'ST-DUNHILL',
    name: 'DUNHIL ICON',
    internalFormulaKey: 'ST-DUNHILL',
    description: 'A refined, classic British signature scent. Merges fresh bergamot, black pepper, and warm vetiver.',
    imageUrls: ['https://images.unsplash.com/photo-1528740561666-bd247e66ad50?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 65,
    isExcludedFromDiscounts: false,
    topNotes: 'Neroli, Bergamot, Black Pepper',
    heartNotes: 'Lavender, Cardamom, Sage',
    baseNotes: 'Vetiver, Leather, Oakmoss'
  },
  {
    _id: 'ST-SWY',
    name: 'STRONGER WITH YOU',
    internalFormulaKey: 'ST-SWY',
    description: 'A warm, magnetic fragrance carrying spicy pepper, chestnut, and vanilla accords.',
    imageUrls: ['https://images.unsplash.com/photo-1563170351-be82bc888bb4?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 75,
    isExcludedFromDiscounts: false,
    topNotes: 'Cardamom, Pink Pepper, Violet Leaf',
    heartNotes: 'Sage, Melon, Pineapple',
    baseNotes: 'Chestnut, Vanilla, Amberwood'
  },
  {
    _id: 'ST-LV-PACIFIC',
    name: 'LV PACIFIC CHILL',
    internalFormulaKey: 'ST-LV-PACIFIC',
    description: 'A vibrant wellness fragrance capturing the energy of the ocean. Blends blackcurrant and carrot seed.',
    imageUrls: ['https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 130,
    isExcludedFromDiscounts: false,
    topNotes: 'Blackcurrant, Orange, Lime',
    heartNotes: 'Coriander, Basil, Carrot Seed',
    baseNotes: 'Dates, Fig, Ambrette'
  },
  {
    _id: 'ST-LV-IMAG',
    name: 'LV IMAGINATION',
    internalFormulaKey: 'ST-LV-IMAG',
    description: 'An exceptional, ultra-premium concentration of amber, tea, and citrus. Sourced with black tea from China.',
    imageUrls: ['https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&q=80&w=600'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 140,
    isExcludedFromDiscounts: false,
    topNotes: 'Citron, Calabrian Bergamot, Sicilian Orange',
    heartNotes: 'Nigerian Ginger, Ceylon Cinnamon, Neroli',
    baseNotes: 'Chinese Black Tea, Ambroxan, Guaiac Wood'
  },
  {
    _id: 'ST-GOODGIRL',
    name: 'GOOD GIRL',
    internalFormulaKey: 'ST-GOODGIRL',
    description: 'A bold, sensual blend of dark and light elements. Features almond, jasmine sambac, and roasted cocoa.',
    imageUrls: ['/images/good_girl.png'],
    current_volume_ml: 10000,
    reorder_threshold_ml: 1000,
    loss_margin_factor: 0.03,
    pricePerMl: 85,
    isExcludedFromDiscounts: false,
    topNotes: 'Almond, Coffee, Bergamot',
    heartNotes: 'Jasmine Sambac, Tuberose, Orris',
    baseNotes: 'Tonka Bean, Cocoa, Sandalwood'
  }
];

export default function LandingPage() {
  const { addToCart, setIsDrawerOpen } = useCart();
  const router = useRouter();
  
  // Default values initialized statically to prevent server delays
  const [carouselItems, setCarouselItems] = useState<Perfume[]>(STATIC_HERO_PERFUMES);
  const [gridItems, setGridItems] = useState<Perfume[]>([]);
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [selectedSize, setSelectedSize] = useState<number>(10);
  const [activeDetailImageIdx, setActiveDetailImageIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [heroVimeoUrls, setHeroVimeoUrls] = useState<string[]>(['https://vimeo.com/1211733718', 'https://vimeo.com/1211735131', 'https://vimeo.com/1211748766']);

  const getDisplayPrice = (perfume: Perfume): string => {
    if (perfume.type === 'combo') {
      return `${perfume.pricePerMl} BDT`;
    }
    if (perfume.perfumeCategory === 'original') {
      return `${perfume.pricePerMl} BDT/ml`;
    }
    const prices = [perfume.price6ml, perfume.price10ml, perfume.price15ml, perfume.price30ml, perfume.price50ml].filter((p): p is number => !!p && p > 0);
    if (prices.length > 0) {
      return `${Math.min(...prices)} BDT`;
    }
    return `${perfume.pricePerMl * 10} BDT`;
  };

  const getPriceLabel = (perfume: Perfume): string => {
    if (perfume.type === 'combo') {
      return 'PACKAGE PRICE';
    }
    if (perfume.perfumeCategory === 'original') {
      return 'PRICE PER ML';
    }
    return 'STARTING PRICE';
  };

  const renderPerfumeCard = (perfume: Perfume) => {
    const isCombo = perfume.type === 'combo';
    return (
      <motion.div
        key={perfume._id}
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.015 }}
        transition={{ type: "spring", stiffness: 350, damping: 24 }}
        viewport={{ once: true }}
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-stone-200/80 p-6 shadow-md hover:shadow-2xl hover:border-amber-300/60 transition-all duration-300"
      >
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 mb-6">
            <img
              src={perfume.imageUrls && perfume.imageUrls.length > 0 ? perfume.imageUrls[0] : 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'}
              alt={perfume.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
            
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span className={`text-[8px] font-extrabold tracking-widest px-2 py-0.5 rounded shadow-sm uppercase font-sans ${
                isCombo
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-850 text-white'
              }`}>
                {isCombo ? 'COMBO SCENT PACK' : (perfume.perfumeCategory === 'original' ? 'ORIGINAL' : 'INSPIRED')}
              </span>
              {perfume.isExcludedFromDiscounts && (
                <span className="bg-red-500 text-white text-[8px] font-bold tracking-widest px-2 py-0.5 rounded shadow-sm font-sans">
                  NO DISCOUNTS
                </span>
              )}
            </div>

            <span className="absolute bottom-3 left-3 bg-slate-900/95 text-white text-[9px] font-sans tracking-widest px-2 py-0.5 rounded">
              {perfume.internalFormulaKey}
            </span>
          </div>

          <h3 className="font-sans text-base font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors uppercase">
            {perfume.name}
          </h3>
          
          <p className="text-slate-500 text-xs font-light line-clamp-3 leading-relaxed mb-6">
            {perfume.description}
          </p>

          {!isCombo ? (
            <div className="border-t border-slate-100 pt-4 mb-6 space-y-2">
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold tracking-widest font-sans">
                <span>TOP NOTES:</span>
                <span className="text-stone-600 font-normal truncate max-w-[180px]">{perfume.topNotes}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold tracking-widest font-sans">
                <span>BASE:</span>
                <span className="text-stone-600 font-normal truncate max-w-[180px]">{perfume.baseNotes}</span>
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-4 mb-6 flex items-center justify-between text-[11px] text-slate-400 font-semibold tracking-widest font-sans">
              <span>PRODUCT TYPE:</span>
              <span className="text-primary font-bold">COMBO BUNDLE</span>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 font-sans">
              {getPriceLabel(perfume)}
            </span>
            <span className="text-primary font-bold text-base">
              {getDisplayPrice(perfume)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openDetails(perfume)}
              className="rounded-lg border border-stone-200 bg-slate-50 py-2.5 text-[10px] font-bold tracking-widest text-stone-600 hover:bg-slate-100 hover:text-stone-900 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" /> DETAILS
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleQuickBuy(perfume)}
              className="rounded-lg bg-stone-900 py-2.5 text-[10px] font-bold tracking-widest text-white hover:bg-stone-800 transition flex items-center justify-center gap-1.5 shadow-md shadow-stone-900/10 cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" /> QUICK BUY
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };



  // Fetch independent hero videos from configuration on mount
  useEffect(() => {
    fetch(`${API_URL}/api/config`)
      .then(res => res.json())
      .then(config => {
        if (config && Array.isArray(config.heroVimeoUrls) && config.heroVimeoUrls.length > 0) {
          setHeroVimeoUrls(config.heroVimeoUrls);
        }
      })
      .catch(err => console.error('Failed fetching config:', err));
  }, []);

  // Fetch perfumes from server and map to respective UI slots
  useEffect(() => {
    // ponytail: load cached perfumes for offline/unstable internet compatibility
    const cachedData = localStorage.getItem('alween_perfumes_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customDBItems = parsed.filter(p => !p.internalFormulaKey.startsWith('ST-'));
          setGridItems(customDBItems);
          
          // Also set carousel items from offline cache if featured items exist
          const featuredDBItems = parsed.filter(p => p.isFeatured === true);
          if (featuredDBItems.length > 0) {
            let items = featuredDBItems;
            if (items.length < 8) {
              const staticPool = STATIC_HERO_PERFUMES.filter(
                sp => !items.some(item => item.internalFormulaKey === sp.internalFormulaKey)
              );
              items = [...items, ...staticPool].slice(0, 10);
            }
            setCarouselItems(items);
          }

          setIsLoading(false);
        }
      } catch (e) {
        console.error('Error parsing perfumes cache:', e);
      }
    }

    fetch(`${API_URL}/api/perfumes`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: Perfume[]) => {
        // Update list and cache even if database has 0 items
        const customDBItems = data.filter(p => !p.internalFormulaKey.startsWith('ST-'));
        setGridItems(customDBItems);

        // Update hero carousel if any database perfumes are explicitly flagged as featured
        const featuredDBItems = data.filter(p => p.isFeatured === true);
        if (featuredDBItems.length > 0) {
          let items = featuredDBItems;
          if (items.length < 8) {
            const staticPool = STATIC_HERO_PERFUMES.filter(
              sp => !items.some(item => item.internalFormulaKey === sp.internalFormulaKey)
            );
            items = [...items, ...staticPool].slice(0, 10);
          }
          setCarouselItems(items);
        } else {
          setCarouselItems(STATIC_HERO_PERFUMES); // fallback
        }

        localStorage.setItem('alween_perfumes_cache', JSON.stringify(data));
      })
      .catch(err => {
        console.log('Using local fallback static carousel. Database connection starting.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleQuickBuy = (perfume: Perfume) => {
    const isCombo = (perfume as any).type === 'combo';
    addToCart({
      id: isCombo ? `${perfume._id}-combo` : `${perfume._id}-10`,
      perfumeId: perfume._id,
      name: perfume.name,
      selectedSizeMl: isCombo ? 50 : 10,
      price: isCombo ? perfume.pricePerMl : perfume.pricePerMl * 10,
      internalFormulaKey: perfume.internalFormulaKey,
      isExcludedFromDiscounts: perfume.isExcludedFromDiscounts
    });
    setIsDrawerOpen(true);
  };

  const openDetails = (perfume: Perfume) => {
    const isCombo = (perfume as any).type === 'combo';
    if (isCombo) {
      router.push(`/combos/${perfume.internalFormulaKey}`);
    } else {
      router.push(`/perfumes/${perfume.internalFormulaKey}`);
    }
  };

  const handleAddToBasketFromDetails = () => {
    if (!selectedPerfume) return;
    const isCombo = (selectedPerfume as any).type === 'combo';
    addToCart({
      id: isCombo ? `${selectedPerfume._id}-combo` : `${selectedPerfume._id}-${selectedSize}`,
      perfumeId: selectedPerfume._id,
      name: selectedPerfume.name,
      selectedSizeMl: isCombo ? 50 : selectedSize,
      price: isCombo ? selectedPerfume.pricePerMl : selectedPerfume.pricePerMl * selectedSize,
      internalFormulaKey: selectedPerfume.internalFormulaKey,
      isExcludedFromDiscounts: selectedPerfume.isExcludedFromDiscounts
    });
    setSelectedPerfume(null);
    setActiveDetailImageIdx(0);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Header />

      <main className="flex-1 bg-white text-slate-900">
        {/* 3D Vimeo Feature Carousel Hero Banner */}
        <HeroSection
          title={
            <div className="flex flex-col items-center">
              <img src="/logo_top.png" alt="Alween" className="h-10 sm:h-12 mb-3 sm:mb-4 object-contain" />
              <span className="whitespace-nowrap tracking-tight font-black uppercase text-[4.2vw] sm:text-4xl md:text-5xl lg:text-6xl block mt-2">
                Discover Luxury Fragrances
              </span>
            </div>
          }
          subtitle="Curated premium perfumes for discerning tastes"
          images={heroVimeoUrls.map((url, idx) => ({
            src: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600',
            alt: `Video ${idx + 1}`,
            vimeoUrl: url,
            title: `Atmosphere ${idx + 1}`,
            description: 'Vimeo Video Walkthrough',
            id: `video-${idx}`
          }))}
          onItemClick={() => {}}
        >
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto mt-6 w-full">
            <NeonButton
              variant="solid"
              size="lg"
              className="w-full sm:w-auto text-[10px] tracking-widest font-bold font-sans flex items-center justify-center gap-1.5 shadow-md shadow-stone-900/10 animate-pulse-subtle"
              onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
            >
              EXPLORE OUR COLLECTION <ChevronRight className="h-4 w-4" />
            </NeonButton>
            <NeonButton
              variant="default"
              size="lg"
              className="w-full sm:w-auto text-[10px] tracking-widest font-bold font-sans text-stone-600 hover:text-stone-900 border border-slate-200 bg-white"
              onClick={() => router.push('/combo-builder')}
            >
              COMBO BUILDER
            </NeonButton>
          </div>
        </HeroSection>

        {/* Collection Section split into Inspired and Original */}
        <section id="collection" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Inspired Creations */}
          <div>
            <div className="text-center mb-12">
              <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase font-sans">OUR INSPIRED SCENTS</span>
              <h2 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-2">
                INSPIRED CREATIONS
              </h2>
              <div className="mx-auto h-0.5 w-16 bg-primary/30 mt-4" />
            </div>

            {gridItems.filter(p => p.perfumeCategory !== 'original').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {gridItems.filter(p => p.perfumeCategory !== 'original').map((perfume) => renderPerfumeCard(perfume))}
              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8 font-mono">No inspired fragrances available right now.</div>
            )}
          </div>

          {/* Original Masterpieces */}
          <div>
            <div className="text-center mb-12">
              <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase font-sans">PREMIUM ORIGINAL RANGE</span>
              <h2 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-2">
                ORIGINAL MASTERPIECES
              </h2>
              <div className="mx-auto h-0.5 w-16 bg-primary/30 mt-4" />
            </div>

            {gridItems.filter(p => p.perfumeCategory === 'original').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {gridItems.filter(p => p.perfumeCategory === 'original').map((perfume) => renderPerfumeCard(perfume))}
              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8 font-sans tracking-widest">No designer fragrances available right now.</div>
            )}
          </div>

          {gridItems.length === 0 && (
            /* Empty state */
            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <Database className="h-10 w-10 text-slate-300 mb-4 animate-bounce" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-sans">Collection Empty</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mt-2 leading-relaxed">
                Our custom decant collections are currently being updated. Please check back shortly.
              </p>
            </div>
          )}
        </section>


        {/* Perfume Details Modal Panel */}
        <AnimatePresence>
          {selectedPerfume && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 text-slate-900 p-6 sm:p-8 shadow-2xl"
              >
                <button
                  onClick={() => setSelectedPerfume(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 rounded-full p-1 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  {/* Left Column */}
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden rounded bg-slate-50 border border-slate-100 shadow-sm">
                      <img
                        loading="lazy"
                        src={selectedPerfume.imageUrls && selectedPerfume.imageUrls.length > 0
                          ? (selectedPerfume.imageUrls[activeDetailImageIdx] || selectedPerfume.imageUrls[0])
                          : 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'}
                        alt={selectedPerfume.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    {/* Thumbnail gallery */}
                    {selectedPerfume.imageUrls && selectedPerfume.imageUrls.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto py-1">
                        {selectedPerfume.imageUrls.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveDetailImageIdx(index)}
                            className={`h-11 w-11 rounded overflow-hidden border-2 shrink-0 transition ${
                              activeDetailImageIdx === index ? 'border-primary' : 'border-slate-200'
                            }`}
                          >
                            <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex justify-between text-xs text-slate-400 font-sans tracking-widest">
                      <span>PRODUCT SKU</span>
                      <span className="font-bold text-slate-700">{selectedPerfume.internalFormulaKey}</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col justify-between text-left">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[7px] font-extrabold tracking-widest px-2 py-0.5 rounded border uppercase ${
                          (selectedPerfume as any).type === 'combo'
                            ? 'bg-stone-900 border-stone-800 text-white'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}>
                          {(selectedPerfume as any).type === 'combo' ? 'Combo Box' : 'Single Fragrance'}
                        </span>
                      </div>
                      <h3 className="font-sans text-xl font-bold text-slate-900 mb-2 uppercase tracking-wide">
                        {selectedPerfume.name}
                      </h3>

                      {/* --- 1. PRICE, SIZE SELECTOR & CTA BUTTON ABOVE DESCRIPTION --- */}
                      <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-xl mb-5 space-y-4">
                        <div className="flex justify-between items-baseline font-mono">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            {(selectedPerfume as any).type === 'combo' ? 'PACKAGE PRICE' : 'PRICE'}
                          </span>
                          <span className="text-primary font-black text-xl">
                            {((selectedPerfume as any).type === 'combo'
                              ? selectedPerfume.pricePerMl
                              : selectedPerfume.pricePerMl * selectedSize
                            ).toFixed(2)} BDT
                          </span>
                        </div>

                        {/* SIZE SELECTION MATRIX (Only for single perfumes) */}
                        {(selectedPerfume as any).type !== 'combo' ? (
                          <div>
                            <label className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase font-sans mb-2">
                              SELECT BOTTLE SIZE
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                              {[6, 10, 15, 30, 50].map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => setSelectedSize(size)}
                                  className={`rounded-lg py-2 text-center text-xs font-bold transition focus:outline-none cursor-pointer ${
                                    selectedSize === size
                                      ? 'bg-stone-900 text-white shadow-md'
                                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {size}ml
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <button
                          onClick={handleAddToBasketFromDetails}
                          className="w-full rounded-xl bg-stone-900 py-3 text-xs font-bold tracking-widest text-white hover:bg-stone-800 transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <ShoppingCart className="h-4 w-4" /> ADD TO CART
                        </button>
                      </div>

                      {/* --- 2. DESCRIPTION & OLFACTORY NOTES (PLACED AFTER PRICE & CTAs) --- */}
                      <p className="text-slate-600 text-xs font-light leading-relaxed mb-5">
                        {selectedPerfume.description}
                      </p>

                      {/* MICRO-COPY OLFACTORY FIELDS (Only for single perfumes) */}
                      {(selectedPerfume as any).type !== 'combo' ? (
                        <div className="space-y-3.5 border-t border-slate-100 pt-4 mb-6">
                          <div>
                            <span className="block text-[9px] font-bold tracking-widest text-primary uppercase font-sans">
                              Top Notes
                            </span>
                            <span className="text-stone-600 text-xs font-light">{selectedPerfume.topNotes}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold tracking-widest text-primary uppercase font-sans">
                              Heart Notes
                            </span>
                            <span className="text-stone-600 text-xs font-light">{selectedPerfume.heartNotes}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold tracking-widest text-primary uppercase font-sans">
                              Base Notes
                            </span>
                            <span className="text-stone-600 text-xs font-light">{selectedPerfume.baseNotes}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="border-t border-slate-100 pt-4 mb-6">
                          <span className="block text-[9px] font-bold tracking-widest text-primary uppercase font-mono mb-2">
                            Combo Contents
                          </span>
                          <p className="text-slate-500 text-xs font-light leading-relaxed">
                            This combo features a collection of decants carefully selected for you.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footerdemo />

      {/* Slide-out Checkout Drawer */}
      <CheckoutDrawer />
    </div>
  );
}
