const getProfile = (req, res) => {
  const email = req.user.email;

  db.get(
    `SELECT email, nome, cognome, telefono, dataNascita, urlFotoProfilo 
     FROM User WHERE email = ?`,
    [email],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Errore del database'
        });
      }
      if (!row) {
        return res.status(404).json({
          success: false,
          error: 'Utente non trovato'
        });
      }

      res.json({
        success: true,
        data: {
          email: row.email,
          nome: row.nome,
          cognome: row.cognome,
          telefono: row.telefono,
          dataNascita: row.dataNascita,
          urlFotoProfilo: row.urlFotoProfilo || null
        }
      });
    }
  );
};

const updatePhone = (req, res) => {
  const email = req.user.email;
  const { telefono } = req.body;

  // Validazione con la tua regex (esattamente 10 cifre)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(telefono)) {
    return res.status(400).json({
      success: false,
      error: 'Il telefono deve contenere esattamente 10 cifre'
    });
  }

  db.run(
    `UPDATE User SET telefono = ? WHERE email = ?`,
    [telefono, email],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Errore durante l\'aggiornamento del telefono'
        });
      }
      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: 'Utente non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Telefono aggiornato con successo',
        data: { telefono }
      });
    }
  );
};

const bcrypt = require('bcrypt');

const updatePassword = (req, res) => {
  const email = req.user.email;
  const { passwordCorrente, nuovaPassword } = req.body;

  // Validazione nuova password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(nuovaPassword)) {
    return res.status(400).json({
      success: false,
      error: 'La password deve avere almeno 8 caratteri, 1 maiuscola, 1 minuscola e 1 numero'
    });
  }

  // Recupera la password hashata dal DB
  db.get(
    `SELECT password FROM User WHERE email = ?`,
    [email],
    async (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Errore del database'
        });
      }
      if (!row) {
        return res.status(404).json({
          success: false,
          error: 'Utente non trovato'
        });
      }

      // Verifica la password corrente
      const isMatch = await bcrypt.compare(passwordCorrente, row.password);
      if (!isMatch) {
        return res.status(403).json({
          success: false,
          error: 'Password attuale errata'
        });
      }

      // Hash della nuova password
      const hashedNewPassword = await bcrypt.hash(nuovaPassword, 10);

      // Aggiornamento nel DB
      db.run(
        `UPDATE User SET password = ? WHERE email = ?`,
        [hashedNewPassword, email],
        function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Errore durante l\'aggiornamento della password'
            });
          }
          res.json({
            success: true,
            message: 'Password aggiornata con successo'
          });
        }
      );
    }
  );
};

const path = require('path');
const fs = require('fs');

const uploadPicture = (req, res) => {
  const email = req.user.email;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Nessun file caricato'
    });
  }

  // req.file.path è il percorso completo sul disco (es. /home/user/project/uploads/profile/profile-1715432100000-123456789.jpg)
  // Ma per il DB e per il frontend ci serve un percorso relativo o URL
  // Per semplicità, salviamo il percorso relativo alla root del server
  // Ad esempio: "/uploads/profile/profile-1715432100000-123456789.jpg"
  const relativePath = '/uploads/profile/' + path.basename(req.file.path);

  // Aggiorna il DB con il percorso relativo
  db.run(
    `UPDATE User SET urlFotoProfilo = ? WHERE email = ?`,
    [relativePath, email],
    function(err) {
      if (err) {
        // Se il DB fallisce, cancella il file appena salvato
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Errore durante la cancellazione del file orfano:', unlinkErr);
        });
        return res.status(500).json({
          success: false,
          error: 'Errore durante il salvataggio della foto'
        });
      }
      if (this.changes === 0) {
        // Se l'utente non esiste, cancella il file
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Errore durante la cancellazione del file orfano:', unlinkErr);
        });
        return res.status(404).json({
          success: false,
          error: 'Utente non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Foto profilo aggiornata',
        data: { urlFotoProfilo: relativePath }
      });
    }
  );
};

const deletePicture = (req, res) => {
  const email = req.user.email;

  // Prima recupera il percorso attuale della foto
  db.get(
    `SELECT urlFotoProfilo FROM User WHERE email = ?`,
    [email],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Errore del database'
        });
      }
      if (!row) {
        return res.status(404).json({
          success: false,
          error: 'Utente non trovato'
        });
      }

      const currentPath = row.urlFotoProfilo;

      // Aggiorna il DB impostando NULL
      db.run(
        `UPDATE User SET urlFotoProfilo = NULL WHERE email = ?`,
        [email],
        function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Errore durante la rimozione della foto'
            });
          }

          // Se c'era una foto, cancella il file fisico
          if (currentPath) {
            // Converti il percorso relativo in percorso assoluto
            const fullPath = path.join(__dirname, '../../', currentPath);
            fs.unlink(fullPath, (unlinkErr) => {
              if (unlinkErr) {
                // Solo log, non bloccare la risposta
                console.error('Errore durante la cancellazione del file:', unlinkErr);
              }
            });
          }

          res.json({
            success: true,
            message: 'Foto profilo rimossa con successo'
          });
        }
      );
    }
  );
};

const deleteAccount = (req, res) => {
  const email = req.user.email;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Password richiesta per confermare l\'eliminazione'
    });
  }

  // Recupero la password hashata
  db.get(
    `SELECT password FROM User WHERE email = ?`,
    [email],
    async (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Errore del database'
        });
      }
      if (!row) {
        return res.status(404).json({
          success: false,
          error: 'Utente non trovato'
        });
      }

      // Verifico la password
      const isMatch = await bcrypt.compare(password, row.password);
      if (!isMatch) {
        return res.status(403).json({
          success: false,
          error: 'Password errata'
        });
      }

      // Eliminazione FISICA dell'utente
      db.run(
        `DELETE FROM User WHERE email = ?`,
        [email],
        function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Errore durante l\'eliminazione dell\'account'
            });
          }
          if (this.changes === 0) {
            return res.status(404).json({
              success: false,
              error: 'Utente non trovato'
            });
          }

          res.json({
            success: true,
            message: 'Account eliminato con successo'
          });
        }
      );
    }
  );
};

module.exports = {
  getProfile,
  updatePhone,
  updatePassword,
  uploadPicture,
  deletePicture,
  deleteAccount
};