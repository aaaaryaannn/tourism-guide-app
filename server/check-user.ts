import { db } from "./db";
import { initializeDatabase } from "./db";

async function checkUser() {
  try {
    // Make sure the database is connected
    await initializeDatabase();
    
    console.log("Connected to MongoDB database successfully");
    
    // List all collections in the database
    const collections = await db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
    // Check for users collection
    if (collections.find(c => c.name === 'users')) {
      console.log("Users collection exists");
      
      // Count users
      const userCount = await db.collection('users').countDocuments();
      console.log(`There are ${userCount} users in the database`);
      
      // List all users
      console.log("Listing all users:");
      const users = await db.collection('users').find().toArray();
      
      users.forEach((user, index) => {
        console.log(`\n--- User ${index + 1} ---`);
        console.log(`ID: ${user._id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${user.password}`);
        console.log(`User Type: ${user.userType}`);
      });
      
      // Check for a specific user
      const username = "Rasika";
      console.log(`\nChecking if user '${username}' exists...`);
      
      const user = await db.collection('users').findOne({ username });
      
      if (user) {
        console.log(`User '${username}' found!`);
        console.log(`ID: ${user._id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${user.password}`);
        console.log(`User Type: ${user.userType}`);
        
        // Test login simulation
        console.log("\nSimulating login with username and password...");
        const loginTest = await db.collection('users').findOne({ 
          username: username,
          password: "password123" 
        });
        
        if (loginTest) {
          console.log("Login simulation SUCCESSFUL!");
        } else {
          console.log("Login simulation FAILED!");
          console.log("Check that the password matches what's in the database");
        }
      } else {
        console.log(`User '${username}' not found!`);
      }
    } else {
      console.log("Users collection does not exist yet");
    }
    
    console.log("\nDone!");
    process.exit(0);
  } catch (error) {
    console.error("Error checking user:", error);
    process.exit(1);
  }
}

// Run the function
checkUser(); 