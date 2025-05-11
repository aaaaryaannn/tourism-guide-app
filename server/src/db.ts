import mongoose from 'mongoose';
import { config } from './config/index.js';

const connectWithRetry = async () => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 5000; // 5 seconds
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      console.log(`Attempting to connect to MongoDB (attempt ${retries + 1}/${MAX_RETRIES})`);
      console.log(`Using MongoDB URI: ${config.mongodbUri.replace(/\/\/[^@]+@/, '//<credentials>@')}`);
      
      await mongoose.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('Successfully connected to MongoDB');
      return;
    } catch (error: unknown) {
      retries++;
      if (error instanceof Error) {
        console.error(`MongoDB connection attempt ${retries} failed:`, error.message);
      } else {
        console.error(`MongoDB connection attempt ${retries} failed with unknown error`);
      }
      
      if (retries === MAX_RETRIES) {
        console.error('Max retries reached. Could not connect to MongoDB');
        throw error;
      }

      console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

// Event handlers
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

// Export the db object with connect and disconnect methods
export const db = {
  connect: connectWithRetry,
  disconnect: () => mongoose.disconnect()
}; 