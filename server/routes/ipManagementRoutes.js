//server/routes/ipManagementRoutes.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import pool from '../config/db.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Check if user has admin privileges
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'IT Admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin privileges required'
    });
  }
  next();
};

// Get current IP control settings
router.get('/settings', requireAdmin, async (req, res) => {
  try {
    const [settingsRows] = await pool.query(
      "SELECT setting_name, setting_value FROM system_settings WHERE setting_name LIKE 'ip_%'"
    );
    
    const settings = {};
    settingsRows.forEach(row => {
      settings[row.setting_name] = row.setting_value;
    });
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching IP settings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update IP control mode
router.put('/settings/mode', requireAdmin, async (req, res) => {
  try {
    const { mode } = req.body;
    
    if (!['open', 'whitelist'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mode. Must be "open" or "whitelist"'
      });
    }
    
    await pool.query(
      "UPDATE system_settings SET setting_value = ? WHERE setting_name = 'ip_control_mode'",
      [mode]
    );
    
    res.json({
      success: true,
      message: `IP control mode updated to ${mode}`
    });
  } catch (error) {
    console.error('Error updating IP control mode:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all whitelisted IPs
router.get('/whitelist', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM ip_whitelist ORDER BY created_at DESC"
    );
    
    res.json({
      success: true,
      whitelist: rows
    });
  } catch (error) {
    console.error('Error fetching whitelist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Add IP to whitelist
router.post('/whitelist', requireAdmin, async (req, res) => {
  try {
    const { ip_address, description } = req.body;
    
    if (!ip_address) {
      return res.status(400).json({
        success: false,
        error: 'IP address is required'
      });
    }
    
    // Validate IP address format
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip_address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IP address format'
      });
    }
    
    const [result] = await pool.query(
      "INSERT INTO ip_whitelist (ip_address, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = ?, is_active = 1",
      [ip_address, description, description]
    );
    
    res.status(201).json({
      success: true,
      message: 'IP added to whitelist',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update whitelist entry
router.put('/whitelist/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { ip_address, description, is_active } = req.body;
    
    let updateFields = [];
    let updateValues = [];
    
    if (ip_address !== undefined) {
      updateFields.push('ip_address = ?');
      updateValues.push(ip_address);
    }
    
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active ? 1 : 0);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    updateValues.push(id);
    
    const [result] = await pool.query(
      `UPDATE ip_whitelist SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Whitelist entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Whitelist entry updated'
    });
  } catch (error) {
    console.error('Error updating whitelist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all blacklisted IPs
router.get('/blacklist', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM ip_blacklist ORDER BY created_at DESC"
    );
    
    res.json({
      success: true,
      blacklist: rows
    });
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Add IP to blacklist
router.post('/blacklist', requireAdmin, async (req, res) => {
  try {
    const { ip_address, description } = req.body;
    
    if (!ip_address) {
      return res.status(400).json({
        success: false,
        error: 'IP address is required'
      });
    }
    
    // Validate IP address format
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip_address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IP address format'
      });
    }
    
    const [result] = await pool.query(
      "INSERT INTO ip_blacklist (ip_address, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = ?, is_active = 1",
      [ip_address, description, description]
    );
    
    res.status(201).json({
      success: true,
      message: 'IP added to blacklist',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding to blacklist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update blacklist entry
router.put('/blacklist/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { ip_address, description, is_active } = req.body;
    
    let updateFields = [];
    let updateValues = [];
    
    if (ip_address !== undefined) {
      updateFields.push('ip_address = ?');
      updateValues.push(ip_address);
    }
    
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active ? 1 : 0);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    updateValues.push(id);
    
    const [result] = await pool.query(
      `UPDATE ip_blacklist SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Blacklist entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Blacklist entry updated'
    });
  } catch (error) {
    console.error('Error updating blacklist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;