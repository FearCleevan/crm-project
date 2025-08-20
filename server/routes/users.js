// server/routes/users.js
import express from 'express';
import bcrypt from 'bcryptjs';
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

// Create new user (protected route)
router.post('/', async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      birthday,
      phone_no,
      address,
      role,
      email,
      username,
      password
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, email, username, and password are required'
      });
    }

    // Check if email already exists
    const [emailCheck] = await pool.query(
      'SELECT user_id FROM `crm-users` WHERE email = ?',
      [email]
    );

    if (emailCheck.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Check if username already exists
    const [usernameCheck] = await pool.query(
      'SELECT user_id FROM `crm-users` WHERE username = ?',
      [username]
    );

    if (usernameCheck.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await pool.query(
      `INSERT INTO \`crm-users\` 
       (first_name, middle_name, last_name, birthday, phone_no, address, role, email, username, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        middle_name || null,
        last_name,
        birthday || null,
        phone_no || null,
        address || null,
        role || 'Data Analyst',
        email,
        username,
        hashedPassword
      ]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;