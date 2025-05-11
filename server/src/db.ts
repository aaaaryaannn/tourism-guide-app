import mongoose from 'mongoose';
import { config } from './config/index.js';

const connectWithRetry = async (retries = 5, delay = 5000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority'
      });
      console.log('Connected to MongoDB Atlas');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple retries');
};

export const db = {
  connect: connectWithRetry,
  disconnect: () => mongoose.disconnect()
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB Atlas');
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
}); 