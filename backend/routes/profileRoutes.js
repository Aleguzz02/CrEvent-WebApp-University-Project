const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authMiddleware = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

// Verifico che la cartella esista
const uploadDir = path.join(__dirname, '../../uploads/profile');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configura storage su disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // dove salvare
  },
  filename: (req, file, cb) => {
    // Genera un nome univoco: timestamp + estensione originale
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// Filtra solo immagini
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo immagini sono permesse'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Tutte le route sono protette da authMiddleware
router.get('/profile', authMiddleware, profileController.getProfile);
router.put('/profile/telefono', authMiddleware, profileController.updatePhone);
router.put('/profile/password', authMiddleware, profileController.updatePassword);
router.post('/profile/foto', authMiddleware, upload.single('file'), profileController.uploadPicture);
router.delete('/profile/foto', authMiddleware, profileController.deletePicture);
router.delete('/profile', authMiddleware, profileController.deleteAccount);

module.exports = router;