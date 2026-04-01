import mongoose from 'mongoose';
import { env } from '../config/env.js';

async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongodbUri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
    throw error;
  }
}

export { connectDB, disconnectDB };
