// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/users.js';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './middlewares/authMiddleware.js';
import pool from './config/db.js';
import requestRoutes from './routes/requestRoutes.js';
import permissionsRoutes from './routes/permissionsRoutes.js';
import prospectsRoutes from './routes/prospectsRoutes.js';
import { ipControlMiddleware } from './middlewares/ipControlMiddleware.js';
import ipManagementRoutes from './routes/ipManagementRoutes.js';

// IMPORTANT: Fix the dashboard routes import
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.path === '/api/auth/login' || req.path === '/api/health' || req.path === '/api/requests/submit') {
    return next();
  }
  ipControlMiddleware(req, res, next);
});

// Add dashboard routes BEFORE other routes that might conflict
app.use('/api/dashboard', dashboardRoutes);

// Add IP management routes
app.use('/api/ip-management', ipManagementRoutes);

app.use('/api/requests', requestRoutes);

app.use('/api/permissions', permissionsRoutes);

app.use('/api/prospects', prospectsRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString() 
    });
});

app.post('/api/users/create', authMiddleware, (req, res, next) => {
  userRoutes(req, res, next);
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});

// Add this temporary route to test
app.get('/api/dashboard/debug', authMiddleware, (req, res) => {
  console.log('✅ Debug dashboard route hit');
  res.json({
    success: true,
    message: 'Debug route working',
    user: req.user
  });
});

// Add the main stats route directly if needed
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    console.log('✅ Direct dashboard stats route hit');
    
    // Simple test query
    const [result] = await pool.query("SELECT COUNT(*) as total FROM prospects WHERE isactive = 1");
    
    res.json({
      success: true,
      data: {
        stats: {
          totalLeads: result[0]?.total || 0,
          totalLeadsChange: 0,
          totalEmails: 0,
          totalEmailsChange: 0,
          totalPhones: 0,
          totalPhonesChange: 0,
          totalCompanies: 0,
          totalCompaniesChange: 0,
          duplicateLeads: 0,
          duplicateLeadsChange: 0,
          junkLeads: 0,
          junkLeadsChange: 0
        },
        recentActivity: []
      }
    });
  } catch (error) {
    console.error('Direct stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add this function to debug all routes
function printRoutes(app) {
  console.log('\n📋 Registered Routes:');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      console.log(`   ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const route = handler.route;
          console.log(`   ${Object.keys(route.methods).join(', ').toUpperCase()} ${route.path}`);
        }
      });
    }
  });
  console.log('');
}

// Call it after all routes are registered
app.use((req, res, next) => {
  // Print routes on first request (optional)
  if (!app.routesPrinted) {
    printRoutes(app);
    app.routesPrinted = true;
  }
  next();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Test all routes
console.log('✅ Dashboard routes loaded: /api/dashboard/stats');
console.log('✅ Prospects routes loaded: /api/prospects');
console.log('✅ Auth routes loaded: /api/auth');

// connection testing
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connection successful');
    
    return connection.query('SELECT 1 + 1 AS solution')
      .then(([rows]) => {
        console.log('✅ Database query test successful:', rows[0].solution);
        connection.release();
      });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });