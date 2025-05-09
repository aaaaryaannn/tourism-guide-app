// mongo-check.js - Script to check and test connections in MongoDB
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Setup environment variables
dotenv.config();

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hardcoded connection string from your previous conversations
// Replace sensitive info with placeholder if sharing this code
const uri = "mongodb+srv://aaaaryaannn:r9J2T4WMCNMjmJGm@tga.ajmql56.mongodb.net/maharashtra_tour_guide";
const dbName = 'maharashtra_tour_guide';

console.log("Using connection string:", uri.replace(/mongodb\+srv:\/\/[^@]+@/, "mongodb+srv://****:****@"));

async function main() {
  // Create a MongoDB client with explicit options
  const client = new MongoClient(uri, {
    maxPoolSize: 10, // Adjust connection pool size
    connectTimeoutMS: 5000, // Connection timeout
    socketTimeoutMS: 30000, // Socket timeout
  });

  try {
    // Connect to the MongoDB server
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log('Connected to MongoDB successfully');

    // Get database and collections
    const db = client.db(dbName);
    const connectionsCollection = db.collection('connections');
    const usersCollection = db.collection('users');
    
    // Count all connections
    const totalConnections = await connectionsCollection.countDocuments();
    console.log(`Total connections in database: ${totalConnections}`);
    
    // Count connections by status
    const pendingCount = await connectionsCollection.countDocuments({ status: 'pending' });
    const acceptedCount = await connectionsCollection.countDocuments({ status: 'accepted' });
    const rejectedCount = await connectionsCollection.countDocuments({ status: 'rejected' });
    
    console.log(`Connections by status:
    - Pending: ${pendingCount}
    - Accepted: ${acceptedCount}
    - Rejected: ${rejectedCount}`);

    // Get all guides
    const guides = await usersCollection.find({ userType: 'guide' }).toArray();
    console.log(`\nFound ${guides.length} guides:`);
    guides.forEach(guide => {
      console.log(`- Guide: ${guide.fullName} (ID: ${guide._id})`);
    });

    // For each guide, check for pending connections
    console.log('\nChecking pending connections for guides:');
    for (const guide of guides) {
      const guideId = guide._id.toString();
      
      // Find pending connections where guide is the recipient
      const pendingToGuide = await connectionsCollection.find({
        toUserId: guideId,
        status: 'pending'
      }).toArray();
      
      console.log(`Guide ${guide.fullName} has ${pendingToGuide.length} pending requests`);
      
      // Log each pending connection
      if (pendingToGuide.length > 0) {
        for (const conn of pendingToGuide) {
          // Get the tourist name
          const tourist = await usersCollection.findOne({ _id: new ObjectId(conn.fromUserId) });
          const touristName = tourist ? tourist.fullName : 'Unknown tourist';
          
          console.log(`  - Request from ${touristName} (${conn.fromUserId}) on ${new Date(conn.createdAt).toLocaleString()}`);
          console.log(`    Message: ${conn.message}`);
          console.log(`    ID: ${conn._id}`);
        }
      }
    }

    // After checking pending connections for guides
    console.log('\nChecking accepted connections for guides:');
    for (const guide of guides) {
      const guideId = guide._id.toString();
      
      // Find accepted connections where guide is the recipient
      const acceptedForGuide = await connectionsCollection.find({
        toUserId: guideId,
        status: 'accepted'
      }).toArray();
      
      console.log(`Guide ${guide.fullName} has ${acceptedForGuide.length} accepted requests`);
      
      // Log each accepted connection
      if (acceptedForGuide.length > 0) {
        for (const conn of acceptedForGuide) {
          // Get the tourist name
          const tourist = await usersCollection.findOne({ _id: new ObjectId(conn.fromUserId) });
          const touristName = tourist ? tourist.fullName : 'Unknown tourist';
          
          console.log(`  - Accepted request from ${touristName} (${conn.fromUserId}) on ${new Date(conn.createdAt).toLocaleString()}`);
          console.log(`    Updated on: ${new Date(conn.updatedAt).toLocaleString()}`);
          console.log(`    Message: ${conn.message}`);
          console.log(`    ID: ${conn._id}`);
        }
      }
    }

    // Get all tourists
    const tourists = await usersCollection.find({ userType: 'tourist' }).toArray();
    console.log(`\nFound ${tourists.length} tourists`);
    
    // For each tourist, check pending requests
    console.log('\nChecking pending connections for tourists:');
    for (const tourist of tourists) {
      const touristId = tourist._id.toString();
      
      // Find pending connections where tourist is the sender
      const pendingFromTourist = await connectionsCollection.find({
        fromUserId: touristId,
        status: 'pending'
      }).toArray();
      
      console.log(`Tourist ${tourist.fullName} has ${pendingFromTourist.length} pending requests`);
      
      // Log each pending connection
      if (pendingFromTourist.length > 0) {
        for (const conn of pendingFromTourist) {
          // Get the guide name
          const guide = await usersCollection.findOne({ _id: new ObjectId(conn.toUserId) });
          const guideName = guide ? guide.fullName : 'Unknown guide';
          
          console.log(`  - Request to ${guideName} (${conn.toUserId}) on ${new Date(conn.createdAt).toLocaleString()}`);
          console.log(`    Message: ${conn.message}`);
          console.log(`    ID: ${conn._id}`);
        }
      }
    }

    // After checking pending connections for tourists
    console.log('\nChecking accepted connections for tourists:');
    for (const tourist of tourists) {
      const touristId = tourist._id.toString();
      
      // Find accepted connections where tourist is the sender
      const acceptedFromTourist = await connectionsCollection.find({
        fromUserId: touristId,
        status: 'accepted'
      }).toArray();
      
      console.log(`Tourist ${tourist.fullName} has ${acceptedFromTourist.length} accepted requests`);
      
      // Log each accepted connection
      if (acceptedFromTourist.length > 0) {
        for (const conn of acceptedFromTourist) {
          // Get the guide name
          const guide = await usersCollection.findOne({ _id: new ObjectId(conn.toUserId) });
          const guideName = guide ? guide.fullName : 'Unknown guide';
          
          console.log(`  - Accepted request to ${guideName} (${conn.toUserId}) on ${new Date(conn.createdAt).toLocaleString()}`);
          console.log(`    Accepted on: ${new Date(conn.updatedAt).toLocaleString()}`);
          console.log(`    Message: ${conn.message}`);
          console.log(`    ID: ${conn._id}`);
        }
      }
    }

    // Command-line arg to accept a connection
    const acceptConnectionId = process.argv[2];
    if (acceptConnectionId && acceptConnectionId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`\nAttempting to accept connection with ID: ${acceptConnectionId}`);
      
      try {
        // Find the connection
        const connection = await connectionsCollection.findOne({ 
          _id: new ObjectId(acceptConnectionId) 
        });
        
        if (!connection) {
          console.log(`Connection with ID ${acceptConnectionId} not found`);
        } else {
          console.log(`Found connection: ${connection._id}`);
          console.log(`Current status: ${connection.status}`);
          
          // Update the connection status
          const result = await connectionsCollection.updateOne(
            { _id: new ObjectId(acceptConnectionId) },
            { $set: { 
                status: 'accepted',
                updatedAt: new Date()
              } 
            }
          );
          
          if (result.modifiedCount === 1) {
            console.log(`Successfully accepted connection ${acceptConnectionId}`);
            
            // Get involved users
            const fromUser = await usersCollection.findOne({ _id: new ObjectId(connection.fromUserId) });
            const toUser = await usersCollection.findOne({ _id: new ObjectId(connection.toUserId) });
            
            console.log(`Connection between: 
              - From: ${fromUser?.fullName} (${fromUser?.userType})
              - To: ${toUser?.fullName} (${toUser?.userType})
            `);
          } else {
            console.log(`Failed to update connection ${acceptConnectionId}`);
          }
        }
      } catch (error) {
        console.error(`Error accepting connection: ${error}`);
      }
    } else if (acceptConnectionId) {
      console.log(`\nInvalid connection ID format: ${acceptConnectionId}`);
      console.log('Connection ID should be a 24-character hexadecimal string');
    }

    // Check for a specific guide ID provided as a CLI argument
    const targetGuideId = "67edc350abce3671ad236b6d"; // Hardcoded ID to check
    console.log(`\nSearching specifically for guide with ID: ${targetGuideId}`);

    // Find all connections for this specific guide
    const guideConnections = await connectionsCollection.find({
      toUserId: targetGuideId
    }).toArray();

    console.log(`Found ${guideConnections.length} total connections for guide ${targetGuideId}`);

    // Show connections by status
    const guidePendingConnections = guideConnections.filter(conn => conn.status === 'pending');
    const guideAcceptedConnections = guideConnections.filter(conn => conn.status === 'accepted');
    const guideRejectedConnections = guideConnections.filter(conn => conn.status === 'rejected');

    console.log(`Connections for guide ${targetGuideId} by status:`);
    console.log(`- Pending: ${guidePendingConnections.length}`);
    console.log(`- Accepted: ${guideAcceptedConnections.length}`);
    console.log(`- Rejected: ${guideRejectedConnections.length}`);

    // Get details of tourists who sent requests
    if (guidePendingConnections.length > 0) {
      console.log(`\nPending requests for guide ${targetGuideId}:`);
      for (const conn of guidePendingConnections) {
        const tourist = await usersCollection.findOne({ _id: new ObjectId(conn.fromUserId) });
        const touristName = tourist ? tourist.fullName : 'Unknown tourist';
        
        console.log(`- From ${touristName} (${conn.fromUserId})`);
        console.log(`  Message: ${conn.message}`);
        console.log(`  Created: ${new Date(conn.createdAt).toLocaleString()}`);
        console.log(`  Connection ID: ${conn._id}`);
      }
    }

    // Check for a command to create a test request
    if (process.argv[2] === "create-test") {
      const targetGuideId = "67edc350abce3671ad236b6d"; // Aryan
      
      // Find the first tourist
      const tourist = await usersCollection.findOne({ userType: 'tourist' });
      
      if (tourist) {
        const touristId = tourist._id.toString();
        console.log(`Using tourist: ${tourist.fullName} (${touristId})`);
        
        // Create the test request
        await createTestRequest(db, targetGuideId, touristId);
        
        // Re-fetch connections to verify
        const updatedConnections = await connectionsCollection.find({
          toUserId: targetGuideId,
          status: 'pending'
        }).toArray();
        
        console.log(`After creating test request, guide ${targetGuideId} has ${updatedConnections.length} pending requests`);
      } else {
        console.log("No tourists found to create test request");
      }
    }

  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    // Close the client
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Function to create a new test request for a guide
async function createTestRequest(db, guideId, touristId) {
  console.log(`\nCreating a test connection request from tourist ${touristId} to guide ${guideId}`);
  try {
    const connectionsCollection = db.collection('connections');
    
    // Create the new connection request
    const newConnection = {
      fromUserId: touristId,
      toUserId: guideId,
      status: 'pending',
      message: 'This is a test connection request',
      tripDetails: 'Looking for a guide in Mumbai for 3 days',
      budget: '₹5000-₹7000',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await connectionsCollection.insertOne(newConnection);
    
    if (result.insertedId) {
      console.log(`Successfully created connection with ID: ${result.insertedId}`);
      return result.insertedId.toString();
    } else {
      console.log("Failed to create connection");
      return null;
    }
  } catch (error) {
    console.error("Error creating test connection:", error);
    return null;
  }
}

// Run the function
main().catch(console.error); 