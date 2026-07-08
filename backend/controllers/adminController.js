const User = require("../models/userModel");
const Event = require("../models/EventModel");
const Location = require("../models/LocationModel");
const Staff = require("../models/StaffModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const SMTP = require("../config/mailer");
const { get, run, all } = require('../db/dbAsync');

const isValidDate = (value) => {
  if (!value || typeof value !== "string") return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const normalizeOptionalText = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isValidEmail = (value) => {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const generateTemporaryPassword = () => {
  return crypto.randomBytes(9).toString("base64url");
};

const isPastDate = (value) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(value);
  date.setHours(0, 0, 0, 0);

  return date < today;
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAllSafe();

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error("Errore in getUsers admin:", err);
    res.status(500).json({
      success: false,
      message: "Errore nel recupero degli utenti"
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const email = req.params.email;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utente non trovato"
      });
    }

    if (user.tipoUtente === 1) {
      return res.status(403).json({
        success: false,
        message: "Non puoi eliminare un amministratore"
      });
    }

    const result = user.tipoUtente === 2 && user.idStaff
      ? await Staff.remStaff(user.idStaff)
      : await User.deleteUser(email);

    res.status(200).json({
      success: true,
      message: user.tipoUtente === 2 && user.idStaff
        ? "Utente staff e staff collegato eliminati con successo"
        : "Utente eliminato con successo",
      changes: result.changes,
      deletedUsers: result.deletedUsers
    });
  } catch (err) {
    if (err.message === "futureEventsForStaff") {
      return res.status(409).json({
        success: false,
        message: "Non puoi eliminare un utente staff collegato a uno staff coinvolto in eventi futuri"
      });
    }

    console.error("Errore in deleteUser admin:", err);
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione dell'utente"
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.getAllEvents();

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (err) {
    console.error("Errore in getEvents admin:", err);
    res.status(500).json({
      success: false,
      message: "Errore nel recupero degli eventi"
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID evento non valido"
      });
    }

    const result = await Event.deleteEvent(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Evento non trovato"
      });
    }

    res.status(200).json({
      success: true,
      message: "Evento eliminato con successo",
      changes: result.changes
    });
  } catch (err) {
    console.error("Errore in deleteEvent admin:", err);
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione dell'evento"
    });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const {
      nome,
      indirizzo,
      citta,
      descrizione,
      capienza,
      costo,
      dataInizio,
      dataFine,
      urlImg,
      linkSito,
      lat,
      lng
    } = req.body;

    const parsedCapienza = toPositiveNumber(capienza);
    const parsedCosto = toPositiveNumber(costo);
    const parsedLat = lat === undefined || lat === null || lat === "" ? null : Number(lat);
    const parsedLng = lng === undefined || lng === null || lng === "" ? null : Number(lng);

    if (!nome || !indirizzo || !citta || !descrizione || !urlImg || !parsedCapienza || !parsedCosto || !isValidDate(dataInizio) || !isValidDate(dataFine)) {
      return res.status(400).json({
        success: false,
        message: "Sono richiesti nome, indirizzo, citta, descrizione, capienza, costo, immagine e date valide"
      });
    }

    if (new Date(dataInizio) > new Date(dataFine)) {
      return res.status(400).json({
        success: false,
        message: "La data di inizio deve essere precedente o uguale alla data di fine"
      });
    }

    if (isPastDate(dataInizio)) {
      return res.status(400).json({
        success: false,
        message: "La data di inizio non può essere nel passato"
      });
    }

    if ((parsedLat !== null && !Number.isFinite(parsedLat)) || (parsedLng !== null && !Number.isFinite(parsedLng))) {
      return res.status(400).json({
        success: false,
        message: "Coordinate non valide"
      });
    }

    const result = await Location.addLoc(
      nome.trim(),
      indirizzo.trim(),
      citta.trim(),
      descrizione.trim(),
      parsedCapienza,
      parsedCosto,
      dataInizio,
      dataFine,
      urlImg.trim(),
      normalizeOptionalText(linkSito),
      parsedLat,
      parsedLng
    );

    res.status(201).json({
      success: true,
      message: "Location creata con successo",
      data: result
    });
  } catch (err) {
    console.error("Errore in createLocation admin:", err);
    res.status(500).json({
      success: false,
      message: "Errore durante la creazione della location"
    });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID location non valido"
      });
    }

    const result = await Location.remLoc(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Location non trovata"
      });
    }

    res.status(200).json({
      success: true,
      message: "Location eliminata con successo",
      changes: result.changes
    });
  } catch (err) {
    if (err.message === "futureEventsForLocation") {
      return res.status(409).json({
        success: false,
        message: "Non puoi eliminare una location con eventi futuri"
      });
    }

    console.error("Errore in deleteLocation admin:", err);
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione della location"
    });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const {
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
      accountEmail
    } = req.body;

    const parsedCosto = toPositiveNumber(costo);
    const tipiValidi = ["catering", "intrattenimento", "fotografo", "altro"];

    if (!nome || !cognome || !tipo || !descrizione || !urlImg || !parsedCosto || !isValidDate(dataInizio) || !isValidDate(dataFine)) {
      return res.status(400).json({
        success: false,
        message: "Sono richiesti nome, cognome, tipo, descrizione, costo, immagine e date valide"
      });
    }

    if (!tipiValidi.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo staff non valido"
      });
    }

    if (new Date(dataInizio) > new Date(dataFine)) {
      return res.status(400).json({
        success: false,
        message: "La data di inizio deve essere precedente o uguale alla data di fine"
      });
    }

    if (isPastDate(dataInizio)) {
      return res.status(400).json({
        success: false,
        message: "La data di inizio non può essere nel passato"
      });
    }

    if (!isValidEmail(accountEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email account staff non valida"
      });
    }

    console.log('dataInizio ricevuta:', dataInizio);
    console.log('isPastDate(dataInizio):', isPastDate(dataInizio));

    const existingUser = await User.findByEmail(accountEmail.trim());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Esiste già un utente con questa email"
      });
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const result = await Staff.addStaff(
      nome.trim(),
      cognome.trim(),
      normalizeOptionalText(linkSito),
      tipo,
      parsedCosto,
      descrizione.trim(),
      normalizeOptionalText(genereMusicale),
      normalizeOptionalText(genereFotografico),
      normalizeOptionalText(mansione),
      dataInizio,
      dataFine,
      urlImg.trim(),
      {
        email: accountEmail.trim(),
        password: hashedPassword,
        nome: nome.trim(),
        cognome: cognome.trim(),
        telefono: "0000000000",
        dataNascita: "2000-01-01"
      }
    );

    try {
      await SMTP.sendEmail({
        to: accountEmail.trim(),
        subject: "Account staff CrEvent",
        text: `Ciao ${nome.trim()} ${cognome.trim()}, il tuo account staff CrEvent e' stato creato.\n\nEmail: ${accountEmail.trim()}\nPassword temporanea: ${temporaryPassword}\n\nAccedi e modifica la password dal tuo profilo.`,
        html: `<h1>Account staff CrEvent</h1>
          <p>Ciao ${nome.trim()} ${cognome.trim()}, il tuo account staff CrEvent e' stato creato.</p>
          <p><strong>Email:</strong> ${accountEmail.trim()}</p>
          <p><strong>Password temporanea:</strong> ${temporaryPassword}</p>
          <p>Accedi e modifica la password dal tuo profilo.</p>`
      });
    } catch (emailErr) {
      if (emailErr.code === "emailError") {
        return res.status(201).json({
          success: true,
          message: "Staff creato con successo. Email con password temporanea non inviata",
          emailError: true,
          data: result
        });
      }
      throw emailErr;
    }

    res.status(201).json({
      success: true,
      message: "Staff creato con successo",
      data: result
    });
  } catch (err) {
    console.error("Errore in createStaff admin:", err);
    res.status(500).json({
      success: false,
      message: "Errore durante la creazione dello staff"
    });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID staff non valido"
      });
    }

    const result = await Staff.remStaff(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff non trovato"
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff eliminato con successo",
      changes: result.changes
    });
  } catch (err) {
    if (err.message === "futureEventsForStaff") {
      return res.status(409).json({
        success: false,
        message: "Non puoi eliminare uno staff coinvolto in eventi futuri"
      });
    }

    console.error("Errore in deleteStaff admin:", err);
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione dello staff"
    });
  }
};

exports.getUserEventsCount = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email richiesta"
      });
    }

    // Conta gli eventi futuri (data >= oggi) associati a questo utente
    const result = await get(
      `SELECT COUNT(*) AS count
       FROM Evento
       WHERE emailUtente = ?
         AND DATE(data) >= DATE('now', 'localtime')`,
      [email]
    );

    res.status(200).json({
      success: true,
      data: { count: result.count || 0 }
    });
  } catch (err) {
    console.error("Errore in getUserEventsCount:", err);
    res.status(500).json({
      success: false,
      message: "Errore nel conteggio degli eventi"
    });
  }
};
