// server/routes/users.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get all users (protected route)
router.get('/', async (req, res) => {
  try {
    // Verify authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const [rows] = await pool.query(`
      SELECT 
        user_id,
        first_name,
        middle_name,
        last_name,
        profile,
        birthday,
        phone_no,
        address,
        role,
        email,
        username,
        permissions,
        created_at,
        updated_at
      FROM \`crm-users\`
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users: rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;