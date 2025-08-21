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

export default router;