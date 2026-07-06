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
        const query = `
        INSERT INTO Staff`;
    },
    remStaff: () => {

    },
    getFreeDates: (idStaff, idLocation) => {

    },
    getByEventId: (idEvento) => {
        return all(`
            SELECT Staff.*, immaginiStaff.url
            FROM Coinvolge
            JOIN Staff ON Staff.id = Coinvolge.idStaff
            LEFT JOIN immaginiStaff ON immaginiStaff.idStaff = Staff.id
            WHERE Coinvolge.idEvento = ?
        `, [idEvento]);
    }
}
module.exports = StaffModel;