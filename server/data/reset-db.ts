import { db } from "../db";

export async function resetDatabase() {
  try {
    console.log("Resetting database collections...");
    
    // List of collections to reset
    const collections = [
      'users',
      'guideProfiles',
      'places',
      'itineraries',
      'itineraryPlaces',
      'bookings',
      'connections',
      'savedPlaces'
    ];
    
    // Drop each collection
    for (const collectionName of collections) {
      try {
        console.log(`Dropping collection: ${collectionName}`);
        await db.collection(collectionName).deleteMany({});
        console.log(`Collection ${collectionName} cleared`);
      } catch (error) {
        console.error(`Error dropping collection ${collectionName}:`, error);
      }
    }
    
    console.log("Database reset complete!");
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === import.meta.main) {
  resetDatabase().catch(console.error);
} 