// Base interface for all models
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types and interfaces
export type UserType = 'user' | 'guide';

export interface User extends BaseModel {
  name: string;
  email: string;
  password: string;
  userType: UserType;
  image?: string;
  currentLatitude?: string;
  currentLongitude?: string;
  lastLocationUpdate?: Date;
  phone?: string;
  username?: string;
}

// Guide profile interface
export interface GuideProfile extends BaseModel {
  userId: string;
  bio: string;
  languages: string[];
  specialties: string[];
  location: string;
  experience: number;
  rating?: number;
  reviews?: string[];
}

// Place types and interfaces
export type PlaceCategory = 'monument' | 'temple' | 'heritage' | 'nature' | 'winery' | 'beach' | 'landmark' | 'spiritual';

export interface Place extends BaseModel {
  name: string;
  description: string;
  location: string;
  category: PlaceCategory;
  latitude: string;
  longitude: string;
  imageUrl: string;
  rating?: number;
  reviews?: string[];
  openingHours?: string;
  entryFee?: string;
  bestTimeToVisit?: string;
  wikimediaImageUrl?: string;
  wikimediaLicenseUrl?: string;
  wikimediaThumbnailUrl?: string;
  wikimediaDescription?: string;
  wikimediaArtist?: string;
  wikimediaAttributionUrl?: string;
  wikimediaLicense?: string;
}

// Itinerary interface
export interface Itinerary extends BaseModel {
  userId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

// Itinerary place interface
export interface ItineraryPlace extends BaseModel {
  itineraryId: string;
  placeId: string;
  order: number;
  notes?: string;
}

// Booking types and interfaces
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking extends BaseModel {
  userId: string;
  guideId: string;
  placeId: string;
  date: Date;
  status: BookingStatus;
  notes?: string;
}

// Connection types and interfaces
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface Connection extends BaseModel {
  fromUser?: Omit<User, 'password'>;
  toUser?: Omit<User, 'password'>;
  status: ConnectionStatus;
  message?: string;
  tripDetails?: string;
  budget?: string;
  guideProfile?: GuideProfile;
}

// Saved place interface
export interface SavedPlace extends BaseModel {
  userId: string;
  placeId: string;
  notes?: string;
}

// Validation functions
export const validateUser = (user: any): user is User => {
  return (
    typeof user === 'object' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    typeof user.password === 'string' &&
    (user.userType === 'user' || user.userType === 'guide')
  );
};

export const validatePlace = (place: any): place is Place => {
  return (
    typeof place === 'object' &&
    typeof place.name === 'string' &&
    typeof place.description === 'string' &&
    typeof place.location === 'string' &&
    typeof place.latitude === 'string' &&
    typeof place.longitude === 'string' &&
    typeof place.imageUrl === 'string'
  );
};

export const validateBooking = (booking: any): booking is Booking => {
  return (
    typeof booking === 'object' &&
    typeof booking.userId === 'string' &&
    typeof booking.guideId === 'string' &&
    typeof booking.placeId === 'string' &&
    booking.date instanceof Date &&
    ['pending', 'confirmed', 'cancelled'].includes(booking.status)
  );
};
