import { MongoClient } from 'mongodb';

// Connection URI from .env file
const uri = "mongodb+srv://aaaaryaannn:r9J2T4WMCNMjmJGm@tga.ajmql56.mongodb.net/maharashtra_tour_guide?retryWrites=true&w=majority&appName=TGA";

async function main() {
  console.log('Connecting to MongoDB...');
  
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('Connected to MongoDB!');
    
    // Get the database
    const db = client.db('maharashtra_tour_guide');
    
    // Check the most recent connections
    const connectionsCollection = db.collection('connections');
    const usersCollection = db.collection('users');
    
    // Find all connections sorted by _id (newest first)
    console.log('\nFetching connections...');
    const connections = await connectionsCollection.find({}).toArray();
    
    // Sort connections by _id (most recent first)
    connections.sort((a, b) => b._id.toString().localeCompare(a._id.toString()));
    
    console.log(`Found ${connections.length} connections total`);
    
    // First, get all users to identify who is who
    const users = await usersCollection.find({}).toArray();
    
    console.log("\n=== USERS INFORMATION ===");
    for (const user of users) {
      console.log(`\nUser ID: ${user._id}`);
      console.log(`  Name: ${user.name || user.fullName || 'Not set'}`);
      console.log(`  Email: ${user.email || 'Not set'}`);
      console.log(`  Username: ${user.username || 'Not set'}`);
      console.log(`  Type: ${user.userType || user.type || 'Not set'}`);
    }
    
    // Get all pending connections
    const pendingConnections = connections.filter(c => c.status === 'pending');
    console.log(`\n\n=== PENDING REQUESTS (${pendingConnections.length} total) ===`);
    
    // Group connections by the "from" user ID (the requester)
    const requestsByUser = {};
    
    for (const connection of pendingConnections) {
      const fromUserId = connection.fromUserId.toString();
      if (!requestsByUser[fromUserId]) {
        requestsByUser[fromUserId] = [];
      }
      requestsByUser[fromUserId].push(connection);
    }
    
    // Display pending requests grouped by user
    for (const userId in requestsByUser) {
      const userRequests = requestsByUser[userId];
      const user = users.find(u => u._id.toString() === userId);
      const userIdentifier = user ? 
        `${user.name || user.fullName || user.username || 'Unknown'} (${user.email || 'No email'})` : 
        'Unknown User';
      
      console.log(`\n--- User: ${userIdentifier} ---`);
      console.log(`User ID: ${userId}`);
      console.log(`Total pending requests: ${userRequests.length}`);
      
      // List each request
      for (let i = 0; i < userRequests.length; i++) {
        const req = userRequests[i];
        const creationTime = new Date(parseInt(req._id.toString().substring(0, 8), 16) * 1000);
        const toUser = users.find(u => u._id.toString() === req.toUserId.toString());
        const toUserName = toUser ? 
          `${toUser.name || toUser.fullName || toUser.username || 'Unknown'} (${toUser.email || 'No email'})` :
          'Unknown Guide';
        
        console.log(`\n  Request ${i + 1}:`);
        console.log(`    Date: ${creationTime.toLocaleString()}`);
        console.log(`    Connection ID: ${req._id}`);
        console.log(`    To Guide: ${toUserName} (ID: ${req.toUserId})`);
        console.log(`    Message: ${req.message || 'No message'}`);
        console.log(`    Trip Details: ${req.tripDetails || 'No details'}`);
      }
    }
    
    // Check specifically for the current user (who we think is having the issue)
    // Most likely user ID based on recent activity
    const currentUserId = '67ed96b89977332e9bc92dcf';
    const currentUserRequests = pendingConnections.filter(c => c.fromUserId.toString() === currentUserId);
    
    if (currentUserRequests.length > 0) {
      console.log(`\n\n=== FOCUS: USER ${currentUserId} PENDING REQUESTS ===`);
      console.log(`This user has ${currentUserRequests.length} pending guide requests`);
      
      // Group by guide to see if multiple requests to same guide
      const requestsByGuide = {};
      for (const req of currentUserRequests) {
        const guideId = req.toUserId.toString();
        if (!requestsByGuide[guideId]) {
          requestsByGuide[guideId] = [];
        }
        requestsByGuide[guideId].push(req);
      }
      
      for (const guideId in requestsByGuide) {
        const guide = users.find(u => u._id.toString() === guideId);
        const guideName = guide ? 
          `${guide.name || guide.fullName || guide.username || 'Unknown'} (${guide.email || 'No email'})` :
          'Unknown Guide';
        
        console.log(`\n--- Guide: ${guideName} ---`);
        console.log(`Guide ID: ${guideId}`);
        console.log(`Number of pending requests to this guide: ${requestsByGuide[guideId].length}`);
        
        requestsByGuide[guideId].forEach((req, index) => {
          const creationTime = new Date(parseInt(req._id.toString().substring(0, 8), 16) * 1000);
          console.log(`\n  Request ${index + 1}:`);
          console.log(`    Date: ${creationTime.toLocaleString()}`);
          console.log(`    Connection ID: ${req._id}`);
          console.log(`    Message: ${req.message || 'No message'}`);
          console.log(`    Trip Details: ${req.tripDetails || 'No details'}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error connecting to MongoDB:');
    console.error(error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed.');
  }
}

main().catch(console.error); 