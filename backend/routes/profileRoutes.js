const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const authMiddleware = require('../middleware/authMiddleware');
const { createUploadMiddleware } = require('../middleware/upload');
const profileController = require('../controllers/profileController');


router.get('/profile', authMiddleware, profileController.getProfile);
router.put('/profile/telefono', authMiddleware, profileController.updatePhone);
router.put('/profile/password', authMiddleware, profileController.updatePassword);

router.post(
  '/profile/foto',
  authMiddleware,
  createUploadMiddleware().single('file'), 
  profileController.uploadPicture
);

router.delete('/profile/foto', authMiddleware, profileController.deletePicture);
router.delete('/profile', authMiddleware, profileController.deleteAccount);

module.exports = router;
