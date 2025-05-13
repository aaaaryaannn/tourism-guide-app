import { Router } from 'express';
import { 
  getConnections,
  createConnection,
  updateConnectionStatus,
  deleteConnection 
} from '../controllers/connections.js';

const router = Router();

router.get('/', getConnections);
router.post('/', createConnection);
router.patch('/:id', updateConnectionStatus);
router.delete('/:id', deleteConnection);

export default router;