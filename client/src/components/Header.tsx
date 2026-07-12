'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, Settings, Award, Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  const { cart, setIsDrawerOpen } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Items (Left) */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-widest text-slate-500">
          <Link href="/" className="transition hover:text-primary">
            COLLECTIONS
          </Link>
          <Link href="/combos" className="transition hover:text-primary">
            SCENT COMBOS
          </Link>
          <Link href="/combo-builder" className="transition hover:text-primary">
            CUSTOM COMBOS
          </Link>
        </nav>

        {/* Brand Logo (Center - Unconditionally absolute centered on both mobile and desktop) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
          <Link href="/" className="group flex flex-col items-center">
            <img src="/logo.png" alt="Alween" className="h-7 md:h-8 mb-1.5 object-contain" />
            <span className="text-[0.5rem] md:text-[0.55rem] font-bold tracking-[0.6em] text-slate-400 font-mono">ALWEEN</span>
          </Link>
        </div>

        {/* Quick Utilities (Right) */}
        <div className="flex items-center space-x-4 md:space-x-6 ml-auto">
          <Link
            href="/affiliate"
            className="flex items-center text-slate-500 transition hover:text-primary"
            title="Affiliate Portal"
          >
            <Award className="h-4.5 w-4.5" />
            <span className="ml-1.5 hidden text-[10px] font-bold tracking-wider lg:inline">PARTNER</span>
          </Link>



          {/* Cart Icon trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative flex items-center text-slate-500 transition hover:text-primary focus:outline-none"
            title="Open Drawer"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
