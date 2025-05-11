import express from 'express';
import { storage } from './storage.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from './config/index.js';

const router = express.Router();

// Define types
interface AuthenticatedRequest extends express.Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Error handler middleware
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Authentication middleware
const authenticate = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
router.post('/register', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { email, password, name, userType } = req.body;
  
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await storage.createUser({
    email,
    password: hashedPassword,
    name,
    userType
  });

  const token = jwt.sign({ userId: user._id, email: user.email }, config.jwtSecret, { expiresIn: '24h' });
  res.status(201).json({ user, token });
}));

router.post('/login', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;
  
  const user = await storage.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, config.jwtSecret, { expiresIn: '24h' });
  const { password: _, ...userWithoutPassword } = user.toObject();
  res.json({ user: userWithoutPassword, token });
}));

router.post('/guide-profiles', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const profileData = {
    ...req.body,
    userId: req.user.userId
  };
  const profile = await storage.createGuideProfile(profileData);
  res.status(201).json(profile);
}));

router.get('/places', asyncHandler(async (req: express.Request, res: express.Response) => {
  const places = await storage.getPlaces();
  res.json(places);
}));

router.get('/places/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
  const place = await storage.getPlace(req.params.id);
  if (!place) {
    return res.status(404).json({ error: 'Place not found' });
  }
  res.json(place);
}));

router.post('/places', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const placeData = {
    ...req.body,
    createdBy: req.user.userId
  };
  const place = await storage.createPlace(placeData);
  res.status(201).json(place);
}));

router.post('/itineraries', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const itineraryData = {
    ...req.body,
    userId: req.user.userId
  };
  const itinerary = await storage.createItinerary(itineraryData);
  res.status(201).json(itinerary);
}));

router.post('/bookings', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const bookingData = {
    ...req.body,
    userId: req.user.userId,
    status: 'pending'
  };
  const booking = await storage.createBooking(bookingData);
  res.status(201).json(booking);
}));

router.get('/connections', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const connections = await storage.getConnections(req.user.userId);
  res.json(connections);
}));

export const setupRoutes = () => router; 