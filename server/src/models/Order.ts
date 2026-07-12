import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  perfumeId: mongoose.Types.ObjectId;
  name: string;
  selectedSizeMl: number;
  quantity: number;
  internalFormulaKey: string;
  price: number;
}

export interface IOrder extends Document {
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
  items: IOrderItem[];
  subtotal: number;
  discountApplied: number;
  shippingFee: number;
  totalPrice: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  orderStatus: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  affiliateId?: mongoose.Types.ObjectId;
  couponCode?: string;
  ipAddress?: string;
  fingerprint?: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  perfumeId: { type: Schema.Types.ObjectId, ref: 'Perfume', required: true },
  name: { type: String, required: true },
  selectedSizeMl: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  internalFormulaKey: { type: String, required: true },
  price: { type: Number, required: true }
});

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, required: true, lowercase: true, trim: true },
  address: {
    formattedAddress: { type: String },
    street: { type: String },
    city: { type: String },
    postalCode: { type: String }
  },
  geolocationAccuracy: { type: Number },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  discountApplied: { type: Number, required: true, default: 0 },
  shippingFee: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  affiliateId: { type: Schema.Types.ObjectId, ref: 'Affiliate' },
  couponCode: { type: String },
  ipAddress: { type: String },
  fingerprint: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>('Order', OrderSchema);
