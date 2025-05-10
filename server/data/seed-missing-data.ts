import { db } from "../db.ts";
import { placeSchema, userSchema, guideProfileSchema } from "../../shared/schema.ts";
import { maharashtraAttractions } from "./maharashtra-attractions.ts";
import { maharashtraGuides } from "./maharashtra-guides.ts";
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
 * Seeds attractions and guides if they are missing from the database
 * This is separate from the initial database seeding and will add
 * missing data even if users already exist
 */
export async function seedMissingData() {
  console.log("Checking for missing attractions and guides...");
  
  // Check current attractions count
  const existingPlaces = await db.collection('places').countDocuments();
  
  // If we only have a few attractions, add all from the maharashtraAttractions array
  if (existingPlaces < 10) {
    console.log(`Only ${existingPlaces} attractions found. Adding Maharashtra attractions...`);
    
    // Add each attraction one by one to avoid conflicts
    for (const attraction of maharashtraAttractions) {
      // Check if attraction with the same name already exists to avoid duplicates
      const existingAttraction = await db.collection('places').findOne({ name: attraction.name });
      
      if (!existingAttraction) {
        try {
          await db.collection('places').insertOne(placeSchema.parse(attraction));
          console.log(`Added attraction: ${attraction.name}`);
        } catch (error) {
          console.error(`Error adding attraction ${attraction.name}:`, error);
        }
      }
    }
  }
  
  // Check current guides count
  const existingGuides = await db.collection('users').countDocuments({ userType: "guide" });
  
  // If we only have a few guides, add all from the maharashtraGuides array
  if (existingGuides < 8) {
    console.log(`Only ${existingGuides} guides found. Adding Maharashtra guides...`);
    
    // Add each guide one by one
    for (const guide of maharashtraGuides) {
      // Check if guide with the same email already exists
      const existingGuide = await db.collection('users').findOne({ email: guide.user.email });
      
      if (!existingGuide) {
        try {
          // Hash the guide password
          const hashedPassword = await hashPassword(guide.user.password);
          
          // Insert guide user
          const guideUser = userSchema.parse({
            ...guide.user,
            password: hashedPassword,
            currentLatitude: (18.5 + Math.random() * 1.5).toString(), // Random location in Maharashtra
            currentLongitude: (73.5 + Math.random() * 1.5).toString(),
            lastLocationUpdate: new Date(),
            createdAt: new Date()
          });
          
          const result = await db.collection('users').insertOne(guideUser);
          
          // Insert guide profile with converted rating to integer
          const profile = guideProfileSchema.parse({
            ...guide.profile,
            userId: result.insertedId.toString(),
            rating: guide.profile.rating ? Math.round(guide.profile.rating) : null
          });
          
          await db.collection('guideProfiles').insertOne(profile);
          console.log(`Added guide: ${guide.user.name}`);
        } catch (error) {
          console.error(`Error adding guide ${guide.user.name}:`, error);
        }
      }
    }
  }
  
  console.log("Completed checking and adding missing data.");
}