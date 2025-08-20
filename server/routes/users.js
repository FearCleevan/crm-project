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

router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
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
    if (!first_name || !last_name || !email || !username) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, email, and username are required'
      });
    }

    // Check if email already exists (excluding current user)
    const [emailCheck] = await pool.query(
      'SELECT user_id FROM `crm-users` WHERE email = ? AND user_id != ?',
      [email, userId]
    );

    if (emailCheck.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Check if username already exists (excluding current user)
    const [usernameCheck] = await pool.query(
      'SELECT user_id FROM `crm-users` WHERE username = ? AND user_id != ?',
      [username, userId]
    );

    if (usernameCheck.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }

    let updateFields = [];
    let updateValues = [];

    // Build dynamic update query
    const fieldsToUpdate = {
      first_name,
      middle_name,
      last_name,
      birthday,
      phone_no,
      address,
      role,
      email,
      username
    };

    Object.entries(fieldsToUpdate).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    // Handle password update if provided
    if (password) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    updateValues.push(userId);

    const [result] = await pool.query(
      `UPDATE \`crm-users\` 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;