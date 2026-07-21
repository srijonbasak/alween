"use client"; 

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Award, Menu, X, Sparkles, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { SearchModal } from "../SearchModal";

export interface TabItem {
  label: string;
  href: string;
}

const DEFAULT_TABS: TabItem[] = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/#collection" },
  { label: "Combos", href: "/combos" },
  { label: "Custom", href: "/combo-builder" },
  { label: "Partner", href: "/affiliate" },
];

function NavHeader({ tabs = DEFAULT_TABS }: { tabs?: TabItem[] }) {
  const { cart, setIsDrawerOpen, setIsSearchOpen } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className={`sticky z-50 w-full flex justify-center px-3 sm:px-6 pointer-events-none transition-all duration-300 ${
          isScrolled ? "top-2 sm:top-3" : "top-4 sm:top-5"
        }`}
      >
        {/* Dynamic 2D Contraction Container (Contracts both Horizontally and Vertically) */}
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className={`pointer-events-auto relative w-full flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 ${
            isScrolled ? "max-w-3xl" : "max-w-5xl"
          }`}
        >
          
          {/* Ambient Gold Radial Glow behind the floating pill */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 via-amber-200/10 to-amber-500/20 blur-xl opacity-70 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />

          {/* Main Floating Glassmorphic Navbar Pill */}
          <div className={`relative flex items-center justify-between gap-2 sm:gap-4 rounded-full border border-black/15 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] w-full transition-all duration-300 ${
            isScrolled ? "p-1 sm:p-1.5 shadow-lg" : "p-1.5 sm:p-2.5 shadow-2xl"
          }`}>
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center pl-2 sm:pl-3 group shrink-0">
              <motion.div 
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <img 
                  src="/logo_top.png" 
                  alt="Alween Luxury" 
                  className={`object-contain transition-all duration-300 ${
                    isScrolled ? "h-4 sm:h-5 mb-0.5" : "h-6 sm:h-7 mb-0.5"
                  }`} 
                />
                <span className={`font-extrabold tracking-[0.35em] text-stone-900 dark:text-white font-sans uppercase leading-none transition-all duration-300 ${
                  isScrolled ? "text-[7px] sm:text-[7.5px]" : "text-[8.5px] sm:text-[9.5px]"
                }`}>
                  ALWEEN
                </span>
              </motion.div>
            </Link>

            {/* Desktop Animated Navigation Tabs (Center) */}
            <ul
              className="relative hidden md:flex items-center w-fit rounded-full"
              onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
            >
              {tabs.map((tab, idx) => (
                <Tab key={tab.href || idx} setPosition={setPosition} href={tab.href} isScrolled={isScrolled}>
                  {tab.label}
                </Tab>
              ))}

              <Cursor position={position} isScrolled={isScrolled} />
            </ul>

            {/* Right Utilities: Search, Cart Drawer & Mobile Menu */}
            <div className="flex items-center gap-1.5 sm:gap-2 pr-1 sm:pr-2 shrink-0">
              {/* Search Trigger Button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsSearchOpen(true)}
                className={`flex items-center justify-center text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all duration-300 border border-stone-200 dark:border-stone-700 cursor-pointer ${
                  isScrolled ? "h-7 w-7" : "h-8 sm:h-9 w-8 sm:w-9"
                }`}
                aria-label="Search Perfumes"
                title="Search Perfumes"
              >
                <Search className={isScrolled ? "h-3.5 w-3.5" : "h-4 w-4"} />
              </motion.button>

              {/* Cart Trigger Button */}
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDrawerOpen(true)}
                className={`relative flex items-center justify-center rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-all duration-300 font-bold gap-1.5 shadow-md shadow-stone-900/10 border border-stone-800 cursor-pointer ${
                  isScrolled ? "h-7 sm:h-8 px-2.5 text-[10px]" : "h-8 sm:h-9 px-3 sm:px-3.5 text-xs"
                }`}
                aria-label="Shopping Cart"
              >
                <ShoppingBag className={isScrolled ? "h-3 w-3" : "h-3.5 w-3.5"} />
                <span className="hidden sm:inline text-[10px] tracking-wider uppercase font-sans font-extrabold">Cart</span>
                <AnimatePresence mode="wait">
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-stone-950 shadow-sm border border-stone-900"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile Hamburger Trigger */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsMobileMenuOpen(true)}
                className={`md:hidden flex items-center justify-center text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all duration-300 border border-stone-200 dark:border-stone-700 cursor-pointer ${
                  isScrolled ? "h-7 w-7" : "h-8 w-8"
                }`}
                aria-label="Toggle Mobile Menu"
              >
                <Menu className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* Render Search Modal */}
      <SearchModal />

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden pointer-events-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-stone-950/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-in Mobile Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white dark:bg-stone-900 p-6 shadow-2xl flex flex-col justify-between border-r border-stone-100 dark:border-stone-800"
            >
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100 dark:border-stone-800">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center">
                    <img src="/logo_top.png" alt="Alween" className="h-6 object-contain mb-0.5" />
                    <span className="text-[8px] font-extrabold tracking-[0.3em] text-stone-900 dark:text-white uppercase font-sans">ALWEEN</span>
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  >
                    <X className="h-4.5 w-4.5" />
                  </motion.button>
                </div>

                <nav className="flex flex-col space-y-3">
                  {tabs.map((tab, idx) => (
                    <motion.div
                      key={tab.href}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 + 0.1 }}
                    >
                      <Link
                        href={tab.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white text-xs font-bold tracking-[0.2em] py-2 transition uppercase font-sans flex items-center justify-between group"
                      >
                        <span>{tab.label}</span>
                        <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 text-amber-500 transition-opacity" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                <Link
                  href="/affiliate"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-stone-900 text-white py-2.5 px-4 text-[10px] font-extrabold tracking-widest uppercase font-sans hover:bg-stone-800 transition shadow-sm"
                >
                  <Award className="h-3.5 w-3.5 text-amber-400" /> PARTNER PORTAL
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

const Tab = ({
  children,
  setPosition,
  href,
  isScrolled,
}: {
  children: React.ReactNode;
  setPosition: any;
  href?: string;
  isScrolled?: boolean;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;

        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      className={`relative z-10 block cursor-pointer uppercase text-white mix-blend-difference font-bold tracking-wider transition-all duration-300 ${
        isScrolled 
          ? "px-2 py-1 text-[10.5px] md:px-2.5 md:text-xs" 
          : "px-3 py-1.5 text-xs md:px-3.5 md:py-2 md:text-sm"
      }`}
    >
      {href ? (
        <Link href={href} className="block w-full h-full">
          {children}
        </Link>
      ) : (
        children
      )}
    </li>
  );
};

const Cursor = ({ position, isScrolled }: { position: any; isScrolled?: boolean }) => {
  return (
    <motion.li
      animate={position}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className={`absolute z-0 rounded-full bg-stone-900 shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-300 ${
        isScrolled ? "h-6 md:h-7" : "h-7 md:h-9"
      }`}
    />
  );
};

export default NavHeader;
export { NavHeader, Tab, Cursor };
