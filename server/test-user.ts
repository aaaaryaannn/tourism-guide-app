import { db } from "./db";
import { initializeDatabase } from "./db";
import { userSchema } from "../shared/schema";

async function createTestUser() {
  try {
    // Make sure the database is connected
    await initializeDatabase();
    
    console.log("Creating test user 'Rasika'...");
    
    // Delete existing user with username 'Rasika' if it exists
    const existingUser = await db.collection('users').findOne({ username: 'Rasika' });
    if (existingUser) {
      console.log("Existing user found with username 'Rasika', removing...");
      await db.collection('users').deleteOne({ username: 'Rasika' });
    }
    
    // Create test user with username 'Rasika'
    const testUser = {
      username: "Rasika",
      email: "rasika@example.com",
      password: "password123",
      fullName: "Rasika Test",
      phone: "1234567890",
      userType: "tourist",
      createdAt: new Date()
    };
    
    // Validate the user data
    const validatedUser = userSchema.omit({ id: true }).parse(testUser);
    
    // Insert the user
    const result = await db.collection('users').insertOne(validatedUser);
    console.log("Created test user 'Rasika' with ID:", result.insertedId.toString());
    console.log("You can now log in with:");
    console.log("Username: Rasika");
    console.log("Password: password123");
    
    console.log("Done!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating test user:", error);
    process.exit(1);
  }
}

// Run the function
createTestUser(); 