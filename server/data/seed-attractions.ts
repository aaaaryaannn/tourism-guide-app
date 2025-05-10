import { db } from "../db.js";
import { Place, User, GuideProfile } from "../../shared/schema.js";
import { maharashtraAttractions } from "./maharashtra-attractions.js";
import { maharashtraGuides } from "./maharashtra-guides.js";
import { log } from "../vite.js";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { getRandomLocation } from "../../client/src/lib/geolocation.js";

const scryptAsync = promisify(scrypt);

// Hash password helper
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedAttractions() {
  // Check if we already have the full set of attractions
  const count = await db.collection('places').countDocuments();
  
  if (count >= 50) {
    log("Attractions already seeded - skipping", "database");
    return;
  }
  
  // Clear existing attractions if any
  if (count > 0) {
    log("Clearing existing attractions to seed new ones", "database");
    await db.collection('places').deleteMany({});
  }
  
  // Insert new attractions
  log(`Seeding ${maharashtraAttractions.length} attractions`, "database");
  for (const attraction of maharashtraAttractions) {
    await db.collection('places').insertOne({
      ...attraction,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  log("Attractions seeded successfully", "database");
}

export async function seedGuides() {
  // First, check how many guides we already have
  const count = await db.collection('users').countDocuments({ userType: "guide" });
  
  // If we already have more than 10 guides, don't add more
  if (count >= 10) {
    log("Guides already seeded - skipping", "database");
    return;
  }
  
  // Get some tourist locations to use as reference points for placing guides
  const touristLocations = await db.collection('places')
    .find({}, { projection: { latitude: 1, longitude: 1 } })
    .limit(5)
    .toArray();
  
  if (!touristLocations.length) {
    log("No places found to reference guide locations - skipping", "database");
    return;
  }
  
  log(`Seeding ${maharashtraGuides.length} guides`, "database");
  
  for (const guide of maharashtraGuides) {
    // Hash the password
    const hashedPassword = await hashPassword(guide.user.password);
    
    // Pick a random tourist location as reference
    const referenceLocation = touristLocations[Math.floor(Math.random() * touristLocations.length)];
    
    // Generate a location within 5-10km of a tourist attraction
    const distanceInKm = 5 + (Math.random() * 5); // 5-10km
    const randomLocation = getRandomLocation(
      parseFloat(referenceLocation.latitude),
      parseFloat(referenceLocation.longitude),
      distanceInKm
    );
    
    // Insert the guide user
    const userResult = await db.collection('users').insertOne({
      ...guide.user,
      password: hashedPassword,
      currentLatitude: randomLocation.lat.toString(),
      currentLongitude: randomLocation.lng.toString(),
      lastLocationUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Insert guide profile with the user ID
    await db.collection('guideProfiles').insertOne({
      ...guide.profile,
      userId: userResult.insertedId.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  log("Guides seeded successfully", "database");
}