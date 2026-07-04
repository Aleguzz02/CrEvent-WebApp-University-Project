const { run, get, all } = require('../db/dbAsync');

const StaffModel = {
    getAll: () => {
        const query = `
            SELECT S.*, Im.url 
            FROM Staff S 
            LEFT JOIN immaginiStaff Im ON S.id = Im.idStaff`;
            return all(query);
    },
    addStaff: () => {

    },
    remStaff: () => {

    },
    getFreeDates: (idStaff, idLocation) => {

    }
}
module.exports = StaffModel;