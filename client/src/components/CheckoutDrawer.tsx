'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { API_URL, safeParseResponse } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Ticket, CheckCircle2, Loader2, Trash2, Plus, Minus } from 'lucide-react';

export const CheckoutDrawer: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, isDrawerOpen, setIsDrawerOpen, affiliateRef } = useCart();
  
  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Geolocation & Address
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDetails, setCouponDetails] = useState<any>(null);

  // Status & Password
  const [saveAccount, setSaveAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [fingerprint, setFingerprint] = useState('');

  useEffect(() => {
    setFingerprint(`fp_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`);
  }, []);

  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotal = getSubtotal();

  const getDiscountAmount = () => {
    if (!couponDetails) return 0;
    const discountableItems = cart.filter(item => !item.isExcludedFromDiscounts);
    const discountableSubtotal = discountableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return (discountableSubtotal * couponDetails.discountPercent) / 100;
  };
  const discountAmount = getDiscountAmount();

  const getStandardShippingFee = () => (city.toLowerCase().trim().includes('dhaka') ? 60 : 120);
  const freeShippingThreshold = 3000;
  const isFreeDeliveryEnabled = true;
  const standardShippingFee = getStandardShippingFee();
  const shippingFee = (isFreeDeliveryEnabled && subtotal >= freeShippingThreshold) ? 0 : standardShippingFee;
  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setLoadingGeo(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGeoAccuracy(accuracy);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            const addr = data.address || {};
            setStreetAddress(addr.road || addr.suburb || addr.neighbourhood || data.display_name);
            setCity(addr.city || addr.state || addr.town || 'Dhaka');
            setPostalCode(addr.postcode || '');
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingGeo(false);
        }
      },
      (error) => {
        console.error(error);
        setErrorMsg('Could not detect location automatically. Please enter your address manually.');
        setLoadingGeo(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const applyCoupon = async () => {
    setErrorMsg('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    try {
      const response = await fetch(`${API_URL}/api/coupons/validate?code=${code}`);
      const { data, ok } = await safeParseResponse(response);
      if (!ok) {
        throw new Error(data.error || 'Invalid coupon code.');
      }
      setCouponDetails(data);
      setAppliedCoupon(code);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired coupon code.');
      setCouponDetails(null);
      setAppliedCoupon('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg('');

    const cleanPhone = phone.trim();
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      setIsSubmitting(false);
      return;
    }

    const fullAddress = streetAddress ? `${streetAddress}, ${city}${postalCode ? ` - ${postalCode}` : ''}` : city;
    if (!fullAddress) {
      setErrorMsg('Please enter your delivery address.');
      setIsSubmitting(false);
      return;
    }

    const turnstileToken = (window as any).turnstileToken || '1x0000000000000000000000000000000AA';

    const payload = {
      customerName: name,
      customerPhone: cleanPhone,
      customerEmail: email,
      address: {
        street: streetAddress,
        city: city,
        postalCode: postalCode,
        formattedAddress: fullAddress
      },
      geolocationAccuracy: geoAccuracy,
      items: cart.map(item => ({
        perfumeId: item.perfumeId,
        selectedSizeMl: item.selectedSizeMl,
        quantity: item.quantity
      })),
      couponCode: appliedCoupon || undefined,
      fingerprint,
      ref: affiliateRef || undefined,
      isAffiliate: false,
      ...(saveAccount && password ? { password, saveAccount: true } : {})
    };

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Turnstile-Token': turnstileToken
        },
        body: JSON.stringify(payload)
      });

      const { data, ok } = await safeParseResponse(response);

      if (!ok) {
        throw new Error(data.error || data.message || 'Checkout failed.');
      }

      setOrderSuccess(data.order);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Centered Crisp Pure White Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden my-auto"
          >
            {/* Clean White Modal Header with Brand Logo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Alween" className="h-6 sm:h-7 object-contain" />
                <span className="h-4 w-px bg-stone-200" />
                <span className="font-sans font-bold text-stone-900 text-sm sm:text-base">Checkout</span>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)} 
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition cursor-pointer"
                aria-label="Close Checkout"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
              {orderSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-8"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-sans text-2xl font-bold text-stone-900 mb-2">Thank You for Your Order!</h3>
                  <p className="text-stone-600 text-sm max-w-md mb-6">
                    We've received your order and are preparing your luxury fragrances for delivery.
                  </p>
                  <div className="w-full max-w-md bg-stone-50 rounded-xl p-5 border border-stone-200 text-left mb-6 font-sans">
                    <div className="flex justify-between border-b border-stone-200/60 pb-2 mb-2 text-xs text-stone-500">
                      <span>Order Number</span>
                      <span className="font-bold text-stone-900">#{orderSuccess.orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-500">
                      <span>Total Amount</span>
                      <span className="font-bold text-stone-900">{orderSuccess.totalPrice.toFixed(2)} BDT</span>
                    </div>
                    {orderSuccess.orderNumber && (
                      <div className="mt-4 pt-3 border-t border-stone-200/60 text-center">
                        <a 
                          href={`${API_URL}/api/invoices/${orderSuccess.orderNumber}.pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs font-bold text-amber-600 hover:underline"
                        >
                          Download PDF Receipt
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setOrderSuccess(null);
                      setIsDrawerOpen(false);
                    }}
                    className="w-full max-w-xs rounded-xl bg-stone-900 py-3 text-xs font-bold tracking-wider text-white hover:bg-stone-800 transition cursor-pointer"
                  >
                    Back to Store
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Customer Information (Left Column) */}
                  <div className="lg:col-span-7 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Personal Contact */}
                      <div>
                        <h4 className="font-sans text-sm tracking-wide text-stone-900 border-b border-stone-100 pb-2 mb-4 font-bold">
                          Contact Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                              Full Name
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Safwan Chowdhury"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="017XXXXXXXX"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="customer@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                          />
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-4">
                          <h4 className="font-sans text-sm tracking-wide text-stone-900 font-bold">
                            Delivery Address
                          </h4>
                          <button
                            type="button"
                            onClick={handleGeolocation}
                            disabled={loadingGeo}
                            className="flex items-center text-xs font-semibold text-amber-600 hover:text-stone-900 transition focus:outline-none cursor-pointer gap-1"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            {loadingGeo ? 'Finding location...' : 'Use Current Location'}
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                              Street / House Address
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="House 12, Road 4, Sector 7, Uttara"
                              value={streetAddress}
                              onChange={(e) => setStreetAddress(e.target.value)}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                                City
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Dhaka"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                                Postal Code
                              </label>
                              <input
                                type="text"
                                placeholder="1230"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Optional Account Creation */}
                      <div className="pt-2 border-t border-stone-100">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={saveAccount}
                            onChange={(e) => setSaveAccount(e.target.checked)}
                            className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 h-4 w-4"
                          />
                          <span className="text-xs text-stone-700">Save details for faster future re-orders</span>
                        </label>
                        
                        <AnimatePresence>
                          {saveAccount && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 overflow-hidden"
                            >
                              <label className="block text-xs font-semibold text-stone-600 mb-1">
                                Choose Account Password
                              </label>
                              <input
                                type="password"
                                required={saveAccount}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {errorMsg && (
                        <div className="text-red-600 text-xs font-semibold bg-red-50 border border-red-200 rounded-xl p-3">
                          {errorMsg}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting || cart.length === 0}
                        className="w-full rounded-xl bg-stone-900 py-3.5 text-xs font-bold tracking-wider text-white hover:bg-stone-800 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          'Complete Order'
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Order Summary (Right Column) */}
                  <div className="lg:col-span-5 bg-stone-50/70 border border-stone-200/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="font-sans text-sm tracking-wide text-stone-900 border-b border-stone-200/80 pb-2 mb-4 font-bold">
                        Order Summary
                      </h4>
                      {cart.length === 0 ? (
                        <div className="text-stone-400 text-xs text-center py-6">Your cart is empty</div>
                      ) : (
                        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                          {cart.map(item => (
                            <div 
                              key={item.id} 
                              className="flex items-start justify-between gap-3 p-3 bg-white rounded-xl border border-stone-200/90 shadow-2xs"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-stone-900 text-xs truncate">{item.name}</span>
                                  <span className="font-bold text-xs text-stone-900 shrink-0">
                                    {(item.price * item.quantity).toFixed(2)} BDT
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500">
                                  <span>Size: {item.selectedSizeMl}ml</span>
                                  {item.isCustomCombo && (
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[8px] font-bold">
                                      Custom Pack
                                    </span>
                                  )}
                                </div>

                                {/* Quantity Controls & Delete Action */}
                                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100">
                                  <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="h-5 w-5 flex items-center justify-center rounded-md bg-white text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                                      title="Decrease Quantity"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="text-xs font-bold px-1.5 text-stone-900">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="h-5 w-5 flex items-center justify-center rounded-md bg-white text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                                      title="Increase Quantity"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                                    title="Remove item"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Coupon Application */}
                      <div className="mt-4 pt-4 border-t border-stone-200/80">
                        <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                          Have a Coupon Code?
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter Code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs uppercase focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={applyCoupon}
                            className="bg-stone-900 hover:bg-stone-800 text-xs px-3.5 rounded-lg text-white font-bold transition cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                        {appliedCoupon && couponDetails && (
                          <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1 bg-emerald-50 p-2 rounded border border-emerald-200">
                            <Ticket className="h-3.5 w-3.5" />
                            <span>Coupon <strong>{appliedCoupon}</strong> applied ({couponDetails.discountPercent}% OFF)</span>
                          </div>
                        )}
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="mt-4 pt-4 border-t border-stone-200/80 space-y-2 text-xs text-stone-600">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-semibold text-stone-900">{subtotal.toFixed(2)} BDT</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-600 font-bold">
                            <span>Discount</span>
                            <span>-{discountAmount.toFixed(2)} BDT</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Delivery Fee</span>
                          <span className="font-semibold text-stone-900">
                            {shippingFee === 0 ? (
                              <span className="text-emerald-600 font-bold">FREE</span>
                            ) : (
                              `${shippingFee.toFixed(2)} BDT`
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200/80">
                          <span>Total Amount</span>
                          <span className="text-stone-900 text-base">{grandTotal.toFixed(2)} BDT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
