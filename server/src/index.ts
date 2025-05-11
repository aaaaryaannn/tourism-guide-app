import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';

const app = express();

// CORS configuration
const allowedOrigins = [
  'https://aaaaryaannn.github.io',  // GitHub Pages domain
  'http://localhost:5173',          // Local development
  'http://localhost:3000'           // Local production build
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.mongodbUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Health check route
app.get('/api/health', (_req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error instanceof Error ? error.message : 'Error';
    res.status(503).send(healthcheck);
  }
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
}); 