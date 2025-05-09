import { db } from "./db";
import { initializeDatabase } from "./db";
import { userSchema } from "../shared/schema";

async function resetDatabase() {
  try {
    // Make sure the database is connected
    await initializeDatabase();
    
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
    
    // Create a test user
    try {
      console.log("Creating test user...");
      const testUser = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
        phone: "1234567890",
        userType: "tourist",
        createdAt: new Date()
      };
      
      // Validate the user data
      const validatedUser = userSchema.omit({ id: true }).parse(testUser);
      
      // Insert the user
      const result = await db.collection('users').insertOne(validatedUser);
      console.log("Created test user with ID:", result.insertedId.toString());
      console.log("You can now log in with email: test@example.com and password: password123");
    } catch (error) {
      console.error("Error creating test user:", error);
    }
    
    console.log("Database reset complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
}

// Run the reset function
resetDatabase(); 