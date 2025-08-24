import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  getProspects,
  getProspectById,
  createProspect,
  updateProspect,
  deleteProspect,
  bulkDeleteProspects,
  exportProspects,
  importProspects,
  getLookupData
} from '../controllers/prospectsController.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get prospects with filtering and pagination
router.get('/', getProspects);

// Get single prospect
router.get('/:id', getProspectById);

// Create new prospect
router.post('/', createProspect);

// Update prospect
router.put('/:id', updateProspect);

// Delete prospect
router.delete('/:id', deleteProspect);

// Bulk delete prospects
router.post('/bulk-delete', bulkDeleteProspects);

// Export prospects
router.get('/export/csv', exportProspects);

// Import prospects
router.post('/import/csv', upload.single('file'), importProspects);

// Get lookup data
router.get('/lookup/data', getLookupData);

export default router;