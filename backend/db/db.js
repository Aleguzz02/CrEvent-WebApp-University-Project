const sql = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sql.Database("./db/database.sqlite", (err) => {
    if(err) console.error(err.message);
    else console.log("Connected to SQLite DB of CrEvent");
});

db.run("PRAGMA foreign_keys = ON");

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS Location (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        indirizzo TEXT NOT NULL,
        citta TEXT NOT NULL,
        descrizione TEXT NOT NULL,
        capienza INTEGER NOT NULL,
        coordX REAL,
        coordY REAL,
        linkSito TEXT,
        costo INTEGER NOT NULL
        )
        `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Professionista (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cognome TEXT NOT NULL,
        linkSito TEXT,
        tipo TEXT NOT NULL CHECK(tipo IN ('catering', 'intrattenimento', 'fotografo', 'altro')),
        costo INTEGER NOT NULL,
        descrizione TEXT NOT NULL,
        genereMusicale TEXT, -- Specifiche dei professionisti specifici
        genereFotografico TEXT,
        mansione TEXT -- Per tutti i professionisti che non ricadono nelle 3 categorie principali
        )
        `);

     db.run(`
        CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL, 
        nome TEXT NOT NULL,
        cognome TEXT NOT NULL,
        telefono TEXT NOT NULL,
        dataNascita DATE NOT NULL,
        tipoUtente NOT NULL CHECK(tipoUtente IN (0,1,2)) DEFAULT 0
        idStaff INTEGER,
        idLocation INTEGER,
        FOREIGN KEY (idStaff) REFERENCES Professionista(id), ON DELETE SET NULL, -- chiave esterna per gli account dei professionisti collegati ai loro eventi
        FOREIGN KEY (idLocation) REFERENCES Location(id) ON DELETE SET NULL -- chiave esterna per gli account delle location collegati ai loro eventi
        ) -- le chiavi sono necessariamente nulle per gli utenti normali, e nulle alternandosi per professionisti o location
        `);

    db.run(`
        CREATE TABLE IF NOT EXISTS immaginiLocation(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idLocation INTEGER,
        url TEXT NOT NULL,
        FOREIGN KEY (idLocation) REFERENCES Location(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS dateProfessionisti (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idProfessionista INTEGER,
        dataInizio DATE NOT NULL,
        dataFine DATE NOT NULL,
        FOREIGN KEY (idProfessionista) REFERENCES Professionista(id) ON DELETE CASCADE
        )
    `);
        db.run(`
        CREATE TABLE IF NOT EXISTS dateLocation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idLocation INTEGER,
        dataInizio DATE NOT NULL,
        dataFine DATE NOT NULL,
        FOREIGN KEY (idLocation) REFERENCES Location(id) ON DELETE CASCADE
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS immaginiProfessionisti(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idProfessionista INTEGER,
        url TEXT NOT NULL,
        FOREIGN KEY (idProfessionista) REFERENCES Professionista(id) ON DELETE CASCADE
        )
    `); 

        /*Per semplicità e necessità di implementazione le date vengono considerate completamente contigue
        tra gli intervalli inseriti inizialmente, permettendo anche di velocizzare le ricerche, gli inserimenti ed evitare migliaia
        di tuple per tutte le date per tutte le risorse presenti
        Inoltre per immagini e disponibilità si utilizzano tabelle differenti per velocizzare le ricerche e ridurre la duplicazione dei dati*/

    
        db.run(`
            CREATE TABLE IF NOT EXISTS Lavora(
            idProfessionista INTEGER,
            idLocation INTEGER,
            PRIMARY KEY (idProfessionista, idLocation),
            FOREIGN KEY (idProfessionista) REFERENCES Professionista(id) ON DELETE CASCADE,
            FOREIGN KEY (idLocation) REFERENCES Location(id) ON DELETE CASCADE
        )
        `);
        //Se non compare qui un professionista, si assume che abbia una disponibilità indipendnente, e che possa lavorare in qualsiasi location, altrimenti si assume che possa lavorare solo nelle location specificate.
        //*****VALUTARE SE INSERIRE RAPPORTI DI LAVORO DETERMINATI*****//
    });

module.exports = db;
