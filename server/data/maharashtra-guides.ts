import { User, GuideProfile } from '../../shared/schema';

interface GuideData {
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
  profile: Omit<GuideProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
}

export const maharashtraGuides: GuideData[] = [
  {
    user: {
      name: 'Ravi Maharaj',
      email: 'ravi.maharaj@example.com',
      password: 'guide1234',
      userType: 'guide',
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    profile: {
      bio: 'Experienced guide specializing in Mumbai heritage tours with 7 years of experience.',
      languages: ['English', 'Hindi', 'Marathi'],
      specialties: ['Heritage', 'Architecture', 'Food Tours'],
      location: 'Mumbai',
      rating: 4.8,
      experience: 7
    }
  },
  {
    user: {
      name: 'Priya Kulkarni',
      email: 'priya.kulkarni@example.com',
      password: 'guide1234',
      userType: 'guide',
      image: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    profile: {
      bio: 'Pune-based guide with expertise in historical monuments and local cuisine.',
      languages: ['English', 'Hindi', 'Marathi'],
      specialties: ['History', 'Food Tours', 'Cultural Tours'],
      location: 'Pune',
      rating: 4.7,
      experience: 5
    }
  },
  {
    user: {
      name: 'Amol Patil',
      email: 'amol.patil@example.com',
      password: 'guide1234',
      userType: 'guide',
      image: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    profile: {
      bio: 'Expert guide for Ajanta and Ellora caves with archaeological knowledge.',
      languages: ['English', 'Hindi', 'Marathi'],
      specialties: ['Archaeology', 'Buddhist Art', 'History'],
      location: 'Aurangabad',
      rating: 4.9,
      experience: 8
    }
  },
  {
    user: {
      name: 'Sangeeta Sharma',
      email: 'sangeeta.sharma@example.com',
      password: 'guide1234',
      userType: 'guide',
      image: 'https://randomuser.me/api/portraits/women/4.jpg'
    },
    profile: {
      location: 'Nashik',
      experience: 4,
      languages: ['English', 'Hindi', 'Marathi'],
      specialties: ['Wine Tours', 'Temple Circuits', 'Food Tours'],
      rating: 4.7,
      bio: 'Nashik-based guide specialized in wine tourism and spiritual circuits. Offers unique food and cultural experiences in the region.'
    }
  },
  {
    user: {
      name: 'Vikram Jadhav',
      email: 'vikram.jadhav@example.com',
      password: 'guide1234',
      userType: 'guide',
      image: 'https://randomuser.me/api/portraits/men/5.jpg'
    },
    profile: {
      location: 'Kolhapur',
      experience: 6,
      languages: ['English', 'Hindi', 'Marathi', 'Kannada'],
      specialties: ['Historical Forts', 'Temple Tours', 'Local Cuisine'],
      rating: 4.5,
      bio: 'Kolhapur native with deep knowledge of the region\'s royal history, temples, and culinary traditions. Expert in Maratha fort architecture.'
    }
  },
  {
    user: {
      name: 'Anita Desai',
      email: 'anita.desai@example.com',
      password: 'guide1234',
      userType: 'guide',
      image: 'https://randomuser.me/api/portraits/women/6.jpg'
    },
    profile: {
      location: 'Lonavala',
      experience: 3,
      languages: ['English', 'Hindi', 'Marathi'],
      specialties: ['Scenic Hill Stations', 'Hiking', 'Monsoon Specials'],
      rating: 4.4,
      bio: 'Nature lover and hiking enthusiast based in Lonavala. Specializes in monsoon tours when the Western Ghats are at their most beautiful.'
    }
  },
  {
    user: {
      name: 'Deepak Chavan',
      email: 'deepak.chavan@example.com',
      password: 'guide1234',
      userType: 'guide',
      image: 'https://randomuser.me/api/portraits/men/7.jpg'
    },
    profile: {
      location: 'Alibaug',
      experience: 5,
      languages: ['English', 'Hindi', 'Marathi', 'Konkani'],
      specialties: ['Beach Tours', 'Coastal Forts', 'Water Sports'],
      rating: 4.6,
      bio: 'Coastal expert from Alibaug specializing in beach tourism, historical coastal forts, and water activities along the Konkan coast.'
    }
  },
  {
    user: {
      name: 'Meera Joshi',
      email: 'meera.joshi@example.com',
      password: 'guide1234',
      userType: 'guide',
      image: 'https://randomuser.me/api/portraits/women/8.jpg'
    },
    profile: {
      location: 'Nagpur',
      experience: 8,
      languages: ['English', 'Hindi', 'Marathi', 'Telugu'],
      specialties: ['Wildlife Tours', 'Tiger Safaris', 'Tribal Culture'],
      rating: 4.8,
      bio: 'Wildlife expert from Nagpur specializing in Tadoba and Pench tiger reserves. Knowledgeable about Central Indian tribal cultures and traditions.'
    }
  },
  {
    user: {
      name: 'Rahul Sawant',
      email: 'rahul.sawant@example.com',
      password: 'guide1234',
      userType: 'guide',
      image: 'https://randomuser.me/api/portraits/men/9.jpg'
    },
    profile: {
      location: 'Mahabaleshwar',
      experience: 4,
      languages: ['English', 'Hindi', 'Marathi'],
      specialties: ['Strawberry Farms', 'Scenic Viewpoints', 'Photography Tours'],
      rating: 4.5,
      bio: 'Hill station expert based in Mahabaleshwar. Specializes in strawberry farm tours, nature photography, and hidden viewpoints in the region.'
    }
  },
  {
    user: {
      name: 'Nisha Patil',
      email: 'nisha.patil@example.com',
      password: 'guide1234',
      userType: 'guide',
      image: 'https://randomuser.me/api/portraits/women/10.jpg'
    },
    profile: {
      location: 'Ratnagiri',
      experience: 6,
      languages: ['English', 'Hindi', 'Marathi', 'Konkani'],
      specialties: ['Coastal Tourism', 'Seafood Tours', 'Alphonso Mango Farms'],
      rating: 4.7,
      bio: 'Konkan coast specialist from Ratnagiri. Expert in local seafood, Alphonso mango plantations, and pristine beaches of the Konkan region.'
    }
  }
];