import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Perfume from '../models/Perfume';
import Order, { IOrderItem } from '../models/Order';
import Affiliate from '../models/Affiliate';
import User from '../models/User';
import SystemConfig from '../models/SystemConfig';
import Coupon from '../models/Coupon';
import { streamInvoice } from '../workers/invoiceGenerator';

// Helper to sanitize IP
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress;
  return ip || '127.0.0.1';
};

// Calculate available size variants based on volume using formula:
// Available Units = (Current Volume * (1 - loss_margin_factor)) / size
export const getAvailableStockForPerfume = (currentVolumeMl: number, lossMarginFactor: number, sizeMl: number): number => {
  if (sizeMl <= 0) return 0;
  const availableVolume = currentVolumeMl * (1 - lossMarginFactor);
  return Math.floor(availableVolume / sizeMl);
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      geolocationAccuracy,
      items, // array of { perfumeId, selectedSizeMl, quantity }
      couponCode,
      fingerprint,
      usePoints, // boolean flag if user wants to redeem points
      userId // if logged in
    } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item.' });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const clientIp = getClientIp(req);

    // 1. Fetch system configs
    let config = await SystemConfig.findOne().session(session);
    if (!config) {
      config = await SystemConfig.create([{}], { session }).then(docs => docs[0]);
    }

    // 2. Resolve items & prices
    let subtotal = 0;
    let discountSubtotalEligible = 0; // Exclude blacklisted items
    const orderItems: any[] = [];

    for (const item of items) {
      let perfume;
      if (mongoose.Types.ObjectId.isValid(item.perfumeId)) {
        perfume = await Perfume.findById(item.perfumeId).session(session);
      } else {
        perfume = await Perfume.findOne({ internalFormulaKey: item.perfumeId }).session(session);
      }

      if (!perfume) {
        throw new Error(`Perfume not found with ID/Key ${item.perfumeId}`);
      }

      const isCombo = (perfume as any).type === 'combo';

      if (!isCombo) {
        // Check stock using spillage calculation
        const totalMlNeeded = item.selectedSizeMl * item.quantity;
        const availableUnits = getAvailableStockForPerfume(
          perfume.current_volume_ml,
          perfume.loss_margin_factor,
          item.selectedSizeMl
        );

        if (availableUnits < item.quantity) {
          throw new Error(
            `Insufficient stock for ${perfume.name} (${item.selectedSizeMl}ml). Available units: ${availableUnits}, requested: ${item.quantity}`
          );
        }

        // Perform ATOMIC stock reduction
        const stockAllocation = await Perfume.findOneAndUpdate(
          { _id: perfume.id, current_volume_ml: { $gte: totalMlNeeded } },
          { $inc: { current_volume_ml: -totalMlNeeded } },
          { new: true, session }
        );

        if (!stockAllocation) {
          throw new Error(`Race condition stock allocation failed for ${perfume.name}.`);
        }
      } else {
        // For pre-made combos, reduce total master volume / units (each unit of combo is 1 quantity)
        if (perfume.current_volume_ml !== undefined && perfume.current_volume_ml > 0) {
          if (perfume.current_volume_ml < item.quantity) {
            throw new Error(`Insufficient stock for combo ${perfume.name}. Available: ${perfume.current_volume_ml}, requested: ${item.quantity}`);
          }
          const stockAllocation = await Perfume.findOneAndUpdate(
            { _id: perfume.id, current_volume_ml: { $gte: item.quantity } },
            { $inc: { current_volume_ml: -item.quantity } },
            { new: true, session }
          );
          if (!stockAllocation) {
            throw new Error(`Race condition stock allocation failed for combo ${perfume.name}.`);
          }
        }
      }

      // Compute pricing (flat price for combos, variant price or fallback for single perfumes)
      let unitPrice = 0;
      if (isCombo) {
        unitPrice = perfume.pricePerMl;
      } else {
        const size = Number(item.selectedSizeMl);
        if (size === 6 && perfume.price6ml && perfume.price6ml > 0) {
          unitPrice = perfume.price6ml;
        } else if (size === 10 && perfume.price10ml && perfume.price10ml > 0) {
          unitPrice = perfume.price10ml;
        } else if (size === 15 && perfume.price15ml && perfume.price15ml > 0) {
          unitPrice = perfume.price15ml;
        } else if (size === 30 && perfume.price30ml && perfume.price30ml > 0) {
          unitPrice = perfume.price30ml;
        } else if (size === 50 && perfume.price50ml && perfume.price50ml > 0) {
          unitPrice = perfume.price50ml;
        } else {
          unitPrice = perfume.pricePerMl * size;
        }
      }
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      if (!perfume.isExcludedFromDiscounts) {
        discountSubtotalEligible += itemTotal;
      }

      orderItems.push({
        perfumeId: perfume._id,
        name: perfume.name,
        selectedSizeMl: item.selectedSizeMl,
        quantity: item.quantity,
        internalFormulaKey: perfume.internalFormulaKey,
        price: unitPrice,
        isExcluded: perfume.isExcludedFromDiscounts
      });
    }

    // 3. Resolve Affiliate and Lifetime guest binds
    let orderAffiliateId: mongoose.Types.ObjectId | undefined = undefined;
    let matchedAffiliate = null;

    // Check permanent guest binds first by email or phone
    const permanentBindAffiliate = await Affiliate.findOne({
      $or: [
        { 'permanentGuestBinds.email': customerEmail.toLowerCase() },
        { 'permanentGuestBinds.phone': customerPhone }
      ]
    }).session(session);

    if (permanentBindAffiliate) {
      orderAffiliateId = permanentBindAffiliate._id as mongoose.Types.ObjectId;
      matchedAffiliate = permanentBindAffiliate;
    }

    // If no permanent bind, check incoming affiliate coupon or query code
    if (!orderAffiliateId && couponCode) {
      // Check if coupon belongs to an affiliate
      const cleanCoupon = couponCode.trim().toUpperCase();
      const affiliateByCoupon = await Affiliate.findOne({ couponCode: cleanCoupon }).session(session);
      if (affiliateByCoupon) {
        orderAffiliateId = affiliateByCoupon._id as mongoose.Types.ObjectId;
        matchedAffiliate = affiliateByCoupon;
      }
    }

    // If still no affiliate, check optional query reference parameter
    const refParam = req.query.ref as string || req.body.ref as string;
    if (!orderAffiliateId && refParam) {
      const affiliateByRef = await Affiliate.findOne({ username: refParam.toLowerCase() }).session(session);
      if (affiliateByRef) {
        orderAffiliateId = affiliateByRef._id as mongoose.Types.ObjectId;
        matchedAffiliate = affiliateByRef;
      }
    }

    // 4. Calculate Coupon Discount and apply Anti-Inflation clamping (Max 50% off subtotal)
    let discountApplied = 0;
    if (couponCode) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      
      // Look up Coupon model in database
      const dbCoupon = await Coupon.findOne({ code: cleanCoupon, isActive: true }).session(session);
      
      if (dbCoupon) {
        if (dbCoupon.expirationDate && new Date() > dbCoupon.expirationDate) {
          throw new Error('The applied coupon has expired.');
        }

        let eligibleSubtotalForCoupon = 0;
        if (dbCoupon.appliesToType === 'all') {
          eligibleSubtotalForCoupon = discountSubtotalEligible;
        } else {
          eligibleSubtotalForCoupon = orderItems.reduce((sum, oItem) => {
            const isApplicable = dbCoupon.applicableProducts.some(pId => pId.toString() === oItem.perfumeId.toString());
            if (isApplicable && !oItem.isExcluded) {
              return sum + (oItem.price * oItem.quantity);
            }
            return sum;
          }, 0);
        }

        if (dbCoupon.discountType === 'percentage') {
          let calculatedDiscount = eligibleSubtotalForCoupon * (dbCoupon.discountValue / 100);
          if (dbCoupon.maxDiscountCap && dbCoupon.maxDiscountCap > 0) {
            calculatedDiscount = Math.min(calculatedDiscount, dbCoupon.maxDiscountCap);
          }
          discountApplied = calculatedDiscount;
        } else if (dbCoupon.discountType === 'fixed') {
          discountApplied = Math.min(dbCoupon.discountValue, eligibleSubtotalForCoupon);
        }
      } else {
        // Fallback to affiliate coupon or old defaults
        let discountPercentage = 0;
        if (matchedAffiliate && cleanCoupon === matchedAffiliate.couponCode) {
          discountPercentage = 0.10;
        } else if (cleanCoupon === 'SAVE20') {
          discountPercentage = 0.20;
        } else if (cleanCoupon === 'ALW50') {
          discountPercentage = 0.50;
        }

        if (discountPercentage > 0) {
          discountApplied = discountSubtotalEligible * discountPercentage;
        }
      }
    }

    // 5. Loyalty Points deduction logic (if user requested and has balance)
    let pointsDiscount = 0;
    if (usePoints && userId) {
      const dbUser = await User.findById(userId).session(session);
      if (dbUser && dbUser.pointsBalance > 0) {
        // config.pointsToDiscountRate points = 1 BDT/USD
        const maxPointsDiscount = dbUser.pointsBalance / config!.pointsToDiscountRate;
        // Remaining amount that can be discounted (after coupon, capped at subtotal - coupon discount)
        const maxAllowedPointsDiscount = Math.max(0, (discountSubtotalEligible - discountApplied));
        
        pointsDiscount = Math.min(maxPointsDiscount, maxAllowedPointsDiscount);
        const pointsDeducted = Math.round(pointsDiscount * config!.pointsToDiscountRate);
        
        // Deduct points from User
        dbUser.pointsBalance -= pointsDeducted;
        await dbUser.save({ session });
        
        discountApplied += pointsDiscount;
      }
    }

    // Clamping engine: Coupon/points deductions cannot exceed 50% of the active order subtotal
    const maxDiscount = subtotal * 0.50;
    if (discountApplied > maxDiscount) {
      discountApplied = maxDiscount;
    }

    // 6. Calculate shipping costs
    let shippingFee = config!.shippingFee;
    if (config!.isFreeDeliveryEnabled && subtotal >= config!.freeDeliveryThreshold) {
      shippingFee = 0;
    } else if (address) {
      const addressStr = (address.formattedAddress || '').toLowerCase();
      const cityStr = (address.city || '').toLowerCase();
      const isInsideDhaka = addressStr.includes('dhaka') || cityStr.includes('dhaka');
      
      shippingFee = isInsideDhaka 
        ? (config!.shippingFeeInsideDhaka ?? 60) 
        : (config!.shippingFeeOutsideDhaka ?? 120);
    }

    const totalPrice = subtotal - discountApplied + shippingFee;

    // 7. Check for Self-Referral Anti-Fraud Shield
    let selfReferralDetected = false;
    if (orderAffiliateId && matchedAffiliate) {
      // Retrieve the affiliate's core User model details
      const affiliateUser = await User.findById(matchedAffiliate.userId).session(session);
      if (affiliateUser) {
        const normalizedAffiliateEmail = affiliateUser.email.toLowerCase();
        const normalizedAffiliatePhone = affiliateUser.phone;

        // Check if customer matches affiliate email or phone
        if (customerEmail.toLowerCase() === normalizedAffiliateEmail || customerPhone === normalizedAffiliatePhone) {
          selfReferralDetected = true;
        }

        // Check fingerprint or IP matches
        if (fingerprint && fingerprint === req.body.affiliateFingerprint) {
          selfReferralDetected = true;
        }
        
        // Check order history or logs if matching IP (for simulation let's do direct IP comparison)
        // If IP matches creator's IP (stored on affiliate user or mocked)
        if (clientIp !== '127.0.0.1' && clientIp === req.body.affiliateIp) {
          selfReferralDetected = true;
        }
      }
    }

    // 8. Generate Order
    const timestampStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8);
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ALW-${timestampStr}-${randSuffix}`;

    const newOrder = new Order({
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      address,
      geolocationAccuracy,
      items: orderItems,
      subtotal,
      discountApplied,
      shippingFee,
      totalPrice,
      paymentStatus: 'success', // We assume instant successful cash/cod/card for verification
      affiliateId: orderAffiliateId,
      couponCode,
      ipAddress: clientIp,
      fingerprint
    });

    await newOrder.save({ session });

    // 9. Process affiliate rewards if order is successful and no fraud detected
    if (orderAffiliateId && matchedAffiliate && !selfReferralDetected) {
      // Award loyalty points to affiliate (e.g. 10% of subtotal converted into points)
      // Conversion: 1 subtotal BDT/USD = 1 points
      const pointsEarned = Math.round(subtotal * 0.10);
      
      // Update Affiliate points balance
      await Affiliate.findByIdAndUpdate(
        orderAffiliateId,
        { $inc: { pointsBalance: pointsEarned } },
        { session }
      );

      // Also update the matching affiliate's User points balance
      await User.findByIdAndUpdate(
        matchedAffiliate.userId,
        { $inc: { pointsBalance: pointsEarned } },
        { session }
      );

      // Permanent Device-Identity Attribution Binds
      // Add email/phone to the affiliate's permanentGuestBinds list if it doesn't exist
      const isAlreadyBound = matchedAffiliate.permanentGuestBinds.some(
        bind => bind.email === customerEmail.toLowerCase() || bind.phone === customerPhone
      );

      if (!isAlreadyBound) {
        await Affiliate.findByIdAndUpdate(
          orderAffiliateId,
          {
            $push: {
              permanentGuestBinds: {
                email: customerEmail.toLowerCase(),
                phone: customerPhone,
                boundAt: new Date()
              }
            }
          },
          { session }
        );
      }
    }

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    // Dynamic invoice generation will be streamed directly on request, no disk storage.

    res.status(201).json({
      message: 'Order created successfully.',
      order: newOrder,
      selfReferralDetected
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: 'Order processing failed.', message: error.message });
  }
};

export const getOrderDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('items.perfumeId');
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve order details.', message: error.message });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().populate('items.perfumeId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve orders.', message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (orderStatus !== undefined) order.orderStatus = orderStatus;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;

    await order.save();
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update order status.', message: error.message });
  }
};

export const updateOrderFields = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { customerName, customerPhone, customerEmail, address, totalPrice, items } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (customerName !== undefined) order.customerName = customerName;
    if (customerPhone !== undefined) order.customerPhone = customerPhone;
    if (customerEmail !== undefined) order.customerEmail = customerEmail;
    if (address !== undefined) order.address = address;
    if (totalPrice !== undefined) order.totalPrice = totalPrice;
    if (items !== undefined) order.items = items;

    await order.save();
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update order fields.', message: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const deleted = await Order.findByIdAndDelete(orderId);
    if (!deleted) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    res.json({ message: 'Order deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete order.', message: error.message });
  }
};
