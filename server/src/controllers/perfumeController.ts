import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Perfume from '../models/Perfume';

export const getPerfumes = async (req: Request, res: Response): Promise<void> => {
  try {
    const perfumes = await Perfume.find().populate('comboPerfumes').sort({ createdAt: -1 });
    res.json(perfumes);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve perfumes.', message: error.message });
  }
};

export const getPerfumeById = async (req: Request, res: Response): Promise<void> => {
  try {
    let perfume;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      perfume = await Perfume.findById(req.params.id).populate('comboPerfumes');
    } else {
      perfume = await Perfume.findOne({ internalFormulaKey: req.params.id }).populate('comboPerfumes');
    }

    if (!perfume) {
      res.status(404).json({ error: 'Perfume not found.' });
      return;
    }
    res.json(perfume);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve perfume.', message: error.message });
  }
};

export const createPerfume = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      internalFormulaKey,
      description,
      vimeoUrl,
      current_volume_ml,
      reorder_threshold_ml,
      loss_margin_factor,
      pricePerMl,
      isExcludedFromDiscounts,
      topNotes,
      heartNotes,
      baseNotes,
      type
    } = req.body;

    const files = req.files as Express.Multer.File[] | undefined;
    const imageUrls: string[] = [];

    if (files && files.length > 0) {
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      files.forEach(file => {
        imageUrls.push(`${protocol}://${host}/uploads/${file.filename}`);
      });
    }

    let comboPerfumesParsed = [];
    if (req.body.comboPerfumes) {
      try {
        comboPerfumesParsed = JSON.parse(req.body.comboPerfumes);
      } catch (e) {
        comboPerfumesParsed = Array.isArray(req.body.comboPerfumes) ? req.body.comboPerfumes : [req.body.comboPerfumes];
      }
    }

    const newPerfume = new Perfume({
      name,
      internalFormulaKey,
      description,
      imageUrls,
      vimeoUrl,
      current_volume_ml: Number(current_volume_ml || 0),
      reorder_threshold_ml: Number(reorder_threshold_ml || 0),
      loss_margin_factor: Number(loss_margin_factor || 0.03),
      pricePerMl: Number(pricePerMl || 1.0),
      isExcludedFromDiscounts: isExcludedFromDiscounts === 'true' || isExcludedFromDiscounts === true,
      topNotes: topNotes || '',
      heartNotes: heartNotes || '',
      baseNotes: baseNotes || '',
      type: type || 'single',
      comboBottleCount: Number(req.body.comboBottleCount || 0),
      comboBottleSizeMl: Number(req.body.comboBottleSizeMl || 0),
      comboPerfumes: comboPerfumesParsed,
      price6ml: Number(req.body.price6ml || 0),
      price10ml: Number(req.body.price10ml || 0),
      price15ml: Number(req.body.price15ml || 0),
      price30ml: Number(req.body.price30ml || 0),
      price50ml: Number(req.body.price50ml || 0)
    });

    await newPerfume.save();
    res.status(201).json(newPerfume);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create perfume.', message: error.message });
  }
};

export const updatePerfume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const perfume = await Perfume.findById(id);

    if (!perfume) {
      res.status(404).json({ error: 'Perfume not found.' });
      return;
    }

    const updateData = { ...req.body };

    // Convert numeric fields
    if (updateData.current_volume_ml !== undefined) updateData.current_volume_ml = Number(updateData.current_volume_ml);
    if (updateData.reorder_threshold_ml !== undefined) updateData.reorder_threshold_ml = Number(updateData.reorder_threshold_ml);
    if (updateData.loss_margin_factor !== undefined) updateData.loss_margin_factor = Number(updateData.loss_margin_factor);
    if (updateData.pricePerMl !== undefined) updateData.pricePerMl = Number(updateData.pricePerMl);
    if (updateData.comboBottleCount !== undefined) updateData.comboBottleCount = Number(updateData.comboBottleCount);
    if (updateData.comboBottleSizeMl !== undefined) updateData.comboBottleSizeMl = Number(updateData.comboBottleSizeMl);
    if (updateData.price6ml !== undefined) updateData.price6ml = Number(updateData.price6ml);
    if (updateData.price10ml !== undefined) updateData.price10ml = Number(updateData.price10ml);
    if (updateData.price15ml !== undefined) updateData.price15ml = Number(updateData.price15ml);
    if (updateData.price30ml !== undefined) updateData.price30ml = Number(updateData.price30ml);
    if (updateData.price50ml !== undefined) updateData.price50ml = Number(updateData.price50ml);
    if (updateData.isExcludedFromDiscounts !== undefined) {
      updateData.isExcludedFromDiscounts = updateData.isExcludedFromDiscounts === 'true' || updateData.isExcludedFromDiscounts === true;
    }

    if (updateData.comboPerfumes !== undefined) {
      try {
        updateData.comboPerfumes = JSON.parse(updateData.comboPerfumes);
      } catch (e) {
        updateData.comboPerfumes = Array.isArray(updateData.comboPerfumes) ? updateData.comboPerfumes : [updateData.comboPerfumes];
      }
    }

    // Append new images if uploaded, preserving selected existing images
    let existingUrls = perfume.imageUrls || [];
    if (req.body.existingImageUrls !== undefined) {
      try {
        existingUrls = JSON.parse(req.body.existingImageUrls);
      } catch (e) {
        existingUrls = Array.isArray(req.body.existingImageUrls) ? req.body.existingImageUrls : [req.body.existingImageUrls];
      }
    }

    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const newUrls = files.map(file => `${protocol}://${host}/uploads/${file.filename}`);
      updateData.imageUrls = [...existingUrls, ...newUrls];
    } else {
      updateData.imageUrls = existingUrls;
    }

    const updatedPerfume = await Perfume.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedPerfume);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update perfume.', message: error.message });
  }
};

export const deletePerfume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const perfume = await Perfume.findByIdAndDelete(id);
    if (!perfume) {
      res.status(404).json({ error: 'Perfume not found.' });
      return;
    }
    res.json({ message: 'Perfume deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete perfume.', message: error.message });
  }
};
