import { Router } from 'express';
import { login, register } from '../controllers/auth.js';

const router = Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);

// Options routes for CORS
router.options('/login', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).end();
});

router.options('/register', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).end();
});

export default router; 