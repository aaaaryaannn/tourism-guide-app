import { db } from './db.js';
import { ObjectId } from 'mongodb';

export const storage = {
  users: db.collection('users'),
  guideProfiles: db.collection('guide_profiles'),
  places: db.collection('places'),
  itineraries: db.collection('itineraries'),
  itineraryPlaces: db.collection('itinerary_places'),
  savedPlaces: db.collection('saved_places'),
  
  // Helper methods
  async getUserByEmail(email: string) {
    return await this.users.findOne({ email });
  },
  
  async createUser(userData: any) {
    const result = await this.users.insertOne(userData);
    return { ...userData, id: result.insertedId.toString() };
  },
  
  async createGuideProfile(profileData: any) {
    const result = await this.guideProfiles.insertOne(profileData);
    return { ...profileData, id: result.insertedId.toString() };
  },
  
  async createPlace(placeData: any) {
    const result = await this.places.insertOne(placeData);
    return { ...placeData, id: result.insertedId.toString() };
  },
  
  async getPlace(id: string) {
    return await this.places.findOne({ _id: new ObjectId(id) });
  },
  
  async getPlaces() {
    return await this.places.find().toArray();
  },
  
  async createItinerary(itineraryData: any) {
    const result = await this.itineraries.insertOne(itineraryData);
    return { ...itineraryData, id: result.insertedId.toString() };
  },
  
  async createBooking(bookingData: any) {
    const result = await this.itineraries.insertOne(bookingData);
    return { ...bookingData, id: result.insertedId.toString() };
  },
  
  async createConnection(connectionData: any) {
    const result = await this.itineraries.insertOne(connectionData);
    return { ...connectionData, id: result.insertedId.toString() };
  },
  
  async getConnections(userId: string) {
    return await this.itineraries.find({
      $or: [{ fromUser: userId }, { toUser: userId }]
    }).toArray();
  }
}; 