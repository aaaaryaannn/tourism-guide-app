import { MongoClient, ObjectId, Filter, UpdateFilter, FindOneAndUpdateOptions } from 'mongodb';
import type { Collection, Document, Db } from 'mongodb';
import { userSchema, guideProfileSchema, placeSchema, itinerarySchema, itineraryPlaceSchema, bookingSchema, connectionSchema, savedPlaceSchema } from '../shared/schema.js';
import type { User, GuideProfile, Place, Itinerary, ItineraryPlace, Booking, Connection, SavedPlace } from '../shared/schema.js';
import { nanoid } from 'nanoid';

export interface IStorage {
  users: Collection<User>;
  guideProfiles: Collection<GuideProfile>;
  places: Collection<Place>;
  itineraries: Collection<Itinerary>;
  itineraryPlaces: Collection<ItineraryPlace>;
  bookings: Collection<Booking>;
  connections: Collection<Connection>;
  savedPlaces: Collection<SavedPlace>;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: Omit<User, 'id'>): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;

  // Guide profile methods
  getGuideProfile(userId: string): Promise<GuideProfile | undefined>;
  createGuideProfile(profileData: Omit<GuideProfile, 'id'>): Promise<GuideProfile>;
  updateGuideProfile(id: string, profileData: Partial<GuideProfile>): Promise<GuideProfile | undefined>;

  // Connection methods
  getConnections(userId: string | number): Promise<ExtendedConnection[]>;
  createConnection(connectionData: Omit<ExtendedConnection, 'id'>): Promise<ExtendedConnection>;
  updateConnectionStatus(id: string | number, status: 'pending' | 'accepted' | 'rejected'): Promise<ExtendedConnection | undefined>;

  // Place methods
  getPlace(id: string): Promise<Place | undefined>;
  getPlaces(): Promise<Place[]>;
  createPlace(placeData: Omit<Place, 'id'>): Promise<Place>;

  // Itinerary methods
  getItinerary(id: string): Promise<Itinerary | undefined>;
  createItinerary(itineraryData: Omit<Itinerary, 'id'>): Promise<Itinerary>;

  // Itinerary place methods
  getItineraryPlaces(itineraryId: string): Promise<ItineraryPlace[]>;
  createItineraryPlace(placeData: Omit<ItineraryPlace, 'id'>): Promise<ItineraryPlace>;

  // Booking methods
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(bookingData: Omit<Booking, 'id'>): Promise<Booking>;

  // Saved place methods
  getSavedPlaces(userId: string): Promise<SavedPlace[]>;
  createSavedPlace(savedPlaceData: Omit<SavedPlace, 'id'>): Promise<SavedPlace>;
  deleteSavedPlace(id: string): Promise<boolean>;

  // Location methods
  updateUserLocation(userId: number, latitude: string, longitude: string): Promise<User>;
  getNearbyGuides(latitude: string, longitude: string, radiusKm?: number): Promise<User[]>;
  getNearbyPlaces(latitude: string, longitude: string, radiusKm?: number, category?: string): Promise<Place[]>;

  // Message methods
  getMessagesByConnectionId(connectionId: string): Promise<any[]>;
  createMessage(message: any): Promise<any>;
}

interface ExtendedConnection extends Omit<Connection, 'fromUser' | 'toUser'> {
  fromUser: Omit<User, 'password'>;
  toUser: Omit<User, 'password'>;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'tourism_guide';

export class MongoStorage implements IStorage {
  private db!: Db;
  private client: MongoClient;
  public users!: Collection<User>;
  public guideProfiles!: Collection<GuideProfile>;
  public places!: Collection<Place>;
  public itineraries!: Collection<Itinerary>;
  public itineraryPlaces!: Collection<ItineraryPlace>;
  public bookings!: Collection<Booking>;
  public connections!: Collection<Connection>;
  public savedPlaces!: Collection<SavedPlace>;

  constructor() {
    this.client = new MongoClient(MONGODB_URI);
    this.initialize();
  }

  private async initialize() {
    try {
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      this.users = this.db.collection('users');
      this.guideProfiles = this.db.collection('guide_profiles');
      this.places = this.db.collection('places');
      this.itineraries = this.db.collection('itineraries');
      this.itineraryPlaces = this.db.collection('itinerary_places');
      this.bookings = this.db.collection('bookings');
      this.connections = this.db.collection('connections');
      this.savedPlaces = this.db.collection('saved_places');
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await this.users.findOne({ _id: new ObjectId(id) });
    if (!user) return undefined;
    const { _id, ...rest } = user;
    return { ...rest, id: _id.toString() } as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.users.findOne({ email });
    if (!user) return undefined;
    const { _id, ...rest } = user;
    return { ...rest, id: _id.toString() } as User;
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const user = {
        ...userData,
        createdAt: userData.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      const result = await this.users.insertOne(user as any);
      
      if (!result.insertedId) {
        throw new Error("Failed to create user - no insertedId returned");
      }
      
      return { ...user, id: result.insertedId.toString() } as User;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const { id: _, ...updateData } = userData;
    const result = await this.users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!result) return undefined;
    const { _id, ...rest } = result;
    return { ...rest, id: _id.toString() } as User;
  }
  
  async getGuideProfile(userId: string): Promise<GuideProfile | undefined> {
    const profile = await this.guideProfiles.findOne({ userId });
    if (!profile) return undefined;
    const { _id, ...rest } = profile;
    return { ...rest, id: _id.toString() } as GuideProfile;
  }

  async createGuideProfile(profileData: Omit<GuideProfile, 'id'>): Promise<GuideProfile> {
    const profile = {
      ...profileData,
      createdAt: profileData.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.guideProfiles.insertOne(profile as any);
    if (!result.insertedId) throw new Error('Failed to create guide profile');
    return { ...profile, id: result.insertedId.toString() } as GuideProfile;
  }

  async updateGuideProfile(id: string, profileData: Partial<GuideProfile>): Promise<GuideProfile | undefined> {
    const { id: _, ...updateData } = profileData;
    const result = await this.guideProfiles.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!result) return undefined;
    const { _id, ...rest } = result;
    return { ...rest, id: _id.toString() } as GuideProfile;
  }
  
  async getConnections(userId: string | number): Promise<ExtendedConnection[]> {
    const userIdStr = userId.toString();
    
    const connections = await this.connections.find({
      $or: [
        { userId: userIdStr },
        { followerId: userIdStr }
      ]
    }).toArray();
      
    const populatedConnections = await Promise.all(connections.map(async connection => {
      const { _id, ...rest } = connection;
      
      const baseConnection: ExtendedConnection = {
        id: nanoid(),
        fromUser: {
          id: '',
          name: '',
          email: '',
          userType: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        toUser: {
          id: '',
          name: '',
          email: '',
          userType: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        status: rest.status || 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        message: rest.message,
        tripDetails: rest.tripDetails,
        budget: rest.budget,
        guideProfile: undefined
      };
      
      // Get the users
      if (rest.fromUser?.id) {
        const fromUser = await this.getUser(rest.fromUser.id);
        if (fromUser) {
          const { password: _, ...fromUserSafe } = fromUser;
          baseConnection.fromUser = fromUserSafe;
        }
      }

      if (rest.toUser?.id) {
        const toUser = await this.getUser(rest.toUser.id);
        if (toUser) {
          const { password: _, ...toUserSafe } = toUser;
          baseConnection.toUser = toUserSafe;

          if (toUser.userType === 'guide' && toUser.id) {
            const guideProfile = await this.getGuideProfile(toUser.id);
            if (guideProfile) {
              baseConnection.guideProfile = guideProfile;
            }
          }
        }
      }
      
      // Save to database
      const savedConnection = await this.db.collection('connections').insertOne({
        fromUser: baseConnection.fromUser,
        toUser: baseConnection.toUser,
        status: baseConnection.status,
        createdAt: baseConnection.createdAt,
        updatedAt: baseConnection.updatedAt,
        guideProfile: baseConnection.guideProfile
      });
      
      return baseConnection;
    }));
    
    return populatedConnections;
  }

  async createConnection(connectionData: Omit<ExtendedConnection, 'id'>): Promise<ExtendedConnection> {
    try {
      const connection = {
        fromUser: connectionData.fromUser,
        toUser: connectionData.toUser,
        status: connectionData.status || 'pending',
        createdAt: connectionData.createdAt || new Date(),
        updatedAt: new Date(),
        message: connectionData.message,
        tripDetails: connectionData.tripDetails,
        budget: connectionData.budget,
        guideProfile: connectionData.guideProfile
      };
      
      const result = await this.connections.insertOne(connection as any);
      
      if (!result.insertedId) {
        throw new Error("Failed to insert connection");
      }
      
      return {
        ...connection,
        id: result.insertedId.toString()
      } as ExtendedConnection;
    } catch (error) {
      console.error("[storage] Error creating connection:", error);
      throw error;
    }
  }

  async updateConnectionStatus(id: string | number, status: 'pending' | 'accepted' | 'rejected'): Promise<ExtendedConnection | undefined> {
    try {
      let result;
      
      if (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
        result = await this.connections.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { status, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      } else {
        result = await this.connections.findOneAndUpdate(
          { id: id.toString() },
          { $set: { status, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      }
      
      if (!result) return undefined;
      
      const { _id, ...rest } = result;
      return {
        ...rest,
        id: _id.toString(),
        fromUser: rest.fromUser,
        toUser: rest.toUser,
        status: rest.status,
        createdAt: rest.createdAt,
        updatedAt: rest.updatedAt,
        guideProfile: rest.guideProfile,
        message: rest.message,
        tripDetails: rest.tripDetails,
        budget: rest.budget
      } as ExtendedConnection;
    } catch (error) {
      console.error("[storage] Error updating connection status:", error);
      return undefined;
    }
  }

  async getPlace(id: string): Promise<Place | undefined> {
    const place = await this.places.findOne({ _id: new ObjectId(id) });
    if (!place) return undefined;
    const { _id, ...rest } = place;
    return { ...rest, id: _id.toString() } as Place;
  }

  async getPlaces(): Promise<Place[]> {
    const places = await this.places.find().toArray();
    return places.map(place => {
      const { _id, ...rest } = place;
      return { ...rest, id: _id.toString() } as Place;
    });
  }

  async createPlace(placeData: Omit<Place, 'id'>): Promise<Place> {
    const place = {
      ...placeData,
      createdAt: placeData.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.places.insertOne(place as any);
    if (!result.insertedId) throw new Error('Failed to create place');
    return { ...place, id: result.insertedId.toString() } as Place;
  }

  async getItinerary(id: string): Promise<Itinerary | undefined> {
    const itinerary = await this.itineraries.findOne({ _id: new ObjectId(id) });
    if (!itinerary) return undefined;
    const { _id, ...rest } = itinerary;
    return { ...rest, id: _id.toString() } as Itinerary;
  }

  async createItinerary(itineraryData: Omit<Itinerary, 'id'>): Promise<Itinerary> {
    const itinerary = {
      ...itineraryData,
      createdAt: itineraryData.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.itineraries.insertOne(itinerary as any);
    if (!result.insertedId) throw new Error('Failed to create itinerary');
    return { ...itinerary, id: result.insertedId.toString() } as Itinerary;
  }

  async getItineraryPlaces(itineraryId: string): Promise<ItineraryPlace[]> {
    const places = await this.itineraryPlaces.find({ itineraryId }).toArray();
    return places.map(place => {
      const { _id, ...rest } = place;
      return { ...rest, id: _id.toString() } as ItineraryPlace;
    });
  }

  async createItineraryPlace(placeData: Omit<ItineraryPlace, 'id'>): Promise<ItineraryPlace> {
    const place = {
      ...placeData,
      createdAt: placeData.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.itineraryPlaces.insertOne(place as any);
    if (!result.insertedId) throw new Error('Failed to create itinerary place');
    return { ...place, id: result.insertedId.toString() } as ItineraryPlace;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const booking = await this.bookings.findOne({ _id: new ObjectId(id) });
    if (!booking) return undefined;
    const { _id, ...rest } = booking;
    return { ...rest, id: _id.toString() } as Booking;
  }

  async createBooking(bookingData: Omit<Booking, 'id'>): Promise<Booking> {
    const booking = {
      ...bookingData,
      createdAt: bookingData.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.bookings.insertOne(booking as any);
    if (!result.insertedId) throw new Error('Failed to create booking');
    return { ...booking, id: result.insertedId.toString() } as Booking;
  }

  async getSavedPlaces(userId: string): Promise<SavedPlace[]> {
    const savedPlaces = await this.savedPlaces.find({ userId }).toArray();
    return savedPlaces.map(savedPlace => {
      const { _id, ...rest } = savedPlace;
      return { ...rest, id: _id.toString() } as SavedPlace;
    });
  }

  async createSavedPlace(savedPlaceData: Omit<SavedPlace, 'id'>): Promise<SavedPlace> {
    const savedPlace = {
      ...savedPlaceData,
      createdAt: savedPlaceData.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.savedPlaces.insertOne(savedPlace as any);
    if (!result.insertedId) throw new Error('Failed to create saved place');
    return { ...savedPlace, id: result.insertedId.toString() } as SavedPlace;
  }

  async deleteSavedPlace(id: string): Promise<boolean> {
    const result = await this.savedPlaces.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }
  
  async updateUserLocation(userId: number, latitude: string, longitude: string): Promise<User> {
    const user = await this.getUser(userId.toString());
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      currentLatitude: latitude,
      currentLongitude: longitude,
      lastLocationUpdate: new Date()
    };
    
    await this.updateUser(userId.toString(), updatedUser);
    return updatedUser;
  }
  
  async getNearbyGuides(latitude: string, longitude: string, radiusKm: number = 10): Promise<User[]> {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    const users = await this.users.find({ userType: 'guide' }).toArray();
    
    return users.filter(user => 
      user.currentLatitude && 
      user.currentLongitude
    ).filter(user => {
      const guideLat = parseFloat(user.currentLatitude!);
      const guideLon = parseFloat(user.currentLongitude!);
      
      const R = 6371;
      const dLat = (guideLat - lat) * Math.PI / 180;
      const dLon = (guideLon - lon) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(guideLat * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return distance <= radiusKm;
    }).map(user => {
      const { _id, ...rest } = user;
      return { ...rest, id: _id.toString() } as User;
    });
  }
  
  async getNearbyPlaces(latitude: string, longitude: string, radiusKm: number = 10, category?: string): Promise<Place[]> {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    let filteredPlaces = await this.getPlaces();
    
    if (category) {
      filteredPlaces = filteredPlaces.filter(place => place.category === category);
    }
    
    return filteredPlaces.filter(place => {
      const placeLat = parseFloat(place.latitude);
      const placeLon = parseFloat(place.longitude);
      
      const R = 6371;
      const dLat = (placeLat - lat) * Math.PI / 180;
      const dLon = (placeLon - lon) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return distance <= radiusKm;
    });
  }
  
  async getMessagesByConnectionId(connectionId: string): Promise<any[]> {
    try {
      const messages = await this.db.collection('messages').find({ connectionId }).toArray();
      return messages.map(message => {
        const { _id, ...rest } = message;
        return { ...rest, id: _id.toString() };
      });
    } catch (error) {
      console.error("[storage] Error getting messages for connection:", error);
      return [];
    }
  }

  async createMessage(message: any): Promise<any> {
    try {
      const result = await this.db.collection('messages').insertOne(message);
      
      if (!result.insertedId) {
        throw new Error("Failed to insert message");
      }
      
      return { ...message, id: result.insertedId.toString() };
    } catch (error) {
      console.error("[storage] Error creating message:", error);
      throw error;
    }
  }

  async saveConnection(connectionData: Omit<ExtendedConnection, "id">): Promise<ExtendedConnection> {
    const baseConnection = {
      fromUser: connectionData.fromUser,
      toUser: connectionData.toUser,
      status: connectionData.status,
      createdAt: connectionData.createdAt,
      updatedAt: connectionData.updatedAt,
      guideProfile: connectionData.guideProfile
    };

    const savedConnection = await this.db.collection('connections').insertOne(baseConnection);
    return { ...baseConnection, id: savedConnection.insertedId.toString() };
  }
}

export const storage = new MongoStorage();