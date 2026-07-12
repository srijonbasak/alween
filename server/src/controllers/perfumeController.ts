import { Request, Response } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Perfume from '../models/Perfume';

const deleteLocalFileFromUrl = (url: string | undefined | null) => {
  if (!url) return;
  try {
    if (url.includes('/uploads/')) {
      const filename = url.split('/uploads/').pop();
      if (filename) {
        const filePath = path.join(__dirname, '../../public/uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
  } catch (err) {
    console.error('Error deleting local upload file:', err);
  }
};

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
      isFeatured,
      topNotes,
      heartNotes,
      baseNotes,
      type,
      perfumeCategory,
      oilConcentration
    } = req.body;

    const files = req.files as Express.Multer.File[] | undefined;
    const imageUrls: string[] = [];
    let image6ml = '';
    let image10ml = '';
    let image15ml = '';
    let image30ml = '';
    let image50ml = '';
    let originalBottleImage = '';
    let packagingImage = '';

    if (files && files.length > 0) {
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      files.forEach(file => {
        const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;
        if (file.fieldname === 'image6ml') image6ml = fileUrl;
        else if (file.fieldname === 'image10ml') image10ml = fileUrl;
        else if (file.fieldname === 'image15ml') image15ml = fileUrl;
        else if (file.fieldname === 'image30ml') image30ml = fileUrl;
        else if (file.fieldname === 'image50ml') image50ml = fileUrl;
        else if (file.fieldname === 'originalBottleImage') originalBottleImage = fileUrl;
        else if (file.fieldname === 'packagingImage') packagingImage = fileUrl;
        else {
          imageUrls.push(fileUrl);
        }
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
      isFeatured: isFeatured === 'true' || isFeatured === true,
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
      price50ml: Number(req.body.price50ml || 0),
      perfumeCategory: perfumeCategory || 'inspired',
      oilConcentration: oilConcentration || '',
      image6ml,
      image10ml,
      image15ml,
      image30ml,
      image50ml,
      originalBottleImage,
      packagingImage
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
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
    }

    if (updateData.comboPerfumes !== undefined) {
      try {
        updateData.comboPerfumes = JSON.parse(updateData.comboPerfumes);
      } catch (e) {
        updateData.comboPerfumes = Array.isArray(updateData.comboPerfumes) ? updateData.comboPerfumes : [updateData.comboPerfumes];
      }
    }

    // Preserve existing single fields if not uploaded
    updateData.image6ml = req.body.image6ml_existing || perfume.image6ml || '';
    updateData.image10ml = req.body.image10ml_existing || perfume.image10ml || '';
    updateData.image15ml = req.body.image15ml_existing || perfume.image15ml || '';
    updateData.image30ml = req.body.image30ml_existing || perfume.image30ml || '';
    updateData.image50ml = req.body.image50ml_existing || perfume.image50ml || '';
    updateData.originalBottleImage = req.body.originalBottleImage_existing || perfume.originalBottleImage || '';
    updateData.packagingImage = req.body.packagingImage_existing || perfume.packagingImage || '';

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
    const newStandardUrls: string[] = [];

    if (files && files.length > 0) {
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      files.forEach(file => {
        const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;
        if (file.fieldname === 'image6ml') updateData.image6ml = fileUrl;
        else if (file.fieldname === 'image10ml') updateData.image10ml = fileUrl;
        else if (file.fieldname === 'image15ml') updateData.image15ml = fileUrl;
        else if (file.fieldname === 'image30ml') updateData.image30ml = fileUrl;
        else if (file.fieldname === 'image50ml') updateData.image50ml = fileUrl;
        else if (file.fieldname === 'originalBottleImage') updateData.originalBottleImage = fileUrl;
        else if (file.fieldname === 'packagingImage') updateData.packagingImage = fileUrl;
        else {
          newStandardUrls.push(fileUrl);
        }
      });
      updateData.imageUrls = [...existingUrls, ...newStandardUrls];
    } else {
      updateData.imageUrls = existingUrls;
    }

    // Compare images to clean up removed files from server uploads folder
    const oldImages = perfume.imageUrls || [];
    const newImages = updateData.imageUrls || [];
    const removedImages = oldImages.filter(url => !newImages.includes(url));
    removedImages.forEach(url => deleteLocalFileFromUrl(url));

    if (perfume.image6ml && updateData.image6ml !== perfume.image6ml) deleteLocalFileFromUrl(perfume.image6ml);
    if (perfume.image10ml && updateData.image10ml !== perfume.image10ml) deleteLocalFileFromUrl(perfume.image10ml);
    if (perfume.image15ml && updateData.image15ml !== perfume.image15ml) deleteLocalFileFromUrl(perfume.image15ml);
    if (perfume.image30ml && updateData.image30ml !== perfume.image30ml) deleteLocalFileFromUrl(perfume.image30ml);
    if (perfume.image50ml && updateData.image50ml !== perfume.image50ml) deleteLocalFileFromUrl(perfume.image50ml);
    if (perfume.originalBottleImage && updateData.originalBottleImage !== perfume.originalBottleImage) deleteLocalFileFromUrl(perfume.originalBottleImage);
    if (perfume.packagingImage && updateData.packagingImage !== perfume.packagingImage) deleteLocalFileFromUrl(perfume.packagingImage);

    const updatedPerfume = await Perfume.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedPerfume);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update perfume.', message: error.message });
  }
};

export const deletePerfume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const perfume = await Perfume.findById(id);
    if (!perfume) {
      res.status(404).json({ error: 'Perfume not found.' });
      return;
    }

    // Delete all local images associated with this perfume
    (perfume.imageUrls || []).forEach(url => deleteLocalFileFromUrl(url));
    deleteLocalFileFromUrl(perfume.image6ml);
    deleteLocalFileFromUrl(perfume.image10ml);
    deleteLocalFileFromUrl(perfume.image15ml);
    deleteLocalFileFromUrl(perfume.image30ml);
    deleteLocalFileFromUrl(perfume.image50ml);
    deleteLocalFileFromUrl(perfume.originalBottleImage);
    deleteLocalFileFromUrl(perfume.packagingImage);

    await Perfume.findByIdAndDelete(id);
    res.json({ message: 'Perfume deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete perfume.', message: error.message });
  }
};
