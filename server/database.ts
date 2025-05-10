import { MongoClient, ObjectId } from 'mongodb';
import type { Collection, Document } from 'mongodb';
import {
  User,
  GuideProfile,
  Place,
  Itinerary,
  ItineraryPlace,
  Booking,
  Connection,
  SavedPlace
} from '../shared/schema.js';
import { IStorage } from './storage.js';

export interface IDatabase {
  users: Collection<User>;
  guideProfiles: Collection<GuideProfile>;
  places: Collection<Place>;
  itineraries: Collection<Itinerary>;
  itineraryPlaces: Collection<ItineraryPlace>;
  bookings: Collection<Booking>;
  connections: Collection<Connection>;
  savedPlaces: Collection<SavedPlace>;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'tourism_guide';

export async function createDatabase(): Promise<IDatabase> {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db(DB_NAME);

  return {
    users: db.collection('users'),
    guideProfiles: db.collection('guide_profiles'),
    places: db.collection('places'),
    itineraries: db.collection('itineraries'),
    itineraryPlaces: db.collection('itinerary_places'),
    bookings: db.collection('bookings'),
    connections: db.collection('connections'),
    savedPlaces: db.collection('saved_places')
  };
}