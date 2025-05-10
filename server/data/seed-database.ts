import { IStorage } from '../storage.js';
import { maharashtraAttractions } from './maharashtra-attractions.js';
import { maharashtraGuides } from './maharashtra-guides.js';
import { ObjectId } from 'mongodb';

export async function seedDatabase(storage: IStorage) {
  console.log('Seeding database...');

  try {
    // Check if users collection has data
    const existingUsers = await storage.users.find().limit(1).toArray();
    if (existingUsers.length > 0) {
      console.log('Database already has users, skipping seed process');
      return;
    }

    // Add places
    console.log('Adding places...');
    for (const place of maharashtraAttractions) {
      const placeId = new ObjectId();
      const placeData = {
        _id: placeId,
        ...place,
        id: placeId.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await storage.places.insertOne(placeData);
    }

    // Add guides
    console.log('Adding guides...');
    for (const guide of maharashtraGuides) {
      const userId = new ObjectId();
      const userData = {
        _id: userId,
        ...guide.user,
        id: userId.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await storage.users.insertOne(userData);

      const profileId = new ObjectId();
      const profileData = {
        _id: profileId,
        ...guide.profile,
        id: profileId.toString(),
        userId: userId.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await storage.guideProfiles.insertOne(profileData);
    }

    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}