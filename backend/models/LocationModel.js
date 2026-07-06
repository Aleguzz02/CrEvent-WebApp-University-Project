const { run, get, all } = require('../db/dbAsync');
    
const LocationModel = {
    addLoc: async (nome, indirizzo, citta, descrizione, capienza, costo, dataInizio, dataFine, urlImg, linkSito = NULL) => {
        try {
            await run(`BEGIN TRANSACTION`);

            const result = await run(
                `INSERT INTO Location 
                (nome, indirizzo, citta, descrizione, capienza, linkSito, costo) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [nome, indirizzo, citta, descrizione, capienza, linkSito, costo]
            );

            const idLocation = result.id;

            await run(
                `INSERT INTO immaginiLocation (url, idLocation) VALUES (?, ?)`,
                [urlImg, idLocation]
            );

            await run(
                `INSERT INTO dateLocation (idLocation, dataInizio, dataFine) VALUES (?, ?, ?)`,
                [idLocation, dataInizio, dataFine]
            );

            await run(`COMMIT`);

            return { id: idLocation };
        } catch (err) {
            await run(`ROLLBACK`).catch(() => {});
            throw err;
        }
    },
    getAll: () => {
        return all(
            `SELECT L.*, Im.url 
            FROM Location L 
            LEFT JOIN immaginiLocation Im ON L.id = Im.idLocation`
        );
    },

    addCustomLoc: (lat, lng, nome, idUtente, dataOggi) => {
            const query = `INSERT INTO Location (nome, indirizzo, citta, descrizione, capienza, lat, lng, costo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            return run(query,[nome, `${idUtente} ${dataOggi}`, 0, 0, 0, lat, lng, 0]);
    },

    remLoc: async (idLocation) => {
        const events = await get(`
            SELECT COUNT(*) AS totale
            FROM Evento
            WHERE ? = idLocation 
            AND DATE(data) >= DATE('now','localtime')`,
            [idLocation]);
            
        if(events.totale > 0){
            throw new Error("futureEventsForLocation");
        }
        return run(
            `DELETE FROM Location WHERE id = ?`,
            [idLocation]);
    },
    getFreeDates: (idLocation) => {
       const query = `SELECT *
            FROM dateLocation
            WHERE ? = idLocation`;
            return all(query, [idLocation]);
    },
    getUsedDates: (idLocation) => {
        const query = `SELECT DISTINCT DATE(data) ad data
        FROM Evento
        WHERE idLocation = ?
        AND data >= DATE('now','localtime')`;
        return all(query, [idLocation]);
    },
    getCapacity: (people) => {
        const query = `SELECT Location.*, immaginiLocation.url
            FROM immaginiLocation RIGHT JOIN Location
            ON immaginiLocaiton.idLocation = Location.id
            WHERE ? <= capienza`;
            return all(query,[people]);
    },
    getCapacityAndDate: (day, people) => {
        const query = `SELECT Location.*, immaginiLocation.url
            FROM immaginiLocation
            RIGHT JOIN
            Location JOIN dateLocation ON dateLocation.idLocation = Location.id
            ON immaginiLocaiton.idLocation = Location.id
            WHERE ? <= capienza
            AND ? <= dateLocation.dataFine AND ? >= dateLocation.dataInizio
            AND Location.id NOT IN (
                SELECT idLocation
                FROM Evento
                WHERE data = ?)`;
            return all(query,[people,day,day,day]);
    },

    getByEventId: (idEvento) => {
        return get(`
            SELECT Location.*, immaginiLocation.url
            FROM Evento
            JOIN Location ON Location.id = Evento.idLocation
            LEFT JOIN immaginiLocation ON immaginiLocation.idLocation = Location.id
            WHERE Evento.id = ?
        `, [idEvento]);
    }
}
module.exports = LocationModel;