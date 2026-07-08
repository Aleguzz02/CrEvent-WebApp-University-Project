const User = require("../models/userModel");
const Event = require("../models/EventModel");

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

    const result = await User.deleteUser(email);

    res.status(200).json({
      success: true,
      message: "Utente eliminato con successo",
      changes: result.changes
    });
  } catch (err) {
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
