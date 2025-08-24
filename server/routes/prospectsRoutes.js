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

// Import multer using dynamic import
let multer;
let upload;

(async () => {
  try {
    const multerModule = await import('multer');
    multer = multerModule.default;
    upload = multer({ storage: multerModule.default.memoryStorage() });
  } catch (error) {
    console.error('Failed to load multer:', error);
  }
})();

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
router.post('/import/csv', (req, res, next) => {
  if (!upload) {
    return res.status(500).json({
      success: false,
      error: 'File upload functionality not available'
    });
  }
  
  // Use multer to handle file upload
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: 'File upload failed: ' + err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    importProspects(req, res, next);
  });
});

// Get lookup data - FIXED ENDPOINT
router.get('/lookup/data', getLookupData);

export default router;