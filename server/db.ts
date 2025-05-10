import { MongoClient } from "mongodb";
import { userSchema, guideProfileSchema, placeSchema, itinerarySchema, itineraryPlaceSchema, bookingSchema, connectionSchema, savedPlaceSchema } from "../shared/schema.js";
import type { User, GuideProfile, Place, Itinerary, ItineraryPlace, Booking, Connection, SavedPlace } from "../shared/schema.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "tourism_guide";

export const client = new MongoClient(MONGODB_URI);
export const db = client.db(DB_NAME);

export const collections = {
  users: db.collection<User>("users"),
  guideProfiles: db.collection<GuideProfile>("guide_profiles"),
  places: db.collection<Place>("places"),
  itineraries: db.collection<Itinerary>("itineraries"),
  itineraryPlaces: db.collection<ItineraryPlace>("itinerary_places"),
  bookings: db.collection<Booking>("bookings"),
  connections: db.collection<Connection>("connections"),
  savedPlaces: db.collection<SavedPlace>("saved_places")
};

export async function initializeDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Create indexes
    await collections.users.createIndex({ email: 1 }, { unique: true });
    await collections.guideProfiles.createIndex({ userId: 1 }, { unique: true });
    await collections.places.createIndex({ name: 1 });
    await collections.itineraries.createIndex({ userId: 1 });
    await collections.itineraryPlaces.createIndex({ itineraryId: 1 });
    await collections.bookings.createIndex({ userId: 1 });
    await collections.connections.createIndex({ userId: 1 });
    await collections.savedPlaces.createIndex({ userId: 1 });

    console.log("Database initialized");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
