import type { User, GuideProfile } from "../../shared/schema.ts";

export const maharashtraGuides: {
  user: User;
  profile: GuideProfile;
}[] = [
  {
    user: {
      username: "ravi_maharaj",
      password: "guide1234",
      fullName: "Ravi Maharaj",
      email: "ravi.maharaj@example.com",
      phone: "+91 9823456789",
      userType: "guide"
    },
    profile: {
      userId: 0, // Will be set during insertion
      location: "Mumbai",
      experience: 7,
      languages: ["English", "Hindi", "Marathi"],
      specialties: ["Historical Sites", "Cultural Tours", "Photography Tours"],
      rating: 4.8,
      bio: "Experienced guide based in Mumbai with 7 years of showing tourists the hidden gems of Maharashtra. Expert in historical and cultural tours."
    }
  },
  {
    user: {
      username: "priya_kulkarni",
      password: "guide1234",
      fullName: "Priya Kulkarni",
      email: "priya.kulkarni@example.com",
      phone: "+91 9834567890",
      userType: "guide"
    },
    profile: {
      userId: 0,
      location: "Pune",
      experience: 5,
      languages: ["English", "Hindi", "Marathi", "Gujarati"],
      specialties: ["Adventure Tours", "Trekking", "Nature Walks"],
      rating: 4.6,
      bio: "Adventure enthusiast and certified trekking guide from Pune. Specializes in Sahyadri mountain treks and nature experiences."
    }
  },
  {
    user: {
      username: "amol_patil",
      password: "guide1234",
      fullName: "Amol Patil",
      email: "amol.patil@example.com",
      phone: "+91 9845678901",
      userType: "guide"
    },
    profile: {
      userId: 0,
      location: "Aurangabad",
      experience: 9,
      languages: ["English", "Hindi", "Marathi", "Urdu"],
      specialties: ["Ajanta & Ellora Caves", "Heritage Sites", "Archaeological Tours"],
      rating: 4.9,
      bio: "Heritage expert with extensive knowledge of Ajanta and Ellora caves. Former archaeology student turned guide with 9 years of experience."
    }
  },
  {
    user: {
      username: "sangeeta_sharma",
      password: "guide1234",
      fullName: "Sangeeta Sharma",
      email: "sangeeta.sharma@example.com",
      phone: "+91 9856789012",
      userType: "guide"
    },
    profile: {
      userId: 0,
      location: "Nashik",
      experience: 4,
      languages: ["English", "Hindi", "Marathi"],
      specialties: ["Wine Tours", "Temple Circuits", "Food Tours"],
      rating: 4.7,
      bio: "Nashik-based guide specialized in wine tourism and spiritual circuits. Offers unique food and cultural experiences in the region."
    }
  },
  {
    user: {
      username: "vikram_jadhav",
      password: "guide1234",
      fullName: "Vikram Jadhav",
      email: "vikram.jadhav@example.com",
      phone: "+91 9867890123",
      userType: "guide"
    },
    profile: {
      userId: 0,
      location: "Kolhapur",
      experience: 6,
      languages: ["English", "Hindi", "Marathi", "Kannada"],
      specialties: ["Historical Forts", "Temple Tours", "Local Cuisine"],
      rating: 4.5,
      bio: "Kolhapur native with deep knowledge of the region's royal history, temples, and culinary traditions. Expert in Maratha fort architecture."
    }
  },
  {
    user: {
      username: "anita_desai",
      password: "guide1234",
      fullName: "Anita Desai",
      email: "anita.desai@example.com",
      phone: "+91 9878901234",
      userType: "guide"
    },
    profile: {
      userId: 0,
      location: "Lonavala",
      experience: 3,
      languages: ["English", "Hindi", "Marathi"],
      specialties: ["Scenic Hill Stations", "Hiking", "Monsoon Specials"],
      rating: 4.4,
      bio: "Nature lover and hiking enthusiast based in Lonavala. Specializes in monsoon tours when the Western Ghats are at their most beautiful."
    }
  },
  {
    user: {
      username: "deepak_chavan",
      password: "guide1234",
      fullName: "Deepak Chavan",
      email: "deepak.chavan@example.com",
      phone: "+91 9889012345",
      userType: "guide"
    },
    profile: {
      userId: 0,
      location: "Alibaug",
      experience: 5,
      languages: ["English", "Hindi", "Marathi", "Konkani"],
      specialties: ["Beach Tours", "Coastal Forts", "Water Sports"],
      rating: 4.6,
      bio: "Coastal expert from Alibaug specializing in beach tourism, historical coastal forts, and water activities along the Konkan coast."
    }
  },
  {
    user: {
      username: "meera_joshi",
      password: "guide1234",
      fullName: "Meera Joshi",
      email: "meera.joshi@example.com",
      phone: "+91 9890123456",
      userType: "guide"
    },
    profile: {
      userId: 0,
      location: "Nagpur",
      experience: 8,
      languages: ["English", "Hindi", "Marathi", "Telugu"],
      specialties: ["Wildlife Tours", "Tiger Safaris", "Tribal Culture"],
      rating: 4.8,
      bio: "Wildlife expert from Nagpur specializing in Tadoba and Pench tiger reserves. Knowledgeable about Central Indian tribal cultures and traditions."
    }
  },
  {
    user: {
      username: "rahul_sawant",
      password: "guide1234",
      fullName: "Rahul Sawant",
      email: "rahul.sawant@example.com",
      phone: "+91 9901234567",
      userType: "guide"
    },
    profile: {
      userId: 0,
      location: "Mahabaleshwar",
      experience: 4,
      languages: ["English", "Hindi", "Marathi"],
      specialties: ["Strawberry Farms", "Scenic Viewpoints", "Photography Tours"],
      rating: 4.5,
      bio: "Hill station expert based in Mahabaleshwar. Specializes in strawberry farm tours, nature photography, and hidden viewpoints in the region."
    }
  },
  {
    user: {
      username: "nisha_patil",
      password: "guide1234",
      fullName: "Nisha Patil",
      email: "nisha.patil@example.com",
      phone: "+91 9912345678",
      userType: "guide"
    },
    profile: {
      userId: 0,
      location: "Ratnagiri",
      experience: 6,
      languages: ["English", "Hindi", "Marathi", "Konkani"],
      specialties: ["Coastal Tourism", "Seafood Tours", "Alphonso Mango Farms"],
      rating: 4.7,
      bio: "Konkan coast specialist from Ratnagiri. Expert in local seafood, Alphonso mango plantations, and pristine beaches of the Konkan region."
    }
  }
];