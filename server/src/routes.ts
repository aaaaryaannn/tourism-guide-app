import { Express } from 'express';

export interface IStorage {
  users: any;
  guideProfiles: any;
  places: any;
  itineraries: any;
  itineraryPlaces: any;
  savedPlaces: any;
  getUserByEmail(email: string): Promise<any>;
  createUser(userData: any): Promise<any>;
  createGuideProfile(profileData: any): Promise<any>;
  createPlace(placeData: any): Promise<any>;
  getPlace(id: string): Promise<any>;
  getPlaces(): Promise<any[]>;
  createItinerary(itineraryData: any): Promise<any>;
  createBooking(bookingData: any): Promise<any>;
  createConnection(connectionData: any): Promise<any>;
  getConnections(userId: string): Promise<any[]>;
}

export function setupRoutes(app: Express, storage: IStorage) {
  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Handle 404 routes
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
} 