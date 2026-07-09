const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const createUploadMiddleware = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// Rotta per l'upload (solo autenticati)
// Per location e staff è richiesto admin (ma lo gestiremo a livello di chiamata)
router.post(
  '/upload',
  authMiddleware,
  // Il middleware di upload accetta il tipo dal body
  createUploadMiddleware().single('file'),
  uploadController.uploadImage
);

router.delete('/upload', authMiddleware, uploadController.deleteImage);

module.exports = router;