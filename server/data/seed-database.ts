import { db } from "../db";
import { userSchema, guideProfileSchema, placeSchema } from "@shared/schema";
import { maharashtraAttractions } from "./maharashtra-attractions";
import { maharashtraGuides } from "./maharashtra-guides";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * Utility function to hash passwords
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Seeds the database with sample data for Maharashtra tourism app
 */
export async function seedDatabase() {
  console.log("Starting database seeding...");
  
  try {
    // Check if there's any data already
    const userCount = await db.collection('users').countDocuments();
    if (userCount > 0) {
      console.log("Database already seeded. Skipping seeding process.");
      return;
    }
    
    // Seed tourist users
    const demoTourist = {
      username: "demo_tourist",
      password: await hashPassword("tourist1234"),
      fullName: "Demo Tourist",
      email: "tourist@example.com",
      phone: "+91 9798765432",
      userType: "tourist",
      currentLatitude: "18.9220", // Gateway of India location
      currentLongitude: "72.8347",
      createdAt: new Date()
    };
    
    const tourist2 = {
      username: "arun_tourist",
      password: await hashPassword("tourist1234"),
      fullName: "Arun Kumar",
      email: "arun@example.com",
      phone: "+91 9712345678",
      userType: "tourist",
      currentLatitude: "18.5204", // Pune location
      currentLongitude: "73.8567",
      createdAt: new Date()
    };
    
    const tourist3 = {
      username: "neha_tourist",
      password: await hashPassword("tourist1234"),
      fullName: "Neha Sharma",
      email: "neha@example.com",
      phone: "+91 9723456789",
      userType: "tourist",
      currentLatitude: "19.9975", // Nashik location
      currentLongitude: "73.7898",
      createdAt: new Date()
    };
    
    console.log("Inserting tourist users...");
    await db.collection('users').insertMany([
      userSchema.parse(demoTourist),
      userSchema.parse(tourist2),
      userSchema.parse(tourist3)
    ]);
    
    // Seed guide users and profiles
    console.log("Inserting guide users and profiles...");
    for (const guide of maharashtraGuides) {
      // Hash the guide password
      const hashedPassword = await hashPassword(guide.user.password);
      
      // Insert the guide user first
      const guideUser = userSchema.parse({
        ...guide.user,
        password: hashedPassword,
        currentLatitude: (18.92 + (Math.random() * 0.1)).toString(),
        currentLongitude: (72.83 + (Math.random() * 0.1)).toString(),
        createdAt: new Date()
      });
      
      const result = await db.collection('users').insertOne(guideUser);
      
      // Then insert the guide profile with the correct userId
      await db.collection('guideProfiles').insertOne(
        guideProfileSchema.parse({
          ...guide.profile,
          userId: result.insertedId.toString()
        })
      );
    }
    
    // Seed places/attractions
    console.log("Inserting Maharashtra attractions...");
    for (const attraction of maharashtraAttractions) {
      await db.collection('places').insertOne(
        placeSchema.parse(attraction)
      );
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}