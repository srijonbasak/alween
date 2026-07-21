import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
  freeDeliveryThreshold: number;
  shippingFee: number;
  shippingFeeInsideDhaka: number;
  shippingFeeOutsideDhaka: number;
  isFreeDeliveryEnabled: boolean;
  pointsToDiscountRate: number; // e.g. 100 points = 1 BDT/USD discount
  heroVimeoUrls: string[];
  updatedAt: Date;
}

const SystemConfigSchema: Schema = new Schema({
  freeDeliveryThreshold: { type: Number, required: true, default: 5000 }, // Default BDT 5000
  shippingFee: { type: Number, required: true, default: 120 }, // Default BDT 120
  shippingFeeInsideDhaka: { type: Number, required: true, default: 60 }, // Default inside Dhaka BDT 60
  shippingFeeOutsideDhaka: { type: Number, required: true, default: 120 }, // Default outside Dhaka BDT 120
  isFreeDeliveryEnabled: { type: Boolean, required: true, default: true },
  pointsToDiscountRate: { type: Number, required: true, default: 100 }, // Default 100 points = 1 BDT discount
  heroVimeoUrls: { type: [String], default: ['https://vimeo.com/1211733718', 'https://vimeo.com/1211735131', 'https://vimeo.com/1211748766'] },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
