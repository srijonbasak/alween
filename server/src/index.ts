import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { corsSpeedup } from './middlewares/corsSpeedup';
import Order from './models/Order';
import { streamInvoice } from './workers/invoiceGenerator';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Body Parsers & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply Custom CORS preflight and cache header optimizations
app.use(corsSpeedup);

// Serve uploads folder statically
// The spec requests: app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
// When compiled to dist/index.js, __dirname will be dist/, so ../public/uploads goes back to root server folder correctly.
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Serve generated laboratory picking slip invoices dynamically on-the-fly directly to the browser
app.get('/invoices/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const orderNumber = filename.replace('.pdf', '');
    
    const order = await Order.findOne({ orderNumber });
    if (!order) {
      res.status(404).send('Invoice not found in the laboratory database.');
      return;
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    await streamInvoice(order.id, res);
  } catch (error: any) {
    console.error('Dynamic invoice PDF generation failed:', error);
    res.status(500).send('Failed to compile molecular extraction slip: ' + error.message);
  }
});

// Mount main API routes router
app.use('/api', apiRouter);

// Basic status route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express App Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

// Connect to MongoDB & Start Listening
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alweenfragrance';

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Perfume Enterprise Server running on port ${PORT}`);
  });
};

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    startServer();
  })
  .catch((err) => {
    console.error('MongoDB initial connection error on primary URI, trying local fallback:', err.message);
    const localUri = 'mongodb://127.0.0.1:27017/alweenfragrance';
    
    if (MONGO_URI !== localUri) {
      mongoose.connect(localUri)
        .then(() => {
          console.log('Successfully connected to local fallback MongoDB.');
          startServer();
        })
        .catch((localErr) => {
          console.error('MongoDB connection failed on local fallback too:', localErr.message);
          process.exit(1);
        });
    } else {
      process.exit(1);
    }
  });
