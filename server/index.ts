import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { registerRoutes } from './routes';
import { initializeDatabase } from './db';
import { setupVite, serveStatic } from './vite';

async function createApp() {
  const app = express();
  
  // Create HTTP server first
  const server = createServer(app);
  
  // Add basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Add CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });
  
  // Add logging middleware for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      const start = Date.now();
      console.log(`[API] ${req.method} ${req.path}`);
      
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        console.log('Request body:', req.body);
      }
      
      // Capture the original send to log response
      const originalSend = res.send;
      res.send = function(...args) {
        const duration = Date.now() - start;
        console.log(`[API] ${req.method} ${req.path} completed in ${duration}ms`);
        console.log('Response:', args[0]);
        return originalSend.apply(res, args);
      };
    }
    next();
  });
  
  // Initialize database
  await initializeDatabase();
  
  // Register API routes BEFORE Vite middleware
  await registerRoutes(app);
  
  // Add error handling for API routes
  app.use('/api', (err: any, _req: Request, res: Response, next: NextFunction) => {
    console.error('[API Error]', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  });
  
  // Setup Vite in development, static serving in production
  if (process.env.NODE_ENV !== 'production') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  
  return { app, server };
}

// Start the server
async function startServer() {
  try {
    const { app, server } = await createApp();
    
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
