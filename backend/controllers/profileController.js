const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// GET PROFILO
const getProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    res.json({
      success: true,
      data: {
        email: user.email,
        nome: user.nome,
        cognome: user.cognome,
        telefono: user.telefono,
        dataNascita: user.dataNascita,
        urlFotoProfilo: user.urlFotoProfilo || null
      }
    });
  } catch (err) {
    console.error('Errore in getProfile:', err);
    res.status(500).json({
      success: false,
      error: 'Errore del database'
    });
  }
};

// UPDATE TELEFONO
const updatePhone = async (req, res) => {
  try {
    const email = req.user.email;
    const { telefono } = req.body;

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(telefono)) {
      return res.status(400).json({
        success: false,
        error: 'Il telefono deve contenere esattamente 10 cifre'
      });
    }

    const result = await User.updatePhone(email, telefono);
    
    if (result.changes === 0) {
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
  } catch (err) {
    console.error('Errore in updatePhone:', err);
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'aggiornamento del telefono'
    });
  }
};

// UPDATE PASSWORD
const updatePassword = async (req, res) => {
  try {
    const email = req.user.email;
    const { passwordCorrente, nuovaPassword } = req.body;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(nuovaPassword)) {
      return res.status(400).json({
        success: false,
        error: 'La password deve avere almeno 8 caratteri, 1 maiuscola, 1 minuscola e 1 numero'
      });
    }

    // Recupera la password hashata dal DB
    const userData = await User.getPasswordByEmail(email);
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    // Verifica la password corrente
    const isMatch = await bcrypt.compare(passwordCorrente, userData.password);
    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: 'Password attuale errata'
      });
    }

    // Hash della nuova password
    const hashedNewPassword = await bcrypt.hash(nuovaPassword, 10);

    // Aggiorna nel DB
    const result = await User.updatePassword(email, hashedNewPassword);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    res.json({
      success: true,
      message: 'Password aggiornata con successo'
    });
  } catch (err) {
    console.error('Errore in updatePassword:', err);
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'aggiornamento della password'
    });
  }
};

// UPLOAD FOTO
const uploadPicture = async (req, res) => {
  try {
    const email = req.user.email;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    // Percorso relativo da salvare nel DB
    const relativePath = '/uploads/profile/' + path.basename(req.file.path);

    // Aggiorna il DB
    const result = await User.updateProfilePicture(email, relativePath);
    
    if (result.changes === 0) {
      // Se l'utente non esiste, cancella il file
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Errore cancellazione file orfano:', unlinkErr);
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
  } catch (err) {
    // Se c'è un errore, cancella il file appena salvato
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Errore cancellazione file orfano:', unlinkErr);
      });
    }
    console.error('Errore in uploadPicture:', err);
    res.status(500).json({
      success: false,
      error: 'Errore durante il salvataggio della foto'
    });
  }
};

// DELETE FOTO
const deletePicture = async (req, res) => {
  try {
    const email = req.user.email;

    // Recupera il percorso attuale della foto
    const userData = await User.getPasswordByEmail(email);
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    const currentPath = userData.urlFotoProfilo;

    // Aggiorna il DB impostando NULL
    const result = await User.deleteProfilePicture(email);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    // Cancella il file fisico se esisteva
    if (currentPath) {
      const fullPath = path.join(__dirname, '../../', currentPath);
      fs.unlink(fullPath, (unlinkErr) => {
        if (unlinkErr) console.error('Errore cancellazione file:', unlinkErr);
      });
    }

    res.json({
      success: true,
      message: 'Foto profilo rimossa con successo'
    });
  } catch (err) {
    console.error('Errore in deletePicture:', err);
    res.status(500).json({
      success: false,
      error: 'Errore durante la rimozione della foto'
    });
  }
};

// DELETE ACCOUNT
const deleteAccount = async (req, res) => {
  try {
    const email = req.user.email;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password richiesta per confermare l\'eliminazione'
      });
    }

    // Recupera la password e la foto
    const userData = await User.getPasswordByEmail(email);
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    // Verifica la password
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: 'Password errata'
      });
    }

    // Cancella la foto se esisteva
    if (userData.urlFotoProfilo) {
      const fullPath = path.join(__dirname, '../../', userData.urlFotoProfilo);
      fs.unlink(fullPath, (unlinkErr) => {
        if (unlinkErr) console.error('Errore cancellazione foto:', unlinkErr);
      });
    }

    // Elimina l'utente dal DB
    const result = await User.deleteUser(email);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    res.json({
      success: true,
      message: 'Account eliminato con successo'
    });
  } catch (err) {
    console.error('Errore in deleteAccount:', err);
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'eliminazione dell\'account'
    });
  }
};

// ESPORTAZIONE
module.exports = {
  getProfile,
  updatePhone,
  updatePassword,
  uploadPicture,
  deletePicture,
  deleteAccount
};