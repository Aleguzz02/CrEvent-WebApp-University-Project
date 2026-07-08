const { run, get, all } = require('../db/dbAsync');

const StaffModel = {
    getAll: () => {
        const query = `
            SELECT S.*, Im.url 
            FROM Staff S 
            LEFT JOIN immaginiStaff Im ON S.id = Im.idStaff`;
            return all(query);
    },
    addStaff: async (
        nome,
        cognome,
        linkSito,
        tipo,
        costo,
        descrizione,
        genereMusicale,
        genereFotografico,
        mansione,
        dataInizio,
        dataFine,
        urlImg,
        account = null
    ) => {
        try {
            await run(`BEGIN TRANSACTION`);

            const result = await run(
                `INSERT INTO Staff
                (nome, cognome, linkSito, tipo, costo, descrizione, genereMusicale, genereFotografico, mansione)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [nome, cognome, linkSito, tipo, costo, descrizione, genereMusicale, genereFotografico, mansione]
            );

            const idStaff = result.id;

            await run(
                `INSERT INTO immaginiStaff (url, idStaff) VALUES (?, ?)`,
                [urlImg, idStaff]
            );

            await run(
                `INSERT INTO dateStaff (idStaff, dataInizio, dataFine) VALUES (?, ?, ?)`,
                [idStaff, dataInizio, dataFine]
            );

            if (account) {
                await run(
                    `INSERT INTO User
                    (email, password, nome, cognome, telefono, dataNascita, tipoUtente, idStaff)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        account.email,
                        account.password,
                        account.nome,
                        account.cognome,
                        account.telefono,
                        account.dataNascita,
                        2,
                        idStaff
                    ]
                );
            }

            await run(`COMMIT`);

            return { id: idStaff };
        } catch (err) {
            await run(`ROLLBACK`).catch(() => {});
            throw err;
        }
    },
    remStaff: async (idStaff) => {
        const events = await get(`
            SELECT COUNT(*) AS totale
            FROM Coinvolge
            JOIN Evento ON Evento.id = Coinvolge.idEvento
            WHERE Coinvolge.idStaff = ?
            AND DATE(Evento.data) >= DATE('now','localtime')`,
            [idStaff]);

        if (events.totale > 0) {
            throw new Error("futureEventsForStaff");
        }

        return run(
            `DELETE FROM Staff WHERE id = ?`,
            [idStaff]
        );
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
    },
    getAvailableForCustomLocation: (day) => {
        const query = `
            SELECT Staff.*, immaginiStaff.url
            FROM Staff
            LEFT JOIN immaginiStaff ON immaginiStaff.idStaff = Staff.id
            WHERE NOT EXISTS (
            SELECT 1
            FROM Lavora
            WHERE Lavora.idStaff = Staff.id
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
        return all(query, [day, day]);
    }
}
module.exports = StaffModel;
