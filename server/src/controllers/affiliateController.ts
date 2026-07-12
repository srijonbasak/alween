import { Response } from 'express';
import Affiliate from '../models/Affiliate';
import Order from '../models/Order';

export const getAffiliateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const affiliate = await Affiliate.findOne({ userId: req.user.userId });
    if (!affiliate) {
      res.status(404).json({ error: 'Affiliate profile not found.' });
      return;
    }

    // Also let's retrieve successful referral orders for list logs
    const referrals = await Order.find({ affiliateId: affiliate._id })
      .select('orderNumber customerName totalPrice paymentStatus createdAt subtotal')
      .sort({ createdAt: -1 });

    res.json({
      affiliate,
      referrals
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve affiliate profile.', message: error.message });
  }
};

export const getAffiliatesList = async (req: any, res: Response): Promise<void> => {
  try {
    const affiliates = await Affiliate.find().populate('userId', 'name email phone');
    res.json(affiliates);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve affiliates ledger.', message: error.message });
  }
};
