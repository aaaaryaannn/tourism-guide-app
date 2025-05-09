// Mock data for transportation options

export interface BusRoute {
  id: string;
  from: string;
  to: string;
  duration: string;
  distance: string;
  price: number;
  departureTime: string;
  arrivalTime: string;
  busOperator: string;
  busType: string;
  amenities: string[];
  availableSeats: number;
  rating: number;
}

export interface TrainRoute {
  id: string;
  from: string;
  to: string;
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: {
    sleeper: number;
    ac3Tier: number;
    ac2Tier: number;
  };
  availableSeats: {
    sleeper: number;
    ac3Tier: number;
    ac2Tier: number;
  };
  daysOfOperation: string[];
}

// Common destinations in Maharashtra
export const maharashtraDestinations = [
  "Mumbai",
  "Pune",
  "Nagpur",
  "Nashik",
  "Aurangabad",
  "Kolhapur",
  "Solapur",
  "Amravati",
  "Nanded",
  "Shirdi",
  "Mahabaleshwar",
  "Lonavala",
  "Alibaug",
  "Matheran",
  "Ratnagiri"
];

// Mock bus operators in Maharashtra
const busOperators = [
  "Maharashtra State Road Transport Corporation (MSRTC)",
  "Purple Travels",
  "Neeta Tours and Travels",
  "SRS Travels",
  "VRL Travels",
  "Prasanna Purple",
  "Himalaya Travels",
  "ShivneriĶ Bus Services",
  "Paulo Travels",
  "Royal Travels"
];

// Bus amenities
const busAmenities = [
  "WiFi",
  "USB Charging",
  "Air Conditioning",
  "Blankets",
  "Water Bottle",
  "Snacks",
  "Reading Light",
  "Emergency Exit",
  "Live Tracking",
  "Entertainment System",
  "Reclining Seats",
  "Extra Legroom"
];

// Bus types
const busTypes = ["AC Sleeper", "AC Seater", "Non-AC Sleeper", "Non-AC Seater", "Volvo AC", "Mercedes AC"];

// Generate mock bus routes between popular destinations
export const generateMockBusRoutes = (from: string, to: string): BusRoute[] => {
  // Return empty array if from and to are the same
  if (from === to) return [];

  // Generate 5-10 bus options
  const numberOfRoutes = Math.floor(Math.random() * 6) + 5;
  const routes: BusRoute[] = [];

  for (let i = 0; i < numberOfRoutes; i++) {
    // Random duration between 1 and 12 hours
    const durationHours = Math.floor(Math.random() * 12) + 1;
    const durationMinutes = Math.floor(Math.random() * 60);
    const duration = `${durationHours}h ${durationMinutes}m`;

    // Random distance based on duration (50-80 km/hour)
    const speedKmPerHour = Math.floor(Math.random() * 31) + 50;
    const distance = `${Math.floor(speedKmPerHour * durationHours + (speedKmPerHour / 60) * durationMinutes)} km`;

    // Random price based on distance and type
    const basePrice = Math.floor(Math.random() * 1000) + 300;

    // Random departure time
    const departureHours = Math.floor(Math.random() * 24);
    const departureMinutes = Math.floor(Math.random() * 60);
    const departureTime = `${departureHours.toString().padStart(2, '0')}:${departureMinutes.toString().padStart(2, '0')}`;

    // Calculate arrival time based on departure and duration
    const arrivalHours = (departureHours + durationHours) % 24;
    const arrivalMinutes = (departureMinutes + durationMinutes) % 60;
    const arrivalTime = `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}`;

    // Random bus operator
    const busOperator = busOperators[Math.floor(Math.random() * busOperators.length)];

    // Random bus type
    const busType = busTypes[Math.floor(Math.random() * busTypes.length)];

    // Random amenities (3-6 items)
    const amenitiesCount = Math.floor(Math.random() * 4) + 3;
    const selectedAmenities: string[] = [];
    while (selectedAmenities.length < amenitiesCount) {
      const amenity = busAmenities[Math.floor(Math.random() * busAmenities.length)];
      if (!selectedAmenities.includes(amenity)) {
        selectedAmenities.push(amenity);
      }
    }

    // Random available seats (0-40)
    const availableSeats = Math.floor(Math.random() * 41);

    // Random rating (3-5 stars)
    const rating = Math.floor(Math.random() * 21) / 10 + 3;

    routes.push({
      id: `BUS-${from.substring(0, 3)}-${to.substring(0, 3)}-${i + 1}`,
      from,
      to,
      duration,
      distance,
      price: basePrice,
      departureTime,
      arrivalTime,
      busOperator,
      busType,
      amenities: selectedAmenities,
      availableSeats,
      rating
    });
  }

  // Sort by departure time
  return routes.sort((a, b) => {
    const [aHours, aMinutes] = a.departureTime.split(':').map(Number);
    const [bHours, bMinutes] = b.departureTime.split(':').map(Number);
    
    if (aHours !== bHours) {
      return aHours - bHours;
    }
    return aMinutes - bMinutes;
  });
};

// Generate mock train routes between popular destinations
export const generateMockTrainRoutes = (from: string, to: string): TrainRoute[] => {
  // Return empty array if from and to are the same
  if (from === to) return [];

  // Generate 3-8 train options
  const numberOfRoutes = Math.floor(Math.random() * 6) + 3;
  const routes: TrainRoute[] = [];

  const trainNames = [
    "Deccan Express",
    "Maharashtra Express",
    "Sahyadri Express",
    "Mumbai-Pune Intercity",
    "Koyna Express",
    "Deccan Queen",
    "Mahalaxmi Express",
    "Godavari Express",
    "Pragati Express",
    "Sinhagad Express"
  ];

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  for (let i = 0; i < numberOfRoutes; i++) {
    // Random train number
    const trainNumber = `${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Random train name
    const trainName = trainNames[Math.floor(Math.random() * trainNames.length)];

    // Random duration between 1 and 12 hours
    const durationHours = Math.floor(Math.random() * 12) + 1;
    const durationMinutes = Math.floor(Math.random() * 60);
    const duration = `${durationHours}h ${durationMinutes}m`;

    // Random departure time
    const departureHours = Math.floor(Math.random() * 24);
    const departureMinutes = Math.floor(Math.random() * 60);
    const departureTime = `${departureHours.toString().padStart(2, '0')}:${departureMinutes.toString().padStart(2, '0')}`;

    // Calculate arrival time based on departure and duration
    const arrivalHours = (departureHours + durationHours) % 24;
    const arrivalMinutes = (departureMinutes + durationMinutes) % 60;
    const arrivalTime = `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}`;

    // Random prices for different classes
    const sleeperPrice = Math.floor(Math.random() * 500) + 200;
    const ac3TierPrice = sleeperPrice + Math.floor(Math.random() * 500) + 300;
    const ac2TierPrice = ac3TierPrice + Math.floor(Math.random() * 500) + 400;

    // Random available seats for different classes
    const sleeperSeats = Math.floor(Math.random() * 101);
    const ac3TierSeats = Math.floor(Math.random() * 41);
    const ac2TierSeats = Math.floor(Math.random() * 21);

    // Random days of operation (at least 3 days a week)
    const numberOfDays = Math.floor(Math.random() * 5) + 3;
    const operationDays: string[] = [];
    while (operationDays.length < numberOfDays) {
      const day = weekdays[Math.floor(Math.random() * 7)];
      if (!operationDays.includes(day)) {
        operationDays.push(day);
      }
    }
    // Sort days in week order
    operationDays.sort((a, b) => weekdays.indexOf(a) - weekdays.indexOf(b));

    routes.push({
      id: `TRAIN-${from.substring(0, 3)}-${to.substring(0, 3)}-${i + 1}`,
      from,
      to,
      trainNumber,
      trainName,
      departureTime,
      arrivalTime,
      duration,
      price: {
        sleeper: sleeperPrice,
        ac3Tier: ac3TierPrice,
        ac2Tier: ac2TierPrice
      },
      availableSeats: {
        sleeper: sleeperSeats,
        ac3Tier: ac3TierSeats,
        ac2Tier: ac2TierSeats
      },
      daysOfOperation: operationDays
    });
  }

  // Sort by departure time
  return routes.sort((a, b) => {
    const [aHours, aMinutes] = a.departureTime.split(':').map(Number);
    const [bHours, bMinutes] = b.departureTime.split(':').map(Number);
    
    if (aHours !== bHours) {
      return aHours - bHours;
    }
    return aMinutes - bMinutes;
  });
}; 