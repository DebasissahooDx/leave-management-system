import express from 'express';
const router = express.Router();

// 1. Import your controllers (must use .js extension)
import { 
  applyLeave, 
  getMyLeaves, 
  getAllLeaves, 
  updateLeaveStatus,
  getUserBalance,
  getManagerDashboard 
} from '../controllers/leaveController.js';

// 2. Import your middleware
import { protect, authorizeManager } from '../middleware/authMiddleware.js';

// --- ROUTES ---

// Protect all routes below
router.use(protect);

router.post('/apply', applyLeave);
router.get('/my', getMyLeaves);
router.get('/balance', getUserBalance);

// Manager specific routes
router.get('/all', authorizeManager, getAllLeaves);
router.put('/:id', authorizeManager, updateLeaveStatus);
router.get('/dashboard/stats', authorizeManager, getManagerDashboard);


export default router;