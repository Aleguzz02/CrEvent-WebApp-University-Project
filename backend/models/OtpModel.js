const { run, get } = require('../db/dbAsync');

const OTP_EXPIRY_MINUTES = 15; // scadenza in minuti

const OtpModel = {
  // Crea o aggiorna OTP per un email
  upsert: async (email, otp) => {
    const now = new Date().toISOString();
    const query = `
      INSERT INTO Otp (email, otp, dataOra)
      VALUES (?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        otp = excluded.otp,
        dataOra = excluded.dataOra
    `;
    return run(query, [email, otp, now]);
  },

  // Trova OTP per email
  findByEmail: (email) => {
    return get('SELECT * FROM Otp WHERE email = ?', [email]);
  },

  // Verifica OTP e scadenza
  validate: async (email, otp) => {
    const record = await OtpModel.findByEmail(email);
    if (!record) return false;

    // Controlla OTP
    if (record.otp !== otp) return false;

    // Controlla scadenza (15 minuti)
    const now = new Date();
    const otpTime = new Date(record.dataOra);
    const diffMinutes = (now - otpTime) / (1000 * 60);

    return diffMinutes <= OTP_EXPIRY_MINUTES;
  },

  // Elimina OTP per email
  delete: (email) => {
    return run('DELETE FROM Otp WHERE email = ?', [email]);
  },

  // (Opzionale) Pulizia OTP scaduti (da chiamare periodicamente)
  cleanExpired: () => {
    const expiryDate = new Date(Date.now() - OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
    return run('DELETE FROM Otp WHERE dataOra < ?', [expiryDate]);
  }
};

module.exports = OtpModel;