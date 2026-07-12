'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { API_URL } from '../lib/api';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, AlertTriangle, ShieldCheck, Ticket, Check, Loader2, Cpu } from 'lucide-react';

export const CheckoutDrawer: React.FC = () => {
  const { cart, clearCart, isDrawerOpen, setIsDrawerOpen, affiliateRef } = useCart();
  
  // Checkout Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Geolocation & Address States
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);
  const [isDrifted, setIsDrifted] = useState(false); // Accuracy trap
  const [formattedAddress, setFormattedAddress] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDetails, setCouponDetails] = useState<any>(null);

  // Optional Registration States
  const [saveAccount, setSaveAccount] = useState(false);
  const [password, setPassword] = useState('');

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Device Fingerprint simulation for Affiliate fraud shield
  const [fingerprint, setFingerprint] = useState('');
  const [sysConfig, setSysConfig] = useState<any>(null);

  useEffect(() => {
    let fp = localStorage.getItem('alween_fingerprint');
    if (!fp) {
      fp = 'fp-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
      localStorage.setItem('alween_fingerprint', fp);
    }
    setFingerprint(fp);

    // ponytail: cache-first settings retrieval for offline robustness
    const cachedConfig = localStorage.getItem('alween_sys_config');
    if (cachedConfig) {
      try {
        setSysConfig(JSON.parse(cachedConfig));
      } catch (e) {}
    }

    fetch(`${API_URL}/api/config`)
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) {
          setSysConfig(data);
          localStorage.setItem('alween_sys_config', JSON.stringify(data));
        }
      })
      .catch(err => console.error('Failed to retrieve system settings:', err));
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (couponDetails && couponDetails.isValid) {
    let eligibleSubtotal = 0;
    if (couponDetails.appliesToType === 'all') {
      eligibleSubtotal = cart.reduce((sum, item) => {
        if (item.isExcludedFromDiscounts) return sum;
        return sum + (item.price * item.quantity);
      }, 0);
    } else {
      eligibleSubtotal = cart.reduce((sum, item) => {
        const isApplicable = couponDetails.applicableProducts.some((pId: string) => pId === item.perfumeId);
        if (isApplicable && !item.isExcludedFromDiscounts) {
          return sum + (item.price * item.quantity);
        }
        return sum;
      }, 0);
    }

    if (couponDetails.discountType === 'percentage') {
      let calcDiscount = eligibleSubtotal * (couponDetails.discountValue / 100);
      if (couponDetails.maxDiscountCap && couponDetails.maxDiscountCap > 0) {
        calcDiscount = Math.min(calcDiscount, couponDetails.maxDiscountCap);
      }
      discountAmount = calcDiscount;
    } else if (couponDetails.discountType === 'fixed') {
      discountAmount = Math.min(couponDetails.discountValue, eligibleSubtotal);
    }
  }

  const maxDiscount = subtotal * 0.50; // 50% capping rule
  if (discountAmount > maxDiscount) {
    discountAmount = maxDiscount;
  }

  // Logistics Configurations
  const freeShippingThreshold = sysConfig?.freeDeliveryThreshold ?? 3000;
  const isFreeDeliveryEnabled = sysConfig?.isFreeDeliveryEnabled !== false;

  const getStandardShippingFee = (): number => {
    if (!sysConfig) return 100;
    
    const finalAddress = isDrifted
      ? `${streetAddress}, ${city} - ${postalCode}`
      : (formattedAddress || streetAddress);
      
    const addrLower = (finalAddress || '').toLowerCase();
    const cityLower = (city || '').toLowerCase();
    const isInsideDhaka = addrLower.includes('dhaka') || cityLower.includes('dhaka');
    
    return isInsideDhaka 
      ? (sysConfig.shippingFeeInsideDhaka ?? 60) 
      : (sysConfig.shippingFeeOutsideDhaka ?? 120);
  };

  const standardShippingFee = getStandardShippingFee();
  const shippingFee = (isFreeDeliveryEnabled && subtotal >= freeShippingThreshold) ? 0 : standardShippingFee;
  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoadingGeo(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGeoAccuracy(accuracy);
        
        // Trap cellular ISP drift (accuracy > 100 meters)
        if (accuracy > 100) {
          setIsDrifted(true);
        } else {
          setIsDrifted(false);
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setFormattedAddress(data.display_name);
            const addr = data.address || {};
            setStreetAddress(addr.road || addr.suburb || addr.neighbourhood || '');
            setCity(addr.city || addr.state || addr.town || '');
            setPostalCode(addr.postcode || '');
          } else {
            setFormattedAddress(`Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
        } catch (e) {
          console.error(e);
          setFormattedAddress(`Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setLoadingGeo(false);
        }
      },
      (error) => {
        console.error(error);
        setErrorMsg('Location access denied. Please fill in your address manually.');
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
      const data = await response.json();
      if (!response.ok) {
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

    const finalAddressObj = isDrifted
      ? {
          street: streetAddress,
          city: city,
          postalCode: postalCode,
          formattedAddress: `${streetAddress}, ${city} - ${postalCode}`
        }
      : {
          formattedAddress: formattedAddress || streetAddress
        };

    if (!finalAddressObj.formattedAddress && !isDrifted) {
      setErrorMsg('Please specify your shipping address.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      address: finalAddressObj,
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
          'X-Turnstile-Token': '1x0000000000000000000000000000000AA'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Checkout failed.');
      }

      setOrderSuccess(data.order);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
        <Drawer.Content 
          className="fixed bottom-0 right-0 top-0 z-50 flex h-full w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex-col bg-white border-l border-slate-200 text-slate-900 outline-none shadow-2xl"
        >
          <div className="mx-auto my-3 h-1 w-12 rounded-full bg-slate-200 sm:hidden" />
          
          <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-100">
            <Drawer.Title className="font-sans text-sm sm:text-lg tracking-wide text-primary font-bold flex items-center gap-1.5">
              <Cpu className="h-4.5 w-4.5" />
              <span className="hidden sm:inline">SECURE ORDER CHECKOUT</span>
              <span className="inline sm:hidden">CHECKOUT</span>
            </Drawer.Title>
            <button 
              onClick={() => setIsDrawerOpen(false)} 
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {orderSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-10"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-primary border border-blue-200 mb-6">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="font-sans text-2xl font-bold text-slate-900 mb-2">ORDER PLACED</h3>
                <p className="text-slate-500 text-sm max-w-sm mb-6">
                  Your scent order has been successfully logged. Our team is preparing your custom package.
                </p>
                <div className="w-full max-w-md bg-slate-50 rounded-xl p-5 border border-slate-200 text-left mb-8">
                  <div className="flex justify-between border-b border-slate-100 pb-2 mb-2 text-xs text-slate-500 font-mono">
                    <span>ORDER ID</span>
                    <span className="font-bold text-slate-800">{orderSuccess.orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>ESTIMATED BILL</span>
                    <span className="font-bold text-primary">{orderSuccess.totalPrice.toFixed(2)} BDT</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-150 text-center font-mono">
                    <a 
                      href={`${API_URL}/api/invoices/${orderSuccess.orderNumber}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-bold text-primary hover:underline"
                    >
                      DOWNLOAD INVOICE PDF
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    setIsDrawerOpen(false);
                  }}
                  className="w-full max-w-xs rounded-xl bg-primary py-3.5 text-xs font-bold tracking-widest text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/10"
                >
                  RETURN TO STORE
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Checkout Forms (Left) */}
                <div className="lg:col-span-7">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h4 className="font-sans text-sm tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-4 font-bold">
                        CUSTOMER DETAILS
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-1.5">
                            Customer Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Safwan Chowdhury"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-1.5">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="017XXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="customer@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                        <h4 className="font-sans text-sm tracking-wider text-slate-800 font-bold">
                          SHIPPING ADDRESS
                        </h4>
                        <button
                          type="button"
                          onClick={handleGeolocation}
                          disabled={loadingGeo}
                          className="flex items-center text-xs font-bold text-primary hover:text-blue-700 transition focus:outline-none"
                        >
                          {loadingGeo ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <MapPin className="mr-1 h-3.5 w-3.5" />
                          )}
                          AUTO-FILL LOCATION
                        </button>
                      </div>

                      {/* ISP Drift Trap Banner */}
                      <AnimatePresence>
                        {isDrifted && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4 flex items-start gap-2.5 text-amber-800 text-xs"
                          >
                            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                            <div>
                              <span className="font-bold font-mono">CELLULAR DRIFT ALERT ({Math.round(geoAccuracy || 0)}m):</span>
                              <p className="mt-0.5 text-slate-600">
                                Low satellite location precision detected. We split the address container into manual entries to ensure courier routing validity.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {isDrifted ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-1">
                              Street / House / Road
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="House 15, Road 2, Dhanmondi"
                              value={streetAddress}
                              onChange={(e) => setStreetAddress(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-1">
                              City Area
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Dhaka"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-1">
                              Postal Zip Code
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="1209"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-1.5">
                            Shipping Destination Address
                          </label>
                          <textarea
                            required
                            rows={2}
                            placeholder="Provide your complete shipping address..."
                            value={formattedAddress}
                            onChange={(e) => setFormattedAddress(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary"
                          />
                        </div>
                      )}
                    </div>

                    {/* Registration Option */}
                    <div className="border-t border-slate-100 pt-4">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-650">
                        <input
                          type="checkbox"
                          checked={saveAccount}
                          onChange={(e) => setSaveAccount(e.target.checked)}
                          className="h-4.5 w-4.5 rounded border-slate-200 bg-white text-primary accent-primary"
                        />
                        <span>Save these details into an account to earn points on future orders.</span>
                      </label>
                      
                      <AnimatePresence>
                        {saveAccount && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 overflow-hidden"
                          >
                            <label className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-1">
                              Choose Password
                            </label>
                            <input
                              type="password"
                              required={saveAccount}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {errorMsg && (
                      <div className="text-red-500 text-xs font-semibold bg-red-50 border border-red-250 rounded-xl p-3.5">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || cart.length === 0}
                      className="w-full rounded-xl bg-primary py-3.5 text-xs font-bold tracking-widest text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-500/10"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          PROCESSING YOUR ORDER...
                        </>
                      ) : (
                        'CONFIRM & PLACE ORDER'
                      )}
                    </button>
                  </form>
                </div>

                {/* Cart summary (Right) */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h4 className="font-sans text-sm tracking-wider text-slate-800 border-b border-slate-200 pb-2 mb-4 font-bold">
                    SHOPPING CART
                  </h4>
                  {cart.length === 0 ? (
                    <div className="text-slate-400 text-xs text-center py-6">Your basket is empty</div>
                  ) : (
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between text-xs items-start gap-4">
                          <div>
                            <span className="font-bold text-slate-800">{item.name}</span>
                            <div className="flex gap-1.5 items-center mt-0.5 text-[10px] text-slate-400 font-mono">
                              <span>Batch: {item.internalFormulaKey}</span>
                              <span>•</span>
                              <span>Size: {item.selectedSizeMl}ml</span>
                              <span>•</span>
                              <span>Qty: {item.quantity}</span>
                              {item.isCustomCombo && (
                                <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[8px] text-primary">
                                  Custom Combo
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-slate-700 font-mono">{(item.price * item.quantity).toFixed(2)} BDT</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Coupon Application */}
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <label className="block text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase mb-1.5">
                      Coupon Voucher Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. ALWEEN20"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs uppercase focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="bg-slate-900 hover:bg-slate-800 text-xs px-4 rounded-lg text-white font-bold transition flex items-center justify-center"
                      >
                        APPLY
                      </button>
                    </div>
                    {appliedCoupon && (
                      <div className="mt-2 flex items-center justify-between text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                        <div className="flex items-center gap-1 font-mono">
                          <Check className="h-3 w-3" />
                          <span>COUPON {appliedCoupon} RUNNING</span>
                        </div>
                        <span className="font-mono">-{discountAmount.toFixed(2)} BDT</span>
                      </div>
                    )}
                  </div>

                  {/* Summary Math Block */}
                  <div className="mt-6 pt-4 border-t border-slate-200 space-y-2.5 text-xs text-slate-500 font-mono">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="text-slate-800 font-medium">{subtotal.toFixed(2)} BDT</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discounts:</span>
                        <span>-{discountAmount.toFixed(2)} BDT</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span className="text-slate-800 font-medium font-sans font-bold">
                        {shippingFee === 0 ? 'FREE DELIVERY' : `${shippingFee.toFixed(2)} BDT`}
                      </span>
                    </div>
                    
                    {subtotal < freeShippingThreshold && (
                      <div className="mt-2 text-[9px] text-slate-400 bg-white p-2 rounded-lg border border-slate-150">
                        Add <span className="text-primary font-bold">{freeShippingThreshold - subtotal} BDT</span> more for <span className="font-bold text-slate-700">FREE delivery</span>.
                      </div>
                    )}

                    <div className="flex justify-between border-t border-slate-200 pt-3 text-sm text-slate-800 font-bold font-sans">
                      <span>GRAND TOTAL:</span>
                      <span className="text-primary font-bold text-base font-mono">{grandTotal.toFixed(2)} BDT</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
