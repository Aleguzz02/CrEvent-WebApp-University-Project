const { run, get, all } = require('../db/dbAsync');
    
const LocationModel = {
    addLoc: async (nome, indirizzo, citta, descrizione, capienza, costo, dataInizio, dataFine, urlImg, linkSito = null, lat = null, lng = null) => {
        try {
            await run(`BEGIN TRANSACTION`);

            const result = await run(
                `INSERT INTO Location 
                (nome, indirizzo, citta, descrizione, capienza, lat, lng, linkSito, costo) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [nome, indirizzo, citta, descrizione, capienza, lat, lng, linkSito, costo]
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
        return new Promise((resolve,reject) => {
            const query = `INSERT INTO Location (nome, indirizzo, citta, descrizione, capienza, lat, lng, costo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(query,[nome, `${idUtente} ${dataOggi}`, 0, 0, 0, lat, lng, 0], function (err) {
                if(err) reject(err);
                else resolve({
                    id: this.lastID
                });
            });
        });
    },

    remLoc: async (idLocation) => {
        const events = await get(`
            SELECT COUNT(*) AS totale
            FROM Evento
            WHERE idLocation = ?
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
    }
}
module.exports = LocationModel;
