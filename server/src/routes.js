import express from 'express';
import { storage } from './storage.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from './config/index.js';
import { RequestHandler } from 'express';
import { ObjectId } from 'mongodb';
import authRoutes from './routes/auth.js';

const router = express.Router();

// Use the new auth routes
router.use('/auth', authRoutes);

// Define types
interface AuthUser {
  userId: string;
  email: string;
}

// ... rest of the existing code ... 