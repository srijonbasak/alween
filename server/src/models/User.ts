import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  pointsBalance: number;
  isAffiliate: boolean;
  affiliateProfile?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  pointsBalance: { type: Number, required: true, default: 0 },
  isAffiliate: { type: Boolean, required: true, default: false },
  affiliateProfile: { type: Schema.Types.ObjectId, ref: 'Affiliate' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
