import { z } from 'zod';
import { ObjectId } from 'mongodb';

// User Schema
export const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string(),
  phone: z.string(),
  userType: z.enum(['tourist', 'guide', 'admin']),
  currentLatitude: z.string().optional(),
  currentLongitude: z.string().optional(),
  lastLocationUpdate: z.date().optional(),
  createdAt: z.date().optional()
}).passthrough(); // Allow unknown properties to pass through

export type User = z.infer<typeof userSchema>;

// Guide Profile Schema
export const guideProfileSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  location: z.string(),
  experience: z.number(),
  languages: z.array(z.string()),
  specialties: z.array(z.string()),
  rating: z.number(),
  bio: z.string()
});

export type GuideProfile = z.infer<typeof guideProfileSchema>;

// Place Schema
export const placeSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  category: z.enum(['attraction', 'hotel', 'restaurant', 'transport']),
  latitude: z.string(),
  longitude: z.string(),
  imageUrl: z.string().optional(),
  // Wikimedia image information
  wikimediaThumbnailUrl: z.string().optional(),
  wikimediaDescription: z.string().optional(),
  wikimediaArtist: z.string().optional(),
  wikimediaAttributionUrl: z.string().optional(),
  wikimediaLicense: z.string().optional(),
  wikimediaLicenseUrl: z.string().optional()
});

export type Place = z.infer<typeof placeSchema>;

// Itinerary Schema
export const itinerarySchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startDate: z.union([z.date(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val),
  endDate: z.union([z.date(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val).optional(),
  createdAt: z.date().optional(),
  // Trip planner fields
  fromCity: z.string().optional(),
  toCity: z.string().optional(),
  numberOfPlaces: z.number().optional(),
  budget: z.string().optional(),
  tripType: z.enum(['historical', 'food', 'adventure', 'cultural', 'picnic', 'nature', 'other']).optional()
});

export type Itinerary = z.infer<typeof itinerarySchema>;

// Itinerary Place Schema
export const itineraryPlaceSchema = z.object({
  id: z.string().optional(),
  itineraryId: z.string(),
  placeId: z.string(),
  visitDate: z.union([z.date(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val),
  notes: z.string().optional()
});

export type ItineraryPlace = z.infer<typeof itineraryPlaceSchema>;

// Booking Schema
export const bookingSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['hotel', 'transport', 'guide']),
  userId: z.string(),
  from: z.string(),
  to: z.string(),
  departureDate: z.union([z.date(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val),
  returnDate: z.union([z.date(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val).optional(),
  passengers: z.number().optional(),
  roomCount: z.number().optional(),
  bookingDetails: z.string().optional(),
  createdAt: z.date().optional()
});

export type Booking = z.infer<typeof bookingSchema>;

// Connection Schema
export const connectionSchema = z.object({
  id: z.string().optional(),
  fromUserId: z.string(),
  toUserId: z.string(),
  status: z.enum(['pending', 'accepted', 'rejected']),
  message: z.string(),
  tripDetails: z.string(),
  budget: z.string().optional(),
  createdAt: z.date().optional(),
  // Add optional user objects for convenience in API responses
  fromUser: z.lazy(() => userSchema.omit({ password: true })).optional(),
  toUser: z.lazy(() => userSchema.omit({ password: true })).optional(),
  // Add optional guide profile for the guide in this connection
  guideProfile: z.lazy(() => guideProfileSchema).optional()
});

export type Connection = z.infer<typeof connectionSchema>;

// Saved Place Schema
export const savedPlaceSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  placeId: z.string(),
  createdAt: z.date().optional()
});

export type SavedPlace = z.infer<typeof savedPlaceSchema>;
