const { run, get, all } = require('../db/dbAsync');

const User = {
  // Crea nuovo utente
  create: (email, password, nome, cognome, telefono, dataNascita) => {
    const query = `INSERT INTO User (email, password, nome, cognome, telefono, dataNascita, tipoUtente) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      return run(query, [email, password, nome, cognome, telefono, dataNascita, 0]);
  },
  
  findByEmail: (email) => {
    const query = `SELECT * FROM User WHERE email = ?`;
      return get(query, [email]);
  },
  // Aggiorna il telefono
  updatePhone: (email, telefono) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE User SET telefono = ? WHERE email = ?`;
      db.run(query, [telefono, email], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  // Aggiorna la password
  updatePassword: (email, hashedPassword) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE User SET password = ? WHERE email = ?`;
      db.run(query, [hashedPassword, email], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  // Aggiorna la foto profilo (salva il percorso)
  updateProfilePicture: (email, urlFotoProfilo) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE User SET urlFotoProfilo = ? WHERE email = ?`;
      db.run(query, [urlFotoProfilo, email], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  // Rimuovi la foto profilo (imposta NULL)
  deleteProfilePicture: (email) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE User SET urlFotoProfilo = NULL WHERE email = ?`;
      db.run(query, [email], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  // Elimina l'utente (fisico)
  deleteUser: (email) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM User WHERE email = ?`;
      db.run(query, [email], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  // Recupera solo la password (per verifica)
  getPasswordByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT password, urlFotoProfilo FROM User WHERE email = ?`;
      db.get(query, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
};

module.exports = User;