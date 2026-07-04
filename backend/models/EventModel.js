const { run, get, all } = require('../db/dbAsync');

const EventModel = {
    getUserEvents: (email) => {
        const query1 = 
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
            const query = 
  `SELECT 
      Evento.*,
      CASE 
        WHEN DATE(Evento.data) < DATE('now', 'localtime') THEN 1 
        ELSE 0 
      END AS svolto,
      immaginiLocation.url,
      Location.nome AS nomeLocazione,
      Location.citta,
      Location.lat,
      Location.lng
    FROM Evento 
    JOIN 
      (Location LEFT JOIN immaginiLocation ON immaginiLocation.idLocation = Location.id) 
    ON Evento.idLocation = Location.id
    WHERE emailUtente = ?
    ORDER BY
      CASE 
        WHEN DATE(Evento.data) < DATE('now', 'localtime') THEN 1 
        ELSE 0 
      END ASC,
      CASE
        WHEN DATE(Evento.data) >= DATE('now', 'localtime') THEN DATE(Evento.data)
      END ASC,
      CASE
        WHEN DATE(Evento.data) < DATE('now', 'localtime') THEN DATE(Evento.data)
      END DESC;`;
            return all(query,[email]);
    },

    addEvent: () => {
        
    }
}

module.exports = EventModel;
