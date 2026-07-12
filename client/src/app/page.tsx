'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { CheckoutDrawer } from '../components/CheckoutDrawer';
import { VimeoVideo } from '../components/VimeoVideo';
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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-250 p-6 glass-hover"
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
              <span className={`text-[8px] font-extrabold tracking-widest px-2 py-0.5 rounded shadow-sm uppercase font-mono ${
                isCombo
                  ? 'bg-blue-500 text-white'
                  : 'bg-stone-850 text-white'
              }`}>
                {isCombo ? 'COMBO SCENT PACK' : (perfume.perfumeCategory === 'original' ? 'ORIGINAL' : 'INSPIRED')}
              </span>
              {perfume.isExcludedFromDiscounts && (
                <span className="bg-red-500 text-white text-[8px] font-bold tracking-widest px-2 py-0.5 rounded shadow-sm font-mono">
                  NO DISCOUNTS
                </span>
              )}
            </div>

            <span className="absolute bottom-3 left-3 bg-slate-900/95 text-white text-[9px] font-mono tracking-wider px-2 py-0.5 rounded">
              {perfume.internalFormulaKey}
            </span>
          </div>

          <h3 className="font-sans text-base font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors uppercase">
            {perfume.name}
          </h3>
          
          <p className="text-slate-500 text-xs font-light line-clamp-3 leading-relaxed mb-6">
            {perfume.description}
          </p>

          {!isCombo ? (
            <div className="border-t border-slate-100 pt-4 mb-6 space-y-2">
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold tracking-wider font-mono">
                <span>TOP NOTES:</span>
                <span className="text-slate-650 font-normal truncate max-w-[180px]">{perfume.topNotes}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold tracking-wider font-mono">
                <span>BASE:</span>
                <span className="text-slate-650 font-normal truncate max-w-[180px]">{perfume.baseNotes}</span>
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-4 mb-6 flex items-center justify-between text-[11px] text-slate-400 font-semibold tracking-wider font-mono">
              <span>PRODUCT TYPE:</span>
              <span className="text-primary font-bold">COMBO BUNDLE</span>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 font-mono">
              {getPriceLabel(perfume)}
            </span>
            <span className="text-primary font-bold text-base">
              {getDisplayPrice(perfume)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openDetails(perfume)}
              className="rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-[10px] font-bold tracking-widest text-slate-650 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" /> DETAILS
            </button>
            <button
              onClick={() => handleQuickBuy(perfume)}
              className="rounded-lg bg-primary py-2.5 text-[10px] font-bold tracking-widest text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
            >
              <ShoppingCart className="h-3.5 w-3.5" /> QUICK BUY
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Screen layout detection for responsive carousel slider coordinates
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carousel slide pointer
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  // Auto-slide effect
  useEffect(() => {
    // ponytail: auto-slide carousel every 5 seconds, resets on manual interaction (activeSlide changes)
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeSlide, carouselItems.length]);

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
            setCarouselItems(featuredDBItems);
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
          setCarouselItems(featuredDBItems);
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
        {/* AI Hero Banner */}
        <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-16 border-b border-slate-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(197,168,128,0.06),rgba(255,255,255,0))]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <img src="/logo_top.png" alt="Alween" className="h-10 sm:h-12 mb-3 sm:mb-4 object-contain" />
              
              <h1 className="font-sans text-3xl sm:text-5xl font-black tracking-tight text-slate-900 max-w-4xl leading-[1.1] mb-4">
                Discover Luxury Fragrances
              </h1>
              
              {/* 3D Coverflow Carousel (White & Gold Slider displaying the 14 premium items statically) */}
              <div className="relative flex w-full items-center justify-center py-4 px-4 max-w-4xl mx-auto h-[330px] sm:h-[400px]">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-10 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 hover:text-primary hover:border-primary shadow-sm transition focus:outline-none"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
                  {carouselItems.map((perfume, idx) => {
                    const len = carouselItems.length;
                    const diff = (idx - activeSlide + len) % len;

                    let isCenter = diff === 0;
                    let isLeft = diff === len - 1;
                    let isRight = diff === 1;

                    // Compute 3D translation positions
                    let scale = 0.75;
                    let rotateY = 0;
                    let zIndex = 10;
                    let x = 0;
                    let opacity = 0;
                    let filter = 'blur(4px)';

                    if (isCenter) {
                      scale = 1.0;
                      rotateY = 0;
                      zIndex = 30;
                      x = 0;
                      opacity = 1.0;
                      filter = 'blur(0px)';
                    } else if (isLeft) {
                      scale = isMobile ? 0.7 : 0.8;
                      rotateY = isMobile ? 10 : 20;
                      zIndex = 20;
                      x = isMobile ? -65 : -210;
                      opacity = isMobile ? 0.35 : 0.55;
                      filter = isMobile ? 'blur(3px)' : 'blur(2px)';
                    } else if (isRight) {
                      scale = isMobile ? 0.7 : 0.8;
                      rotateY = isMobile ? -10 : -20;
                      zIndex = 20;
                      x = isMobile ? 65 : 210;
                      opacity = isMobile ? 0.35 : 0.55;
                      filter = isMobile ? 'blur(3px)' : 'blur(2px)';
                    } else if (diff === len - 2) {
                      // Pre-render outer left
                      scale = 0.65;
                      zIndex = 5;
                      x = isMobile ? -120 : -320;
                      opacity = isMobile ? 0 : 0.15;
                    } else if (diff === 2) {
                      // Pre-render outer right
                      scale = 0.65;
                      zIndex = 5;
                      x = isMobile ? 120 : 320;
                      opacity = isMobile ? 0 : 0.15;
                    }

                    return (
                      <motion.div
                        key={perfume.internalFormulaKey}
                        animate={{
                          scale,
                          x,
                          rotateY,
                          opacity,
                          filter,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ zIndex, perspective: 1200, pointerEvents: opacity > 0 ? 'auto' : 'none' }}
                        className="absolute w-[200px] h-[290px] sm:w-[240px] sm:h-[350px] shrink-0 rounded-2xl bg-white border border-slate-200/80 shadow-xl flex flex-col justify-between p-3 sm:p-4 cursor-pointer"
                        onClick={() => {
                          if (isCenter) {
                            openDetails(perfume);
                          } else {
                            setActiveSlide(idx);
                          }
                        }}
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                          <img
                            loading="lazy"
                            src={perfume.imageUrls[0]}
                            alt={perfume.name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                          <span className="absolute bottom-2 left-2 bg-slate-900/90 text-white text-[8px] font-mono tracking-wider px-1.5 py-0.5 rounded">
                            {perfume.internalFormulaKey}
                          </span>
                        </div>

                        <div className="mt-3 flex-1 flex flex-col justify-between text-left">
                          <div>
                            <h4 className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider line-clamp-1">
                              {perfume.name}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-light truncate mt-0.5 font-mono">
                              {perfume.topNotes} • {perfume.baseNotes}
                            </p>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-baseline">
                            <span className="text-[8px] text-slate-400 font-bold uppercase font-mono">Price</span>
                            <span className="text-primary font-bold text-xs">{perfume.pricePerMl} BDT/ml</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-10 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 hover:text-primary hover:border-primary shadow-sm transition focus:outline-none"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <p className="text-slate-500 text-xs sm:text-sm font-light tracking-wide max-w-2xl mt-4 sm:mt-6 mb-4 sm:mb-6 leading-relaxed font-serif">
                Curated premium perfumes for discerning tastes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-xs sm:max-w-none">
                <a
                  href="#collection"
                  className="rounded bg-primary px-8 py-3.5 text-xs font-bold tracking-widest text-slate-900 transition hover:bg-primary/80 hover:scale-[1.01] flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
                >
                  EXPLORE OUR COLLECTION <ChevronRight className="h-4 w-4" />
                </a>
                <Link
                  href="/combo-builder"
                  className="rounded border border-slate-250 bg-slate-50 px-8 py-3.5 text-xs font-bold tracking-widest text-slate-650 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  COMBO BUILDER
                </Link>
              </div>

            </motion.div>
          </div>
        </section>

        {/* Collection Section split into Inspired and Original */}
        <section id="collection" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Inspired Creations */}
          <div>
            <div className="text-center mb-12">
              <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase font-mono">OUR INSPIRED SCENTS</span>
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
              <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase font-mono">PREMIUM ORIGINAL RANGE</span>
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
              <div className="text-center text-slate-400 text-xs py-8 font-mono">No designer fragrances available right now.</div>
            )}
          </div>

          {gridItems.length === 0 && (
            /* Empty state */
            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <Database className="h-10 w-10 text-slate-300 mb-4 animate-bounce" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Collection Empty</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mt-2 leading-relaxed">
                Our custom decant collections are currently being updated. Please check back shortly.
              </p>
            </div>
          )}
        </section>

        {/* Video Presentation */}
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase font-mono">BRAND VIDEO</span>
            <h2 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-2 mb-6">
              ALWEEN LUXURY PERFUMES BANGLADESH
            </h2>
            <VimeoVideo url="https://vimeo.com/76979871" />
            <p className="text-slate-500 text-xs font-light tracking-wide mt-6 max-w-lg mx-auto leading-relaxed">
              Every scent decant is hand-poured with precision from authentic bottles to preserve the original fragrance projection.
            </p>
          </div>
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

                    <div className="mt-4 flex justify-between text-xs text-slate-400 font-mono">
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
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}>
                          {(selectedPerfume as any).type === 'combo' ? 'Combo Box' : 'Single Fragrance'}
                        </span>
                      </div>
                      <h3 className="font-sans text-xl font-bold text-slate-900 mb-2 uppercase tracking-wide">
                        {selectedPerfume.name}
                      </h3>
                      <p className="text-slate-500 text-xs font-light leading-relaxed mb-6">
                        {selectedPerfume.description}
                      </p>

                      {/* SIZE SELECTION MATRIX (Only for single perfumes) */}
                      {(selectedPerfume as any).type !== 'combo' ? (
                        <div className="mb-6">
                          <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-2">
                            SELECT BOTTLE SIZE
                          </label>
                          <div className="grid grid-cols-5 gap-2">
                            {[6, 10, 15, 30, 50].map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => setSelectedSize(size)}
                                className={`rounded py-2 text-center text-xs font-bold transition focus:outline-none ${
                                  selectedSize === size
                                    ? 'bg-primary text-slate-900 shadow-md shadow-primary/10'
                                    : 'bg-slate-50 border border-slate-200 text-slate-650 hover:bg-slate-100 hover:border-slate-350'
                                }`}
                              >
                                {size}ml
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* MICRO-COPY OLFACTORY FIELDS (Only for single perfumes) */}
                      {(selectedPerfume as any).type !== 'combo' ? (
                        <div className="space-y-3.5 border-t border-slate-100 pt-4 mb-6">
                          <div>
                            <span className="block text-[9px] font-bold tracking-widest text-primary uppercase font-mono">
                              Top Notes
                            </span>
                            <span className="text-slate-650 text-xs font-light">{selectedPerfume.topNotes}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold tracking-widest text-primary uppercase font-mono">
                              Heart Notes
                            </span>
                            <span className="text-slate-650 text-xs font-light">{selectedPerfume.heartNotes}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold tracking-widest text-primary uppercase font-mono">
                              Base Notes
                            </span>
                            <span className="text-slate-650 text-xs font-light">{selectedPerfume.baseNotes}</span>
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

                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-baseline mb-4 font-mono">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400">
                          {(selectedPerfume as any).type === 'combo' ? 'PACKAGE PRICE' : 'TOTAL PRICE'}
                        </span>
                        <span className="text-primary font-bold text-lg">
                          {((selectedPerfume as any).type === 'combo'
                            ? selectedPerfume.pricePerMl
                            : selectedPerfume.pricePerMl * selectedSize
                          ).toFixed(2)} BDT
                        </span>
                      </div>
                      <button
                        onClick={handleAddToBasketFromDetails}
                        className="w-full rounded bg-primary py-3 text-xs font-bold tracking-widest text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
                      >
                        <ShoppingCart className="h-4 w-4" /> ADD TO CART
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 font-sans">
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
