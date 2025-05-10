import express from 'express';
import { setupRoutes } from './routes';
import { MongoStorage } from './storage';
import { setupMiddleware } from './middleware';
import { createViteServer } from './vite';

async function main() {
  const app = express();
  const storage = new MongoStorage();
  
  setupMiddleware(app);
  setupRoutes(app, storage);

  const vite = await createViteServer();
  app.use(vite.middlewares);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

main().catch(console.error);
