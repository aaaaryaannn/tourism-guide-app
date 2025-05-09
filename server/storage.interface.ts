import { User, GuideProfile, Place, Itinerary, ItineraryPlace, Connection, SavedPlace } from "../shared/schema.js";
import { Booking, Message } from "./types.js";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  
  // Guide methods
  getGuideProfile(userId: string): Promise<GuideProfile | undefined>;
  createGuideProfile(profile: Omit<GuideProfile, 'id'>): Promise<GuideProfile>;
  updateGuideProfile(id: string, profile: Partial<GuideProfile>): Promise<GuideProfile | undefined>;
  
  // Places methods
  getPlace(id: string): Promise<Place | undefined>;
  getPlaces(): Promise<Place[]>;
  createPlace(place: Omit<Place, 'id'>): Promise<Place>;
  
  // Itinerary methods
  getItinerary(id: string): Promise<Itinerary | undefined>;
  createItinerary(itinerary: Omit<Itinerary, 'id'>): Promise<Itinerary>;
  
  // Itinerary Place methods
  getItineraryPlaces(itineraryId: string): Promise<ItineraryPlace[]>;
  createItineraryPlace(place: Omit<ItineraryPlace, 'id'>): Promise<ItineraryPlace>;
  
  // Booking methods
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: Omit<Booking, 'id'>): Promise<Booking>;
  
  // Connection methods
  getConnections(userId: string | number): Promise<Connection[]>;
  createConnection(connection: Omit<Connection, 'id'>): Promise<Connection>;
  getConnection(connectionId: number | string): Promise<Connection | null>;
  updateConnectionStatus(id: string | number, status: string): Promise<Connection | undefined>;
  
  // Saved places methods
  getSavedPlaces(userId: string): Promise<SavedPlace[]>;
  createSavedPlace(savedPlace: Omit<SavedPlace, 'id'>): Promise<SavedPlace>;
  deleteSavedPlace(id: string): Promise<boolean>;
  
  // Geolocation methods
  updateUserLocation(userId: number, latitude: string, longitude: string): Promise<User>;
  getNearbyGuides(latitude: string, longitude: string, radiusKm?: number): Promise<User[]>;
  getNearbyPlaces(latitude: string, longitude: string, radiusKm?: number, category?: string): Promise<Place[]>;
  
  // Messages methods
  getMessagesByConnectionId(connectionId: string): Promise<Message[]>;
  createMessage(message: Omit<Message, 'id'>): Promise<Message>;
} 