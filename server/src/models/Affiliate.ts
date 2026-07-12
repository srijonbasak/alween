import mongoose, { Document, Schema } from 'mongoose';

export interface IPermanentGuestBind {
  email: string;
  phone: string;
  boundAt: Date;
}

export interface IAffiliate extends Document {
  userId: mongoose.Types.ObjectId;
  username: string; // Used for ref url query: ?ref=username
  couponCode: string; // e.g., USERNAME10
  pointsBalance: number;
  permanentGuestBinds: IPermanentGuestBind[];
  createdAt: Date;
}

const PermanentGuestBindSchema: Schema = new Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  boundAt: { type: Date, default: Date.now }
});

const AffiliateSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  couponCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  pointsBalance: { type: Number, required: true, default: 0 },
  permanentGuestBinds: [PermanentGuestBindSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAffiliate>('Affiliate', AffiliateSchema);
