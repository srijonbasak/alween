'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { 
  Settings, Database, Users, Plus, Trash2, Edit, AlertCircle, Save, 
  Loader2, LogOut, CheckCircle, ClipboardList, Tag, ExternalLink, Check, Eye
} from 'lucide-react';

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
  type: 'single' | 'combo';
  comboBottleCount?: number;
  comboBottleSizeMl?: number;
  comboPerfumes?: any[];
  price6ml?: number;
  price10ml?: number;
  price15ml?: number;
  price30ml?: number;
  price50ml?: number;
}

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountCap?: number;
  expirationDate?: string;
  appliesToType: 'all' | 'specific';
  applicableProducts: any[];
  isActive: boolean;
  createdAt: string;
}

interface OrderItem {
  _id: string;
  perfumeId: {
    _id: string;
    name: string;
    imageUrls: string[];
  } | null;
  name: string;
  selectedSizeMl: number;
  quantity: number;
  internalFormulaKey: string;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: {
    formattedAddress?: string;
    street?: string;
    city?: string;
    postalCode?: string;
  };
  geolocationAccuracy?: number;
  items: OrderItem[];
  subtotal: number;
  discountApplied: number;
  shippingFee: number;
  totalPrice: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  orderStatus: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Tab Control
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'settings' | 'affiliates'>('products');

  // Master Scent Catalog
  const [perfumesList, setPerfumesList] = useState<Perfume[]>([]);
  const [singlePerfumesOnly, setSinglePerfumesOnly] = useState<Perfume[]>([]); // For checkboxes
  
  // Product Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [productType, setProductType] = useState<'single' | 'combo'>('single');
  const [name, setName] = useState('');
  const [internalFormulaKey, setInternalFormulaKey] = useState('');
  const [description, setDescription] = useState('');
  const [vimeoUrl, setVimeoUrl] = useState('');
  const [volumeMl, setVolumeMl] = useState(5000);
  const [thresholdMl, setThresholdMl] = useState(1000);
  const [lossFactor, setLossFactor] = useState(0.03);
  const [pricePerMl, setPricePerMl] = useState(50);
  const [price6ml, setPrice6ml] = useState<number>(0);
  const [price10ml, setPrice10ml] = useState<number>(0);
  const [price15ml, setPrice15ml] = useState<number>(0);
  const [price30ml, setPrice30ml] = useState<number>(0);
  const [price50ml, setPrice50ml] = useState<number>(0);
  const [isExcluded, setIsExcluded] = useState(false);
  const [topNotes, setTopNotes] = useState('');
  const [heartNotes, setHeartNotes] = useState('');
  const [baseNotes, setBaseNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Custom Combo specific form states
  const [comboBottleCount, setComboBottleCount] = useState<number>(3);
  const [comboBottleSizeMl, setComboBottleSizeMl] = useState<number>(10);
  const [comboSelectedPerfumeIds, setComboSelectedPerfumeIds] = useState<string[]>([]);

  // Orders Manager states
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string>('');

  // Coupon Manager states
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponDiscountValue, setCouponDiscountValue] = useState<number>(20);
  const [couponMaxDiscountCap, setCouponMaxDiscountCap] = useState<number>(0);
  const [couponExpirationDate, setCouponExpirationDate] = useState('');
  const [couponAppliesTo, setCouponAppliesTo] = useState<'all' | 'specific'>('all');
  const [couponSelectedProductIds, setCouponSelectedProductIds] = useState<string[]>([]);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  // Configuration Variables
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(true);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);
  const [shippingFee, setShippingFee] = useState(100);
  const [shippingFeeInsideDhaka, setShippingFeeInsideDhaka] = useState(60);
  const [shippingFeeOutsideDhaka, setShippingFeeOutsideDhaka] = useState(120);
  const [pointsValuation, setPointsValuation] = useState(10);

  // Affiliates Campaign list
  const [affiliatesList, setAffiliatesList] = useState<any[]>([]);

  // Action feedback status
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [submittingConfig, setSubmittingConfig] = useState(false);

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const user = await res.json();
        if (user.role === 'admin') {
          setIsAdmin(true);
          fetchAdminData();
        }
      }
    } catch (e) {
      console.log('Admin session check bypassed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = () => {
    fetchPerfumes();
    fetchOrders();
    fetchCoupons();
    fetchConfigs();
    fetchAffiliates();
  };

  const fetchPerfumes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/perfumes');
      if (res.ok) {
        const data = await res.json();
        setPerfumesList(data);
        
        // Filter single perfumes only to be referenced inside pre-made combos selection
        const singles = data.filter((p: any) => p.type === 'single' || !p.type);
        setSinglePerfumesOnly(singles);
      }
    } catch (e) { console.error('Failed fetching perfumes catalog:', e); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrdersList(data);
      }
    } catch (e) { console.error('Failed fetching orders manager list:', e); }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/coupons', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCouponsList(data);
      }
    } catch (e) { console.error('Failed fetching coupon records:', e); }
  };

  const fetchConfigs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/config');
      if (res.ok) {
        const config = await res.json();
        setFreeShippingEnabled(config.isFreeDeliveryEnabled);
        setFreeShippingThreshold(config.freeDeliveryThreshold);
        setShippingFee(config.shippingFee);
        setShippingFeeInsideDhaka(config.shippingFeeInsideDhaka ?? 60);
        setShippingFeeOutsideDhaka(config.shippingFeeOutsideDhaka ?? 120);
        setPointsValuation(config.pointsToDiscountRate);
      }
    } catch (e) { console.error('Failed fetching logistics variables:', e); }
  };

  const fetchAffiliates = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/affiliates', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAffiliatesList(data);
      }
    } catch (e) { console.error('Failed fetching creator campaigns:', e); }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Authentication failed.');
      if (data.user.role !== 'admin') throw new Error('Administrator privileges required.');

      setIsAdmin(true);
      fetchAdminData();
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleAdminLogout = async () => {
    await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' });
    setIsAdmin(false);
  };

  // Product CRUD
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setSubmittingProduct(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('internalFormulaKey', internalFormulaKey);
    formData.append('description', description);
    formData.append('vimeoUrl', vimeoUrl);
    formData.append('current_volume_ml', (productType === 'combo' ? 0 : volumeMl).toString());
    formData.append('reorder_threshold_ml', (productType === 'combo' ? 0 : thresholdMl).toString());
    formData.append('loss_margin_factor', (productType === 'combo' ? 0.03 : lossFactor).toString());
    formData.append('pricePerMl', pricePerMl.toString());
    if (productType === 'single') {
      formData.append('price6ml', price6ml.toString());
      formData.append('price10ml', price10ml.toString());
      formData.append('price15ml', price15ml.toString());
      formData.append('price30ml', price30ml.toString());
      formData.append('price50ml', price50ml.toString());
    }
    formData.append('isExcludedFromDiscounts', isExcluded.toString());
    formData.append('topNotes', productType === 'combo' ? '' : topNotes);
    formData.append('heartNotes', productType === 'combo' ? '' : heartNotes);
    formData.append('baseNotes', productType === 'combo' ? '' : baseNotes);
    formData.append('type', productType);
    
    // Combo fields
    if (productType === 'combo') {
      formData.append('comboBottleCount', comboBottleCount.toString());
      formData.append('comboBottleSizeMl', comboBottleSizeMl.toString());
      formData.append('comboPerfumes', JSON.stringify(comboSelectedPerfumeIds));
    }

    if (isEditing) {
      formData.append('existingImageUrls', JSON.stringify(existingImages));
    }

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('images', selectedFiles[i]);
      }
    }

    try {
      const url = isEditing 
        ? `http://localhost:5000/api/perfumes/${editId}` 
        : 'http://localhost:5000/api/perfumes';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product.');

      setActionSuccess(isEditing ? 'Product details updated successfully.' : 'New product catalogued successfully.');
      resetProductForm();
      fetchPerfumes();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const startEditProduct = (perfume: Perfume) => {
    setIsEditing(true);
    setEditId(perfume._id);
    setName(perfume.name);
    setInternalFormulaKey(perfume.internalFormulaKey);
    setDescription(perfume.description);
    setVimeoUrl(perfume.vimeoUrl || '');
    setVolumeMl(perfume.current_volume_ml || 0);
    setThresholdMl(perfume.reorder_threshold_ml || 0);
    setLossFactor(perfume.loss_margin_factor || 0.03);
    setPricePerMl(perfume.pricePerMl);
    setPrice6ml(perfume.price6ml || 0);
    setPrice10ml(perfume.price10ml || 0);
    setPrice15ml(perfume.price15ml || 0);
    setPrice30ml(perfume.price30ml || 0);
    setPrice50ml(perfume.price50ml || 0);
    setIsExcluded(perfume.isExcludedFromDiscounts);
    setTopNotes(perfume.topNotes || '');
    setHeartNotes(perfume.heartNotes || '');
    setBaseNotes(perfume.baseNotes || '');
    setProductType(perfume.type || 'single');
    setExistingImages(perfume.imageUrls || []);
    
    if (perfume.type === 'combo') {
      setComboBottleCount(perfume.comboBottleCount || 3);
      setComboBottleSizeMl(perfume.comboBottleSizeMl || 10);
      setComboSelectedPerfumeIds(perfume.comboPerfumes?.map(p => typeof p === 'object' ? p._id : p) || []);
    } else {
      setComboSelectedPerfumeIds([]);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/perfumes/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      setActionSuccess('Product removed from database.');
      fetchPerfumes();
    } catch (e) {
      setActionError('Delete request failed.');
    }
  };

  const resetProductForm = () => {
    setIsEditing(false);
    setEditId('');
    setName('');
    setInternalFormulaKey('');
    setDescription('');
    setVimeoUrl('');
    setVolumeMl(5000);
    setThresholdMl(1000);
    setLossFactor(0.03);
    setPricePerMl(50);
    setPrice6ml(0);
    setPrice10ml(0);
    setPrice15ml(0);
    setPrice30ml(0);
    setPrice50ml(0);
    setIsExcluded(false);
    setTopNotes('');
    setHeartNotes('');
    setBaseNotes('');
    setSelectedFiles(null);
    setProductType('single');
    setExistingImages([]);
    setComboBottleCount(3);
    setComboBottleSizeMl(10);
    setComboSelectedPerfumeIds([]);
  };

  // Order Operations
  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus, paymentStatus }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status.');
      setActionSuccess(`Order #${data.orderNumber} successfully updated.`);
      fetchOrders();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setUpdatingOrderId('');
    }
  };

  // Coupon creation
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setSubmittingCoupon(true);

    try {
      const res = await fetch('http://localhost:5000/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          discountType: couponDiscountType,
          discountValue: couponDiscountValue,
          maxDiscountCap: couponMaxDiscountCap,
          expirationDate: couponExpirationDate || undefined,
          appliesToType: couponAppliesTo,
          applicableProducts: couponAppliesTo === 'specific' ? couponSelectedProductIds : []
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create coupon code.');

      setActionSuccess(`Coupon code ${data.code} successfully created.`);
      setCouponCode('');
      setCouponDiscountValue(20);
      setCouponMaxDiscountCap(0);
      setCouponExpirationDate('');
      setCouponAppliesTo('all');
      setCouponSelectedProductIds([]);
      fetchCoupons();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon code?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      setActionSuccess('Coupon deleted.');
      fetchCoupons();
    } catch (e) {
      setActionError('Delete coupon request failed.');
    }
  };

  // Config settings
  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setSubmittingConfig(true);

    try {
      const res = await fetch('http://localhost:5000/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFreeDeliveryEnabled: freeShippingEnabled,
          freeDeliveryThreshold: freeShippingThreshold,
          shippingFee,
          shippingFeeInsideDhaka,
          shippingFeeOutsideDhaka,
          pointsToDiscountRate: pointsValuation
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update system variables.');

      setActionSuccess('Store configurations saved successfully.');
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmittingConfig(false);
    }
  };

  const toggleProductInComboSelection = (id: string) => {
    setComboSelectedPerfumeIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleProductInCouponSelection = (id: string) => {
    setCouponSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-slate-800">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl bg-white border border-[#EAE5DB] rounded-2xl shadow-sm overflow-hidden">
          
          {/* Dashboard Header Bar */}
          <div className="bg-[#FAF8F5] border-b border-[#EAE5DB] px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-sans text-2xl font-black tracking-wide text-slate-900">
                ADMINISTRATION DASHBOARD
              </h1>
              <p className="text-slate-500 text-xs font-light mt-0.5">
                Manage inventory catalog, validate custom coupon codes, check customer orders, and audit affiliate earnings.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-2 text-[10px] text-red-650 font-bold bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg transition"
              >
                <LogOut className="h-3.5 w-3.5" /> SIGN OUT
              </button>
            )}
          </div>

          {!isAdmin ? (
            /* Secure Access Gate login form */
            <div className="py-20 flex justify-center items-center">
              <div className="w-full max-w-md bg-white border border-[#EAE5DB] rounded-2xl p-8 shadow-sm">
                <h3 className="font-sans text-sm font-bold text-slate-800 mb-6 text-center uppercase tracking-widest border-b border-[#EAE5DB] pb-3">
                  ADMINISTRATIVE CREDENTIALS
                </h3>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@alweenfragrance.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                      Password Code
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-800"
                    />
                  </div>
                  {authError && (
                    <div className="text-red-650 text-xs font-semibold bg-red-50 border border-red-200 rounded-lg p-3">
                      {authError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary py-3 text-xs font-bold text-slate-900 hover:bg-primary/80 transition"
                  >
                    AUTHENTICATE GATEWAY
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Dashboard Grid with Side-menu Tabs */
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
              
              {/* Left Sidebar Menu */}
              <div className="lg:col-span-2 border-r border-[#EAE5DB] bg-[#FAF8F5] p-4 flex flex-col gap-1.5 font-sans">
                <button
                  onClick={() => { setActiveTab('products'); resetProductForm(); }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                    activeTab === 'products' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  <Database className="h-4 w-4" /> PRODUCTS
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                    activeTab === 'orders' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  <ClipboardList className="h-4 w-4" /> CUSTOMER ORDERS
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                    activeTab === 'coupons' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  <Tag className="h-4 w-4" /> COUPON SYSTEM
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                    activeTab === 'settings' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  <Settings className="h-4 w-4" /> SYSTEM SETTINGS
                </button>
                <button
                  onClick={() => setActiveTab('affiliates')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                    activeTab === 'affiliates' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  <Users className="h-4 w-4" /> AFFILIATES HUB
                </button>
              </div>

              {/* Right Panel Content */}
              <div className="lg:col-span-10 p-6 space-y-6">
                
                {/* Feedback banners */}
                {actionSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> {actionSuccess}
                  </div>
                )}
                {actionError && (
                  <div className="bg-red-50 border border-red-200 text-red-750 rounded-xl p-4 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" /> {actionError}
                  </div>
                )}

                {/* TAB 1: PRODUCTS INVENTORY */}
                {activeTab === 'products' && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* Add/Edit Product form (Left card) */}
                    <form onSubmit={handleProductSubmit} className="xl:col-span-5 bg-white border border-[#EAE5DB] p-5 rounded-xl space-y-4 text-slate-800">
                      <h3 className="font-sans text-xs font-black tracking-widest text-slate-900 uppercase border-b border-slate-200 pb-2 mb-2 flex items-center justify-between">
                        <span>{isEditing ? 'EDIT CATALOG ENTRY' : 'ADD NEW CATALOG ENTRY'}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded font-normal uppercase">
                          {productType}
                        </span>
                      </h3>

                      {/* Selector type for new entries only */}
                      {!isEditing && (
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Product Type
                          </label>
                          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => setProductType('single')}
                              className={`flex-1 py-1.5 text-[10px] font-bold tracking-wider rounded-md transition uppercase ${
                                productType === 'single' ? 'bg-white text-slate-900 shadow-sm border border-[#EAE5DB]' : 'text-slate-500'
                              }`}
                            >
                              Single Scent
                            </button>
                            <button
                              type="button"
                              onClick={() => { setProductType('combo'); setPricePerMl(1500); }}
                              className={`flex-1 py-1.5 text-[10px] font-bold tracking-wider rounded-md transition uppercase ${
                                productType === 'combo' ? 'bg-white text-slate-900 shadow-sm border border-[#EAE5DB]' : 'text-slate-500'
                              }`}
                            >
                              Pre-made Combo
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                            Name / Label
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={productType === 'single' ? 'Creed Aventus' : 'Discovery Combo'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary text-slate-800 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                            SKU Code
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={productType === 'single' ? 'ST-AVENTUS' : 'CB-DISCOVER-01'}
                            value={internalFormulaKey}
                            onChange={(e) => setInternalFormulaKey(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary font-mono uppercase text-slate-800 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                          Fragrance Description & Items
                        </label>
                        <textarea
                          required
                          rows={2}
                          placeholder="A brief marketing explanation or package listing of items included..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary text-slate-800 font-light"
                        />
                      </div>

                      {/* Single Scent fields */}
                      {productType === 'single' && (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                Stock (ml)
                              </label>
                              <input
                                type="number"
                                required
                                value={volumeMl}
                                onChange={(e) => setVolumeMl(Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-slate-800 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                Warning (ml)
                              </label>
                              <input
                                type="number"
                                required
                                value={thresholdMl}
                                onChange={(e) => setThresholdMl(Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-slate-800 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                Price/ml (BDT)
                              </label>
                              <input
                                type="number"
                                required
                                value={pricePerMl}
                                onChange={(e) => setPricePerMl(Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-slate-800 font-mono"
                              />
                            </div>
                          </div>

                          <div className="border border-slate-200 rounded-lg p-2.5 space-y-2 bg-[#FAF8F5]">
                            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                              Variant Specific Pricing BDT (Optional - fallback to Price/ml if 0)
                            </span>
                            <div className="grid grid-cols-5 gap-1.5">
                              <div>
                                <label className="block text-[8px] text-slate-400 font-mono uppercase mb-0.5 text-center">6ml</label>
                                <input
                                  type="number"
                                  value={price6ml}
                                  onChange={(e) => setPrice6ml(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-[10px] focus:outline-none text-slate-800 font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] text-slate-400 font-mono uppercase mb-0.5 text-center">10ml</label>
                                <input
                                  type="number"
                                  value={price10ml}
                                  onChange={(e) => setPrice10ml(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-[10px] focus:outline-none text-slate-800 font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] text-slate-400 font-mono uppercase mb-0.5 text-center">15ml</label>
                                <input
                                  type="number"
                                  value={price15ml}
                                  onChange={(e) => setPrice15ml(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-[10px] focus:outline-none text-slate-800 font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] text-slate-400 font-mono uppercase mb-0.5 text-center">30ml</label>
                                <input
                                  type="number"
                                  value={price30ml}
                                  onChange={(e) => setPrice30ml(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-[10px] focus:outline-none text-slate-800 font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] text-slate-400 font-mono uppercase mb-0.5 text-center">50ml</label>
                                <input
                                  type="number"
                                  value={price50ml}
                                  onChange={(e) => setPrice50ml(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-[10px] focus:outline-none text-slate-800 font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                Top Notes
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Bergamot, Pineapple"
                                value={topNotes}
                                onChange={(e) => setTopNotes(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                Heart Notes
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Birch, Rose, Jasmine"
                                value={heartNotes}
                                onChange={(e) => setHeartNotes(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                Base Notes
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Oakmoss, Musk, Amber"
                                value={baseNotes}
                                onChange={(e) => setBaseNotes(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none text-slate-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                              Vimeo Video URL (Optional)
                            </label>
                            <input
                              type="url"
                              placeholder="https://vimeo.com/..."
                              value={vimeoUrl}
                              onChange={(e) => setVimeoUrl(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-slate-800"
                            />
                          </div>
                        </>
                      )}

                      {/* Combo Box fields */}
                      {productType === 'combo' && (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                Bottle Count
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                max="10"
                                value={comboBottleCount}
                                onChange={(e) => setComboBottleCount(Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-slate-800 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                Bottle Size (ml)
                              </label>
                              <select
                                value={comboBottleSizeMl}
                                onChange={(e) => setComboBottleSizeMl(Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none text-slate-800"
                              >
                                <option value={6}>6 ml decant</option>
                                <option value={10}>10 ml decant</option>
                                <option value={15}>15 ml decant</option>
                                <option value={30}>30 ml decant</option>
                                <option value={50}>50 ml decant</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                Flat Combo Price
                              </label>
                              <input
                                type="number"
                                required
                                value={pricePerMl}
                                onChange={(e) => setPricePerMl(Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-slate-800 font-mono"
                              />
                            </div>
                          </div>

                          {/* Checkboxes of included perfumes in this combo */}
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                              Select Included Scent Decants
                            </label>
                            <div className="max-h-24 overflow-y-auto border border-slate-300 rounded-lg p-2.5 space-y-1.5 bg-slate-55 text-xs">
                              {singlePerfumesOnly.map(perf => (
                                <label key={perf._id} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={comboSelectedPerfumeIds.includes(perf._id)}
                                    onChange={() => toggleProductInComboSelection(perf._id)}
                                    className="h-3.5 w-3.5 text-primary rounded"
                                  />
                                  <span>{perf.name} ({perf.internalFormulaKey})</span>
                                </label>
                              ))}
                              {singlePerfumesOnly.length === 0 && (
                                <span className="text-[10px] text-slate-400">No single perfumes available to select.</span>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Exclusion flag */}
                      <label className="flex items-center gap-2 cursor-pointer select-none text-[10px] font-semibold text-slate-700 border border-slate-200 p-2 rounded-lg bg-slate-50">
                        <input
                          type="checkbox"
                          checked={isExcluded}
                          onChange={(e) => setIsExcluded(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-primary accent-primary"
                        />
                        <span>Exclude product from coupon code discounts</span>
                      </label>

                      {/* Image List handling */}
                      {isEditing && existingImages.length > 0 && (
                        <div className="border-t border-slate-200 pt-3">
                          <span className="block text-[9px] font-bold text-slate-500 uppercase mb-2 font-mono">
                            Current Files ({existingImages.length}) - Hover & click Trash to delete:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {existingImages.map((url, idx) => (
                              <div key={idx} className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                                <img src={url} alt="" className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg"
                                  title="Delete Image"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* File upload input */}
                      <div className="border-t border-slate-200 pt-3">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                          {productType === 'single' ? 'Upload Single Scent Image' : 'Upload Scent Combo Images (Multiple allowed)'}
                        </label>
                        <input
                          type="file"
                          multiple={productType === 'combo'}
                          accept="image/*"
                          onChange={(e) => setSelectedFiles(e.target.files)}
                          className="w-full text-[10px] text-slate-500 file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                        />
                        <span className="block text-[8px] text-slate-400 mt-1 font-mono">
                          {productType === 'single' ? 'Select 1 photo' : 'Select 1 or more photos'}
                        </span>
                      </div>

                      {/* Submit / Cancel Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={submittingProduct}
                          className="flex-1 rounded-lg bg-primary py-2.5 text-xs font-bold text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-1.5"
                        >
                          {submittingProduct ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5" /> SAVE PRODUCT
                            </>
                          )}
                        </button>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={resetProductForm}
                            className="border border-slate-300 bg-white px-3 py-2 rounded-lg text-xs text-slate-650 hover:bg-slate-100"
                          >
                            CANCEL
                          </button>
                        )}
                      </div>
                    </form>

                    {/* Products list table (Right side card) */}
                    <div className="xl:col-span-7 bg-white border border-[#EAE5DB] p-5 rounded-xl space-y-4">
                      <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase border-b border-slate-200 pb-2 mb-2">
                        PRODUCT INVENTORY CATALOG ({perfumesList.length})
                      </h3>

                      {perfumesList.length === 0 ? (
                        <div className="text-slate-400 text-xs py-16 text-center flex flex-col items-center justify-center">
                          <Database className="h-8 w-8 text-slate-300 mb-2" />
                          <span>No products are currently saved in the database.</span>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase font-mono tracking-wider text-[9px]">
                                <th className="pb-3">Images</th>
                                <th className="pb-3">Name / Label</th>
                                <th className="pb-3">Type</th>
                                <th className="pb-3">SKU Code</th>
                                <th className="pb-3 text-right">Price</th>
                                <th className="pb-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {perfumesList.map((perfume) => (
                                <tr key={perfume._id} className="border-b border-slate-150 hover:bg-slate-50 text-slate-700 transition">
                                  <td className="py-2.5">
                                    <div className="flex gap-1 max-w-[100px] overflow-x-auto">
                                      {(perfume.imageUrls || []).map((url, i) => (
                                        <div key={i} className="h-9 w-9 rounded overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                          <img src={url} alt="" className="h-full w-full object-cover" />
                                        </div>
                                      ))}
                                      {(!perfume.imageUrls || perfume.imageUrls.length === 0) && (
                                        <span className="text-[10px] text-slate-400 font-mono">none</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2.5">
                                    <span className="font-bold text-slate-800">{perfume.name}</span>
                                    {perfume.isExcludedFromDiscounts && (
                                      <span className="ml-1.5 bg-red-50 text-red-650 border border-red-150 text-[7px] font-bold tracking-widest px-1 py-0.5 rounded uppercase">
                                        No discount
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 uppercase font-semibold text-[10px] text-slate-500">
                                    {perfume.type === 'combo' ? 'Combo' : 'Single'}
                                  </td>
                                  <td className="py-2.5 font-mono text-[10px] font-bold text-slate-650">{perfume.internalFormulaKey}</td>
                                  <td className="py-2.5 text-right font-mono font-bold">
                                    {perfume.type === 'combo' ? (
                                      <span>{perfume.pricePerMl} BDT</span>
                                    ) : (
                                      <span>{perfume.pricePerMl} BDT/ml</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 text-right space-x-1 shrink-0">
                                    <button
                                      onClick={() => startEditProduct(perfume)}
                                      className="p-1 border border-slate-300 rounded bg-[#FAF9F6] text-slate-500 hover:text-slate-850 hover:bg-slate-100 transition"
                                      title="Edit details"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteProduct(perfume._id)}
                                      className="p-1 border border-red-200 rounded bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 transition"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: ORDER MANAGER */}
                {activeTab === 'orders' && (
                  <div className="bg-white border border-[#EAE5DB] p-5 rounded-xl space-y-4">
                    <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase border-b border-slate-200 pb-2">
                      ORDER FULFILLMENT & PICKING LOGS ({ordersList.length})
                    </h3>

                    {ordersList.length === 0 ? (
                      <div className="text-slate-400 text-xs py-20 text-center flex flex-col items-center justify-center">
                        <ClipboardList className="h-10 w-10 text-slate-300 mb-2" />
                        <span>No customer orders are logged in the database yet.</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-450 font-bold uppercase font-mono tracking-wider text-[9px] pb-3">
                              <th className="pb-3 text-left">Order #</th>
                              <th className="pb-3">Customer Details</th>
                              <th className="pb-3">Shipping Address</th>
                              <th className="pb-3">Basket Items</th>
                              <th className="pb-3 text-right">Totals</th>
                              <th className="pb-3 text-center">Payment Status</th>
                              <th className="pb-3 text-right">Fulfillment Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ordersList.map((order) => (
                              <tr key={order._id} className="border-b border-slate-150 hover:bg-slate-50 transition text-slate-700">
                                <td className="py-4 font-mono font-bold text-slate-800 text-[11px] align-top pr-2">
                                  <div className="flex flex-col gap-1">
                                    <span>{order.orderNumber}</span>
                                    <a
                                      href={`http://localhost:5000/invoices/${order.orderNumber}.pdf`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[9px] text-primary font-bold hover:underline"
                                    >
                                      INVOICE PDF <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  </div>
                                </td>
                                <td className="py-4 align-top pr-3">
                                  <span className="font-bold text-slate-800">{order.customerName}</span>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{order.customerPhone}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{order.customerEmail}</div>
                                </td>
                                <td className="py-4 align-top text-[11px] font-light max-w-xs pr-3">
                                  <span>{order.address?.formattedAddress || order.address?.street}</span>
                                  {(order.address?.city || order.address?.postalCode) && (
                                    <div className="text-slate-450 mt-0.5">
                                      {order.address.city} - {order.address.postalCode}
                                    </div>
                                  )}
                                </td>
                                <td className="py-4 align-top pr-3">
                                  <div className="space-y-1">
                                    {(order.items || []).map((item, index) => (
                                      <div key={index} className="text-[10px] bg-slate-50 border border-slate-150 p-1.5 rounded font-mono">
                                        <span className="font-bold text-slate-750">{item.name}</span>
                                        <div className="text-slate-405 flex justify-between gap-2 mt-0.5">
                                          <span>Qty: {item.quantity} × {item.selectedSizeMl}ml</span>
                                          <span className="font-semibold">{item.price * item.quantity} BDT</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-4 text-right font-mono align-top pr-2">
                                  <div className="text-[10px] text-slate-455 space-y-0.5">
                                    <div>Subtotal: {order.subtotal}</div>
                                    {order.discountApplied > 0 && <div className="text-red-500 font-semibold">-Disc: {order.discountApplied}</div>}
                                    <div>Ship: {order.shippingFee}</div>
                                    <div className="text-slate-900 font-black text-xs pt-1 border-t border-slate-100">
                                      {order.totalPrice} BDT
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 text-center align-top pr-2">
                                  <button
                                    onClick={() => handleUpdateOrderStatus(
                                      order._id, 
                                      order.orderStatus, 
                                      order.paymentStatus === 'success' ? 'pending' : 'success'
                                    )}
                                    disabled={updatingOrderId === order._id}
                                    className={`px-2.5 py-1 text-[9px] font-bold tracking-wider rounded font-mono border transition ${
                                      order.paymentStatus === 'success'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    {updatingOrderId === order._id ? (
                                      <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                                    ) : (
                                      order.paymentStatus.toUpperCase()
                                    )}
                                  </button>
                                </td>
                                <td className="py-4 text-right align-top">
                                  <select
                                    value={order.orderStatus || 'pending'}
                                    disabled={updatingOrderId === order._id}
                                    onChange={(e) => handleUpdateOrderStatus(
                                      order._id, 
                                      e.target.value, 
                                      order.paymentStatus
                                    )}
                                    className="bg-white border border-slate-300 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-primary text-slate-800 font-bold"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: COUPON SYSTEM */}
                {activeTab === 'coupons' && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* Create Coupon form */}
                    <form onSubmit={handleCouponSubmit} className="xl:col-span-5 bg-white border border-[#EAE5DB] p-5 rounded-xl space-y-4">
                      <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase border-b border-slate-200 pb-2 mb-2">
                        CREATE NEW DISCOUNT COUPON
                      </h3>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                          Coupon Code
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="SAVE20, OUD50, etc."
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary font-mono uppercase text-slate-800 font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Discount Type
                          </label>
                          <select
                            value={couponDiscountType}
                            onChange={(e: any) => setCouponDiscountType(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary text-slate-800 font-semibold"
                          >
                            <option value="percentage">Percentage %</option>
                            <option value="fixed">Fixed BDT Deduction</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Value
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={couponDiscountValue}
                            onChange={(e) => setCouponDiscountValue(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary text-slate-800 font-mono"
                          />
                        </div>
                      </div>

                      {/* Coupon Cap and Expiration Date */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                            Max Discount Cap BDT
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0 for Unlimited"
                            value={couponMaxDiscountCap}
                            onChange={(e) => setCouponMaxDiscountCap(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary text-slate-800 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                            Expiration Date
                          </label>
                          <input
                            type="date"
                            value={couponExpirationDate}
                            onChange={(e) => setCouponExpirationDate(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary text-slate-800 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                          Applicability Scope
                        </label>
                        <select
                          value={couponAppliesTo}
                          onChange={(e: any) => setCouponAppliesTo(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary text-slate-800 font-semibold"
                        >
                          <option value="all">Applies on All Products</option>
                          <option value="specific">Applies on Specific Products Only</option>
                        </select>
                      </div>

                      {/* Checklist showing perfumes & combos to apply coupon specifically */}
                      {couponAppliesTo === 'specific' && (
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                            Select Eligible Products
                          </label>
                          <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-2.5 space-y-1.5 bg-slate-50 text-xs">
                            {perfumesList.map(perf => (
                              <label key={perf._id} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={couponSelectedProductIds.includes(perf._id)}
                                  onChange={() => toggleProductInCouponSelection(perf._id)}
                                  className="h-3.5 w-3.5 text-primary rounded"
                                />
                                <span>{perf.name} ({perf.type === 'combo' ? 'Combo' : 'Single'})</span>
                              </label>
                            ))}
                            {perfumesList.length === 0 && (
                              <span className="text-[10px] text-slate-400">No products available in database.</span>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submittingCoupon}
                        className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-1.5"
                      >
                        {submittingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" /> SAVE COUPON
                          </>
                        )}
                      </button>
                    </form>

                    {/* Coupons list table */}
                    <div className="xl:col-span-7 bg-white border border-[#EAE5DB] p-5 rounded-xl space-y-4">
                      <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase border-b border-slate-200 pb-2 mb-2">
                        ACTIVE STORE COUPONS ({couponsList.length})
                      </h3>

                      {couponsList.length === 0 ? (
                        <div className="text-slate-400 text-xs py-16 text-center flex flex-col items-center justify-center">
                          <Tag className="h-8 w-8 text-slate-300 mb-2" />
                          <span>No coupons have been created for discount campaigns yet.</span>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase font-mono tracking-wider text-[9px] pb-3">
                                <th className="pb-3">Code</th>
                                <th className="pb-3">Discount Details</th>
                                <th className="pb-3">Applies To</th>
                                <th className="pb-3">Expiry</th>
                                <th className="pb-3 text-center">Status</th>
                                <th className="pb-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {couponsList.map((coupon) => (
                                <tr key={coupon._id} className="border-b border-slate-150 hover:bg-slate-50 transition text-slate-700">
                                  <td className="py-3 font-mono font-bold text-slate-800 text-[11px]">{coupon.code}</td>
                                  <td className="py-3">
                                    <span className="font-semibold text-slate-800">
                                      {coupon.discountType === 'percentage'
                                        ? `${coupon.discountValue}% Off`
                                        : `${coupon.discountValue} BDT Flat Off`}
                                    </span>
                                    {coupon.discountType === 'percentage' && coupon.maxDiscountCap && coupon.maxDiscountCap > 0 ? (
                                      <span className="block text-[9px] text-slate-450 font-mono mt-0.5">Max Cap: {coupon.maxDiscountCap} BDT</span>
                                    ) : null}
                                  </td>
                                  <td className="py-3">
                                    {coupon.appliesToType === 'all' ? (
                                      <span className="text-[10px] text-slate-450 uppercase font-mono">All Products</span>
                                    ) : (
                                      <div className="max-w-[150px] truncate text-[10px] font-mono text-slate-550">
                                        {(coupon.applicableProducts || []).map(p => p.name).join(', ')}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 font-mono text-[10px] text-slate-500">
                                    {coupon.expirationDate ? new Date(coupon.expirationDate).toLocaleDateString() : 'Never'}
                                  </td>
                                  <td className="py-3 text-center font-bold text-[10px]">
                                    <span className={`px-2 py-0.5 rounded-full ${coupon.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                      {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right">
                                    <button
                                      onClick={() => deleteCoupon(coupon._id)}
                                      className="p-1 border border-red-200 rounded bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 transition"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: STORE SETTINGS */}
                {activeTab === 'settings' && (
                  <div className="max-w-md mx-auto bg-white border border-[#EAE5DB] p-6 rounded-xl shadow-sm text-slate-800">
                    <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase border-b border-slate-200 pb-2 mb-6">
                      LOGISTICS & VALUATION CONFIGURATIONS
                    </h3>

                    <form onSubmit={handleConfigSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <span className="block text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                          Logistics Variables
                        </span>
                        
                        <div className="bg-[#FAF8F5] p-3 border border-slate-200 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-slate-805">Enable Free Delivery Threshold</span>
                            <p className="text-[9px] text-slate-400 mt-0.5 font-light">Cancels delivery shipping fees when basket totals match threshold.</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={freeShippingEnabled}
                            onChange={(e) => setFreeShippingEnabled(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-slate-350 text-primary accent-primary cursor-pointer"
                          />
                        </div>

                        {freeShippingEnabled && (
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 font-mono uppercase mb-1">
                              Free Delivery Minimum Threshold BDT
                            </label>
                            <input
                              type="number"
                              value={freeShippingThreshold}
                              onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800 font-mono"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[8px] font-bold text-slate-500 font-mono uppercase mb-1">
                            Standard Shipping Fee BDT (Fallback)
                          </label>
                          <input
                            type="number"
                            value={shippingFee}
                            onChange={(e) => setShippingFee(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800 font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 font-mono uppercase mb-1">
                              Inside Dhaka Shipping BDT
                            </label>
                            <input
                              type="number"
                              value={shippingFeeInsideDhaka}
                              onChange={(e) => setShippingFeeInsideDhaka(Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 font-mono uppercase mb-1">
                              Outside Dhaka Shipping BDT
                            </label>
                            <input
                              type="number"
                              value={shippingFeeOutsideDhaka}
                              onChange={(e) => setShippingFeeOutsideDhaka(Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 border-t border-slate-200 pt-5">
                        <div className="flex justify-between items-baseline">
                          <span className="block text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                            Loyalty Point Redemption
                          </span>
                          <span className="text-xs font-bold text-primary font-mono">{pointsValuation} Points = 1 BDT discount</span>
                        </div>
                        
                        <div className="bg-[#FAF8F5] p-4 border border-slate-200 rounded-lg">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={pointsValuation}
                            onChange={(e) => setPointsValuation(Number(e.target.value))}
                            className="w-full accent-primary bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-[7px] text-slate-400 mt-2 font-mono uppercase">
                            <span>1 Point = 1 BDT</span>
                            <span>100 Points = 1 BDT</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingConfig}
                        className="w-full rounded-lg bg-primary py-3 text-xs font-bold text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-1.5"
                      >
                        {submittingConfig ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" /> SAVE CONFIGURATIONS
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 5: AFFILIATE PROGRAM */}
                {activeTab === 'affiliates' && (
                  <div className="bg-white border border-[#EAE5DB] p-5 rounded-xl space-y-4">
                    <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase border-b border-slate-200 pb-2">
                      ACTIVE PARTNERS & CREATORS ({affiliatesList.length})
                    </h3>

                    {affiliatesList.length === 0 ? (
                      <div className="text-slate-400 text-xs py-16 text-center flex flex-col items-center justify-center">
                        <Users className="h-8 w-8 text-slate-350 mb-2" />
                        <span>No creators or partners are active under this brand yet.</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-405 font-bold uppercase font-mono tracking-wider text-[9px] pb-3">
                              <th className="pb-3">Affiliate Code</th>
                              <th className="pb-3">User Partner Name</th>
                              <th className="pb-3">Referral URL Key</th>
                              <th className="pb-3 text-right">Points Balance</th>
                              <th className="pb-3 text-right">Lifetime Guest Binds</th>
                            </tr>
                          </thead>
                          <tbody>
                            {affiliatesList.map((aff) => (
                              <tr key={aff._id} className="border-b border-slate-150 hover:bg-slate-50 text-slate-700 transition">
                                <td className="py-3 font-mono font-bold text-slate-800 text-[11px]">{aff.couponCode}</td>
                                <td className="py-3">
                                  <span className="font-bold text-slate-800">{aff.userId?.name || 'Customer'}</span>
                                  <div className="text-[10px] text-slate-405">{aff.userId?.email}</div>
                                </td>
                                <td className="py-3 font-mono text-primary text-[11px]">?ref={aff.username}</td>
                                <td className="py-3 text-right font-mono font-bold text-primary">{aff.pointsBalance}</td>
                                <td className="py-3 text-right font-mono font-semibold">{aff.permanentGuestBinds?.length || 0} binds</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-[#FAF8F5] border-t border-[#EAE5DB] py-8 text-center text-xs text-slate-400 font-mono mt-12">
        <p>© 2026 ALWEEN INC. ADMINISTRATIVE CONSOLE. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
