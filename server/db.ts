import { MongoClient, ServerApiVersion } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Did you forget to provision a database?",
  );
}

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export const db = client.db("maharashtra_tour_guide");

// List of collections to ensure exist
const requiredCollections = [
  'users',
  'guideProfiles',
  'places',
  'itineraries',
  'itineraryPlaces',
  'bookings',
  'connections',
  'savedPlaces'
];

// Initialize the database connection
export async function initializeDatabase() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
    
    // Ensure all required collections exist
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);
    
    console.log("Existing collections:", existingNames);
    
    for (const collectionName of requiredCollections) {
      if (!existingNames.includes(collectionName)) {
        console.log(`Creating collection: ${collectionName}`);
        await db.createCollection(collectionName);
      }
    }
    
    console.log("All required collections are available");
    
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
