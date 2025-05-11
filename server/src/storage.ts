import { User, GuideProfile, Place, Itinerary, Booking } from './models/index.js';
import type { Document } from 'mongoose';

export const storage = {
  users: User,
  guideProfiles: GuideProfile,
  places: Place,
  itineraries: Itinerary,
  bookings: Booking,
  
  // Helper methods
  async getUserByEmail(email: string) {
    return await User.findOne({ email });
  },
  
  async createUser(userData: any) {
    const user = new User(userData);
    await user.save();
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  },
  
  async createGuideProfile(profileData: any) {
    const profile = new GuideProfile(profileData);
    await profile.save();
    return profile.toObject();
  },
  
  async createPlace(placeData: any) {
    const place = new Place(placeData);
    await place.save();
    return place.toObject();
  },
  
  async getPlace(id: string) {
    return await Place.findById(id);
  },
  
  async getPlaces() {
    return await Place.find();
  },
  
  async createItinerary(itineraryData: any) {
    const itinerary = new Itinerary(itineraryData);
    await itinerary.save();
    return itinerary.toObject();
  },
  
  async createBooking(bookingData: any) {
    const booking = new Booking(bookingData);
    await booking.save();
    return booking.toObject();
  },
  
  async getConnections(userId: string) {
    return await Booking.find({
      $or: [{ userId }, { guideId: userId }]
    }).populate('userId guideId');
  }
}; 