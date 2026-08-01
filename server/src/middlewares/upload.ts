import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirectory = path.join(process.cwd(), 'public/uploads');

// Ensure directory exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.memoryStorage(); // Store files in memory so Sharp can process them

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed!'));
    }
  }
});

import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

// Middleware to compress images and save them as webp
export const compressImages = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !Array.isArray(req.files)) return next();

  try {
    await Promise.all(
      req.files.map(async (file) => {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const sanitizedBase = path.basename(file.originalname, fileExtension)
          .replace(/[^a-zA-Z0-9-_]/g, '');
        const filename = `${Date.now()}-${sanitizedBase}.webp`;
        const filepath = path.join(uploadDirectory, filename);

        await sharp(file.buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // Max dimensions
          .webp({ quality: 80, effort: 4 })
          .toFile(filepath);

        // Update the file object so the controller can read the new filename
        file.filename = filename;
        file.path = filepath;
      })
    );
    next();
  } catch (error) {
    console.error('Image compression failed:', error);
    res.status(500).json({ error: 'Image processing failed during upload.' });
  }
};
