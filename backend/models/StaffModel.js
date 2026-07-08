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
    },

    getAvailableByLocationAndDate: (idLocation, day) => {
        const query = `
            SELECT Staff.*, immaginiStaff.url
            FROM Staff
            LEFT JOIN immaginiStaff ON immaginiStaff.idStaff = Staff.id
            WHERE (
            NOT EXISTS (
                SELECT 1
                FROM Lavora
                WHERE Lavora.idStaff = Staff.id
            )
            OR EXISTS (
                SELECT 1
                FROM Lavora
                WHERE Lavora.idStaff = Staff.id
                AND Lavora.idLocation = ?
            )
            )
            AND EXISTS (
            SELECT 1
            FROM dateStaff
            WHERE dateStaff.idStaff = Staff.id
            AND DATE(?) BETWEEN DATE(dateStaff.dataInizio) AND DATE(dateStaff.dataFine)
            )
            AND Staff.id NOT IN (
            SELECT Coinvolge.idStaff
            FROM Coinvolge
            JOIN Evento ON Evento.id = Coinvolge.idEvento
            WHERE DATE(Evento.data) = DATE(?)
            )
        `;
        return all(query, [idLocation, day, day]);
        }
}
module.exports = StaffModel;