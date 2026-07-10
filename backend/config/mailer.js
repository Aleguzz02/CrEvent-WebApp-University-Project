require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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
        console.error("emailError:", error);
        error.code = "emailError";
        throw error;
    }
};

module.exports = { sendEmail };