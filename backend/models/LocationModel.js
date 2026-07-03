const db = require('../db/db');

const run = (query, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(query, params, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    };
    
const LocationModel = {
    /*addLoc: (nome, indirizzo, citta, descrizione, capienza, costo, dataInizio, dataFine, urlImg, linkSito = NULL) => {
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
    },*/
    getAll: () => {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT L.*, Im.url 
            FROM Location L 
            LEFT JOIN immaginiLocation Im ON L.id = Im.idLocation`;
            db.all(query, [], (err, rows) => {
                if(err) reject(err);
                else resolve(rows);
            });
        });
    },

    addCustomLoc: (lat, lng, nome, idUtente, dataOggi) => {
        return new Promise((resolve,reject) => {
            const query = `INSERT INTO Location (nome, indirizzo, citta, descrizione, capienza, coordX, coordY, costo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(query,[nome, `${idUtente} ${dataOggi}`, 0, 0, 0, lng, lat, 0], function (err) {
                if(err) reject(err);
                else resolve({
                    id: this.lastID
                });
            });
        });
    },

    remLoc: (idLocation) => {
        const events = new Promise((resolve, reject) =>{
            const query = `
            SELECT COUNT(*) AS totale
            FROM Evento
            WHERE ? = idLocation 
            AND DATE(data) >= DATE('now','localtime')`;
            db.get(query,[idLocation], (err,rows)=>{
                if(err) reject(err);
                else resolve(rows);
            });
        });
        if(events.totale > 0){
            throw new Error("futureEventsForLocation");
        }
        return new Promise((resolve, reject) => {
            const query = `
            DELETE FROM Location WHERE id = ?`;
            db.run(query,[idLocation], function (err) {
                if(err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes});
            });
        });
    },
    getFreeDates: (idLocation) => {
       return new Promise((resolve,reject) => {
            const query = `SELECT *
            FROM dateLocation
            WHERE ? = idLocation`;
            db.all(query,[idLocation],(err,rows)=>{
                if(err) reject(err);
                else resolve(rows);
            });
        }); 
    },
    getCapacity: (people) => {
        return new Promise((resolve,reject) => {
            const query = `SELECT Location.*, immaginiLocation.url
            FROM immaginiLocation RIGHT JOIN Location
            ON immaginiLocaiton.idLocation = Location.id
            WHERE ? <= capienza`;
            db.all(query,[people],(err,rows)=>{
                if(err) reject(err);
                else resolve(rows);
            });
        });
    },
    getCapacityAndDate: (day, people) => {
        return new Promise((resolve,reject) => {
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
            db.all(query,[people,day,day,day],(err,rows)=>{
                if(err) reject(err);
                else resolve(rows);
            });
        });
    }
}
module.exports = LocationModel;