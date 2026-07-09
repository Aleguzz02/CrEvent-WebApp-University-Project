const fs = require('fs');
const path = require('path');

/**
 * Endpoint per l'upload di un'immagine
 * Riceve il file e il tipo (profile, location, staff)
 * Restituisce l'URL pubblico da salvare nel DB
 */
exports.uploadImage = (req, res) => {
  try {
    // Verifica che il file sia stato caricato
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nessun file caricato'
      });
    }

    const type = req.body.type;
    
    // Costruisce l'URL pubblico (relativo alla root del server)
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
    // Se c'è un errore, cancella il file appena salvato
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

    // Estrai il percorso relativo dalla URL (es. /uploads/location/img.jpg)
    const fullPath = path.join(__dirname, '../..', fileUrl);

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