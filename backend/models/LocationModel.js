const db = require('../db/db');

const LocationModel = {
    getAll: (callback) => {
        const query = `
        SELECT L.*, Im.url 
        FROM Location L 
        LEFT JOIN immaginiLocation Im ON L.id = Im.idLocation`;
        db.all(query, [], (err, rows) => {
            callback(err, rows);
        });
    },
}
module.exports = LocationModel;