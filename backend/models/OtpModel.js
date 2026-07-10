const { run, get } = require('../db/dbAsync');

const OTP_EXPIRY_MINUTES = 15;

const OtpModel = {
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

  findByEmail: (email) => {
    return get('SELECT * FROM Otp WHERE email = ?', [email]);
  },

  validate: async (email, otp) => {
    const record = await OtpModel.findByEmail(email);
    if (!record) return false;

    if (record.otp !== otp) return false;

    const now = new Date();
    const otpTime = new Date(record.dataOra);
    const diffMinutes = (now - otpTime) / (1000 * 60);

    return diffMinutes <= OTP_EXPIRY_MINUTES;
  },

  delete: (email) => {
    return run('DELETE FROM Otp WHERE email = ?', [email]);
  },

  cleanExpired: () => {
    const expiryDate = new Date(Date.now() - OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
    return run('DELETE FROM Otp WHERE dataOra < ?', [expiryDate]);
  }
};

module.exports = OtpModel;