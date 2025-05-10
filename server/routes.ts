import express from 'express';
import type { Request, Response } from 'express';
import { createServer, type Server } from "http";
import { storage } from "./storage.ts";
import { db } from './db.js';
import { 
  userSchema,
  guideProfileSchema,
  placeSchema,
  itinerarySchema,
  itineraryPlaceSchema,
  bookingSchema,
  connectionSchema,
  savedPlaceSchema
} from "../shared/schema.ts";
import { z } from 'zod';
import { fromZodError } from "zod-validation-error";
import { Mistral } from '@mistralai/mistralai';
import { Router } from "express";
import { ObjectId } from "mongodb";
import { Express } from 'express';
import { IStorage } from './storage';
import type { User, GuideProfile, Place, Itinerary, ItineraryPlace, Booking, Connection } from '../shared/schema';

const router = express.Router();

// Helper function to calculate distance between two coordinates in kilometers using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to generate random coordinates near a given location
function generateRandomLocationNearby(baseLat: number, baseLng: number, maxDistanceKm: number = 5): { lat: number, lng: number } {
  // Convert max distance from km to degrees (approximate)
  const maxLat = maxDistanceKm / 111.32; // 1 degree latitude is approx 111.32 km
  const maxLng = maxDistanceKm / (111.32 * Math.cos(baseLat * Math.PI / 180)); // Longitude degrees vary by latitude
  
  // Generate random offsets
  const latOffset = (Math.random() * 2 - 1) * maxLat;
  const lngOffset = (Math.random() * 2 - 1) * maxLng;
  
  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset
  };
}

// Error handling middleware
const handleError = (error: unknown, res: express.Response) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: fromZodError(error).message });
  } else if (error instanceof Error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(500).json({ error: 'An unknown error occurred' });
  }
};

// Users
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const userData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const validatedData = userSchema.parse(userData);
    const existingUser = await storage.users.findOne({ email: validatedData.email });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const result = await storage.users.insertOne(validatedData);
    const user = { ...validatedData, id: result.insertedId.toString() };
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: fromZodError(error).message });
    } else {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Guide Profiles
router.get('/guides', async (_req: Request, res: Response) => {
  try {
    const guides = await db.collection('guide_profiles').find().toArray();
    res.json(guides);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

router.post('/guides', async (req, res) => {
  try {
    const guideProfileData = guideProfileSchema.parse(req.body);
    const profile = await storage.createGuideProfile(guideProfileData);
    res.status(201).json(profile);
  } catch (error) {
    handleError(error, res);
  }
});

// Places
router.get('/places', async (req, res) => {
  try {
    const places = await storage.getPlaces();
    res.json(places);
  } catch (error) {
    handleError(error, res);
  }
});

router.get('/places/:id', async (req, res) => {
  try {
    const placeId = new ObjectId(req.params.id);
    const place = await storage.getPlace(placeId.toString());
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }
    res.json(place);
  } catch (error) {
    handleError(error, res);
  }
});

router.post('/places', async (req, res) => {
  try {
    const placeData = placeSchema.parse(req.body);
    const place = await storage.createPlace(placeData);
    res.status(201).json(place);
  } catch (error) {
    handleError(error, res);
  }
});

// AI Trip Planning
router.post('/plan-trip', async (req: Request, res: Response) => {
  try {
    const { fromCity, toCity, numberOfPlaces, budget, tripType } = req.body;

    const client = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY ?? ""
    });

    const prompt = `Plan a trip from ${fromCity} to ${toCity} with the following criteria:
- Number of places to visit: ${numberOfPlaces}
- Budget: ${budget}
- Trip type: ${tripType}

Please provide:
1. A list of recommended places to visit
2. Suggested itinerary
3. Budget breakdown
4. Travel tips`;

    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (!response.choices?.[0]?.message?.content) {
      return res.status(500).json({ message: "Failed to generate trip plan" });
    }

    res.json({ plan: response.choices[0].message.content });
  } catch (error) {
    console.error('Error generating trip plan:', error);
    res.status(500).json({ error: 'Failed to generate trip plan' });
  }
});

// AI chat route
router.post('/chat', async (req, res) => {
  try {
    const { fromCity, toCity, numberOfPlaces, budget, tripType } = req.body;

    const client = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY ?? ""
    });

    const messages = [{
      role: 'user' as const,
      content: `Plan a trip from ${fromCity} to ${toCity} with the following criteria:
- Number of places to visit: ${numberOfPlaces}
- Budget: ${budget}
- Trip type: ${tripType}

Please provide:
1. A suggested itinerary
2. Estimated costs
3. Travel tips`
    }];

    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages
    });

    if (!response.choices?.[0]?.message?.content) {
      return res.status(500).json({ message: "Failed to generate response" });
    }

    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    handleError(error, res);
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // TODO: Add proper password hashing and comparison
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    console.log("Login successful for user:", userWithoutPassword.name);
    res.json(userWithoutPassword);
  } catch (error) {
    handleError(error, res);
  }
});

// Itineraries
router.post('/itineraries', async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const validatedData = itinerarySchema.parse(tripData);
    const trip = await storage.createItinerary(validatedData);
    res.status(201).json(trip);
  } catch (error) {
    handleError(error, res);
  }
});

export function setupRoutes(app: Express, storage: IStorage) {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get user by ID
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.users.findOne({ _id: new ObjectId(req.params.id) });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create user
  app.post('/api/users', async (req, res) => {
    try {
      const userData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const validatedData = userSchema.parse(userData);
      const existingUser = await storage.users.findOne({ email: validatedData.email });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      
      const result = await storage.users.insertOne(validatedData);
      const user = { ...validatedData, id: result.insertedId.toString() };
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Create guide profile
  app.post('/api/guides', async (req, res) => {
    try {
      const guideProfileData = guideProfileSchema.parse(req.body);
      const result = await storage.guideProfiles.insertOne({
        ...guideProfileData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const guideProfile = { ...guideProfileData, id: result.insertedId.toString() };
      res.status(201).json(guideProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        console.error('Error creating guide profile:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Get places
  app.get('/api/places', async (req, res) => {
    try {
      const places = await storage.places.find().toArray();
      res.json(places);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create place
  app.post('/api/places', async (req, res) => {
    try {
      const placeData = placeSchema.parse(req.body);
      const place = await storage.createPlace(placeData);
      res.status(201).json(place);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Create itinerary
  app.post('/api/itineraries', async (req, res) => {
    try {
      const itineraryData = itinerarySchema.parse({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const itinerary = await storage.createItinerary(itineraryData);
      res.status(201).json(itinerary);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Add place to itinerary
  app.post('/api/itineraries/:id/places', async (req, res) => {
    try {
      const itineraryPlaceData = itineraryPlaceSchema.parse({
        ...req.body,
        itineraryId: req.params.id
      });
      
      const result = await storage.itineraryPlaces.insertOne(itineraryPlaceData);
      res.json({ id: result.insertedId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Create booking
  app.post('/api/bookings', async (req, res) => {
    try {
      const bookingData = bookingSchema.parse(req.body);
      const result = await storage.bookings.insertOne(bookingData);
      res.json({ id: result.insertedId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Create connection
  router.post('/connections', async (req, res) => {
    try {
      const { userId, followerId, status } = req.body;
      const connectionData = {
        userId,
        followerId,
        status,
        fromUserId: userId,
        toUserId: followerId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const connection = await storage.createConnection(connectionData);
      res.status(201).json(connection);
    } catch (error) {
      handleError(error, res);
    }
  });

  // Save place for user
  app.post('/api/saved-places', async (req, res) => {
    try {
      const savedPlaceData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const validatedSavedPlace = savedPlaceSchema.parse(savedPlaceData);
      const result = await storage.savedPlaces.insertOne(validatedSavedPlace);
      res.json({ id: result.insertedId });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Recommendations endpoint
  app.post('/api/recommendations', async (req, res) => {
    try {
      const client = new Mistral({
        apiKey: process.env.MISTRAL_API_KEY ?? ""
      });
      const { interests, location, duration } = req.body;

      const response = await client.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "user" as const,
            content: `Generate a personalized travel itinerary for ${location} with the following preferences: ${interests.join(', ')} and I'm planning to visit for ${duration} days. Can you suggest some places to visit and create an itinerary?`
          }
        ]
      });

      if (!response.choices?.[0]?.message?.content) {
        return res.status(500).json({ message: "Failed to generate recommendations" });
      }

      res.json({ recommendations: response.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: 'Error getting recommendations' });
    }
  });

  // Nearby guides endpoint - returns 4-5 guides near the tourist's location
  app.get("/api/nearby/guides", async (req, res) => {
    try {
      // Get latitude and longitude from query parameters
      const userLat = parseFloat(req.query.latitude as string);
      const userLng = parseFloat(req.query.longitude as string);
      
      // Validate coordinates
      if (isNaN(userLat) || isNaN(userLng)) {
        return res.status(400).json({ message: "Invalid coordinates provided" });
      }
      
      // Fetch all guides from the database
      const guides = await db.collection('users').find({ userType: "guide" }).toArray();
      
      if (!guides || guides.length === 0) {
        return res.status(404).json({ message: "No guides found" });
      }
      
      // Convert MongoDB _id to id for each guide and prepare for frontend
      const formattedGuides = guides.map(guide => {
        // Generate nearby random location for this guide around the user's location
        const randomLocation = generateRandomLocationNearby(userLat, userLng);
        
        return {
          ...guide,
          id: guide._id.toString(),
          // Update location fields with nearby random coordinates
          currentLatitude: randomLocation.lat.toString(),
          currentLongitude: randomLocation.lng.toString(),
          // Calculate distance from user
          distance: calculateDistance(userLat, userLng, randomLocation.lat, randomLocation.lng),
          // Remove MongoDB _id and password for security
          _id: undefined,
          password: undefined
        };
      });
      
      // Get guide profiles
      const guideIds = formattedGuides.map(g => g.id);
      const guideProfiles = await db.collection('guideProfiles').find({
        userId: { $in: guideIds }
      }).toArray();
      
      // Create a map of profiles by userId for quick lookup
      const profileMap = new Map();
      guideProfiles.forEach(profile => {
        profileMap.set(profile.userId, {
          ...profile,
          id: profile._id.toString(),
          _id: undefined
        });
      });
      
      // Add guide profiles to guides
      const guidesWithProfiles = formattedGuides.map(guide => ({
        ...guide,
        guideProfile: profileMap.get(guide.id) || null
      }));
      
      // Sort guides by distance
      guidesWithProfiles.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      // Return 4-5 random guides (random number between 4-5)
      const numGuides = Math.floor(Math.random() * 2) + 4; // 4 or 5
      const nearbyGuides = guidesWithProfiles.slice(0, Math.min(numGuides, guidesWithProfiles.length));
      
      return res.json(nearbyGuides);
    } catch (error) {
      console.error("Error fetching nearby guides:", error);
      return res.status(500).json({ message: "Server error", error: String(error) });
    }
  });

  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("============ REGISTRATION REQUEST ============");
      console.log("Registration request body:", JSON.stringify(req.body, null, 2));
      
      const userData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("Sanitized data:", JSON.stringify(userData, null, 2));
      
      if (!userData.email || !userData.password || !userData.name) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          received: Object.keys(userData) 
        });
      }
      
      try {
        const validatedData = userSchema.omit({ id: true }).parse(userData);
        console.log("Parsed user data:", JSON.stringify(validatedData, null, 2));
        
        const existingUser = await storage.getUserByEmail(validatedData.email);
        console.log("Existing user check:", existingUser ? "User exists" : "User doesn't exist");
        
        if (existingUser) {
          return res.status(400).json({ message: "Email already exists" });
        }

        console.log("Creating user with data:", JSON.stringify(validatedData, null, 2));
        const user = await storage.createUser(validatedData);
        console.log("User created with ID:", user.id);

        // If user is a guide, create guide profile
        if (validatedData.userType === "guide" && req.body.guideProfile) {
          try {
            console.log("Creating guide profile for user:", user.id);
            const guideProfileData = guideProfileSchema.omit({ id: true }).parse({
              ...req.body.guideProfile,
              userId: user.id,
              createdAt: new Date(),
              updatedAt: new Date()
            });

            await storage.createGuideProfile(guideProfileData);
            console.log("Guide profile created");
          } catch (guideProfileError) {
            console.error("Error creating guide profile:", guideProfileError);
          }
        }

        // Don't return password
        const { password, ...userWithoutPassword } = user;

        console.log("Registration successful");
        console.log("============ END REGISTRATION REQUEST ============");
        return res.status(201).json(userWithoutPassword);
      } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Server error" });
      }
    } catch (error) {
      console.error("Unhandled registration error:", error);
      console.error("============ END REGISTRATION REQUEST WITH ERROR ============");
      return res.status(500).json({ message: "Server error" });
    }
  });

  // User location update endpoint
  app.post("/api/user/location", async (req, res) => {
    try {
      const { userId, latitude, longitude } = req.body;
      
      if (!userId || !latitude || !longitude) {
        return res.status(400).json({ message: "User ID, latitude, and longitude are required" });
      }
      
      // Validate coordinates
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }
      
      // Update user's location in the database
      const result = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            currentLatitude: latitude,
            currentLongitude: longitude,
            lastLocationUpdate: new Date()
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json({ message: "Location updated successfully" });
    } catch (error) {
      console.error("Error updating user location:", error);
      return res.status(500).json({ message: "Server error", error: String(error) });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("============ LOGIN REQUEST ============");
      console.log("Login request body:", JSON.stringify(req.body, null, 2));
      
      // Extract credentials from request body
      const { username, password, email } = req.body;
      
      // Check if required fields are provided
      if ((!username && !email) || !password) {
        console.error("Missing required fields");
        return res.status(400).json({ message: "Email/username and password are required" });
      }
      
      let user = null;
      
      // First try to find by username if provided
      if (username) {
        console.log("Looking up user by username:", username);
        user = await db.collection('users').findOne({ username });
      }
      
      // If no user found and email provided, try by email
      if (!user && email) {
        console.log("Looking up user by email:", email);
        user = await db.collection('users').findOne({ email });
      }
      
      // Check if user was found
      if (!user) {
        console.error("User not found");
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Convert MongoDB _id to id and ensure it's a string
      const userId = user._id.toString();
      console.log("Converted user ID:", userId);
      
      // Create user object with string ID while preserving all properties
      const userWithStringId = userSchema.parse({ 
        ...user, 
        id: userId,
        _id: undefined // Remove MongoDB _id
      });
      
      console.log("User found:", userWithStringId.name);
      
      // Verify password
      if (userWithStringId.password !== password) {
        console.error(`Invalid password. Expected: ${userWithStringId.password}, Received: ${password}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create response without password
      const { password: _, ...userWithoutPassword } = userWithStringId;

      console.log("Login successful for user:", userWithoutPassword.name);
      console.log("============ END LOGIN REQUEST ============");
      
      // Return user data in the format expected by client
      return res.json(userWithoutPassword);
      
    } catch (error) {
      console.error("Login error:", error);
      console.error("============ END LOGIN REQUEST WITH ERROR ============");
      return res.status(500).json({ message: "Server error", error: String(error) });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId.toString());

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return password
      const { password, ...userWithoutPassword } = user;

      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Trip routes
  app.get("/api/trips/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const trips = await storage.getItinerary(userId.toString());
      return res.json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/trips", async (req, res) => {
    try {
      const tripData = {
        userId: req.body.userId,
        title: req.body.title,
        description: req.body.description,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const trip = await storage.createItinerary(tripData);
      return res.status(201).json(trip);
    } catch (error) {
      console.error("Error creating trip:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Guide routes
  app.get("/api/guides", async (req, res) => {
    try {
      console.log("Fetching guides...");
      // Get all users with userType 'guide' directly from MongoDB
      const guides = await db.collection('users').find({ userType: 'guide' }).toArray();
      
      console.log(`Found ${guides.length} guides in users collection`);
      
      // Get all guide profiles in one query
      const guideIds = guides.map(guide => guide._id.toString());
      const guideProfiles = await db.collection('guideProfiles').find({
        userId: { $in: guideIds }
      }).toArray();
      
      console.log(`Found ${guideProfiles.length} guide profiles`);
      
      // Create a map of profiles by userId for quick lookup
      const profileMap = new Map();
      guideProfiles.forEach(profile => {
        const { _id, ...profileWithoutId } = profile;
        profileMap.set(profile.userId, {
          ...profileWithoutId,
          id: _id.toString()
        });
      });
      
      // Map the guides to include guide profiles
      const guidesWithProfiles = guides.map(guide => {
        // Convert MongoDB _id to id and remove sensitive information
        const { _id, password, ...guideWithoutPassword } = guide;
        const guideId = _id.toString();
        
        // Get the guide profile from the map
        const guideProfile = profileMap.get(guideId);
        
        return {
          ...guideWithoutPassword,
          id: guideId,
          guideProfile: guideProfile || null
        };
      });
      
      console.log(`Returning ${guidesWithProfiles.length} guides with profiles`);
      return res.json(guidesWithProfiles);
    } catch (error) {
      console.error("Error fetching guides:", error);
      return res.status(500).json({ message: "Server error", error: String(error) });
    }
  });

  app.get("/api/guides/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId.toString());

      if (!user || user.userType !== "guide") {
        return res.status(404).json({ message: "Guide not found" });
      }

      const guideProfile = await storage.getGuideProfile(userId.toString());

      if (!guideProfile) {
        return res.status(404).json({ message: "Guide profile not found" });
      }

      // Don't return password
      const { password, ...userWithoutPassword } = user;

      return res.json({
        ...userWithoutPassword,
        guideProfile
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Places routes
  app.get("/api/places", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const places = await storage.getPlaces();
      return res.json(places);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/places/:id", async (req, res) => {
    try {
      const placeId = parseInt(req.params.id);

      if (isNaN(placeId)) {
        return res.status(400).json({ message: "Invalid place ID" });
      }

      const place = await storage.getPlace(placeId.toString());

      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }

      return res.json(place);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/places", async (req, res) => {
    try {
      const placeData = placeSchema.parse(req.body);
      const { id, ...placeWithoutId } = placeData;
      const place = await storage.createPlace(placeWithoutId);
      return res.status(201).json(place);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Add this endpoint after the places routes
  app.post("/api/places/:id/wikimedia", async (req, res) => {
    try {
      const placeId = req.params.id;
      const {
        wikimediaThumbnailUrl,
        wikimediaDescription,
        wikimediaArtist,
        wikimediaAttributionUrl,
        wikimediaLicense,
        wikimediaLicenseUrl
      } = req.body;
      
      if (!placeId) {
        return res.status(400).json({ message: "Place ID is required" });
      }
      
      // Update the place with Wikimedia information
      await db.collection('places').updateOne(
        { _id: new ObjectId(placeId) },
        { 
          $set: { 
            wikimediaThumbnailUrl,
            wikimediaDescription,
            wikimediaArtist,
            wikimediaAttributionUrl,
            wikimediaLicense,
            wikimediaLicenseUrl
          },
          // Set imageUrl only if it doesn't exist
          $setOnInsert: {
            imageUrl: wikimediaThumbnailUrl
          }
        },
        { upsert: true }
      );
      
      // Get the updated place
      const updatedPlace = await db.collection('places').findOne({ _id: new ObjectId(placeId) });
      
      if (!updatedPlace) {
        return res.status(404).json({ message: "Place not found after update" });
      }
      
      // Convert MongoDB _id to id for response
      const { _id, ...placeData } = updatedPlace;
      
      return res.json({
        ...placeData,
        id: _id.toString()
      });
    } catch (error) {
      console.error("Error updating place with Wikimedia data:", error);
      return res.status(500).json({ message: "Server error", error: String(error) });
    }
  });

  // Itinerary routes
  app.get("/api/users/:userId/itineraries", async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log("Fetching itineraries for user ID:", userId);

      if (!userId) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Search in MongoDB by the userId field in itineraries
      const itineraries = await db.collection('itineraries').find({ userId }).toArray();
      console.log(`Found ${itineraries.length} itineraries for user ${userId}`);
      
      // Map MongoDB documents to expected format with id field
      const formattedItineraries = itineraries.map(itinerary => {
        const { _id, ...rest } = itinerary;
        return {
          id: _id.toString(),
          ...rest
        };
      });

      return res.json(formattedItineraries);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      return res.status(500).json({ message: "Server error", error: String(error) });
    }
  });

  app.get("/api/itineraries/:id/places", async (req, res) => {
    try {
      const itineraryId = parseInt(req.params.id);

      if (isNaN(itineraryId)) {
        return res.status(400).json({ message: "Invalid itinerary ID" });
      }

      const itineraryPlaces = await storage.getItineraryPlaces(itineraryId.toString());

      // Get full place details for each itinerary place
      const placesWithDetails = await Promise.all(
        itineraryPlaces.map(async (itineraryPlace) => {
          const place = await storage.getPlace(itineraryPlace.placeId);
          return {
            ...itineraryPlace,
            place
          };
        })
      );

      return res.json(placesWithDetails);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/itineraries/:id/places", async (req, res) => {
    try {
      const itineraryId = parseInt(req.params.id);

      if (isNaN(itineraryId)) {
        return res.status(400).json({ message: "Invalid itinerary ID" });
      }

      const itineraryPlaceData = itineraryPlaceSchema.parse({
        ...req.body,
        itineraryId
      });

      const itineraryPlace = await storage.createItineraryPlace(itineraryPlaceData);
      return res.status(201).json(itineraryPlace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Booking routes
  app.get("/api/bookings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const type = req.query.type as string | undefined;

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const booking = await storage.getBooking(userId.toString());
      return res.json(booking);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = bookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  // Connection routes
  app.get("/api/users/:userId/connections", async (req, res) => {
    try {
      const { userId } = req.params;
      const rawId = req.query.raw; // For debugging

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      console.log(`[API] Fetching connections for user ${userId}, raw param: ${rawId || 'none'}`);
      console.log(`[API] User ID type: ${typeof userId}`);
      
      // Get all connections for this user
      const connections = await storage.getConnections(userId as string);
      console.log(`[API] Found ${connections.length} connections for user ${userId}`);
      
      // Debug output for each connection
      if (connections.length > 0) {
        connections.forEach((connection, index) => {
          console.log(`Connection ${index + 1}:`, connection);
        });
      }
      
      return res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      return res.status(500).json({ message: "Server error", error: String(error) });
    }
  });

  // Update connection status
  app.patch("/api/connections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, userId } = req.body;
      
      console.log(`[API] Updating connection ${id} status to ${status}`, {
        params: req.params,
        body: req.body,
        headers: req.headers
      });
      
      // Validate status
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'rejected'" });
      }
      
      // Get the connection first to validate the update
      const connection = await db.collection('connections').findOne({ 
        $or: [
          { _id: new ObjectId(id) },
          { id: id }
        ]
      });
      
      if (!connection) {
        console.log(`Connection with ID ${id} not found`);
        return res.status(404).json({ message: 'Connection not found' });
      }
      
      // Update the connection status in the database
      const result = await db.collection('connections').updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      return res.json({ message: "Connection status updated successfully" });
    } catch (error) {
      console.error("Error updating connection status:", error);
      return res.status(500).json({ message: "Server error", error: String(error) });
    }
  });
}