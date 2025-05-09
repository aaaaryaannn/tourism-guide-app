import { MongoClient, ServerApiVersion } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be set");
}

async function testMongoDBConnection() {
  console.log("Testing MongoDB connection...");
  console.log("Connection string:", process.env.MONGODB_URI);
  
  const client = new MongoClient(process.env.MONGODB_URI!, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB server");
    
    const db = client.db("maharashtra_tour_guide");
    console.log("Connected to database:", db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
    // Test inserting and finding a document
    console.log("Testing document operations...");
    const testCollection = db.collection('test_connection');
    
    const result = await testCollection.insertOne({
      test: true,
      message: "This is a test document",
      createdAt: new Date()
    });
    
    console.log("Inserted document with ID:", result.insertedId.toString());
    
    const document = await testCollection.findOne({ _id: result.insertedId });
    console.log("Found document:", document);
    
    // Cleanup
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log("Test document deleted");
    
    // Test user collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log("Number of users in database:", userCount);
    
    console.log("All MongoDB tests passed successfully!");
  } catch (error) {
    console.error("MongoDB test failed:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Run the test
testMongoDBConnection().catch(console.error); 