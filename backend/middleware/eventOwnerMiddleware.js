const Event = require('../models/EventModel');

const eventOwnerMiddleware = async (req, res, next) => {
  try {
    const idEvento = Number(req.params.id);
    const email = req.user.email;

    if (!Number.isInteger(idEvento)) {
      return res.status(400).json({
        success: false,
        message: 'ID evento non valido'
      });
    }

    const event = await Event.getEventById(idEvento, email);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento non trovato'
      });
    }

    req.event = event;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = eventOwnerMiddleware;