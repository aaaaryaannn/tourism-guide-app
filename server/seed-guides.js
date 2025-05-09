import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

const uri = "mongodb+srv://aaaaryaannn:r9J2T4WMCNMjmJGm@tga.ajmql56.mongodb.net/maharashtra_tour_guide";

// Maharashtra guides data
const maharashtraGuides = [
  {
    user: {
      username: "aditya_guide",
      password: "guide1234",
      fullName: "Aditya Patil",
      email: "aditya@guides.com",
      phone: "9876543210",
      userType: "guide"
    },
    profile: {
      location: "Mumbai",
      experience: 5,
      languages: ["English", "Hindi", "Marathi"],
      specialties: ["Historical Sites", "City Tours", "Food Tours"],
      rating: 4.8,
      bio: "Passionate Mumbai guide with extensive knowledge of the city's history and hidden gems."
    }
  },
  {
    user: {
      username: "priya_guide",
      password: "guide1234",
      fullName: "Priya Sharma",
      email: "priya@guides.com",
      phone: "9876543211",
      userType: "guide"
    },
    profile: {
      location: "Pune",
      experience: 3,
      languages: ["English", "Hindi", "Marathi", "French"],
      specialties: ["Cultural Tours", "Historical Sites", "Adventure"],
      rating: 4.6,
      bio: "Passionate about showcasing the cultural beauty of Pune with a focus on historical narratives."
    }
  },
  {
    user: {
      username: "raj_guide",
      password: "guide1234",
      fullName: "Raj Deshmukh",
      email: "raj@guides.com",
      phone: "9876543212",
      userType: "guide"
    },
    profile: {
      location: "Aurangabad",
      experience: 7,
      languages: ["English", "Hindi", "Marathi", "German"],
      specialties: ["Ajanta & Ellora", "Ancient Architecture", "Photography Tours"],
      rating: 4.9,
      bio: "Specialized in Ajanta & Ellora caves tours with in-depth knowledge of ancient Indian art and architecture."
    }
  }
];

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function seedGuides() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB!');
    
    const db = client.db('maharashtra_tour_guide');
    
    // Clear existing guides and profiles
    await db.collection('users').deleteMany({ userType: 'guide' });
    await db.collection('guideProfiles').deleteMany({});
    
    console.log('Cleared existing guides and profiles');
    
    // Insert guides
    for (const guide of maharashtraGuides) {
      // Hash the password
      const hashedPassword = await hashPassword(guide.user.password);
      
      // Insert the guide user
      const userResult = await db.collection('users').insertOne({
        ...guide.user,
        password: hashedPassword,
        currentLatitude: (18.5 + Math.random() * 1.5).toString(),
        currentLongitude: (73.5 + Math.random() * 1.5).toString(),
        lastLocationUpdate: new Date(),
        createdAt: new Date()
      });
      
      // Insert guide profile
      await db.collection('guideProfiles').insertOne({
        ...guide.profile,
        userId: userResult.insertedId.toString()
      });
      
      console.log(`Added guide: ${guide.user.fullName}`);
    }
    
    console.log('Guides seeded successfully!');
  } catch (error) {
    console.error('Error seeding guides:', error);
  } finally {
    await client.close();
  }
}

// Run the seeding
seedGuides().catch(console.error); 