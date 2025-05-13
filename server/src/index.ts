import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { db } from './db';
import routes from './routes';
import { storage } from './storage';
import { config } from './config/index';

const app = express();

// CORS configuration - Must be first!
app.use((req, res, next) => {
  // Log the request for debugging
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    headers: req.headers
  });

  // Define allowed origins
  const allowedOrigins = [
    'https://tourism-guide-app.vercel.app',
    'https://tourism-guide-app-git-main-aaaaryaannn-gmailcoms-projects.vercel.app',
    'https://tourism-guide-backend.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  
  // Check if the origin is in our allowedOrigins array or matches Vercel pattern
  if (origin) {
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      origin.includes('-tourism-guide-app.vercel.app');
    
    if (isAllowed) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      // For non-matching origins
      res.header('Access-Control-Allow-Origin', '*');
    }
  } else {
    // For requests with no origin (like mobile apps)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  // Allow credentials
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Allow specific headers
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Request-Method, Access-Control-Request-Headers'
  );
  
  // Allow specific methods
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return res.status(204).end();
  }

  next();
});

// Enable detailed logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.json());

// Test route to verify server is running
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Health check route
app.get('/api/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  try {
    res.json(healthcheck);
  } catch (error) {
    healthcheck.message = error instanceof Error ? error.message : 'Error';
    res.status(503).json(healthcheck);
  }
});

// Connect to MongoDB
mongoose.connect(config.mongodbUri)
  .then(() => console.log('Connected to MongoDB:', config.mongodbUri))
  .catch((error: Error) => console.error('MongoDB connection error:', error));

// Setup routes with /api prefix
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Handle 404 routes
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ error: 'Not found', path: req.url });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS enabled for all origins');
  console.log('Environment:', process.env.NODE_ENV);
}); 