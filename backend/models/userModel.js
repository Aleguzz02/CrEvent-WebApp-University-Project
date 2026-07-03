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

  findById: (id) => {
    const query = `SELECT * FROM User WHERE id = ?`;
      return get(query, [id]);
  }
};

module.exports = User;