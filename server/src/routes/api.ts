import { Router } from 'express';
import { register, login, logout, getCurrentUser, toggleAffiliateStatus } from '../controllers/authController';
import { getPerfumes, getPerfumeById, createPerfume, updatePerfume, deletePerfume } from '../controllers/perfumeController';
import { createOrder, getOrderDetails, getOrders, updateOrderStatus } from '../controllers/orderController';
import { getAffiliateProfile, getAffiliatesList } from '../controllers/affiliateController';
import { getConfig, updateConfig } from '../controllers/configController';
import { getCoupons, createCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { verifyTurnstile } from '../middlewares/turnstile';
import { upload } from '../middlewares/upload';

const router = Router();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', authenticate, getCurrentUser);
router.post('/auth/toggle-affiliate', authenticate, toggleAffiliateStatus);

// ==========================================
// PERFUME CRUD ROUTES
// ==========================================
router.get('/perfumes', getPerfumes);
router.get('/perfumes/:id', getPerfumeById);
router.post('/perfumes', authenticate, authorizeAdmin, upload.array('images', 5), createPerfume);
router.put('/perfumes/:id', authenticate, authorizeAdmin, upload.array('images', 5), updatePerfume);
router.delete('/perfumes/:id', authenticate, authorizeAdmin, deletePerfume);

// ==========================================
// ORDER / CHECKOUT ROUTES
// ==========================================
// verifyTurnstile checks incoming X-Turnstile-Token or request body to prevent bot spam
router.post('/orders', verifyTurnstile, createOrder);
router.get('/orders', authenticate, authorizeAdmin, getOrders);
router.get('/orders/:orderId', getOrderDetails);
router.put('/orders/:orderId/status', authenticate, authorizeAdmin, updateOrderStatus);

// ==========================================
// COUPON MANAGEMENT ROUTES
// ==========================================
router.get('/coupons/validate', validateCoupon);
router.get('/coupons', authenticate, authorizeAdmin, getCoupons);
router.post('/coupons', authenticate, authorizeAdmin, createCoupon);
router.delete('/coupons/:id', authenticate, authorizeAdmin, deleteCoupon);

// ==========================================
// AFFILIATE SYSTEM ROUTES
// ==========================================
router.get('/affiliates/me', authenticate, getAffiliateProfile);
router.get('/affiliates', authenticate, authorizeAdmin, getAffiliatesList);

// ==========================================
// GLOBAL CONFIGURATION ROUTES
// ==========================================
router.get('/config', getConfig);
router.put('/config', authenticate, authorizeAdmin, updateConfig);

export default router;
