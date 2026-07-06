const { run, get, all } = require('../db/dbAsync');

const User = {
  create: (email, password, nome, cognome, telefono, dataNascita) => {
    const query = `INSERT INTO User (email, password, nome, cognome, telefono, dataNascita, tipoUtente) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      return run(query, [email, password, nome, cognome, telefono, dataNascita, 0]);
  },
  
  findByEmail: (email) => {
    const query = `SELECT * FROM User WHERE email = ?`;
      return get(query, [email]);
  },

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