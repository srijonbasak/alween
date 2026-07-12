'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // Unique cart item ID (can be product ID or combo unique ID)
  perfumeId: string;
  name: string;
  selectedSizeMl: number;
  quantity: number;
  price: number;
  internalFormulaKey: string;
  isCustomCombo?: boolean;
  isExcludedFromDiscounts?: boolean;
  comboItems?: {
    perfumeId: string;
    name: string;
    selectedSizeMl: number;
    internalFormulaKey: string;
  }[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  affiliateRef: string | null;
  setAffiliateRef: (ref: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [affiliateRef, setAffiliateRef] = useState<string | null>(null);

  // Initialize cart from localStorage on client mount
  useEffect(() => {
    const savedCart = localStorage.getItem('alween_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart from localStorage:', e);
      }
    }

    // Capture affiliate URL reference query
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('alween_ref', ref);
      setAffiliateRef(ref);
    } else {
      const savedRef = localStorage.getItem('alween_ref');
      if (savedRef) {
        setAffiliateRef(savedRef);
      }
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('alween_cart', JSON.stringify(newCart));
  };

  const addToCart = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = newItem.quantity || 1;
    const existingIndex = cart.findIndex(item => item.id === newItem.id);

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += qty;
      saveCart(updated);
    } else {
      saveCart([...cart, { ...newItem, quantity: qty }]);
    }
  };

  const removeFromCart = (id: string) => {
    saveCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    saveCart([]);
    localStorage.removeItem('alween_cart');
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      isDrawerOpen,
      setIsDrawerOpen,
      affiliateRef,
      setAffiliateRef
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
