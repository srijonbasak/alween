import mongoose, { Document, Schema } from 'mongoose';

export interface IPerfume extends Document {
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
  topNotes?: string;
  heartNotes?: string;
  baseNotes?: string;
  type: 'single' | 'combo';
  comboBottleCount?: number;
  comboBottleSizeMl?: number;
  comboPerfumes?: mongoose.Types.ObjectId[];
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
  createdAt: Date;
}

const PerfumeSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  internalFormulaKey: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  imageUrls: [{ type: String }],
  vimeoUrl: { type: String },
  current_volume_ml: { type: Number, required: true, default: 0 },
  reorder_threshold_ml: { type: Number, required: true, default: 0 },
  loss_margin_factor: { type: Number, required: true, default: 0.03 },
  pricePerMl: { type: Number, required: true, default: 1.0 },
  isExcludedFromDiscounts: { type: Boolean, required: true, default: false },
  topNotes: { type: String, default: '' },
  heartNotes: { type: String, default: '' },
  baseNotes: { type: String, default: '' },
  type: { type: String, enum: ['single', 'combo'], default: 'single' },
  comboBottleCount: { type: Number, default: 0 },
  comboBottleSizeMl: { type: Number, default: 0 },
  comboPerfumes: [{ type: Schema.Types.ObjectId, ref: 'Perfume' }],
  price6ml: { type: Number, default: 0 },
  price10ml: { type: Number, default: 0 },
  price15ml: { type: Number, default: 0 },
  price30ml: { type: Number, default: 0 },
  price50ml: { type: Number, default: 0 },
  perfumeCategory: { type: String, enum: ['inspired', 'original'], default: 'inspired' },
  oilConcentration: { type: String, default: '' },
  image6ml: { type: String, default: '' },
  image10ml: { type: String, default: '' },
  image15ml: { type: String, default: '' },
  image30ml: { type: String, default: '' },
  image50ml: { type: String, default: '' },
  originalBottleImage: { type: String, default: '' },
  packagingImage: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Database indexes for 10x faster query lookups
PerfumeSchema.index({ internalFormulaKey: 1 });
PerfumeSchema.index({ perfumeCategory: 1, type: 1, isFeatured: -1, createdAt: -1 });

export default mongoose.model<IPerfume>('Perfume', PerfumeSchema);
