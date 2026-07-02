require('dotenv').config();
const nodemailer = require('nodemailer');

console.log("DEBUG EMAIL USER:", process.env.EMAIL_USER);
console.log("DEBUG EMAIL PASS:", process.env.EMAIL_PASS);

// Configurazione del trasportatore
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false, // true per porta 465, false per altre (es. 587)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Funzione generica per inviare le email
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailOptions = {
            from: `"CrEvent" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`Email inviata: ${result.messageId}`);
        return result;
    } catch (error) {
        console.error("Errore nell'invio dell'email:", error);
        throw error; // Rilanciamo l'errore per gestirlo nel controller/rotta
    }
};

module.exports = { sendEmail };