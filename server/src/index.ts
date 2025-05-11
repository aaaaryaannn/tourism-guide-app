import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';
import { setupRoutes } from './routes';
import { storage } from './storage';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.mongodbUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Basic health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Setup routes
setupRoutes(app, storage);

// Start server
const port = process.env.PORT || config.port;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 