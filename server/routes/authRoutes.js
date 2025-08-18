// server/routes/authRoutes.js
import express from 'express';
import { loginUser, protectedRoute, logoutUser } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/protected', authMiddleware, ProtectedRoute);
router.post('/logout', logoutUser);

export default router;
