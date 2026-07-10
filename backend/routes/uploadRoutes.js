const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const {createUploadMiddleware,requireAdminForResourceImage} = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');



router.post(
  '/upload',
  authMiddleware,
  requireAdminForResourceImage,
  createUploadMiddleware().single('file'),
  uploadController.uploadImage
);

router.delete('/upload', authMiddleware, requireAdminForResourceImage, uploadController.deleteImage);

module.exports = router;
