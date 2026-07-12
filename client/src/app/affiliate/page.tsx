'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { CheckoutDrawer } from '../../components/CheckoutDrawer';
import { API_URL } from '../../lib/api';
import { Award, User, Copy, Check, Info, Users, Gift, ShieldAlert } from 'lucide-react';

export default function AffiliatePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Registration / Login form states
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [affRefName, setAffRefName] = useState('');

  // Affiliate Dashboard states
  const [affProfile, setAffProfile] = useState<any>(null);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [siteOrigin, setSiteOrigin] = useState('http://localhost:3000');

  // Fetch current session on mount
  useEffect(() => {
    fetchProfile();
    if (typeof window !== 'undefined') {
      setSiteOrigin(window.location.origin);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`);
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        setIsLoggedIn(true);

        if (userData.isAffiliate) {
          fetchAffiliateStats();
        }
      }
    } catch (e) {
      console.log('User not logged in yet.');
    }
  };

  const fetchAffiliateStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/affiliates/me`);
      if (res.ok) {
        const data = await res.json();
        setAffProfile(data.affiliate);
        setReferralsList(data.referrals);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auth submits
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const endpoint = isSignup ? 'register' : 'login';
    const payload = isSignup
      ? { name, email, phone, password, isAffiliate: true, affiliateUsername: affRefName }
      : { email, password };

    try {
      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication process failed.');
      }

      if (isSignup) {
        setSuccessMsg('Registration completed. Please log in with your credentials.');
        setIsSignup(false);
        setPassword('');
      } else {
        setSuccessMsg('Logged in successfully.');
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        if (data.user.isAffiliate) {
          fetchAffiliateStats();
        } else {
          // Re-fetch current user profile details
          fetchProfile();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Toggle affiliate status for existing account
  const enableAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch(`${API_URL}/api/auth/toggle-affiliate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: affRefName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable affiliate status.');
      }

      setSuccessMsg('Affiliate profile activated.');
      fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST' });
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAffProfile(null);
    setReferralsList([]);
  };

  const copyToClipboard = (text: string, type: 'link' | 'coupon') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Header />

      <main className="flex-1 py-12 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase font-mono">LOYALTY NETWORK</span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mt-2 uppercase">
              AFFILIATE LEDGER PORTAL
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-light tracking-wide max-w-lg mx-auto mt-3">
              Earn store loyalty points on successful customer references. Bind device identities for lifelong commissions.
            </p>
          </div>

          {!isLoggedIn ? (
            /* Authentication Panel */
            <div className="mx-auto max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="font-serif text-xl font-black text-slate-900 mb-6 text-center uppercase tracking-wide">
                {isSignup ? 'CREATE PARTNER ACCOUNT' : 'SECURE IDENTITY ACCESS'}
              </h3>

              <form onSubmit={handleAuth} className="space-y-4">
                {isSignup && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Srijon Rahman"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-1.5">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="017XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="creator@alweenfragrance.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                {isSignup && (
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-1.5">
                      Choose Referral URL Key (Username)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="srijon"
                      value={affRefName}
                      onChange={(e) => setAffRefName(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-mono lowercase"
                    />
                    <span className="block text-[9px] text-slate-400 mt-1.5 font-mono">
                      Your link will be: {siteOrigin}/?ref={affRefName || 'username'}
                    </span>
                  </div>
                )}

                {errorMsg && (
                  <div className="text-red-500 text-xs font-semibold bg-red-50 border border-red-200 rounded-xl p-3.5">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="text-emerald-600 text-xs font-semibold bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-3.5 text-xs font-bold tracking-widest text-slate-900 hover:bg-primary/80 transition shadow-md shadow-primary/10"
                >
                  {isSignup ? 'REGISTER AS PARTNER' : 'SECURE SIGN IN'}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-slate-100 pt-4">
                <button
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-450 hover:text-primary transition underline font-medium focus:outline-none"
                >
                  {isSignup ? 'Already have an account? Sign In' : 'Need an affiliate profile? Sign Up'}
                </button>
              </div>
            </div>
          ) : (
            /* Affiliate Dashboard Panel */
            <div className="space-y-8">
              
              {/* Header Profile Actions */}
              <div className="flex justify-between items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-black text-slate-900 uppercase">{currentUser?.name}</h3>
                    <p className="text-xs text-slate-450 font-mono">{currentUser?.email} • ROLE: {currentUser?.role.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs border border-slate-200 px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition font-bold"
                >
                  LOGOUT
                </button>
              </div>

              {currentUser?.role === 'admin' ? (
                <div className="max-w-md mx-auto bg-white border border-red-200 p-6 rounded-2xl text-center shadow-sm">
                  <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-black text-slate-900 uppercase">ADMIN ACCESS RESTRICTED</h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-light mt-2 leading-relaxed">
                    Administrative accounts cannot participate in the affiliate partner network. Please log in with a customer account to register as an affiliate.
                  </p>
                </div>
              ) : !currentUser?.isAffiliate ? (
                /* Activate Affiliate section */
                <div className="max-w-md mx-auto bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <div className="text-center mb-6">
                    <Award className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="font-serif text-lg font-black text-slate-900 uppercase">ENABLE CREATOR ACCESS</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Activate affiliate configurations on this account to earn referral credit codes.
                    </p>
                  </div>

                  <form onSubmit={enableAffiliate} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-1.5">
                        Choose Referral Username Reference Key
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="srijon"
                        value={affRefName}
                        onChange={(e) => setAffRefName(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-mono lowercase"
                      />
                    </div>

                    {errorMsg && (
                      <div className="text-red-500 text-xs font-semibold bg-red-50 border border-red-200 rounded-xl p-3.5">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary py-3.5 text-xs font-bold tracking-widest text-slate-900 hover:bg-primary/80 transition shadow-md shadow-primary/10"
                    >
                      ACTIVATE PROFILE
                    </button>
                  </form>
                </div>
              ) : (
                /* Active Affiliate Profile Panels */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Referral details (Left) */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Share widgets */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
                      <div>
                        <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-2">
                          YOUR REFERRAL CAMPAIGN LINK
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${siteOrigin}/?ref=${affProfile?.username}`}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 outline-none"
                          />
                          <button
                            onClick={() => copyToClipboard(`${siteOrigin}/?ref=${affProfile?.username}`, 'link')}
                            className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-lg text-slate-700 transition"
                            title="Copy link"
                          >
                            {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-2">
                          YOUR SCENT DISCOUNT COUPON
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={affProfile?.couponCode}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 font-bold uppercase tracking-wider outline-none"
                          />
                          <button
                            onClick={() => copyToClipboard(affProfile?.couponCode, 'coupon')}
                            className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-lg text-slate-700 transition"
                            title="Copy coupon"
                          >
                            {copiedCoupon ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Referrals lists */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                      <h4 className="font-serif text-base tracking-wider text-slate-900 border-b border-slate-100 pb-3 mb-4 font-black flex items-center gap-2 uppercase">
                        <Users className="h-4.5 w-4.5 text-primary" /> REFERRAL ORDERS HISTORY
                      </h4>

                      {referralsList.length === 0 ? (
                        <div className="text-slate-400 text-xs py-8 text-center font-medium">
                          No orders tracked under your campaign link yet. Share links to start earning!
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase font-mono">
                                <th className="pb-3">Order Number</th>
                                <th className="pb-3">Date</th>
                                <th className="pb-3">Customer</th>
                                <th className="pb-3 text-right">Price</th>
                                <th className="pb-3 text-right text-primary">Points Earned</th>
                              </tr>
                            </thead>
                            <tbody>
                              {referralsList.map((refOrder) => (
                                <tr key={refOrder._id} className="border-b border-slate-50 hover:bg-slate-50/50 text-slate-750">
                                  <td className="py-3 font-mono text-[11px]">{refOrder.orderNumber}</td>
                                  <td className="py-3">{new Date(refOrder.createdAt).toLocaleDateString()}</td>
                                  <td className="py-3 font-semibold">{refOrder.customerName}</td>
                                  <td className="py-3 text-right font-mono">{refOrder.totalPrice.toFixed(2)} BDT</td>
                                  <td className="py-3 text-right font-mono font-bold text-primary">
                                    +{Math.round(refOrder.subtotal * 0.10)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Points & permanent guest binds (Right) */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Points Box */}
                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl text-center shadow-sm">
                      <Gift className="h-10 w-10 text-primary mx-auto mb-3" />
                      <span className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">
                        ACTIVE LOYALTY BALANCE
                      </span>
                      <div className="text-3xl font-bold text-primary font-mono mt-2 mb-1">
                        {currentUser?.pointsBalance || 0}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Valued at: {((currentUser?.pointsBalance || 0) / 10).toFixed(2)} BDT store credit
                      </span>
                    </div>

                    {/* Permanent Guest Binds */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                      <h4 className="font-serif text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between uppercase">
                        <span>LIFETIME GUEST BINDS</span>
                        <span title="These guests automatically credit your account on future orders, bypassing cookies.">
                          <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                        </span>
                      </h4>

                      {affProfile?.permanentGuestBinds?.length === 0 ? (
                        <div className="text-slate-450 text-[11px] py-4 text-center font-medium">
                          No lifetime devices bound yet. Placed orders using your referral links bind guest details for life.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {affProfile?.permanentGuestBinds?.map((bind: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-750">
                              <div className="font-semibold text-slate-800 truncate">{bind.email}</div>
                              <div className="flex justify-between items-center text-[10px] text-slate-450 mt-1 font-mono">
                                <span>Phone: {bind.phone}</span>
                                <span>Bound: {new Date(bind.boundAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fraud notice */}
                    <div className="bg-red-50/50 border border-red-200/65 p-4 rounded-2xl flex items-start gap-2.5 text-slate-500 text-[10px] leading-relaxed shadow-sm">
                      <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-800 font-mono">SELF-REFERRAL SHIELD ACTIVE</span>
                        <p className="mt-0.5 font-light">
                          Order metrics match login profiles or IP overlays automatically discard referral points balances. Creator code points logic generates only on genuine guest transactions.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <footer className="bg-[#FAF8F5] border-t border-[#EAE5DB] py-8 text-center text-xs text-slate-400 font-mono mt-16">
        <p>© 2026 ALWEEN FRAGRANCE. ALL RIGHTS RESERVED. SECURE DECOUPLED MERN CLIENT ENGINE.</p>
      </footer>

      {/* Slide-out Checkout Drawer */}
      <CheckoutDrawer />
    </div>
  );
}
