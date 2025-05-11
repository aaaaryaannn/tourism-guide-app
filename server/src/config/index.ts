import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  corsOrigins: string[];
}

// Export configuration with proper type checking
export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tourism_guide',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  corsOrigins: [
    'https://aaaaryaannn.github.io',
    'http://localhost:5173',
    'http://localhost:3000'
  ]
};

export default config; 