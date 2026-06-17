const db = require('../db/db');

const LocationModel = {
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
    }
}
module.exports = LocationModel;