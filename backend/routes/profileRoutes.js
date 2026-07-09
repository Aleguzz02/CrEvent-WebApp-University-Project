const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const authMiddleware = require('../middleware/authMiddleware');
const createUploadMiddleware = require('../middleware/upload');
const profileController = require('../controllers/profileController');

// RIMUOVI la vecchia configurazione multer (storage, fileFilter, upload)

// Tutte le route sono protette da authMiddleware
router.get('/profile', authMiddleware, profileController.getProfile);
router.put('/profile/telefono', authMiddleware, profileController.updatePhone);
router.put('/profile/password', authMiddleware, profileController.updatePassword);

// Usa il middleware centralizzato per l'upload
router.post(
  '/profile/foto',
  authMiddleware,
  createUploadMiddleware().single('file'), // Il tipo viene passato come query param
  profileController.uploadPicture
);

router.delete('/profile/foto', authMiddleware, profileController.deletePicture);
router.delete('/profile', authMiddleware, profileController.deleteAccount);

module.exports = router;