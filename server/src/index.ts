import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { db } from './db.js';
import routes from './routes.js';
import { storage } from './storage.js';
import { config } from './config/index.js';

const app = express();

// CORS configuration
const allowedOrigins = [
  'https://aaaaryaannn.github.io',    // GitHub Pages domain
  'https://tourism-guide-app.vercel.app', // Vercel production domain
  'https://tourism-guide-app-git-main-aaaaryaannn-gmailcoms-projects.vercel.app', // Vercel preview domain
  'http://localhost:5173',            // Local development
  'http://localhost:3000'             // Local production build
];

const corsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Request with no origin');
      return callback(null, true);
    }
    
    console.log('Request from origin:', origin);
    
    // Allow all Vercel domains
    if (origin.endsWith('.vercel.app')) {
      console.log('Allowing Vercel domain:', origin);
      return callback(null, true);
    }
    
    // Check against explicit allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Origin explicitly allowed:', origin);
      return callback(null, true);
    }
    
    console.log('Origin not allowed:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.mongodbUri)
  .then(() => console.log('Connected to MongoDB:', config.mongodbUri))
  .catch((error: Error) => console.error('MongoDB connection error:', error));

// Health check route
app.get('/api/health', (_req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error instanceof Error ? error.message : 'Error';
    res.status(503).send(healthcheck);
  }
});

// Setup routes with /api prefix
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Handle 404 routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
}); 