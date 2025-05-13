import { storage } from '../storage.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ObjectId } from 'mongodb';

// Login controller
export const login = async (req, res) => {
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
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
        testUser: {
          _id: new ObjectId(),
          name: username || email || "Test User",
          email: email || `${username}@example.com`,
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
      
      // Create a test user
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
};

// Register controller
export const register = async (req, res) => {
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
}; 