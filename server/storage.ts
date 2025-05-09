import type { User, GuideProfile, Place, Itinerary, ItineraryPlace, Connection, SavedPlace } from "../shared/schema.ts";
import { db } from './db.ts';
import type { IStorage } from './storage.interface.ts';
import { ObjectId } from 'mongodb';

export class MongoStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) return undefined;
    const { _id, ...rest } = user;
    return { ...rest, id: _id.toString() } as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await db.collection('users').findOne({ email });
    if (!user) return undefined;
    const { _id, ...rest } = user;
    return { ...rest, id: _id.toString() } as User;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      console.log("In createUser, data:", JSON.stringify(user, null, 2));
      // Add a createdAt date if not provided
      const userData = {
        ...user,
        createdAt: user.createdAt || new Date()
      };
      
      console.log("Inserting user into MongoDB:", JSON.stringify(userData, null, 2));
      const result = await db.collection('users').insertOne(userData);
      console.log("Insert result:", JSON.stringify(result, null, 2));
      
      if (!result.insertedId) {
        throw new Error("Failed to create user - no insertedId returned");
      }
      
      const insertedUser = { ...userData, id: result.insertedId.toString() } as User;
      console.log("User created successfully:", JSON.stringify(insertedUser, null, 2));
      return insertedUser;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    const { id: _, ...updateData } = user;
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    if (!result.value) return undefined;
    const { _id, ...rest } = result.value;
    return { ...rest, id: _id.toString() } as User;
  }
  
  // Guide methods
  async getGuideProfile(userId: string): Promise<GuideProfile | undefined> {
    const profile = await db.collection('guideProfiles').findOne({ userId });
    if (!profile) return undefined;
    const { _id, ...rest } = profile;
    return { ...rest, id: _id.toString() } as GuideProfile;
  }

  async createGuideProfile(profile: Omit<GuideProfile, 'id'>): Promise<GuideProfile> {
    const result = await db.collection('guideProfiles').insertOne(profile);
    if (!result.insertedId) throw new Error('Failed to create guide profile');
    return { ...profile, id: result.insertedId.toString() } as GuideProfile;
  }

  async updateGuideProfile(id: string, profile: Partial<GuideProfile>): Promise<GuideProfile | undefined> {
    const { id: _, ...updateData } = profile;
    const result = await db.collection('guideProfiles').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    if (!result.value) return undefined;
    const { _id, ...rest } = result.value;
    return { ...rest, id: _id.toString() } as GuideProfile;
  }
  
  // Places methods
  async getPlace(id: string): Promise<Place | undefined> {
    const place = await db.collection('places').findOne({ _id: new ObjectId(id) });
    if (!place) return undefined;
    const { _id, ...rest } = place;
    return { ...rest, id: _id.toString() } as Place;
  }

  async getPlaces(): Promise<Place[]> {
    const places = await db.collection('places').find().toArray();
    return places.map(place => {
      const { _id, ...rest } = place;
      return { ...rest, id: _id.toString() } as Place;
    });
  }

  async createPlace(place: Omit<Place, 'id'>): Promise<Place> {
    const result = await db.collection('places').insertOne(place);
    if (!result.insertedId) throw new Error('Failed to create place');
    return { ...place, id: result.insertedId.toString() } as Place;
  }
  
  // Itinerary methods
  async getItinerary(id: string): Promise<Itinerary | undefined> {
    const itinerary = await db.collection('itineraries').findOne({ _id: new ObjectId(id) });
    if (!itinerary) return undefined;
    const { _id, ...rest } = itinerary;
    return { ...rest, id: _id.toString() } as Itinerary;
  }

  async createItinerary(itinerary: Omit<Itinerary, 'id'>): Promise<Itinerary> {
    const result = await db.collection('itineraries').insertOne(itinerary);
    if (!result.insertedId) throw new Error('Failed to create itinerary');
    return { ...itinerary, id: result.insertedId.toString() } as Itinerary;
  }
  
  // Itinerary places methods
  async getItineraryPlaces(itineraryId: string): Promise<ItineraryPlace[]> {
    const places = await db.collection('itineraryPlaces').find({ itineraryId }).toArray();
    return places.map(place => {
      const { _id, ...rest } = place;
      return { ...rest, id: _id.toString() } as ItineraryPlace;
    });
  }

  async createItineraryPlace(place: Omit<ItineraryPlace, 'id'>): Promise<ItineraryPlace> {
    const result = await db.collection('itineraryPlaces').insertOne(place);
    if (!result.insertedId) throw new Error('Failed to create itinerary place');
    return { ...place, id: result.insertedId.toString() } as ItineraryPlace;
  }
  
  // Booking methods
  async getBooking(id: string): Promise<Booking | undefined> {
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) });
    if (!booking) return undefined;
    const { _id, ...rest } = booking;
    return { ...rest, id: _id.toString() } as Booking;
  }

  async createBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const result = await db.collection('bookings').insertOne(booking);
    if (!result.insertedId) throw new Error('Failed to create booking');
    return { ...booking, id: result.insertedId.toString() } as Booking;
  }
  
  // Connection methods
  async getConnections(userId: string | number): Promise<Connection[]> {
    console.log("[storage] Getting connections for user:", userId, "Type:", typeof userId);
    
    // Convert userId to string for consistent comparison
    const userIdStr = userId.toString();
    
    // Search for connections where the user is either the sender or recipient
    const connections = await db.collection('connections').find({
      $or: [
        { fromUserId: userIdStr }, 
        { toUserId: userIdStr }
      ]
    }).toArray();
      
    console.log(`[storage] Found ${connections.length} connections for user ${userId}`);
    
    // Map connections and populate user data
    const populatedConnections = await Promise.all(connections.map(async connection => {
      const { _id, ...rest } = connection;
      
      // Create base connection with string IDs
      const baseConnection = { 
        ...rest, 
        id: _id.toString(),
        fromUserId: String(rest.fromUserId || ""),
        toUserId: String(rest.toUserId || "")
      };
      
      try {
        // Get fromUser data
        const fromUser = await this.getUser(baseConnection.fromUserId);
        if (fromUser) {
          const { password, ...fromUserSafe } = fromUser;
          baseConnection.fromUser = fromUserSafe;
        }
        
        // Get toUser data
        const toUser = await this.getUser(baseConnection.toUserId);
        if (toUser) {
          const { password, ...toUserSafe } = toUser;
          baseConnection.toUser = toUserSafe;
        }
        
        // If toUser is a guide, get their guide profile
        if (toUser?.userType === 'guide') {
          const guideProfile = await this.getGuideProfile(baseConnection.toUserId);
          if (guideProfile) {
            baseConnection.guideProfile = guideProfile;
          }
        }
      } catch (error) {
        console.error("[storage] Error populating user data for connection:", error);
      }
      
      return baseConnection as Connection;
    }));
    
    return populatedConnections;
  }

  async createConnection(connection: Omit<Connection, 'id'>): Promise<Connection> {
    try {
      console.log("[DEBUG] About to insert connection into MongoDB:", connection);
      
      // Add creation timestamp if not provided
      const connectionWithTimestamp = {
        ...connection,
        createdAt: connection.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Ensure IDs are strings for consistency
      const normalizedConnection = {
        ...connectionWithTimestamp,
        fromUserId: connectionWithTimestamp.fromUserId.toString(),
        toUserId: connectionWithTimestamp.toUserId.toString()
      };
      
      const result = await db.collection('connections').insertOne(normalizedConnection);
      console.log("[DEBUG] MongoDB insert result:", result);
      
      if (!result.insertedId) {
        console.error("[DEBUG] Failed to insert connection - no insertedId returned");
        throw new Error('Failed to create connection - no insertedId returned');
      }
      
      const insertedConnection = { 
        ...normalizedConnection, 
        id: result.insertedId.toString() 
      } as Connection;
      
      console.log("[DEBUG] Connection successfully created:", insertedConnection);
      return insertedConnection;
    } catch (error) {
      console.error("[DEBUG] Error in createConnection:", error);
      throw error;
    }
  }

  // Get a connection by ID
  async getConnection(connectionId: number | string): Promise<Connection | null> {
    try {
      console.log("[storage] Getting connection with ID:", connectionId, "Type:", typeof connectionId);
      
      let query = {};
      // If it looks like an ObjectId, convert it
      if (typeof connectionId === 'string' && connectionId.match(/^[0-9a-fA-F]{24}$/)) {
        query = { _id: new ObjectId(connectionId) };
      } else {
        // Try with the raw ID (could be a numeric ID or another string format)
        query = { _id: connectionId };
      }
      
      const connection = await db.collection('connections').findOne(query);
      console.log("[storage] Connection found:", connection ? "Yes" : "No");
      
      if (!connection) return null;
      
      const { _id, ...rest } = connection;
      
      // Convert MongoDB document to Connection type
      const connectionData: Connection = { 
        ...rest,
        id: _id.toString(),
        fromUserId: rest.fromUserId.toString(),
        toUserId: rest.toUserId.toString()
      };
      
      // Add user fields to connection object manually
      const connectionWithUsers: any = { ...connectionData };
      
      try {
        // Get the fromUser details
        const fromUser = await this.getUser(connectionData.fromUserId);
        if (fromUser) {
          // Remove password for security
          const { password, ...fromUserSafe } = fromUser;
          connectionWithUsers.fromUser = fromUserSafe;
        }
        
        // Get the toUser details
        const toUser = await this.getUser(connectionData.toUserId);
        if (toUser) {
          // Remove password for security
          const { password, ...toUserSafe } = toUser;
          connectionWithUsers.toUser = toUserSafe;
        }
      } catch (userError) {
        console.error("[storage] Error getting user details for connection:", userError);
        // Continue even if we can't get user details
      }
      
      return connectionWithUsers as Connection;
    } catch (error) {
      console.error("[storage] Error getting connection:", error);
      return null;
    }
  }
  
  async updateConnectionStatus(id: string | number, status: string): Promise<Connection | undefined> {
    try {
      console.log("[storage] Updating connection status:", { id, status, idType: typeof id });
      
      // Try multiple approaches to find the connection
      let connection;
      
      // 1. First try as a MongoDB ObjectId (most common case)
      if (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
        try {
          console.log("[storage] Trying with ObjectId:", id);
          const objectId = new ObjectId(id);
          const result = await db.collection('connections').findOneAndUpdate(
            { _id: objectId },
            { $set: { status, updatedAt: new Date().toISOString() } },
            { returnDocument: 'after' }
          );
          if (result && result.value) {
            console.log("[storage] Found and updated connection with ObjectId");
            connection = result.value;
          }
        } catch (error) {
          console.log("[storage] ObjectId approach failed:", error);
        }
      }
      
      // 2. If no result, try with string ID instead of numeric ID
      if (!connection && typeof id === 'string' && !isNaN(Number(id))) {
        try {
          console.log("[storage] Trying with string ID that looks numeric:", id);
          // Do not convert to Number - this can cause ObjectId type issues
          const result = await db.collection('connections').findOneAndUpdate(
            { _id: id },
            { $set: { status, updatedAt: new Date().toISOString() } },
            { returnDocument: 'after' }
          );
          if (result && result.value) {
            console.log("[storage] Found and updated connection with string ID");
            connection = result.value;
          }
        } catch (error) {
          console.log("[storage] String ID approach failed:", error);
        }
      }
      
      // 3. If still no result, try direct ID match (string comparison)
      if (!connection) {
        try {
          console.log("[storage] Trying with string ID direct match:", id);
          const result = await db.collection('connections').findOneAndUpdate(
            { id: id.toString() },
            { $set: { status, updatedAt: new Date().toISOString() } },
            { returnDocument: 'after' }
          );
          if (result && result.value) {
            console.log("[storage] Found and updated connection with string ID");
            connection = result.value;
          }
        } catch (error) {
          console.log("[storage] String ID approach failed:", error);
        }
      }
      
      // 4. Last resort: Search by ID in ID field (for non-_id stored values)
      if (!connection) {
        try {
          console.log("[storage] Last resort - searching for connection with the ID value:", id);
          // Get the connection first, then update it
          const foundConnection = await db.collection('connections').findOne({ id: id.toString() });
          if (foundConnection) {
            console.log("[storage] Found connection with id field:", foundConnection);
            const result = await db.collection('connections').findOneAndUpdate(
              { _id: foundConnection._id },
              { $set: { status, updatedAt: new Date().toISOString() } },
              { returnDocument: 'after' }
            );
            if (result && result.value) {
              console.log("[storage] Successfully updated connection found by id field");
              connection = result.value;
            }
          }
        } catch (error) {
          console.log("[storage] Last resort approach failed:", error);
        }
      }
      
      if (!connection) {
        console.log("[storage] No connection found with ID:", id);
        return undefined;
      }
      
      // Connection was found and updated
      console.log("[storage] Connection updated:", connection);
      const { _id, ...rest } = connection;
      
      // Ensure fromUserId and toUserId are strings for consistency
      return { 
        ...rest, 
        id: _id.toString(),
        fromUserId: rest.fromUserId?.toString() || "",
        toUserId: rest.toUserId?.toString() || ""
      } as Connection;
    } catch (error) {
      console.error("[storage] Error updating connection status:", error);
      return undefined;
    }
  }

  // Saved places methods
  async getSavedPlaces(userId: string): Promise<SavedPlace[]> {
    const savedPlaces = await db.collection('savedPlaces').find({ userId }).toArray();
    return savedPlaces.map(savedPlace => {
      const { _id, ...rest } = savedPlace;
      return { ...rest, id: _id.toString() } as SavedPlace;
    });
  }

  async createSavedPlace(savedPlace: Omit<SavedPlace, 'id'>): Promise<SavedPlace> {
    const result = await db.collection('savedPlaces').insertOne(savedPlace);
    if (!result.insertedId) throw new Error('Failed to create saved place');
    return { ...savedPlace, id: result.insertedId.toString() } as SavedPlace;
  }

  async deleteSavedPlace(id: string): Promise<boolean> {
    const result = await db.collection('savedPlaces').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }
  
  // Geolocation methods
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
    
    // Get all users who are guides
    const users = await db.collection('users').find({ userType: 'guide' }).toArray();
    
    return users.filter(user => 
      user.currentLatitude && 
      user.currentLongitude
    ).filter(user => {
      const guideLat = parseFloat(user.currentLatitude!);
      const guideLon = parseFloat(user.currentLongitude!);
      
      // Calculate distance using haversine formula
      const R = 6371; // Earth's radius in km
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
      
      // Calculate distance using haversine formula
      const R = 6371; // Earth's radius in km
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
  
  // Messages methods
  async getMessagesByConnectionId(connectionId: string): Promise<any[]> {
    try {
      console.log("[storage] Getting messages for connection:", connectionId);
      
      // Find messages for this connection
      const messages = await db.collection('messages').find({ connectionId }).toArray();
      console.log("[storage] Found", messages.length, "messages for connection", connectionId);
      
      // Map the messages to our expected format
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
      console.log("[storage] Creating new message:", {
        connectionId: message.connectionId,
        sender: message.senderId,
        recipient: message.recipientId,
        contentLength: message.content.length
      });
      
      // Insert the message
      const result = await db.collection('messages').insertOne(message);
      
      if (!result.insertedId) {
        throw new Error("Failed to insert message");
      }
      
      // Return the created message with the ID
      const createdMessage = { ...message, id: result.insertedId.toString() };
      console.log("[storage] Message created successfully with ID:", createdMessage.id);
      
      return createdMessage;
    } catch (error) {
      console.error("[storage] Error creating message:", error);
      throw error;
    }
  }
}

// Export the MongoDB storage implementation
export const storage = new MongoStorage();
