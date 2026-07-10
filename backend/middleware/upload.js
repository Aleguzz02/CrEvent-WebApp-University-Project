const multer = require('multer');
const path = require('path');
const fs = require('fs');
const requireAdmin = require('./requireAdmin');

const requireAdminForResourceImage = (req, res, next) => {
  const urlType = typeof req.query.url === 'string'
    ? req.query.url.replace(/\\/g, '/').match(/^\/uploads\/([^/]+)\//)?.[1]
    : null;
  const type = req.query.type || urlType;

  if (type === 'location' || type === 'staff') {
    return requireAdmin(req, res, next);
  }

  next();
};

const createUploadMiddleware = (allowedTypes = ['profile', 'location', 'staff']) => {
  const validateType = (req) => {
    const type = req.query.type;
    if (!type) {
      throw new Error('Il campo "type" è obbligatorio come parametro query (profile, location, staff)');
    }
    if (!allowedTypes.includes(type)) {
      throw new Error(`Tipo non valido. Usa: ${allowedTypes.join(', ')}`);
    }
    return type;
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const type = validateType(req);
        const uploadDir = path.join(__dirname, '../uploads', type);
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

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo immagini sono permesse'), false);
    }
  };

  return multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
  });
};

module.exports = {createUploadMiddleware,requireAdminForResourceImage};
