import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

interface Config {
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  corsOrigins: string[];
  isDevelopment: boolean;
}

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  const errorMessage = process.env.NODE_ENV === 'production'
    ? `Missing required environment variables: ${missingEnvVars.join(', ')}. Please set these in your Render dashboard under Environment Variables.`
    : `Missing required environment variables: ${missingEnvVars.join(', ')}. Please check your .env file.`;
  throw new Error(errorMessage);
}

// Export configuration with proper type checking
export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongodbUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  corsOrigins: [
    'https://aaaaryaannn.github.io',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  isDevelopment: process.env.NODE_ENV !== 'production'
};

export default config; 