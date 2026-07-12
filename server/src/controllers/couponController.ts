import { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import Affiliate from '../models/Affiliate';

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().populate('applicableProducts').sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve coupons.', message: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, maxDiscountCap, expirationDate, appliesToType, applicableProducts, isActive } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      res.status(400).json({ error: 'Coupon code already exists.' });
      return;
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      maxDiscountCap: maxDiscountCap !== undefined ? Number(maxDiscountCap) : 0,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      appliesToType,
      applicableProducts: applicableProducts || [],
      isActive: isActive !== undefined ? isActive : true
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create coupon.', message: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found.' });
      return;
    }
    res.json({ message: 'Coupon deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete coupon.', message: error.message });
  }
};

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = (req.query.code as string || '').trim().toUpperCase();
    if (!code) {
      res.status(400).json({ error: 'Coupon code query parameter is required.' });
      return;
    }

    // 1. Search Coupon Collection
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (coupon) {
      if (coupon.expirationDate && new Date() > coupon.expirationDate) {
        res.status(400).json({ isValid: false, error: 'Coupon code has expired.' });
        return;
      }
      res.json({
        isValid: true,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountCap: coupon.maxDiscountCap || 0,
        appliesToType: coupon.appliesToType,
        applicableProducts: coupon.applicableProducts
      });
      return;
    }

    // 2. Search Affiliate Collection
    const affiliate = await Affiliate.findOne({ couponCode: code });
    if (affiliate) {
      // Standard affiliate codes give 10% off everything
      res.json({
        isValid: true,
        code: affiliate.couponCode,
        discountType: 'percentage',
        discountValue: 10,
        appliesToType: 'all',
        applicableProducts: []
      });
      return;
    }

    // If we've reached here, code is not valid
    res.status(404).json({ isValid: false, error: 'Invalid or expired coupon code.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Coupon validation failed.', message: error.message });
  }
};
