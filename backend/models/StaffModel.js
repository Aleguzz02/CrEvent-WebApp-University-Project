const db = require('../db/db');

const StaffModel = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT S.*, Im.url 
            FROM Staff S 
            LEFT JOIN immaginiStaff Im ON S.id = Im.idStaff`;
            db.all(query, [], (err, rows) => {
                if(err) reject(err);
                else resolve(rows);
            });
        });
    },
    addStaff: () => {

    },
    remStaff: () => {

    },
    getFreeDates: (idStaff, idLocation) => {

    }
}
module.exports = StaffModel;