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
  getLookupData,
  downloadCSVTemplate,
  cleanupImportSessions,
  checkImportProgress
} from '../controllers/prospectsController.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});

// All routes require authentication
router.use(authMiddleware);

// Template download route should come BEFORE parameterized routes
router.get('/import/template', downloadCSVTemplate);

// Get prospects with filtering and pagination
router.get('/', getProspects);

// Check import progress
router.get('/import/progress/:sessionId', checkImportProgress);

// Cleanup import sessions (optional)
router.delete('/import/cleanup', cleanupImportSessions);

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