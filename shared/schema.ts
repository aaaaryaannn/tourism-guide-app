import { z } from 'zod';

// Base schema for all models
export const baseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// User schema
export const userSchema = baseSchema.extend({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  userType: z.enum(['user', 'guide']),
  image: z.string().optional(),
  currentLatitude: z.string().optional(),
  currentLongitude: z.string().optional(),
  lastLocationUpdate: z.date().optional(),
  phone: z.string().optional(),
  username: z.string().optional()
});

// Guide profile schema
export const guideProfileSchema = baseSchema.extend({
  userId: z.string(),
  bio: z.string(),
  languages: z.array(z.string()),
  specialties: z.array(z.string()),
  location: z.string(),
  experience: z.number(),
  rating: z.number().optional(),
  reviews: z.array(z.string()).optional()
});

// Place schema
export const placeSchema = baseSchema.extend({
  name: z.string(),
  description: z.string(),
  location: z.string(),
  category: z.enum(['monument', 'temple', 'heritage', 'nature', 'winery', 'beach', 'landmark', 'spiritual']),
  latitude: z.string(),
  longitude: z.string(),
  imageUrl: z.string(),
  rating: z.number().optional(),
  reviews: z.array(z.string()).optional(),
  openingHours: z.string().optional(),
  entryFee: z.string().optional(),
  bestTimeToVisit: z.string().optional(),
  wikimediaImageUrl: z.string().optional(),
  wikimediaLicenseUrl: z.string().optional(),
  wikimediaThumbnailUrl: z.string().optional(),
  wikimediaDescription: z.string().optional(),
  wikimediaArtist: z.string().optional(),
  wikimediaAttributionUrl: z.string().optional(),
  wikimediaLicense: z.string().optional()
});

// Itinerary schema
export const itinerarySchema = baseSchema.extend({
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date()
});

// Itinerary place schema
export const itineraryPlaceSchema = baseSchema.extend({
  itineraryId: z.string(),
  placeId: z.string(),
  order: z.number(),
  notes: z.string().optional()
});

// Booking schema
export const bookingSchema = baseSchema.extend({
  userId: z.string(),
  guideId: z.string(),
  placeId: z.string(),
  date: z.date(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  notes: z.string().optional()
});

// Connection schema
export const connectionSchema = baseSchema.extend({
  fromUser: userSchema.omit({ password: true }).optional(),
  toUser: userSchema.omit({ password: true }).optional(),
  status: z.enum(['pending', 'accepted', 'rejected']),
  message: z.string().optional(),
  tripDetails: z.string().optional(),
  budget: z.string().optional(),
  guideProfile: guideProfileSchema.optional()
});

// Saved place schema
export const savedPlaceSchema = baseSchema.extend({
  userId: z.string(),
  placeId: z.string(),
  notes: z.string().optional()
});

// Export types
export type User = z.infer<typeof userSchema>;
export type ExtendedUser = User & {
  guideProfile?: GuideProfile;
};
export type GuideProfile = z.infer<typeof guideProfileSchema>;
export type Place = z.infer<typeof placeSchema>;
export type Itinerary = z.infer<typeof itinerarySchema>;
export type ItineraryPlace = z.infer<typeof itineraryPlaceSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type SavedPlace = z.infer<typeof savedPlaceSchema>;
