import { Request, Response } from 'express';
import SystemConfig from '../models/SystemConfig';

export const getConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    let config = await SystemConfig.findOne().lean();
    if (!config) {
      const newConfig = new SystemConfig();
      await newConfig.save();
      config = newConfig.toObject() as any;
    }
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve system settings.', message: error.message });
  }
};

export const updateConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      freeDeliveryThreshold, 
      shippingFee, 
      shippingFeeInsideDhaka, 
      shippingFeeOutsideDhaka, 
      isFreeDeliveryEnabled, 
      pointsToDiscountRate,
      heroVimeoUrls
    } = req.body;
    
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }

    if (freeDeliveryThreshold !== undefined) config.freeDeliveryThreshold = Number(freeDeliveryThreshold);
    if (shippingFee !== undefined) config.shippingFee = Number(shippingFee);
    if (shippingFeeInsideDhaka !== undefined) config.shippingFeeInsideDhaka = Number(shippingFeeInsideDhaka);
    if (shippingFeeOutsideDhaka !== undefined) config.shippingFeeOutsideDhaka = Number(shippingFeeOutsideDhaka);
    if (isFreeDeliveryEnabled !== undefined) config.isFreeDeliveryEnabled = !!isFreeDeliveryEnabled;
    if (pointsToDiscountRate !== undefined) config.pointsToDiscountRate = Number(pointsToDiscountRate);
    if (heroVimeoUrls !== undefined) config.heroVimeoUrls = Array.isArray(heroVimeoUrls) ? heroVimeoUrls : [];
    config.updatedAt = new Date();

    await config.save();
    res.json({ message: 'Settings updated successfully.', config });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update system settings.', message: error.message });
  }
};
