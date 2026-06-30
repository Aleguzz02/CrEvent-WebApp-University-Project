const db = require('../db/db');

const EventModel = {
    getUserEvents: (email) => {
        return new Promise((resolve,reject) => {
            const query = 
            `SELECT Evento.*, immaginiLocation.url, Location.nome AS nomeLocazione, Location.citta, Location.coordX, Location.coordY
            FROM Evento 
            JOIN 
            (Location LEFT JOIN immaginiLocation ON immaginiLocation.idLocation=Location.id) 
            ON Evento.idLocation=Location.id
            WHERE emailUtente=?
            ORDER BY
            Evento.svolto ASC,
            CASE
                WHEN Evento.svolto = 0 THEN Evento.data
            END ASC,
            CASE
                WHEN Evento.svolto = 1 THEN Evento.data
            END DESC;`;
            db.get(query,[email], (err, row) => {
                if(err) reject(err);
                else resolve(row);
            });
        });
    }
}

module.exports = EventModel;
