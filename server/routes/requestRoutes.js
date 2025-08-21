// server/routes/requestRoutes.js
import express from 'express';
import { createRequest, getRequests, updateRequest } from '../controllers/requestController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for submitting requests
router.post('/submit', createRequest);

// Protected routes for managing requests
router.get('/', authMiddleware, getRequests);
router.put('/:id', authMiddleware, updateRequest);

export default router;