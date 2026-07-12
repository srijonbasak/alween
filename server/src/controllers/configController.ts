import { Request, Response } from 'express';
import SystemConfig from '../models/SystemConfig';

export const getConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
      await config.save();
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
      pointsToDiscountRate 
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
    config.updatedAt = new Date();

    await config.save();
    res.json({ message: 'Settings updated successfully.', config });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update system settings.', message: error.message });
  }
};
