// server/routes/dashboard.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { 
  getDashboardStats, 
  getDashboardStatsWithTrends, 
  debugDashboardData 
} from '../controllers/dashboardController.js';

const router = express.Router();

console.log('🔄 Dashboard routes initializing...');

// All dashboard routes require authentication
router.use(authMiddleware);

// Debug middleware to log dashboard requests
router.use((req, res, next) => {
  console.log(`📊 Dashboard API call: ${req.method} ${req.originalUrl}`);
  next();
});

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get dashboard statistics with trends (optional enhanced version)
router.get('/stats/trends', getDashboardStatsWithTrends);

// Debug route to analyze data issues
router.get('/debug', debugDashboardData);

// Test route to verify dashboard routes are working
router.get('/test', (req, res) => {
  console.log('✅ Dashboard test route hit');
  res.json({
    success: true,
    message: 'Dashboard routes are working!',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Dashboard routes registered: /stats, /stats/trends, /debug, /test');

export default router;