// server/routes/permissionsRoutes.js
import express from 'express';
import { 
    getUsersWithPermissions, 
    getRoles, 
    getPermissions, 
    updateUserRoles,
    getUserPermissions 
} from '../controllers/permissionsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get current user's permissions
router.get('/my-permissions', getUserPermissions);

// Get all users with permissions (admin only)
router.get('/users', getUsersWithPermissions);

// Get all available roles
router.get('/roles', getRoles);

// Get all available permissions
router.get('/permissions', getPermissions);

// Update user roles
router.put('/users/:userId/roles', updateUserRoles);

// server/routes/permissionsRoutes.js - Fix the my-permissions endpoint
router.get('/my-permissions', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's direct role from crm-users table
    const [userRows] = await pool.query(
      `SELECT role FROM \`crm-users\` WHERE user_id = ?`,
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userRole = userRows[0].role;
    
    // If user is IT Admin, they have ALL permissions
    if (userRole === 'IT Admin') {
      // Get all permissions from the database
      const [allPermissions] = await pool.query(
        `SELECT permission_key FROM permissions`
      );
      
      const permissionKeys = allPermissions.map(p => p.permission_key);
      
      return res.json({
        success: true,
        permissions: permissionKeys,
        roles: [userRole]
      });
    }
    
    // Get additional roles from user_roles table
    const [additionalRoles] = await pool.query(
      `SELECT r.role_name 
       FROM user_roles ur
       JOIN permission_roles r ON ur.role_id = r.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    
    // Combine all roles
    const allRoles = [userRole];
    additionalRoles.forEach(role => {
      if (role.role_name && !allRoles.includes(role.role_name)) {
        allRoles.push(role.role_name);
      }
    });
    
    // Get permissions for all roles
    let allPermissions = [];
    for (const roleName of allRoles) {
      const [rolePermissions] = await pool.query(
        `SELECT DISTINCT p.permission_key
         FROM permission_roles r
         JOIN role_permissions rp ON r.role_id = rp.role_id
         JOIN permissions p ON rp.permission_id = p.permission_id
         WHERE r.role_name = ? AND rp.has_permission = TRUE`,
        [roleName]
      );
      
      rolePermissions.forEach(perm => {
        if (perm.permission_key && !allPermissions.includes(perm.permission_key)) {
          allPermissions.push(perm.permission_key);
        }
      });
    }
    
    res.json({
      success: true,
      permissions: allPermissions,
      roles: allRoles
    });
    
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;