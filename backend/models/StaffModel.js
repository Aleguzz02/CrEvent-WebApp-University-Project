const db = require('../db/db');

const StaffModel = {
    getAll: (callback) => {
        const query = `
        SELECT S.*, Im.url 
        FROM Staff S 
        LEFT JOIN immaginiStaff Im ON S.id = Im.idStaff`;
        db.all(query, [], (err, rows) => {
            callback(err, rows);
        });
    }
}
module.exports = StaffModel;