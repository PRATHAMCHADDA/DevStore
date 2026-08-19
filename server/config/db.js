import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const dbStatus = {
  mongo: 'local',
  sql: 'local'
};

// 1. Initialize Sequelize (SQL database)
let sequelize;

if (process.env.DB_DIALECT === 'mysql' && process.env.DB_NAME && process.env.DB_USER) {
  console.log('Attempting MySQL Cloud Connection...');
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  console.log('MySQL configuration empty or incomplete. Booting SQLite local DB...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(DATA_DIR, 'devstore.sqlite'),
    logging: false
  });
}

// Helper to authenticate Sequelize
const connectSQL = async () => {
  try {
    await sequelize.authenticate();
    if (sequelize.options.dialect === 'mysql') {
      dbStatus.sql = 'production';
      console.log('✅ MySQL Cloud Connected successfully.');
    } else {
      dbStatus.sql = 'local';
      console.log('✅ SQLite Local Database (devstore.sqlite) Initialized.');
    }
  } catch (error) {
    if (sequelize.options.dialect === 'mysql') {
      console.error('❌ MySQL Connection failed! Falling back to SQLite local database...', error.message);
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(DATA_DIR, 'devstore.sqlite'),
        logging: false
      });
      await sequelize.authenticate();
      dbStatus.sql = 'local';
      console.log('✅ SQLite Fallback Database (devstore.sqlite) Initialized.');
    } else {
      console.error('❌ Local SQLite DB initialization error:', error);
    }
  }
};

// 2. Initialize Mongoose (MongoDB)
const connectMongo = async () => {
  if (!process.env.MONGO_URI) {
    console.log('⚠️  No MONGO_URI provided in environmental settings. Using local JSON collection mode.');
    dbStatus.mongo = 'local';
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // fail fast if not reachable
    });
    dbStatus.mongo = 'production';
    console.log('✅ MongoDB Cloud Connected successfully.');
  } catch (error) {
    console.error('❌ MongoDB Connection failed! Falling back to local JSON collection mode...', error.message);
    dbStatus.mongo = 'local';
  }
};

export const connectDB = async () => {
  await connectSQL();
  await connectMongo();
  return { sequelize, dbStatus };
};

export { sequelize };
export default connectDB;
