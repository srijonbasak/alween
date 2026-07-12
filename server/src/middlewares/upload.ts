import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirectory = path.join(__dirname, '../../public/uploads');

// Ensure directory exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent directory traversal and collisions
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, fileExtension)
      .replace(/[^a-zA-Z0-9-_]/g, '');
    cb(null, `${Date.now()}-${sanitizedBase}${fileExtension}`);
  }
});

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
