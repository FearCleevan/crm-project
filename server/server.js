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

app.use('/api/requests', requestRoutes);

app.use('/api/permissions', permissionsRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes); // Add authentication middleware

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString() 
    });
});

app.post('/api/users/create', authMiddleware, (req, res, next) => {
  // Forward to the users router
  userRoutes(req, res, next);
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// connection testing
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connection successful');
    
    // Test a simple query
    return connection.query('SELECT 1 + 1 AS solution')
      .then(([rows]) => {
        console.log('✅ Database query test successful:', rows[0].solution);
        connection.release();
      });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    console.error('❌ Error details:', err.message);
    console.error('❌ Error code:', err.code);
  });