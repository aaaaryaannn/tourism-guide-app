import express, { Request, Response, NextFunction } from 'express';
import { storage } from './storage.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from './config/index.js';
import { RequestHandler } from 'express';

const router = express.Router();

// Define types
interface AuthUser {
  userId: string;
  email: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Error handler middleware
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => 
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Auth middleware
const authenticateToken: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      email: decoded.email
    };
    next();
  });
};

// Routes
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Check if user exists
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await storage.createUser({ email, password: hashedPassword });
  res.status(201).json({ message: 'User created successfully', userId: user._id });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await storage.getUserByEmail(email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Check password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Generate token
  const token = jwt.sign({ userId: user._id, email: user.email }, config.jwtSecret);
  res.json({ token });
}));

// Helper function to handle authenticated routes
const handleAuthRoute = (handler: (req: AuthenticatedRequest, res: Response) => Promise<void>): RequestHandler => 
  asyncHandler(async (req, res, next) => {
    await handler(req as AuthenticatedRequest, res);
  });

router.post('/guide-profile', authenticateToken, handleAuthRoute(async (req, res) => {
  const { userId } = req.user!;
  const { name, description, languages, expertise, hourlyRate } = req.body;

  const profile = await storage.createGuideProfile({
    userId,
    name,
    description,
    languages,
    expertise,
    hourlyRate
  });

  res.status(201).json(profile);
}));

router.get('/guide-profiles', asyncHandler(async (req, res) => {
  const profiles = await storage.guideProfiles.find();
  res.json(profiles);
}));

router.get('/guide-profile/:id', asyncHandler(async (req, res) => {
  const profile = await storage.guideProfiles.findById(req.params.id);
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  res.json(profile);
}));

router.post('/places', authenticateToken, handleAuthRoute(async (req, res) => {
  const { name, description, location, images } = req.body;
  const place = await storage.createPlace({ name, description, location, images });
  res.status(201).json(place);
}));

router.get('/places', asyncHandler(async (req, res) => {
  const places = await storage.getPlaces();
  res.json(places);
}));

router.post('/itineraries', authenticateToken, handleAuthRoute(async (req, res) => {
  const { userId } = req.user!;
  const { places, startDate, endDate } = req.body;
  
  const itinerary = await storage.createItinerary({
    userId,
    places,
    startDate,
    endDate
  });

  res.status(201).json(itinerary);
}));

router.post('/bookings', authenticateToken, handleAuthRoute(async (req, res) => {
  const { userId } = req.user!;
  const { guideId, date, duration } = req.body;

  const booking = await storage.createBooking({
    userId,
    guideId,
    date,
    duration
  });

  res.status(201).json(booking);
}));

router.get('/user-connections/:userId', asyncHandler(async (req, res) => {
  const connections = await storage.getConnections(req.params.userId);
  res.json(connections);
}));

// Get user profile
router.get('/auth/profile', authenticateToken, handleAuthRoute(async (req, res) => {
  const { userId } = req.user!;
  
  // Get user data
  const user = await storage.getUserById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get guide profile if exists
  const guideProfile = await storage.guideProfiles.findOne({ userId: user._id });

  // Return user data without password
  const { password, ...userData } = user.toObject();
  res.json({
    ...userData,
    isGuide: !!guideProfile
  });
}));

export default router; 