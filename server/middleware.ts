import express from 'express';
import cors from 'cors';
import type { Express } from 'express';

export function setupMiddleware(app: Express) {
  app.use(cors());
  app.use(express.json());
} 