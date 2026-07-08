const User = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Utente non autenticato"
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utente non trovato"
      });
    }

    if (user.tipoUtente !== 1) {
      return res.status(403).json({
        success: false,
        message: "Accesso consentito solo agli amministratori"
      });
    }

    req.currentUser = user;
    next();
  } catch (err) {
    console.error("Errore in requireAdmin:", err);
    res.status(500).json({
      success: false,
      message: "Errore durante la verifica dei permessi"
    });
  }
};
