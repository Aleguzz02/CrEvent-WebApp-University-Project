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
            const query = `
  SELECT 
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
  JOIN Location ON Evento.idLocation = Location.id
  LEFT JOIN immaginiLocation ON immaginiLocation.idLocation = Location.id
  WHERE Evento.emailUtente = ?
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

    getAllEvents: () => {
      const query = `
        SELECT
          Evento.*,
          User.nome AS nomeUtente,
          User.cognome AS cognomeUtente,
          User.telefono AS telefonoUtente,
          Location.nome AS nomeLocation,
          Location.indirizzo AS indirizzoLocation,
          Location.citta AS cittaLocation,
          Location.descrizione AS descrizioneLocation,
          Location.capienza AS capienzaLocation,
          Location.lat,
          Location.lng,
          Location.linkSito AS linkSitoLocation,
          Location.costo AS costoLocation,
          GROUP_CONCAT(
            Staff.id || ':' || Staff.nome || ' ' || Staff.cognome || ' (' || Staff.tipo || ')',
            ', '
          ) AS staffCoinvolto
        FROM Evento
        LEFT JOIN User ON Evento.emailUtente = User.email
        LEFT JOIN Location ON Evento.idLocation = Location.id
        LEFT JOIN Coinvolge ON Evento.id = Coinvolge.idEvento
        LEFT JOIN Staff ON Coinvolge.idStaff = Staff.id
        GROUP BY Evento.id
        ORDER BY DATE(Evento.data) DESC, Evento.id DESC
      `;
      return all(query);
    },

    deleteEvent: (id) => {
      const query = `DELETE FROM Evento WHERE id = ?`;
      return run(query, [id]);
    },

    addEvent: (data, nome, prezzoTotale, invitati, emailUtente, idLocation) => {
      const query = `
        INSERT INTO Evento
        (data, nome, prezzoTotale, invitati, emailUtente, idLocation)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      return run(query, [
        data,
        nome,
        prezzoTotale,
        invitati,
        emailUtente,
        idLocation
      ]);
    },

    addStaffToEvent: async (idEvento, staffIds = []) => {
      for (const idStaff of staffIds) {
        await run(
          `INSERT INTO Coinvolge (idEvento, idStaff) VALUES (?, ?)`,
          [idEvento, idStaff]
        );
      }
    },

    getStaffEvents: (idStaff) => {
      const query = `
        SELECT
          Evento.id,
          Evento.nome,
          Evento.data,
          Evento.invitati,
          Evento.emailUtente,
          CASE
            WHEN DATE(Evento.data) < DATE('now', 'localtime') THEN 1
            ELSE 0
          END AS svolto,
          User.nome AS nomeCliente,
          User.cognome AS cognomeCliente,
          User.telefono AS telefonoCliente,
          User.email AS emailCliente,
          User.urlFotoProfilo AS urlFotoProfiloCliente,
          Location.id AS idLocation,
          Location.nome AS nomeLocation,
          Location.indirizzo AS indirizzoLocation,
          Location.citta AS cittaLocation,
          Location.lat,
          Location.lng,
          Location.custom AS customLocation,
          immaginiLocation.url AS urlLocation
        FROM Coinvolge
        JOIN Evento ON Evento.id = Coinvolge.idEvento
        JOIN User ON User.email = Evento.emailUtente
        LEFT JOIN Location ON Location.id = Evento.idLocation
        LEFT JOIN (
          SELECT idLocation, MIN(url) AS url
          FROM immaginiLocation
          GROUP BY idLocation
        ) AS immaginiLocation ON immaginiLocation.idLocation = Location.id
        WHERE Coinvolge.idStaff = ?
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
          END DESC;
      `;

      return all(query, [idStaff]);
    },

    getLocationEvents: (idLocation) => {
      const query = `
        SELECT
          Evento.id,
          Evento.nome,
          Evento.data,
          Evento.invitati,
          Evento.emailUtente,
          CASE
            WHEN DATE(Evento.data) < DATE('now', 'localtime') THEN 1
            ELSE 0
          END AS svolto,
          User.nome AS nomeCliente,
          User.cognome AS cognomeCliente,
          User.telefono AS telefonoCliente,
          User.email AS emailCliente,
          User.urlFotoProfilo AS urlFotoProfiloCliente,
          Location.id AS idLocation,
          Location.nome AS nomeLocation,
          Location.indirizzo AS indirizzoLocation,
          Location.citta AS cittaLocation,
          Location.lat,
          Location.lng,
          Location.custom AS customLocation,
          immaginiLocation.url AS urlLocation,
          Staff.id AS idStaff,
          Staff.nome AS nomeStaff,
          Staff.cognome AS cognomeStaff,
          Staff.linkSito AS linkSitoStaff,
          Staff.tipo AS tipoStaff,
          Staff.costo AS costoStaff,
          Staff.descrizione AS descrizioneStaff,
          Staff.genereMusicale AS genereMusicaleStaff,
          Staff.genereFotografico AS genereFotograficoStaff,
          Staff.mansione AS mansioneStaff,
          immaginiStaff.url AS urlStaff
        FROM Coinvolge
        JOIN Evento ON Evento.id = Coinvolge.idEvento
        JOIN User ON User.email = Evento.emailUtente
        LEFT JOIN Location ON Location.id = Evento.idLocation
        LEFT JOIN (
          SELECT idLocation, MIN(url) AS url
          FROM immaginiLocation
          GROUP BY idLocation
        ) AS immaginiLocation ON immaginiLocation.idLocation = Location.id
        JOIN Staff ON Staff.id = Coinvolge.idStaff
        LEFT JOIN (
          SELECT idStaff, MIN(url) AS url
          FROM immaginiStaff
          GROUP BY idStaff
        ) AS immaginiStaff ON immaginiStaff.idStaff = Staff.id
        WHERE Evento.idLocation = ?
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
          END DESC;
      `;

      return all(query, [idLocation]);
    },
    
    getEventById: (idEvento, email) => {
      return get(`
        SELECT *
        FROM Evento
        WHERE id = ?
        AND emailUtente = ?
      `, [idEvento, email]);
    }
}

module.exports = EventModel;
