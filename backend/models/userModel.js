const db = require("../db/db");

const User = {
  create: (email, password, nome, cognome, telefono, dataNascita) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO User (email, password, nome, cognome, telefono, dataNascita, tipoUtente) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(query, [email, password, nome, cognome, telefono, dataNascita, 0], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, email });
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM User WHERE email = ?`;
      db.get(query, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM User WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

module.exports = User;