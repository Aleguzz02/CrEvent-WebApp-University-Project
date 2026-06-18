const sql = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sql.Database("./db/database.sqlite", (err) => {
    if(err) console.error(err.message);
    else console.log("Connected to SQLite DB of CrEvent");
}); //connessione con il db usando una funzione di callback per gestire eventuali errori

db.run("PRAGMA foreign_keys = ON");
//abilitazione delle chiavi esterne

//serializzazione delle operazioni per farle eseguire in ordine e mantenere l'integrità della base di dati
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
        costo INTEGER NOT NULL,
        UNIQUE(nome, indirizzo) 
        )
        `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cognome TEXT NOT NULL,
        linkSito TEXT,
        tipo TEXT NOT NULL CHECK(tipo IN ('catering', 'intrattenimento', 'fotografo', 'altro')),
        costo INTEGER NOT NULL,
        descrizione TEXT NOT NULL,
        genereMusicale TEXT, -- Specifiche dei Staff specifici
        genereFotografico TEXT,
        mansione TEXT, -- Per tutti gli Staff che non ricadono nelle 3 categorie principali
        UNIQUE(nome, cognome)
        )
        `);

     db.run(`
        CREATE TABLE IF NOT EXISTS User (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL, 
        nome TEXT NOT NULL,
        cognome TEXT NOT NULL,
        telefono TEXT NOT NULL,
        dataNascita TEXT NOT NULL,
        tipoUtente INTEGER NOT NULL CHECK(tipoUtente IN (0,1,2)) DEFAULT 0, -- 0 per utenti normali, 1 per amministratori, 2 per staff o location
        idStaff INTEGER,
        idLocation INTEGER,
        FOREIGN KEY (idStaff) REFERENCES Staff(id) ON DELETE SET NULL, -- chiave esterna per gli account dei Staff collegati ai loro eventi
        FOREIGN KEY (idLocation) REFERENCES Location(id) ON DELETE SET NULL -- chiave esterna per gli account delle location collegati ai loro eventi
        ) -- le chiavi sono necessariamente nulle per gli utenti normali, e nulle alternandosi per Staff o location
        `);

    db.run(`
        CREATE TABLE IF NOT EXISTS immaginiLocation(
        url TEXT PRIMARY KEY,
        idLocation INTEGER,
        FOREIGN KEY (idLocation) REFERENCES Location(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS dateStaff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idStaff INTEGER,
        dataInizio TEXT NOT NULL,
        dataFine TEXT NOT NULL,
        FOREIGN KEY (idStaff) REFERENCES Staff(id) ON DELETE CASCADE
        )
    `);
        db.run(`
        CREATE TABLE IF NOT EXISTS dateLocation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idLocation INTEGER,
        dataInizio TEXT NOT NULL,
        dataFine TEXT NOT NULL,
        FOREIGN KEY (idLocation) REFERENCES Location(id) ON DELETE CASCADE
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS immaginiStaff(
        url TEXT PRIMARY KEY,
        idStaff INTEGER,
        FOREIGN KEY (idStaff) REFERENCES Staff(id) ON DELETE CASCADE
        )
    `); 

        /*Per semplicità e necessità di implementazione le date vengono considerate completamente contigue
        tra gli intervalli inseriti inizialmente, permettendo anche di velocizzare le ricerche, gli inserimenti ed evitare migliaia
        di tuple per tutte le date per tutte le risorse presenti
        Inoltre per immagini e disponibilità si utilizzano tabelle differenti per velocizzare le ricerche e ridurre la duplicazione dei dati*/

    
        db.run(`
            CREATE TABLE IF NOT EXISTS Lavora(
            idStaff INTEGER,
            idLocation INTEGER,
            PRIMARY KEY (idStaff, idLocation),
            FOREIGN KEY (idStaff) REFERENCES Staff(id) ON DELETE CASCADE,
            FOREIGN KEY (idLocation) REFERENCES Location(id) ON DELETE CASCADE
        )
        `);
        //Se non compare qui un Staff, si assume che abbia una disponibilità indipendnente, e che possa lavorare in qualsiasi location, altrimenti si assume che possa lavorare solo nelle location specificate.
        //*****VALUTARE SE INSERIRE RAPPORTI DI LAVORO DETERMINATI*****//

        db.run(`
            CREATE TABLE IF NOT EXISTS Evento(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            nome TEXT NOT NULL,
            svolto INTEGER DEFAULT 0 CHECK(svolto IN (0,1)),
            invitati INTEGER NOT NULL,
            emailUtente TEXT NOT NULL,
            idLocation INTEGER NOT NULL,
            FOREIGN KEY (emailUtente) REFERENCES User(email) ON DELETE CASCADE,
            FOREIGN KEY (idLocation) REFERENCES Location(id) ON DELETE CASCADE
        )
            `);
        db.run(`
            CREATE TABLE IF NOT EXISTS Coinvolge(
                idEvento INTEGER,
                idStaff INTEGER,
                PRIMARY KEY (idEvento, idStaff),
                FOREIGN KEY (idEvento)  REFERENCES Evento(id) ON DELETE CASCADE,
                FOREIGN KEY (idStaff) REFERENCES Staff(id) ON DELETE CASCADE
        )
            `);
    });

async function putData() {
    try{
        const saltRounds = 10;
        const pw1 = await bcrypt.hash('password1', saltRounds);
        const pw2 = await bcrypt.hash('password2', saltRounds);
        const pw3 = await bcrypt.hash('password3', saltRounds);
        db.serialize(() => {
        
            db.run(`
                INSERT OR IGNORE INTO Location (id, nome, indirizzo, citta, descrizione, capienza, linkSito, costo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [1, 'Villa Zuccarello', 'Via Villagrazia 103', 'Palermo', 'Una splendida villa con ampio giardino e piscina, con spazi interni molto moderni, ideale per qualsiasi tipo di evento da trascorrere in pace e eleganza', 200, 'https://www.villazuccarello.net', 2500],
                (err) => {
                    if (err) console.error(err);
                }    
                );

            db.run(`
                INSERT OR IGNORE INTO immaginiLocation (url, idLocation)
                VALUES (?, ?)`,
                ['/resource/locImg/villaZuccarello.jpg',1],
                (err) => {
                    if (err) console.error(err);
                }  
            );

            db.run(`
                INSERT OR IGNORE INTO Location (id, nome, indirizzo, citta, descrizione, capienza, linkSito, costo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [2, 'Villa Infinito', 'Viale Regione Siciliana 6985', 'Palermo', 'Una villa molto moderna con ampio spazio interno, situata in una zona meno centrale di Palermo ma perfetta per eventi eleganti e sofisticati.', 150, 'https://www.villainfinito.it', 2000],
                (err) => {
                    if (err) console.error(err);
                }    
            );

            db.run(`
                INSERT OR IGNORE INTO immaginiLocation (url, idLocation)
                VALUES (?, ?)`,
                ['/resource/locImg/villaInfinito.jpg',2],
                (err) => {
                    if (err) console.error(err);
                }  
            );

            db.run(`
                INSERT OR IGNORE INTO Location (id, nome, indirizzo, citta, descrizione, capienza, linkSito, costo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [3, 'Baglio Culluzia', 'Via Funnuta 9', 'Palermo', 'Baglio Culluzia: un\'oasi di pace che rispecchia la tradizione siciliana, con spazi ampi all\'esterno e sul prato, che permettono di vivere un evento unico tra storia, tradizione e natura', 300, 'https://www.baglioculluzia.it', 3500],
                (err) => {
                    if (err) console.error(err);
                }    
            );

            db.run(`
                INSERT OR IGNORE INTO immaginiLocation (url, idLocation)
                VALUES (?, ?)`,
                ['/resource/locImg/baglioCulluzia.jpg',3],
                (err) => {
                    if (err) console.error(err);
                }  
            );

            db.run(`
                INSERT OR IGNORE INTO Staff (id, nome, cognome, linkSito, tipo, costo, descrizione)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [1, 'Galati', 'Catering', 'https://www.galaticatering.it', 'catering', 80, 'Storico catering di Palermo specializzato in ricevimenti di altissima qualità, per matrimoni ed eventi istituzionali tra i più importanti ricadono sempre tra la prima scelta.'],
                (err) => {
                    if (err) console.error(err);
                }    
            );

            db.run(`
                INSERT OR IGNORE INTO immaginiStaff (url, idStaff)
                VALUES (?, ?)`,
                ['/resource/staffImg/galati.jpg',1],
                (err) => {
                    if (err) console.error(err);
                }  
            );

            db.run(`
                INSERT OR IGNORE INTO Staff (id, nome, cognome, linkSito, tipo, costo, descrizione)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [2, 'Natale', 'Chef Catering', 'https://www.natalegiunta.it', 'catering', 95, 'Chef Natale Giunta offre un servizio di catering gourmet focalizzato sulla rivisitazione moderna dei piatti tradizionali siciliani.'],
                (err) => {
                    if (err) console.error(err);
                }    
            );

            db.run(`
                INSERT OR IGNORE INTO immaginiStaff (url, idStaff)
                VALUES (?, ?)`,
                ['/resource/staffImg/nataleGiunta.png',2],
                (err) => {
                    if (err) console.error(err);
                }  
            );

            db.run(`
                INSERT OR IGNORE INTO Staff (id, nome, cognome, linkSito, tipo, costo, descrizione, genereMusicale)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [3, 'Riccardo', 'Ferrarese', 'https://www.riccardoferrarese.it', 'intrattenimento', 500, 'DJ e produver attivo nella movida palermitana e con grande esperienza sui matrimoni, eventi aziendali e dj-set personalizzati.', 'Commerciale, House, Revival 70/80/90'],
                (err) => {
                    if (err) console.error(err);
                }    
            );

            db.run(`
                INSERT OR IGNORE INTO immaginiStaff (url, idStaff)
                VALUES (?, ?)`,
                ['/resource/staffImg/riccardoFerrarese.png',3],
                (err) => {
                    if (err) console.error(err);
                }  
            );

            db.run(`
                INSERT OR IGNORE INTO Staff (id, nome, cognome, linkSito, tipo, costo, descrizione, genereMusicale)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [4, 'Nello', 'Anfuso', 'https://www.nelloanfusodj.com', 'intrattenimento', 450, 'DJ professionista specializzato in intrattenimento musicale per ricevimenti privati, rinomato per l\'eleganza del sound selection mista a delle tracce che sono la miccia pura per il divertimento.', 'Deep House, Chillout, Lounge, Pop Italiano'],
                (err) => {
                    if (err) console.error(err);
                }    
            );

            db.run(`
                INSERT OR IGNORE INTO immaginiStaff (url, idStaff)
                VALUES (?, ?)`,
                ['/resource/staffImg/nelloAnfuso.jpg',4],
                (err) => {
                    if (err) console.error(err);
                }  
            );

            db.run(`
                INSERT OR IGNORE INTO Staff (id, nome, cognome, linkSito, tipo, costo, descrizione, genereFotografico)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [5, 'Tiberio', 'Cantafia', 'https://www.tiberiocantafia.it', 'fotografo', 1200, 'Fotografo professionista di Palermo specializzato nel genere reportage per matrimoni ed eventi privati.', 'Reportage, Wedding Storytelling, Candid Photography'],
                (err) => {
                    if (err) console.error(err);
                }    
            );

            db.run(`
                INSERT OR IGNORE INTO immaginiStaff (url, idStaff)
                VALUES (?, ?)`,
                ['/resource/staffImg/tiberioCantafia.jpg',5],
                (err) => {
                    if (err) console.error(err);
                }  
            );

            db.run(`
                INSERT OR IGNORE INTO Staff (id, nome, cognome, linkSito, tipo, costo, descrizione, genereFotografico)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [6, 'Ines', 'Mendola', 'https://www.inesmendola.com', 'fotografo', 1000, 'Studio fotografico focalizzato sulla cattura spontanea delle emozioni durante eventi privati in tutta la Sicilia.', 'Fine Art, Ritrattistica, Reportage Moderno'],
                (err) => {
                    if (err) console.error(err);
                }    
            );



            db.run(`
                INSERT OR IGNORE INTO Staff (id, nome, cognome, linkSito, tipo, costo, descrizione, mansione)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [7, 'Emanuele', 'D\'Angeli', 'https://www.emanueledangeli.com', 'altro', 600, 'Illusionista e prestigiatore palermitano, offre spettacoli di mentalismo e magia close-up itinerante tra i tavoli degli ospiti.', 'Illusionismo e Close-up Magic'],
                (err) => {
                    if (err) console.error(err);
                }    
            );

            db.run(`
                INSERT OR IGNORE INTO immaginiStaff (url, idStaff)
                VALUES (?, ?)`,
                ['/resource/staffImg/emanueleDangeli.jpeg',7],
                (err) => {
                    if (err) console.error(err);
                }  
            );

            db.run(`
                INSERT OR IGNORE INTO Staff (id, nome, cognome, linkSito, tipo, costo, descrizione, mansione)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [8, 'Sogni', 'di Grande', 'https://www.sognidigrande.it', 'altro', 850, 'Compagnia di spettacolo specializzata in attrazioni fuori dall\'ordinario: performance con il fuoco, farfalle luminose sui trampolini ed effetti speciali per il taglio torta.', 'Spettacoli di Fuoco e Trampolieri Luminosi'],
                (err) => {
                    if (err) console.error(err);
                }    
            );

            db.run(`
                INSERT OR IGNORE INTO immaginiStaff (url, idStaff)
                VALUES (?, ?)`,
                ['/resource/staffImg/sogniDiGrande.jpeg',8],
                (err) => {
                    if (err) console.error(err);
                }  
            );

            db.run(`
                INSERT OR IGNORE INTO User (email, password, nome, cognome, telefono, dataNascita, tipoUtente) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                ['prova1@example.com', pw1, 'Mario', 'Rossi', '1234567890', '1990-01-01', '0'],
                (err) => {
                    if (err) console.error(err);
                }
            );
            db.run(`
                INSERT OR IGNORE INTO User (email, password, nome, cognome, telefono, dataNascita, tipoUtente) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                ['admin1@crevent.com', pw2, 'Luca', 'Bianchi', '0987654321', '1985-05-15', '1'],
                (err) => {
                    if (err) console.error(err);
                }
            );
            db.run(`
                INSERT OR IGNORE INTO User (email, password, nome, cognome, telefono, dataNascita, tipoUtente, idStaff) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                ['inesmendola@crevent.com', pw3, 'Ines', 'Mendola', '1111111111', '1992-12-25', '2', 6],
                (err) => {
                    if (err) console.error(err);
                }
            );
            db.run(`
                INSERT OR IGNORE INTO Evento (id, data, nome, svolto, invitati, emailUtente, idLocation) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [1, '2025-09-15', 'Matrimonio Rossi-Verdi', 0, 150, 'prova1@example.com', 1],
                (err) => {
                    if (err) console.error(err);
                }
            );
            db.run(`
                INSERT OR IGNORE INTO Lavora (idStaff, idLocation) VALUES (?, ?)`,
                [1, 1], 
                (err) => { if (err) console.error(err); }
            );

            db.run(`
                INSERT OR IGNORE INTO Lavora (idStaff, idLocation) VALUES (?, ?)`,
                [5, 1], 
                (err) => { if (err) console.error(err); }
            );

            db.run(`
                INSERT OR IGNORE INTO Lavora (idStaff, idLocation) VALUES (?, ?)`,
                [3, 1], 
                (err) => { if (err) console.error(err); }
            );

            db.run(`
                INSERT OR IGNORE INTO Coinvolge (idEvento, idStaff) VALUES (?, ?)`,
                [1, 1], 
                (err) => { if (err) console.error(err); }
            );

            db.run(`
                INSERT OR IGNORE INTO Coinvolge (idEvento, idStaff) VALUES (?, ?)`,
                [1, 5], 
                (err) => { if (err) console.error(err); }
            );
        })
    } catch (err) {
        console.error(err);
    }
}

putData();

module.exports = db;

