import { ObjectId } from 'mongodb';

export interface Booking {
  id: string;
  userId: string;
  guideId: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'guide' | 'admin';
  guideProfile?: {
    bio: string;
    experience: number;
    languages: string[];
    rating: number;
    reviews: number;
  };
}

export interface Message {
  id: string;
  connectionId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: Date;
} 