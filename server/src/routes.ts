import { Router } from 'express';

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

export function setupRoutes(router: Router, storage: IStorage): Router {
  // Health check
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // User routes
  router.post('/auth/register', async (req, res) => {
    try {
      const userData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Guide routes
  router.get('/guides', async (_req, res) => {
    try {
      const guides = await storage.guideProfiles.find().toArray();
      res.json(guides);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch guides' });
    }
  });

  // Places routes
  router.get('/places', async (_req, res) => {
    try {
      const places = await storage.getPlaces();
      res.json(places);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch places' });
    }
  });

  // Handle 404 routes
  router.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return router;
} 