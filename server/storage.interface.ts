import type { User, GuideProfile, Place, Itinerary, ItineraryPlace, Booking, Connection, SavedPlace } from "../shared/schema.ts";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  
  // Guide Profile methods
  getGuideProfile(userId: string): Promise<GuideProfile | undefined>;
  createGuideProfile(profile: Omit<GuideProfile, 'id'>): Promise<GuideProfile>;
  updateGuideProfile(id: string, profile: Partial<GuideProfile>): Promise<GuideProfile | undefined>;
  
  // Place methods
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
  getConnections(userId: string): Promise<Connection[]>;
  createConnection(connection: Omit<Connection, 'id'>): Promise<Connection>;
  updateConnectionStatus(id: string, status: string): Promise<Connection | undefined>;
  
  // Saved Place methods
  getSavedPlaces(userId: string): Promise<SavedPlace[]>;
  createSavedPlace(savedPlace: Omit<SavedPlace, 'id'>): Promise<SavedPlace>;
  deleteSavedPlace(id: string): Promise<boolean>;
  
  // Geolocation methods
  updateUserLocation(userId: number, latitude: string, longitude: string): Promise<User>;
  getNearbyGuides(latitude: string, longitude: string, radiusKm?: number): Promise<User[]>;
  getNearbyPlaces(latitude: string, longitude: string, radiusKm?: number, category?: string): Promise<Place[]>;
} 