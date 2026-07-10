const User = require('../models/userModel');

const staffProfileMiddleware = async (req, res, next) => {
  try {
    const email = req.user.email;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non registrato'
      });
    }

    if (user.tipoUtente !== 2 || (!user.idStaff && !user.idLocation)) {
      return res.status(403).json({
        success: false,
        message: 'Profilo staff/location non disponibile'
      });
    }

    req.staffUser = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = staffProfileMiddleware;
