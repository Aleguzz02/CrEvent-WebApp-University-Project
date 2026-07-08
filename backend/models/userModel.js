const { run, get, all } = require('../db/dbAsync');
const db = require("../db/db");

const User = {
  create: (email, password, nome, cognome, telefono, dataNascita) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO User (email, password, nome, cognome, telefono, dataNascita, tipoUtente) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(query, [email, password, nome, cognome, telefono, dataNascita, 0], function (err) {
        if (err) reject(err);
        else resolve({ email });
      });
    });
  },
  
  // Trova utente con la mail
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM User WHERE email = ?`;
      db.get(query, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Recupera tutti gli utenti senza restituire la password
  findAllSafe: () => {
    const query = `
      SELECT email, nome, cognome, telefono, dataNascita, urlFotoProfilo, tipoUtente, idStaff, idLocation
      FROM User
      ORDER BY tipoUtente DESC, cognome ASC, nome ASC
    `;
    return all(query);
  },

  // Aggiorna il telefono
  updatePhone: (email, telefono) => {
      const query = `UPDATE User SET telefono = ? WHERE email = ?`;
      return run(query, [telefono, email]);
  },

  updatePassword: (email, hashedPassword) => {
      const query = `UPDATE User SET password = ? WHERE email = ?`;
      return run(query, [hashedPassword, email]);
  },

  updateProfilePicture: (email, urlFotoProfilo) => {
      const query = `UPDATE User SET urlFotoProfilo = ? WHERE email = ?`;
      return run(query, [urlFotoProfilo, email]);
  },

  deleteProfilePicture: (email) => {
      const query = `UPDATE User SET urlFotoProfilo = NULL WHERE email = ?`;
      return run(query, [email]);
  },

  deleteUser: (email) => {
      const query = `DELETE FROM User WHERE email = ?`;
      return run(query, [email]);
  },

  getPasswordByEmail: (email) => {
      const query = `SELECT password, urlFotoProfilo FROM User WHERE email = ?`;
      return get(query, [email]);
  }
};

module.exports = User;
