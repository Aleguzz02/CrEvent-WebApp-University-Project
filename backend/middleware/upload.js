const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Middleware di upload dinamico per immagini
 * Supporta i tipi: 'profile', 'location', 'staff'
 * 
 * Usa req.body.type per determinare la sottocartella di destinazione
 * Esempio: { type: 'location' } => salva in backend/uploads/location/
 */
const createUploadMiddleware = (allowedTypes = ['profile', 'location', 'staff']) => {
  // Validazione del tipo
  const validateType = (req) => {
    // Legge da query string invece che da body
    const type = req.query.type;
    if (!type) {
      throw new Error('Il campo "type" è obbligatorio come parametro query (profile, location, staff)');
    }
    if (!allowedTypes.includes(type)) {
      throw new Error(`Tipo non valido. Usa: ${allowedTypes.join(', ')}`);
    }
    return type;
  };

  // Configurazione storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const type = validateType(req);
        const uploadDir = path.join(__dirname, '../uploads', type);
        // Crea la cartella se non esiste
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      } catch (err) {
        cb(err, null);
      }
    },
    filename: (req, file, cb) => {
      try {
        const type = validateType(req);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, type + '-' + uniqueSuffix + ext);
      } catch (err) {
        cb(err, null);
      }
    }
  });

  // Filtro: solo immagini
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo immagini sono permesse'), false);
    }
  };

  return multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
  });
};

module.exports = createUploadMiddleware;