import { db } from "../db.js";
import { 
  userSchema,
  guideProfileSchema,
  placeSchema,
  bookingSchema
} from "../../shared/schema.js";
import { ObjectId } from 'mongodb';

// Maharashtra attractions with images, descriptions, and coordinates
const maharashtraAttractions = [
  {
    name: "Gateway of India",
    location: "Mumbai, Maharashtra",
    description: "Iconic monument built during British rule, a symbol of Mumbai and a popular tourist spot.",
    latitude: "18.9219",
    longitude: "72.8347",
    category: "monument",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg"
  },
  {
    name: "Ellora Caves",
    location: "Aurangabad, Maharashtra",
    description: "UNESCO World Heritage site with 34 rock-cut temples and monasteries dating back to 600-1000 CE.",
    latitude: "20.0258",
    longitude: "75.1780",
    category: "heritage",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Kailasa_temple_at_ellora.JPG"
  },
  {
    name: "Lonavala",
    location: "Lonavala, Maharashtra",
    description: "Popular hill station in the Western Ghats, famous for its scenic beauty, waterfalls, and chikki.",
    latitude: "18.7546",
    longitude: "73.4062",
    category: "nature",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Lonavla_Lake.JPG"
  },
  {
    name: "Ajanta Caves",
    location: "Aurangabad, Maharashtra",
    description: "30 rock-cut Buddhist cave monuments dating from the 2nd century BCE to about 480 CE.",
    latitude: "20.5526",
    longitude: "75.7033",
    category: "heritage",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/Ajanta_%288%29.jpg"
  },
  {
    name: "Mahabaleshwar",
    location: "Mahabaleshwar, Maharashtra",
    description: "Hill station in Western Ghats, known for its strawberries, honey, and panoramic views.",
    latitude: "17.9256",
    longitude: "73.6395",
    category: "nature",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Mahabaleshwar_hills_01.jpg"
  },
  {
    name: "Shaniwar Wada",
    location: "Pune, Maharashtra",
    description: "Historical fortification in Pune, once the seat of the Peshwa rulers of the Maratha Empire.",
    latitude: "18.5195",
    longitude: "73.8553",
    category: "monument",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/Shaniwarwada_entrance.JPG"
  },
  {
    name: "Shirdi Sai Baba Temple",
    location: "Shirdi, Maharashtra",
    description: "Temple dedicated to Sai Baba of Shirdi, attracts millions of devotees from around the world.",
    latitude: "19.7645",
    longitude: "74.4771",
    category: "spiritual",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Shirdi_Sai_Baba_Temple.jpg"
  },
  {
    name: "Marine Drive",
    location: "Mumbai, Maharashtra",
    description: "3.6 km long boulevard in South Mumbai, also known as the Queen's Necklace.",
    latitude: "18.9548",
    longitude: "72.8224",
    category: "landmark",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Marine_Drive_Mumbai.jpg"
  },
  {
    name: "Elephanta Caves",
    location: "Mumbai, Maharashtra",
    description: "UNESCO World Heritage site on Elephanta Island in Mumbai Harbour with ancient cave temples.",
    latitude: "18.9633",
    longitude: "72.9315",
    category: "heritage",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Elephanta_Caves.jpg"
  },
  {
    name: "Kanheri Caves",
    location: "Mumbai, Maharashtra",
    description: "Ancient Buddhist caves in the forests of Sanjay Gandhi National Park with 109 cave entrances.",
    latitude: "19.2094",
    longitude: "72.9069",
    category: "heritage",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Kanheri_caves_1.jpg"
  },
  {
    name: "Aga Khan Palace",
    location: "Pune, Maharashtra",
    description: "Historical building with importance in India's independence movement, now a memorial to Mahatma Gandhi.",
    latitude: "18.5507",
    longitude: "73.9006",
    category: "monument",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/19/Aga_Khan_Palace%2C_Pune.jpg"
  },
  {
    name: "Raigad Fort",
    location: "Raigad, Maharashtra",
    description: "Hill fort in the Sahyadri mountain range, capital of the Maratha Empire under Shivaji Maharaj.",
    latitude: "18.2349",
    longitude: "73.4482",
    category: "monument",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Main_entrance_to_Raigad_Fort.jpg"
  },
  {
    name: "Pratapgad Fort",
    location: "Satara, Maharashtra",
    description: "Mountain fort where the Battle of Pratapgad was fought between Shivaji and Afzal Khan.",
    latitude: "17.9368",
    longitude: "73.5805",
    category: "monument",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Pratapgad_-_Main_Entrance.JPG"
  },
  {
    name: "Chhatrapati Shivaji Terminus",
    location: "Mumbai, Maharashtra",
    description: "UNESCO World Heritage Site and historic railway station with Victorian Gothic architecture.",
    latitude: "18.9399",
    longitude: "72.8354",
    category: "monument",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Mumbai_Train_Station.jpg"
  },
  {
    name: "Lavasa",
    location: "Pune, Maharashtra",
    description: "Planned hill city with Italian-style architecture and beautiful landscapes.",
    latitude: "18.4060",
    longitude: "73.5065",
    category: "nature",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Lavasa.jpg"
  }
];

// Maharashtra guides
const maharashtraGuides = [
  {
    user: {
      name: "Aditya Patil",
      email: "aditya@guides.com",
      password: "password123",
      userType: "guide",
      image: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    profile: {
      location: "Mumbai, Maharashtra",
      experience: 5,
      languages: ["English", "Hindi", "Marathi"],
      specialties: ["Historical Sites", "City Tours", "Food Tours"],
      rating: 4.8,
      bio: "Passionate Mumbai guide with extensive knowledge of the city's history and hidden gems."
    }
  },
  {
    user: {
      name: "Priya Sharma",
      email: "priya@guides.com",
      password: "password123",
      userType: "guide",
      image: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    profile: {
      location: "Pune, Maharashtra",
      experience: 3,
      languages: ["English", "Hindi", "Marathi", "French"],
      specialties: ["Cultural Tours", "Historical Sites", "Adventure"],
      rating: 4.6,
      bio: "Passionate about showcasing the cultural beauty of Pune with a focus on historical narratives."
    }
  },
  {
    user: {
      name: "Raj Deshmukh",
      email: "raj@guides.com",
      password: "password123",
      userType: "guide",
      image: "https://randomuser.me/api/portraits/men/3.jpg"
    },
    profile: {
      location: "Aurangabad, Maharashtra",
      experience: 7,
      languages: ["English", "Hindi", "Marathi", "German"],
      specialties: ["Ajanta & Ellora", "Ancient Architecture", "Photography Tours"],
      rating: 4.9,
      bio: "Specialized in Ajanta & Ellora caves tours with in-depth knowledge of ancient Indian art and architecture."
    }
  },
  {
    user: {
      name: "Kavita Joshi",
      email: "kavita@guides.com",
      password: "$2b$10$S4XBLz/HNLhXILB3AJB0s.jvUCHWBbRvUlGBTJAc11tGnjGtoFEKi", // password123
      userType: "guide",
      image: "https://randomuser.me/api/portraits/women/4.jpg"
    },
    profile: {
      location: "Nashik, Maharashtra",
      experience: 4,
      languages: ["English", "Hindi", "Marathi"],
      specialties: ["Wine Tours", "Religious Sites", "Local Cuisine"],
      rating: 4.7,
      bio: "Expert in Nashik's wineries and religious sites with a passion for introducing local Maharashtrian cuisine."
    }
  },
  {
    user: {
      name: "Vikram Kulkarni",
      email: "vikram@guides.com",
      password: "$2b$10$S4XBLz/HNLhXILB3AJB0s.jvUCHWBbRvUlGBTJAc11tGnjGtoFEKi", // password123
      userType: "guide",
      image: "https://randomuser.me/api/portraits/men/5.jpg"
    },
    profile: {
      location: "Lonavala, Maharashtra",
      experience: 6,
      languages: ["English", "Hindi", "Marathi"],
      specialties: ["Trekking", "Nature Walks", "Adventure Sports"],
      rating: 4.8,
      bio: "Adventure specialist focusing on Western Ghats trekking routes and outdoor activities in Lonavala region."
    }
  },
  {
    user: {
      name: "Neha Verma",
      email: "neha@guides.com",
      password: "$2b$10$S4XBLz/HNLhXILB3AJB0s.jvUCHWBbRvUlGBTJAc11tGnjGtoFEKi", // password123
      userType: "guide",
      image: "https://randomuser.me/api/portraits/women/6.jpg"
    },
    profile: {
      location: "Mahabaleshwar, Maharashtra",
      experience: 5,
      languages: ["English", "Hindi", "Marathi"],
      specialties: ["Strawberry Farms", "Viewpoints", "Nature"],
      rating: 4.5,
      bio: "Expert on Mahabaleshwar's natural beauty, strawberry farms, and viewpoints with a focus on sustainable tourism."
    }
  },
  {
    user: {
      name: "Amit Thakur",
      email: "amit@guides.com",
      password: "$2b$10$S4XBLz/HNLhXILB3AJB0s.jvUCHWBbRvUlGBTJAc11tGnjGtoFEKi", // password123
      userType: "guide",
      image: "https://randomuser.me/api/portraits/men/7.jpg"
    },
    profile: {
      location: "Kolhapur, Maharashtra",
      experience: 4,
      languages: ["English", "Hindi", "Marathi"],
      specialties: ["Temples", "Food Tours", "Local Crafts"],
      rating: 4.7,
      bio: "Specialized in traditional Kolhapuri cuisine, crafts, and religious heritage sites of the region."
    }
  },
  {
    user: {
      name: "Sarika Patel",
      email: "sarika@guides.com",
      password: "$2b$10$S4XBLz/HNLhXILB3AJB0s.jvUCHWBbRvUlGBTJAc11tGnjGtoFEKi", // password123
      userType: "guide",
      image: "https://randomuser.me/api/portraits/women/8.jpg"
    },
    profile: {
      location: "Mumbai, Maharashtra",
      experience: 8,
      languages: ["English", "Hindi", "Marathi", "Gujarati"],
      specialties: ["Shopping Tours", "Bollywood", "Street Food"],
      rating: 4.9,
      bio: "Mumbai specialist focusing on shopping, Bollywood experiences, and the best street food locations."
    }
  },
  {
    user: {
      name: "Nikhil Sawant",
      email: "nikhil@guides.com",
      password: "$2b$10$S4XBLz/HNLhXILB3AJB0s.jvUCHWBbRvUlGBTJAc11tGnjGtoFEKi", // password123
      userType: "guide",
      image: "https://randomuser.me/api/portraits/men/9.jpg"
    },
    profile: {
      location: "Ratnagiri, Maharashtra",
      experience: 6,
      languages: ["English", "Hindi", "Marathi", "Konkani"],
      specialties: ["Beaches", "Seafood", "Coastal Culture"],
      rating: 4.6,
      bio: "Expert on Maharashtra's Konkan coast, its beaches, seafood cuisine, and unique coastal traditions."
    }
  },
  {
    user: {
      name: "Tanvi Bhosale",
      email: "tanvi@guides.com",
      password: "$2b$10$S4XBLz/HNLhXILB3AJB0s.jvUCHWBbRvUlGBTJAc11tGnjGtoFEKi", // password123
      userType: "guide",
      image: "https://randomuser.me/api/portraits/women/10.jpg"
    },
    profile: {
      location: "Shirdi, Maharashtra",
      experience: 5,
      languages: ["English", "Hindi", "Marathi"],
      specialties: ["Religious Tours", "Spiritual Experiences", "Local History"],
      rating: 4.7,
      bio: "Spiritual guide specializing in Shirdi Sai Baba temple visits and related religious experiences."
    }
  }
];

// Hotels data by city
const maharashtraHotels = [
  // Mumbai
  {
    name: "Taj Mahal Palace",
    location: "Mumbai, Maharashtra",
    description: "Luxury 5-star hotel overlooking the Gateway of India with classic architecture and premium amenities.",
    latitude: "18.9217",
    longitude: "72.8332",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Mumbai_Aug_2018_%2843397784544%29.jpg"
  },
  {
    name: "Trident Nariman Point",
    location: "Mumbai, Maharashtra",
    description: "Upscale hotel at Nariman Point with sea views, multiple restaurants, and business facilities.",
    latitude: "18.9274",
    longitude: "72.8208",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Trident_Hotel%2C_Mumbai.jpg"
  },
  {
    name: "ITC Maratha",
    location: "Mumbai, Maharashtra",
    description: "Luxury hotel near the airport with traditional architecture, award-winning restaurants, and spa.",
    latitude: "19.1096",
    longitude: "72.8724",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4d/ITC_Maratha.jpg"
  },
  
  // Pune
  {
    name: "Conrad Pune",
    location: "Pune, Maharashtra",
    description: "Premium hotel in the heart of Pune's business district with contemporary design and upscale dining.",
    latitude: "18.5302",
    longitude: "73.8548",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/03/Conrad_Hotel_Miami_Lobby.jpg"
  },
  {
    name: "JW Marriott Hotel",
    location: "Pune, Maharashtra",
    description: "Luxury hotel with spacious rooms, multiple dining options, and a rejuvenating spa.",
    latitude: "18.5428",
    longitude: "73.9070",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/JW_Marriott_Pune.jpeg"
  },
  {
    name: "The Corinthians Resort",
    location: "Pune, Maharashtra",
    description: "Resort-style hotel inspired by ancient Greek architecture, with extensive gardens and wellness facilities.",
    latitude: "18.4622",
    longitude: "73.8861",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/The_Corinthians_Resort_%26_Club%2C_Pune.jpg"
  },
  
  // Aurangabad
  {
    name: "Vivanta Aurangabad",
    location: "Aurangabad, Maharashtra",
    description: "Premium hotel close to Ajanta and Ellora caves, featuring contemporary rooms and local cuisine.",
    latitude: "19.9187",
    longitude: "75.3125",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/60/Vivant_Taj_Aurangabad.JPG"
  },
  {
    name: "Lemon Tree Hotel",
    location: "Aurangabad, Maharashtra",
    description: "Modern hotel with comfortable rooms, multi-cuisine restaurant, and convenient access to historical sites.",
    latitude: "19.8874",
    longitude: "75.3519",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Hotel_Lemon_Tree%2C_Aurangabad.jpg"
  },
  {
    name: "WelcomHotel Rama International",
    location: "Aurangabad, Maharashtra",
    description: "Upscale hotel offering spacious accommodation, excellent dining options, and close proximity to major attractions.",
    latitude: "19.8748",
    longitude: "75.3407",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Welcome_Hotel_Rama_International.jpg"
  },
  
  // Lonavala
  {
    name: "The Machan",
    location: "Lonavala, Maharashtra",
    description: "Unique treehouse resort offering eco-friendly accommodation amid pristine forest with valley views.",
    latitude: "18.7615",
    longitude: "73.3922",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a5/The_machan%2C_Lonavla.jpg"
  },
  {
    name: "Rhythm Lonavala",
    location: "Lonavala, Maharashtra",
    description: "Resort with mountain views, luxurious rooms, multiple dining options, and recreational activities.",
    latitude: "18.7563",
    longitude: "73.4173",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Rhythm_Lonavala.jpg"
  },
  {
    name: "Della Resorts",
    location: "Lonavala, Maharashtra",
    description: "Adventure resort with luxury tents, adventure park, and multiple restaurants offering a unique experience.",
    latitude: "18.7701",
    longitude: "73.4363",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/68/Della_Resort%2C_Lonavala.jpg"
  },
  
  // Mahabaleshwar
  {
    name: "Le Meridien Resort & Spa",
    location: "Mahabaleshwar, Maharashtra",
    description: "Modern resort with valley views, spacious rooms, infinity pool, and rejuvenating spa treatments.",
    latitude: "17.9289",
    longitude: "73.6419",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Le_Meridien_Jakarta.jpg"
  },
  {
    name: "Brightland Resort & Spa",
    location: "Mahabaleshwar, Maharashtra",
    description: "Sprawling resort on a hilltop with panoramic views, extensive amenities, and activities for all ages.",
    latitude: "17.9321",
    longitude: "73.6501",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/55/Brightland_Resort%2C_Mahabaleshwar.jpg"
  },
  {
    name: "Evershine Resort",
    location: "Mahabaleshwar, Maharashtra",
    description: "Family-friendly resort with lush gardens, a variety of accommodation options, and recreational facilities.",
    latitude: "17.9247",
    longitude: "73.6514",
    category: "hotel",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Evershine_Resort%2C_Mahabaleshwar.jpg"
  }
];

export async function seedDatabase() {
  try {
    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('guideProfiles').deleteMany({});
    await db.collection('places').deleteMany({});
    await db.collection('bookings').deleteMany({});

    // Seed attractions
    console.log("Seeding attractions...");
    for (const attraction of maharashtraAttractions) {
      const validatedAttraction = placeSchema.parse({
        ...attraction,
        id: new ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await db.collection('places').insertOne(validatedAttraction);
    }
    console.log("Attractions seeded successfully");

    // Seed guides
    console.log("Seeding guides...");
    for (const guide of maharashtraGuides) {
      // Create user
      const validatedUser = userSchema.parse({
        ...guide.user,
        id: new ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const userResult = await db.collection('users').insertOne(validatedUser);

      // Create guide profile
      const validatedProfile = guideProfileSchema.parse({
        ...guide.profile,
        id: new ObjectId().toString(),
        userId: userResult.insertedId.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await db.collection('guideProfiles').insertOne(validatedProfile);
    }
    console.log("Guides seeded successfully");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}