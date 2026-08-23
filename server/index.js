import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// DB imports
import { connectDB } from './config/db.js';
import { syncSQLModels } from './models/sqlModels.js';
import { seedDatabase, seedDefaultData } from './config/seed.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local uploads in development
}));

// Dynamic Serverless CORS & Preflight Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.options('*', cors());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // Higher limit in development
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// APi Root
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DevStore Full-Stack E-Commerce API Server!' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message, err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// App Startup & Serverless Middleware
let isDbInitialized = false;
let dbInitPromise = null;

const initializeServices = async () => {
  if (isDbInitialized) return;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        console.log('Initializing DevStore Server services...');
        const { dbStatus } = await connectDB();
        console.log(`Database Status: MongoDB -> ${dbStatus?.mongo}, SQL -> ${dbStatus?.sql}`);
        await syncSQLModels();
        console.log('✅ SQL Schema verified.');
        await seedDatabase();
        isDbInitialized = true;
      } catch (error) {
        console.error('❌ DB Initialization error:', error.message);
      }
    })();
  }
  await dbInitPromise;
};

// Ensure DB initialization & auto-seeder middleware for serverless requests
app.use(async (req, res, next) => {
  try {
    if (!isDbInitialized) {
      await initializeServices();
    }
    await seedDefaultData();
  } catch (e) {
    console.error('Seeder execution error:', e.message);
  }
  next();
});

// Standalone Server Startup for Local Development
if (!process.env.VERCEL) {
  initializeServices().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 DevStore Backend running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('❌ Failed to start server:', err);
  });
}

export default app;
