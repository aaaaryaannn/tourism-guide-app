import { db } from "./db";
import { initializeDatabase } from "./db";
import { ObjectId } from "mongodb";

async function checkSpecificUsers() {
  try {
    await initializeDatabase();
    console.log("Connected to MongoDB database successfully");

    const userIds = [
      "67ed94c184aaf5a134d892be",  // fromUserId (tourist)
      "67eedc9f2132ccb7dd627ae3"   // toUserId (guide)
    ];

    for (const userId of userIds) {
      console.log(`\nChecking user with ID: ${userId}`);
      try {
        // Try to create ObjectId to validate format
        const objectId = new ObjectId(userId);
        console.log("Valid ObjectId format");

        // Try to find the user
        const user = await db.collection('users').findOne({ _id: objectId });
        
        if (user) {
          console.log("✅ User found!");
          console.log(`ID: ${user._id}`);
          console.log(`Username: ${user.username}`);
          console.log(`Email: ${user.email}`);
          console.log(`User Type: ${user.userType}`);
        } else {
          console.log("❌ User not found in database!");
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(`❌ Error with ID ${userId}:`, error.message);
        }
      }
    }

    // Also check all users in the database
    console.log("\n=== Listing all users in database ===");
    const allUsers = await db.collection('users').find({}).toArray();
    console.log(`Total users in database: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`ID: ${user._id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`User Type: ${user.userType}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error checking users:", error);
    process.exit(1);
  }
}

checkSpecificUsers(); 