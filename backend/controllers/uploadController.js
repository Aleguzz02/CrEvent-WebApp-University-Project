const fs = require('fs');
const path = require('path');


exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nessun file caricato'
      });
    }

    const type = req.uploadType || req.query.type || req.body.type;
    
    const publicUrl = `/uploads/${type}/${path.basename(req.file.path)}`;

    res.status(200).json({
      success: true,
      message: 'Immagine caricata con successo',
      data: {
        url: publicUrl,
        filename: req.file.filename
      }
    });

  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Errore cancellazione file orfano:', unlinkErr);
      });
    }
    console.error('Errore in uploadImage:', err);
    res.status(500).json({
      success: false,
      message: 'Errore durante il caricamento dell\'immagine'
    });
  }
};

exports.deleteImage = (req, res) => {
  try {
    const fileUrl = req.query.url;
    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL del file è obbligatorio'
      });
    }

    const normalizedUrl = fileUrl.replace(/\\/g, '/');
    if (!normalizedUrl.startsWith('/uploads/')) {
      return res.status(400).json({
        success: false,
        message: 'URL del file non valido'
      });
    }

    const uploadsRoot = path.resolve(__dirname, '../uploads');
    const relativePath = normalizedUrl.slice('/uploads/'.length);
    const fullPath = path.resolve(uploadsRoot, relativePath);

    if (!fullPath.startsWith(`${uploadsRoot}${path.sep}`)) {
      return res.status(400).json({
        success: false,
        message: 'URL del file non valido'
      });
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`File eliminato: ${fullPath}`);
      res.json({
        success: true,
        message: 'File eliminato con successo'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File non trovato'
      });
    }
  } catch (err) {
    console.error('Errore in deleteImage:', err);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'eliminazione del file'
    });
  }
};
