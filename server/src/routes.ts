import express, { Request, Response, NextFunction } from 'express';
import { storage } from './storage.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from './config/index.js';
import { RequestHandler } from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Define types
interface AuthUser {
  userId: string;
  email: string;
}

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
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

// Helper function to handle authenticated routes
const handleAuthRoute = (handler: (req: AuthenticatedRequest, res: Response) => Promise<any>): RequestHandler => 
  asyncHandler(async (req, res, next) => {
    await handler(req as AuthenticatedRequest, res);
  });

// Handle preflight requests for registration
router.options('/auth/register', (req, res) => {
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
  
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});

// Routes
router.post('/auth/register', asyncHandler(async (req, res) => {
  try {
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
    
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    console.log('Registration request received:', {
      body: req.body,
      headers: req.headers,
      method: req.method
    });

    const { email, password, name, phone, userType } = req.body;
    
    // Validate required fields
    if (!email || !password || !name) {
      console.log('Missing required fields');
      return res.status(200).json({ 
        success: false,
        message: 'Missing required fields',
        received: { email: !!email, password: !!password, name: !!name }
      });
    }
  
    // Check if user exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      console.log('User already exists, but allowing registration for development:', email);
      
      // For development: Still create JWT token
      const token = jwt.sign(
        { userId: existingUser._id.toString(), email: existingUser.email },
        config.jwtSecret,
        { expiresIn: '7d' }
      );
      
      return res.status(200).json({ 
        success: true,
        message: 'Using existing user for development', 
        userId: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
        token,
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          userType: existingUser.userType || 'tourist',
          phone: existingUser.phone
        }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await storage.createUser({ 
      email, 
      password: hashedPassword,
      name,
      phone,
      userType: userType || 'tourist'
    });
    
    console.log('User created successfully:', {
      userId: user._id,
      email: user.email,
      name: user.name
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      success: true,
      message: 'User created successfully', 
      userId: user._id,
      email: user.email,
      name: user.name,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType || 'tourist',
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(200).json({ 
      success: false,
      message: 'Registration failed', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Handle preflight requests for login
router.options('/auth/login', (req, res) => {
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
  
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});

router.post('/auth/login', asyncHandler(async (req, res) => {
  try {
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
    
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    console.log("============ LOGIN REQUEST ============");
    console.log("Login request body:", JSON.stringify(req.body, null, 2));
    
    // Extract credentials from request body
    const { username, password, email } = req.body;
    
    // Check if required fields are provided
    if ((!username && !email) || !password) {
      console.error("Missing required fields");
      return res.status(200).json({ 
        success: false,
        message: "Email/username and password are required",
        user: null,
        // Adding a test user for demo purposes
        testUser: {
          _id: new ObjectId(),
          name: "Test User",
          email: username || email || "test@example.com",
          userType: "tourist"
        }
      });
    }
    
    let user = null;
    
    // First try to find by username if provided
    if (username) {
      console.log("Looking up user by username:", username);
      user = await storage.getUserByEmail(username);
    }
    
    // If no user found and email provided, try by email
    if (!user && email) {
      console.log("Looking up user by email:", email);
      user = await storage.getUserByEmail(email);
    }
    
    // FOR DEVELOPMENT: Create a test user if none found
    if (!user) {
      console.log("User not found, creating test user for development");
      
      // Create a test user for easier testing
      const testUser = {
        _id: new ObjectId(),
        name: username || email?.split('@')[0] || "Test User",
        email: email || `${username}@example.com`,
        userType: "tourist"
      };
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: testUser._id.toString(), email: testUser.email },
        config.jwtSecret,
        { expiresIn: '7d' }
      );
      
      return res.status(200).json({
        success: true,
        message: "Developer mode: Created test user",
        token,
        user: testUser
      });
    }

    console.log("User found:", user.name);
    
    // DEVELOPMENT MODE: Skip password verification for testing
    let validPassword = true;
    
    // In production, uncomment this code to verify passwords
    /* 
    try {
      validPassword = await bcrypt.compare(password, user.password);
    } catch (err) {
      console.error("Error comparing passwords:", err);
      validPassword = false;
    }
    */
    
    if (!validPassword) {
      console.error("Invalid password");
      return res.status(200).json({ 
        success: false,
        message: "Invalid credentials (password incorrect)",
        // For testing, still return the user
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType || "tourist"
        }
      });
    }
    
    // Create and sign JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    
    console.log("Login successful, generated token");
    
    // Return user info and token
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        fullName: user.name,
        email: user.email,
        userType: user.userType || "tourist",
        phone: user.phone
      }
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(200).json({ 
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
      // Create a test user for easier development
      user: {
        _id: new ObjectId(),
        name: req.body.username || req.body.email?.split('@')[0] || "Test User",
        email: req.body.email || `${req.body.username}@example.com`,
        userType: "tourist"
      }
    });
  }
}));

// Auth routes
router.get('/auth/profile', authenticateToken, handleAuthRoute(async (req: AuthenticatedRequest, res) => {
  const user = await storage.users.findOne({ _id: new ObjectId(req.user.userId) });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { password, ...userWithoutPassword } = user;
  return res.json(userWithoutPassword);
}));

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

export default router; 