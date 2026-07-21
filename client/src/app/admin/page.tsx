'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { API_URL, safeParseResponse } from '../../lib/api';
import { 
  Settings, Database, Users, Plus, Trash2, Edit, AlertCircle, Save, 
  Loader2, LogOut, CheckCircle, ClipboardList, Tag, ExternalLink, Check, Eye,
  Layers, Package
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
  perfumeCategory?: 'inspired' | 'original';
  oilConcentration?: string;
  image6ml?: string;
  image10ml?: string;
  image15ml?: string;
  image30ml?: string;
  image50ml?: string;
  originalBottleImage?: string;
  packagingImage?: string;
  isFeatured?: boolean;
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
  const [activeTab, setActiveTab] = useState<'add-product' | 'single-scents' | 'scent-combos' | 'orders' | 'coupons' | 'settings' | 'affiliates' | 'admins'>('single-scents');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
  const [isFeatured, setIsFeatured] = useState(false);
  const [topNotes, setTopNotes] = useState('');
  const [heartNotes, setHeartNotes] = useState('');
  const [baseNotes, setBaseNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Custom Combo specific form states
  const [comboBottleCount, setComboBottleCount] = useState<number>(3);
  const [comboBottleSizeMl, setComboBottleSizeMl] = useState<number>(10);
  const [comboSelectedPerfumeIds, setComboSelectedPerfumeIds] = useState<string[]>([]);

  // Inspired vs Original form states
  const [perfumeCategory, setPerfumeCategory] = useState<'inspired' | 'original'>('inspired');
  const [oilConcentration, setOilConcentration] = useState('');
  
  // Specific size and other image upload states
  const [file6ml, setFile6ml] = useState<File | null>(null);
  const [file10ml, setFile10ml] = useState<File | null>(null);
  const [file15ml, setFile15ml] = useState<File | null>(null);
  const [file30ml, setFile30ml] = useState<File | null>(null);
  const [file50ml, setFile50ml] = useState<File | null>(null);
  const [fileOriginal, setFileOriginal] = useState<File | null>(null);
  const [filePackaging, setFilePackaging] = useState<File | null>(null);

  // Existing image URLs when editing
  const [image6ml, setImage6ml] = useState('');
  const [image10ml, setImage10ml] = useState('');
  const [image15ml, setImage15ml] = useState('');
  const [image30ml, setImage30ml] = useState('');
  const [image50ml, setImage50ml] = useState('');
  const [originalBottleImage, setOriginalBottleImage] = useState('');
  const [packagingImage, setPackagingImage] = useState('');

  // Admin Management form states
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPasswordVal, setNewAdminPasswordVal] = useState('');
  
  const [submittingNewAdmin, setSubmittingNewAdmin] = useState(false);
  const [submittingChangePassword, setSubmittingChangePassword] = useState(false);

  // Orders Manager states
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string>('');

  // Order CRUD states
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editOrderId, setEditOrderId] = useState('');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editCustomerEmail, setEditCustomerEmail] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPostalCode, setEditPostalCode] = useState('');
  const [editTotalPrice, setEditTotalPrice] = useState<number>(0);
  const [submittingOrderEdit, setSubmittingOrderEdit] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
  const [heroVimeoUrlsText, setHeroVimeoUrlsText] = useState('');

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
      const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
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
      const res = await fetch(`${API_URL}/api/perfumes`);
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
      const res = await fetch(`${API_URL}/api/orders`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrdersList(data);
      }
    } catch (e) { console.error('Failed fetching orders manager list:', e); }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_URL}/api/coupons`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCouponsList(data);
      }
    } catch (e) { console.error('Failed fetching coupon records:', e); }
  };

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/config`);
      if (res.ok) {
        const config = await res.json();
        setFreeShippingEnabled(config.isFreeDeliveryEnabled);
        setFreeShippingThreshold(config.freeDeliveryThreshold);
        setShippingFee(config.shippingFee);
        setShippingFeeInsideDhaka(config.shippingFeeInsideDhaka ?? 60);
        setShippingFeeOutsideDhaka(config.shippingFeeOutsideDhaka ?? 120);
        setPointsValuation(config.pointsToDiscountRate);
        setHeroVimeoUrlsText(config.heroVimeoUrls ? config.heroVimeoUrls.join('\n') : '');
      }
    } catch (e) { console.error('Failed fetching logistics variables:', e); }
  };

  const fetchAffiliates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/affiliates`, { credentials: 'include' });
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
      const res = await fetch(`${API_URL}/api/auth/login`, {
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
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setIsAdmin(false);
  };

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setSubmittingNewAdmin(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          phone: newAdminPhone,
          password: newAdminPassword
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin user.');

      setActionSuccess(`Admin user "${newAdminName}" added successfully.`);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPhone('');
      setNewAdminPassword('');
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmittingNewAdmin(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setSubmittingChangePassword(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentAdminPassword,
          newPassword: newAdminPasswordVal
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');

      setActionSuccess('Password updated successfully.');
      setCurrentAdminPassword('');
      setNewAdminPasswordVal('');
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmittingChangePassword(false);
    }
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
    formData.append('isFeatured', isFeatured.toString());
    formData.append('topNotes', productType === 'combo' ? '' : topNotes);
    formData.append('heartNotes', productType === 'combo' ? '' : heartNotes);
    formData.append('baseNotes', productType === 'combo' ? '' : baseNotes);
    formData.append('type', productType);
    formData.append('perfumeCategory', perfumeCategory);
    formData.append('oilConcentration', oilConcentration);
    
    // Combo fields
    if (productType === 'combo') {
      formData.append('comboBottleCount', comboBottleCount.toString());
      formData.append('comboBottleSizeMl', comboBottleSizeMl.toString());
      formData.append('comboPerfumes', JSON.stringify(comboSelectedPerfumeIds));
    }

    if (isEditing) {
      formData.append('existingImageUrls', JSON.stringify(existingImages));
      formData.append('image6ml_existing', image6ml);
      formData.append('image10ml_existing', image10ml);
      formData.append('image15ml_existing', image15ml);
      formData.append('image30ml_existing', image30ml);
      formData.append('image50ml_existing', image50ml);
      formData.append('originalBottleImage_existing', originalBottleImage);
      formData.append('packagingImage_existing', packagingImage);
    }

    if (file6ml) formData.append('image6ml', file6ml);
    if (file10ml) formData.append('image10ml', file10ml);
    if (file15ml) formData.append('image15ml', file15ml);
    if (file30ml) formData.append('image30ml', file30ml);
    if (file50ml) formData.append('image50ml', file50ml);
    if (fileOriginal) formData.append('originalBottleImage', fileOriginal);
    if (filePackaging) formData.append('packagingImage', filePackaging);

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('images', selectedFiles[i]);
      }
    }

    try {
      const url = isEditing 
        ? `${API_URL}/api/perfumes/${editId}` 
        : `${API_URL}/api/perfumes`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: 'include'
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { error: res.status === 401 ? 'Admin session expired. Please log in again.' : (text || 'Server error occurred.') };
      }

      if (!res.ok) throw new Error(data.error || 'Failed to save product.');

      setActionSuccess(isEditing ? 'Product details updated successfully.' : 'New product catalogued successfully.');
      const finalType = productType;
      resetProductForm();
      fetchPerfumes();
      setActiveTab(finalType === 'single' ? 'single-scents' : 'scent-combos');
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const startEditProduct = (perfume: Perfume) => {
    setIsEditing(true);
    setActiveTab('add-product');
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
    setIsFeatured(perfume.isFeatured || false);
    setTopNotes(perfume.topNotes || '');
    setHeartNotes(perfume.heartNotes || '');
    setBaseNotes(perfume.baseNotes || '');
    setProductType(perfume.type || 'single');
    setExistingImages(perfume.imageUrls || []);
    setPerfumeCategory(perfume.perfumeCategory || 'inspired');
    setOilConcentration(perfume.oilConcentration || '');
    setImage6ml(perfume.image6ml || '');
    setImage10ml(perfume.image10ml || '');
    setImage15ml(perfume.image15ml || '');
    setImage30ml(perfume.image30ml || '');
    setImage50ml(perfume.image50ml || '');
    setOriginalBottleImage(perfume.originalBottleImage || '');
    setPackagingImage(perfume.packagingImage || '');
    
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
      const res = await fetch(`${API_URL}/api/perfumes/${id}`, { method: 'DELETE', credentials: 'include' });
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
    setIsFeatured(false);
    setTopNotes('');
    setHeartNotes('');
    setBaseNotes('');
    setSelectedFiles(null);
    setProductType('single');
    setExistingImages([]);
    setComboBottleCount(3);
    setComboBottleSizeMl(10);
    setComboSelectedPerfumeIds([]);
    setPerfumeCategory('inspired');
    setOilConcentration('');
    setFile6ml(null);
    setFile10ml(null);
    setFile15ml(null);
    setFile30ml(null);
    setFile50ml(null);
    setFileOriginal(null);
    setFilePackaging(null);
    setImage6ml('');
    setImage10ml('');
    setImage15ml('');
    setImage30ml('');
    setImage50ml('');
    setOriginalBottleImage('');
    setPackagingImage('');
  };

  // Order Operations
  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
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

  const startEditOrder = (order: Order) => {
    setIsEditingOrder(true);
    setEditOrderId(order._id);
    setEditCustomerName(order.customerName);
    setEditCustomerPhone(order.customerPhone);
    setEditCustomerEmail(order.customerEmail);
    setEditStreet(order.address?.formattedAddress || order.address?.street || '');
    setEditCity(order.address?.city || '');
    setEditPostalCode(order.address?.postalCode || '');
    setEditTotalPrice(order.totalPrice);
  };

  const resetOrderEditForm = () => {
    setIsEditingOrder(false);
    setEditOrderId('');
    setEditCustomerName('');
    setEditCustomerPhone('');
    setEditCustomerEmail('');
    setEditStreet('');
    setEditCity('');
    setEditPostalCode('');
    setEditTotalPrice(0);
  };

  const handleEditOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setSubmittingOrderEdit(true);

    try {
      const res = await fetch(`${API_URL}/api/orders/${editOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: editCustomerName,
          customerPhone: editCustomerPhone,
          customerEmail: editCustomerEmail,
          totalPrice: editTotalPrice,
          address: {
            street: editStreet,
            formattedAddress: editStreet,
            city: editCity,
            postalCode: editPostalCode
          }
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order fields.');

      setActionSuccess(`Order details updated successfully.`);
      resetOrderEditForm();
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmittingOrderEdit(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to permanently delete this order?')) return;
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error();
      setActionSuccess('Order removed from database.');
      fetchOrders();
    } catch (e) {
      setActionError('Delete order request failed.');
    }
  };

  // Coupon creation
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setSubmittingCoupon(true);

    try {
      const res = await fetch(`${API_URL}/api/coupons`, {
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
      const res = await fetch(`${API_URL}/api/coupons/${id}`, { method: 'DELETE', credentials: 'include' });
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
      const res = await fetch(`${API_URL}/api/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFreeDeliveryEnabled: freeShippingEnabled,
          freeDeliveryThreshold: freeShippingThreshold,
          shippingFee,
          shippingFeeInsideDhaka,
          shippingFeeOutsideDhaka,
          pointsToDiscountRate: pointsValuation,
          heroVimeoUrls: heroVimeoUrlsText.split('\n').map(url => url.trim()).filter(url => !!url)
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

  const renderPerfumeTable = (type: 'single' | 'combo') => {
    const list = perfumesList.filter(p => p.type === type);
    const filtered = list.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.internalFormulaKey.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="bg-white border border-[#EAE5DB] p-5 rounded-xl space-y-4 text-slate-800 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-2 mb-2 gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase font-mono">
              {type === 'single' ? 'SINGLE SCENTS CATALOG' : 'SCENT COMBOS CATALOG'} ({list.length})
            </h3>
            
            {/* Grid / List View Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2 py-0.5 font-bold rounded transition uppercase text-[8px] tracking-wider ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2 py-0.5 font-bold rounded transition uppercase text-[8px] tracking-wider ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Grid
              </button>
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-primary text-slate-800 w-44 font-semibold font-mono"
          />
        </div>

        {list.length === 0 ? (
          <div className="text-slate-400 text-xs py-16 text-center flex flex-col items-center justify-center">
            <Database className="h-8 w-8 text-slate-300 mb-2" />
            <span>No entries found in this category.</span>
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase font-mono tracking-wider text-[9px] pb-3">
                  <th className="pb-3">Images</th>
                  <th className="pb-3">Name / Label</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">SKU Code</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((perfume) => (
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
                      {perfume.type}
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
                        className="p-1 border border-slate-300 rounded bg-[#FAF9F6] text-slate-500 hover:text-slate-850 hover:bg-slate-100 transition inline-block"
                        title="Edit details"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProduct(perfume._id)}
                        className="p-1 border border-red-200 rounded bg-red-50 text-red-500 hover:text-red-750 hover:bg-red-100 transition inline-block"
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((perfume) => (
              <div key={perfume._id} className="bg-white border border-[#EAE5DB] rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="h-40 w-full rounded-lg overflow-hidden bg-slate-50 border border-slate-150 mb-3 relative group">
                    {perfume.imageUrls && perfume.imageUrls.length > 0 ? (
                      <img src={perfume.imageUrls[0]} alt={perfume.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400 font-mono text-[9px]">
                        NO IMAGE
                      </div>
                    )}
                    {perfume.isExcludedFromDiscounts && (
                      <span className="absolute top-2 right-2 bg-red-50 text-red-650 border border-red-150 text-[7px] font-bold tracking-widest px-1 py-0.5 rounded uppercase">
                        No discount
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <h4 className="font-bold text-slate-800 text-xs truncate" title={perfume.name}>{perfume.name}</h4>
                    <span className="text-[9px] font-mono font-bold text-slate-400 block mt-0.5">{perfume.internalFormulaKey}</span>
                  </div>

                  <div className="text-[10px] text-slate-500 mb-3 space-y-0.5">
                    {perfume.perfumeCategory && (
                      <p><span className="font-bold text-slate-400">Class:</span> <span className="capitalize">{perfume.perfumeCategory}</span></p>
                    )}
                    {perfume.topNotes && (
                      <p className="truncate"><span className="font-bold text-slate-400">Notes:</span> {perfume.topNotes}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="font-mono font-black text-xs text-slate-900">
                    {perfume.type === 'combo' ? `${perfume.pricePerMl} BDT` : `${perfume.pricePerMl} BDT/ml`}
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditProduct(perfume)}
                      className="p-1 border border-slate-300 rounded bg-[#FAF9F6] text-slate-500 hover:text-slate-850 hover:bg-slate-100 transition inline-block"
                      title="Edit details"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(perfume._id)}
                      className="p-1 border border-red-200 rounded bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 transition inline-block"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] text-slate-800 w-full">
      {!isAdmin ? (
        /* Secure Access Gate login form */
        <div className="flex-1 py-20 flex justify-center items-center bg-[#FAF9F6]">
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
        /* Main Dashboard layout */
        <div className="flex flex-row w-full h-screen overflow-hidden bg-[#FAF9F6]">
          
          {/* Left Sidebar Menu */}
          <div className="w-64 border-r border-[#EAE5DB] bg-[#FAF8F5] p-5 flex flex-col gap-6 font-sans shrink-0 h-full overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-[#EAE5DB] pb-4">
              <img src="/logo.png" alt="Alween Logo" className="h-8 w-8 object-contain" />
              <div>
                <h2 className="text-xs font-black tracking-[0.15em] text-slate-900 uppercase leading-none">
                  ALWEEN LUXURY
                </h2>
                <span className="text-[7px] font-bold text-primary tracking-[0.2em] font-mono block mt-1 uppercase">ADMIN PORTAL</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setActiveTab('add-product'); resetProductForm(); setSearchQuery(''); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                  activeTab === 'add-product' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                }`}
              >
                <Plus className="h-4 w-4" /> ADD PRODUCT
              </button>
              <button
                onClick={() => { setActiveTab('single-scents'); setSearchQuery(''); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                  activeTab === 'single-scents' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                }`}
              >
                <Package className="h-4 w-4" /> SINGLE SCENTS
              </button>
              <button
                onClick={() => { setActiveTab('scent-combos'); setSearchQuery(''); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                  activeTab === 'scent-combos' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                }`}
              >
                <Layers className="h-4 w-4" /> SCENT COMBOS
              </button>
              <button
                onClick={() => { setActiveTab('orders'); setSearchQuery(''); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                  activeTab === 'orders' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                }`}
              >
                <ClipboardList className="h-4 w-4" /> CUSTOMER ORDERS
              </button>
              <button
                onClick={() => { setActiveTab('coupons'); setSearchQuery(''); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                  activeTab === 'coupons' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                }`}
              >
                <Tag className="h-4 w-4" /> COUPON SYSTEM
              </button>
              <button
                onClick={() => { setActiveTab('settings'); setSearchQuery(''); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                  activeTab === 'settings' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                }`}
              >
                <Settings className="h-4 w-4" /> SYSTEM SETTINGS
              </button>
              <button
                onClick={() => { setActiveTab('affiliates'); setSearchQuery(''); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                  activeTab === 'affiliates' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                }`}
              >
                <Users className="h-4 w-4" /> AFFILIATES HUB
              </button>
              <button
                onClick={() => { setActiveTab('admins'); setSearchQuery(''); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider transition flex items-center gap-2.5 ${
                  activeTab === 'admins' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-650 hover:bg-white hover:text-slate-800'
                }`}
              >
                <Users className="h-4 w-4" /> ADMINS
              </button>
            </div>
          </div>

          {/* Right Area (Header + Content) */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] h-full overflow-hidden">
            
            {/* Dashboard Header Bar */}
            <div className="bg-white border-b border-[#EAE5DB] px-8 py-5 flex justify-between items-center gap-4 shrink-0 font-sans">
              <div>
                <h1 className="font-sans text-sm font-black tracking-widest text-slate-900 uppercase">
                  {activeTab === 'add-product' && (isEditing ? 'Edit Catalog Entry' : 'Add Catalog Entry')}
                  {activeTab === 'single-scents' && 'Single Scents Inventory'}
                  {activeTab === 'scent-combos' && 'Scent Combos Inventory'}
                  {activeTab === 'orders' && 'Customer Orders'}
                  {activeTab === 'coupons' && 'Coupon System'}
                  {activeTab === 'settings' && 'System Settings'}
                  {activeTab === 'affiliates' && 'Affiliates Hub'}
                  {activeTab === 'admins' && 'Administrative Settings'}
                </h1>
                <span className="text-[9px] text-slate-400 mt-0.5 block font-mono font-bold tracking-wider">
                  ACTIVE MANAGEMENT VIEW
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <a
                  href="/"
                  className="flex items-center gap-2 text-[10px] text-slate-750 font-bold bg-white hover:bg-slate-100 border border-slate-300 px-4 py-2 rounded-lg transition"
                >
                  GO TO HOMEPAGE
                </a>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-2 text-[10px] text-red-650 font-bold bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg transition"
                >
                  <LogOut className="h-3.5 w-3.5" /> SIGN OUT
                </button>
              </div>
            </div>

            {/* Right Panel Content */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6">
                
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

                {/* TAB 1: ADD PRODUCT FORM */}
                {activeTab === 'add-product' && (
                  <div className="w-full bg-white border border-[#EAE5DB] p-6 rounded-xl shadow-sm text-slate-800">
                    <form onSubmit={handleProductSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* Left Column: Details & Pricing */}
                      <div className="space-y-4">
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
                            rows={3}
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

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                  Perfume Category
                                </label>
                                <select
                                  value={perfumeCategory}
                                  onChange={(e: any) => setPerfumeCategory(e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary text-slate-800 font-semibold"
                                >
                                  <option value="inspired">Inspired Creation</option>
                                  <option value="original">Original Masterpiece</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                  Oil Concentration
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. 30%"
                                  value={oilConcentration}
                                  onChange={(e) => setOilConcentration(e.target.value)}
                                  disabled={perfumeCategory === 'original'}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary text-slate-800 disabled:bg-slate-100"
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

                            <div className="grid grid-cols-3 gap-2">
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
                          </>
                        )}

                        {/* Combo Scent details */}
                        {productType === 'combo' && (
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                Bottle Count
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                max="12"
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
                        )}
                      </div>

                      {/* Right Column: Assets, Vimeo, Exclusions, and Uploads */}
                      <div className="space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                          
                          {/* Single Inspired Scent Size Images Upload */}
                          {productType === 'single' && perfumeCategory === 'inspired' && (
                            <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-[#FAF8F5]">
                              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                                Bottle & Packaging Images (Inspired Scent Only)
                              </span>
                              <div className="grid grid-cols-2 gap-3 text-[10px]">
                                <div>
                                  <label className="block text-slate-500 font-mono mb-1">6ml Bottle Image</label>
                                  <input
                                    type="file"
                                    onChange={(e) => setFile6ml(e.target.files?.[0] || null)}
                                    className="w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                  />
                                  {image6ml && (
                                    <div className="flex items-center justify-between mt-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                      <span className="text-[8px] text-emerald-700 font-medium truncate">6ml: {image6ml.split('/').pop()}</span>
                                      <button type="button" onClick={() => setImage6ml('')} className="text-red-500 hover:text-red-700 p-0.5">
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-slate-500 font-mono mb-1">10ml Bottle Image</label>
                                  <input
                                    type="file"
                                    onChange={(e) => setFile10ml(e.target.files?.[0] || null)}
                                    className="w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                  />
                                  {image10ml && (
                                    <div className="flex items-center justify-between mt-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                      <span className="text-[8px] text-emerald-700 font-medium truncate">10ml: {image10ml.split('/').pop()}</span>
                                      <button type="button" onClick={() => setImage10ml('')} className="text-red-500 hover:text-red-700 p-0.5">
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-slate-500 font-mono mb-1">15ml Bottle Image</label>
                                  <input
                                    type="file"
                                    onChange={(e) => setFile15ml(e.target.files?.[0] || null)}
                                    className="w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                  />
                                  {image15ml && (
                                    <div className="flex items-center justify-between mt-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                      <span className="text-[8px] text-emerald-700 font-medium truncate">15ml: {image15ml.split('/').pop()}</span>
                                      <button type="button" onClick={() => setImage15ml('')} className="text-red-500 hover:text-red-700 p-0.5">
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-slate-500 font-mono mb-1">30ml Bottle Image</label>
                                  <input
                                    type="file"
                                    onChange={(e) => setFile30ml(e.target.files?.[0] || null)}
                                    className="w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                  />
                                  {image30ml && (
                                    <div className="flex items-center justify-between mt-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                      <span className="text-[8px] text-emerald-700 font-medium truncate">30ml: {image30ml.split('/').pop()}</span>
                                      <button type="button" onClick={() => setImage30ml('')} className="text-red-500 hover:text-red-700 p-0.5">
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-slate-500 font-mono mb-1">50ml Bottle Image</label>
                                  <input
                                    type="file"
                                    onChange={(e) => setFile50ml(e.target.files?.[0] || null)}
                                    className="w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                  />
                                  {image50ml && (
                                    <div className="flex items-center justify-between mt-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                      <span className="text-[8px] text-emerald-700 font-medium truncate">50ml: {image50ml.split('/').pop()}</span>
                                      <button type="button" onClick={() => setImage50ml('')} className="text-red-500 hover:text-red-700 p-0.5">
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-slate-500 font-mono mb-1">Original Bottle Image</label>
                                  <input
                                    type="file"
                                    onChange={(e) => setFileOriginal(e.target.files?.[0] || null)}
                                    className="w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                  />
                                  {originalBottleImage && (
                                    <div className="flex items-center justify-between mt-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                      <span className="text-[8px] text-emerald-700 font-medium truncate">Original: {originalBottleImage.split('/').pop()}</span>
                                      <button type="button" onClick={() => setOriginalBottleImage('')} className="text-red-500 hover:text-red-700 p-0.5">
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="block text-slate-500 font-mono mb-1 text-[10px]">Packaging Image</label>
                                <input
                                  type="file"
                                  onChange={(e) => setFilePackaging(e.target.files?.[0] || null)}
                                  className="w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                />
                                {packagingImage && (
                                  <div className="flex items-center justify-between mt-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                    <span className="text-[8px] text-emerald-700 font-medium truncate">Packaging: {packagingImage.split('/').pop()}</span>
                                    <button type="button" onClick={() => setPackagingImage('')} className="text-red-500 hover:text-red-700 p-0.5">
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Vimeo Video URL (Single Scents only) */}
                          {productType === 'single' && (
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
                          )}

                          {/* Combo Scent: Select Included Scent Decants list box */}
                          {productType === 'combo' && (
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                                Select Included Scent Decants
                              </label>
                              <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-2.5 space-y-1.5 bg-slate-50 text-xs">
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
                          )}

                          {/* Exclusion & Feature check flags */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-[10px] font-semibold text-slate-700 border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                              <input
                                type="checkbox"
                                  checked={isExcluded}
                                  onChange={(e) => setIsExcluded(e.target.checked)}
                                  className="h-4 w-4 rounded border-slate-300 text-primary accent-primary"
                              />
                              <span>Exclude product from discounts</span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer select-none text-[10px] font-semibold text-slate-700 border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                              <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(e) => setIsFeatured(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-primary accent-primary"
                              />
                              <span>Feature in Hero Carousel slider</span>
                            </label>
                          </div>

                          {/* Existing Images preview (when editing) */}
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
                        </div>

                        {/* Submit / Cancel Buttons */}
                        <div className="flex gap-2 pt-4 border-t border-slate-150">
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
                              onClick={() => {
                                const finalType = productType;
                                resetProductForm();
                                setActiveTab(finalType === 'single' ? 'single-scents' : 'scent-combos');
                              }}
                              className="border border-slate-300 bg-white px-3 py-2 rounded-lg text-xs text-slate-650 hover:bg-slate-100"
                            >
                              CANCEL
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'single-scents' && (
                  <div className="w-full">
                    {renderPerfumeTable('single')}
                  </div>
                )}

                {activeTab === 'scent-combos' && (
                  <div className="w-full">
                    {renderPerfumeTable('combo')}
                  </div>
                )}

                {/* TAB 2: ORDER MANAGER */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    {/* ponytail: ERP style statistics */}
                    {(() => {
                      const nonCancelled = ordersList.filter(o => o.orderStatus !== 'cancelled');
                      const totalSales = nonCancelled.reduce((sum, o) => sum + o.totalPrice, 0);
                      const totalOrdersCount = nonCancelled.length;
                      const avgOrderValue = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;
                      const pendingShipments = nonCancelled.filter(o => o.orderStatus === 'pending').length;

                      return (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">TOTAL SALES REVENUE</span>
                            <span className="text-xl font-black text-slate-900 font-mono mt-1">{totalSales.toLocaleString()} BDT</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">ACTIVE ORDERS COUNT</span>
                            <span className="text-xl font-black text-slate-900 font-mono mt-1">{totalOrdersCount} Orders</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">AVERAGE ORDER VALUE</span>
                            <span className="text-xl font-black text-slate-900 font-mono mt-1">{avgOrderValue.toFixed(2)} BDT</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">PENDING SHIPMENTS</span>
                            <span className="text-xl font-black text-amber-600 font-mono mt-1">{pendingShipments} Pending</span>
                          </div>
                        </div>
                      );
                    })()}
                    {isEditingOrder && (
                      <form onSubmit={handleEditOrderSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4 max-w-xl text-slate-800">
                        <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase border-b border-slate-200 pb-2 mb-2 font-mono flex justify-between items-center">
                          <span>EDIT CUSTOMER ORDER</span>
                          <span className="text-[9px] text-slate-400 font-mono">ID: {editOrderId}</span>
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                              Customer Name
                            </label>
                            <input
                              type="text"
                              required
                              value={editCustomerName}
                              onChange={(e) => setEditCustomerName(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                              Customer Phone
                            </label>
                            <input
                              type="text"
                              required
                              value={editCustomerPhone}
                              onChange={(e) => setEditCustomerPhone(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                              Customer Email
                            </label>
                            <input
                              type="email"
                              required
                              value={editCustomerEmail}
                              onChange={(e) => setEditCustomerEmail(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                              Total Price (BDT)
                            </label>
                            <input
                              type="number"
                              required
                              value={editTotalPrice}
                              onChange={(e) => setEditTotalPrice(Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-800 font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="block text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                            Shipping Address
                          </span>
                          
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 font-mono uppercase mb-0.5">
                              Street / Detailed Address
                            </label>
                            <input
                              type="text"
                              required
                              value={editStreet}
                              onChange={(e) => setEditStreet(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-800"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[8px] font-bold text-slate-500 font-mono uppercase mb-0.5">
                                City
                              </label>
                              <input
                                type="text"
                                required
                                value={editCity}
                                onChange={(e) => setEditCity(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-500 font-mono uppercase mb-0.5">
                                Postal Code
                              </label>
                              <input
                                type="text"
                                required
                                value={editPostalCode}
                                onChange={(e) => setEditPostalCode(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-800 font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            disabled={submittingOrderEdit}
                            className="flex-1 rounded-lg bg-primary py-2 text-xs font-bold text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-1.5"
                          >
                            {submittingOrderEdit ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Save className="h-3.5 w-3.5" /> UPDATE ORDER DETAILS
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={resetOrderEditForm}
                            className="border border-slate-300 bg-white px-4 py-2 rounded-lg text-xs text-slate-650 hover:bg-slate-100"
                          >
                            CANCEL
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="bg-white border border-[#EAE5DB] p-5 rounded-xl space-y-4">
                      {/* ponytail: status filter controls */}
                      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-slate-200 pb-3 mb-2 gap-3">
                        <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase font-mono">
                          ORDER LOGS ({ordersList.length})
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap w-full xl:w-auto">
                          <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-primary text-slate-800 w-44 font-semibold font-mono"
                          />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase mr-1">FILTER STATUS:</span>
                            {(['all', 'pending', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setOrderStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold font-mono tracking-wider transition ${
                                  orderStatusFilter === status
                                    ? 'bg-primary text-slate-900 shadow-sm'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-650'
                                }`}
                              >
                                {status.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

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
                                <th className="pb-3 text-center">Payment</th>
                                <th className="pb-3 text-right">Fulfillment</th>
                                <th className="pb-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ordersList
                                .filter(order => {
                                  const matchesFilter = orderStatusFilter === 'all' || order.orderStatus === orderStatusFilter;
                                  const query = searchQuery.toLowerCase();
                                  const matchesQuery = 
                                    order.orderNumber.toLowerCase().includes(query) ||
                                    order.customerName.toLowerCase().includes(query) ||
                                    order.customerPhone.includes(query) ||
                                    order.customerEmail.toLowerCase().includes(query);
                                  return matchesFilter && matchesQuery;
                                })
                                .map((order) => (
                                <tr key={order._id} className="border-b border-slate-150 hover:bg-slate-50 transition text-slate-700">
                                  <td className="py-4 font-mono font-bold text-slate-800 text-[11px] align-top pr-2">
                                    <div className="flex flex-col gap-1">
                                      <span>{order.orderNumber}</span>
                                      <a
                                        href={`${API_URL}/api/invoices/${order.orderNumber}.pdf`}
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
                                      <div className="text-slate-455 mt-0.5">
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
                                      className={`px-2 py-0.5 text-[9px] font-bold tracking-wider rounded font-mono border transition ${
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
                                  <td className="py-4 text-right align-top pr-2">
                                    <select
                                      value={order.orderStatus || 'pending'}
                                      disabled={updatingOrderId === order._id}
                                      onChange={(e) => handleUpdateOrderStatus(
                                        order._id, 
                                        e.target.value, 
                                        order.paymentStatus
                                      )}
                                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px] focus:outline-none focus:border-primary text-slate-800 font-semibold"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </td>
                                  <td className="py-4 text-right align-top space-x-1 shrink-0">
                                    <button
                                      onClick={() => startEditOrder(order)}
                                      className="p-1 border border-slate-300 rounded bg-[#FAF9F6] text-slate-500 hover:text-slate-850 hover:bg-slate-100 transition inline-block"
                                      title="Edit details"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteOrder(order._id)}
                                      className="p-1 border border-red-200 rounded bg-red-50 text-red-500 hover:text-red-750 hover:bg-red-100 transition inline-block"
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
                    <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase border-b border-slate-200 pb-2 mb-6 font-mono">
                      STORE SETTINGS
                    </h3>

                    <form onSubmit={handleConfigSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <span className="block text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                          Shipping & Delivery Settings
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

                      <div className="space-y-3 border-t border-slate-200 pt-5">
                        <span className="block text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                          Hero Carousel Vimeo Videos
                        </span>
                        <div>
                          <label className="block text-[8px] font-bold text-slate-500 font-mono uppercase mb-1">
                            Vimeo Video URLs (One URL per line)
                          </label>
                          <textarea
                            value={heroVimeoUrlsText}
                            onChange={(e) => setHeroVimeoUrlsText(e.target.value)}
                            placeholder="https://vimeo.com/1211733718&#10;https://vimeo.com/1211735131"
                            rows={4}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-800 font-mono"
                          />
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

                {/* TAB 6: ADMIN MANAGEMENT */}
                {activeTab === 'admins' && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 text-slate-800">
                    
                    {/* Add Admin Form */}
                    <div className="bg-white border border-[#EAE5DB] p-6 rounded-xl shadow-sm space-y-6">
                      <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase border-b border-slate-200 pb-2 mb-2 font-mono">
                        ADD NEW ADMINISTRATOR
                      </h3>
                      
                      <form onSubmit={handleAddAdminSubmit} className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={newAdminName}
                            onChange={(e) => setNewAdminName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            placeholder="admin@alween.com"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            required
                            value={newAdminPhone}
                            onChange={(e) => setNewAdminPhone(e.target.value)}
                            placeholder="+88017XXXXXXXX"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                            Temporary Password
                          </label>
                          <input
                            type="password"
                            required
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-850"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingNewAdmin}
                          className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-1.5"
                        >
                          {submittingNewAdmin ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" /> CREATE ADMIN USER
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white border border-[#EAE5DB] p-6 rounded-xl shadow-sm space-y-6">
                      <h3 className="font-sans text-xs font-black tracking-widest text-slate-905 uppercase border-b border-slate-200 pb-2 mb-2 font-mono">
                        CHANGE YOUR PASSWORD
                      </h3>
                      
                      <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                            Current Password
                          </label>
                          <input
                            type="password"
                            required
                            value={currentAdminPassword}
                            onChange={(e) => setCurrentAdminPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                            New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={newAdminPasswordVal}
                            onChange={(e) => setNewAdminPasswordVal(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-850"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingChangePassword}
                          className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-slate-900 hover:bg-primary/80 transition flex items-center justify-center gap-1.5"
                        >
                          {submittingChangePassword ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5" /> UPDATE PASSWORD
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                  </div>
                )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
