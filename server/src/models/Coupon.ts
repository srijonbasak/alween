import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountCap?: number; // Maximum capping amount (especially for percentage discounts)
  expirationDate?: Date; // Optional expiry timestamp
  appliesToType: 'all' | 'specific';
  applicableProducts: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
}

const CouponSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true, default: 'percentage' },
  discountValue: { type: Number, required: true },
  maxDiscountCap: { type: Number, default: 0 }, // 0 or undefined means no capping
  expirationDate: { type: Date, default: null }, // null means no expiration
  appliesToType: { type: String, enum: ['all', 'specific'], required: true, default: 'all' },
  applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Perfume' }],
  isActive: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
