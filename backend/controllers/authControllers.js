const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const SMTP = require("../config/mailer");
const OtpModel = require('../models/OtpModel');
const crypto = require('crypto');

const SECRET = "secretkey2026";

exports.register = async (req, res) => {
    try {
        const { email, password, confermaPassword, nome, cognome, telefono, dataNascita} = req.body;

        // Verifica aggiuntiva di controllo campi
        if (!email || !password || !confermaPassword || !nome || !cognome || !telefono || !dataNascita) {
            return res.status(400).json({ message : "Sono richiesti tutti i campi"});
        }
        
        console.log("Registering user: ", email);
        
        // Verifica che la mail inserita sia presente nel DB
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Utente già registrato" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create(email, hashedPassword, nome, cognome, telefono, dataNascita);

        await SMTP.sendEmail({
            to: email,
            subject: 'Benvenuto su CrEvent!',
            text: `Ciao ${nome} ${cognome}, grazie per esserti registrato!`,
            html: `<h1>Benvenuto!</h1><p>Grazie per esserti registrato su CrEvent.</p>
                    <p>Entra subito nel nostro sito per prenotare il tuo primo evento!!</p>`
        });

        res.status(201).json(newUser);
    } catch (err) {
        if(err.code === "emailError"){
            console.error(err.message)
            return res.status(201).json({
                success: true,
                message: "Registrazione avvenuta con successo. Email non inviata",
                emailError: true
            });
        }
        else{
            console.error("ERRORE DETTAGLIATO NEL CONTROLLER:", err);
            res.status(500).json({ error: err.message });
        }
        
    }
};

exports.login = async (req, res) => { 
    try {
        const {email, password} = req.body;

        // Verifica aggiuntiva di controllo campi
        if (!email || !password) {
            return res.status(400).json({ message : "Sono richiesti email e password"});
        }

        // Verifica che la mail inserita sia presente nel DB
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Credenziali non valide" });
        };

        // Verifica corrispondenza password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenziali non valide' });
        };

        const token = jwt.sign(
            { email: user.email },
            SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, userEmail: user.email, userNome: user.nome });

    } catch (err) {
        console.error("ERRORE DETTAGLIATO NEL CONTROLLER:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.me = async (req, res) => {
    try {
        const email = req.user.email;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utente non trovato"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                email: user.email,
                nome: user.nome,
                cognome: user.cognome,
                telefono: user.telefono,
                dataNascita: user.dataNascita,
                urlFotoProfilo: user.urlFotoProfilo || null,
                tipoUtente: user.tipoUtente,
                idStaff: user.idStaff,
                idLocation: user.idLocation
            }
        });
    } catch (err) {
        console.error("ERRORE DETTAGLIATO NEL CONTROLLER:", err);
        res.status(500).json({ success: false, message: "Errore nel recupero dell'utente" });
    }
};

// Helper per generare OTP di 6 cifre
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// 1. Richiedi OTP
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Verifica che l'email esista
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nessun utente trovato con questa email'
      });
    }

    // Genera OTP
    const otp = generateOtp();
    console.log(`OTP generato per ${email}: ${otp}`); // debug

    // Salva OTP nel database
    await OtpModel.upsert(email, otp);

    // Invia email
    await SMTP.sendEmail({
      to: email,
      subject: 'Recupero password - CrEvent',
      text: `Il tuo codice OTP per il recupero password è: ${otp}\n\nIl codice è valido per 15 minuti.`,
      html: `
        <h1>Recupero password</h1>
        <p>Il tuo codice OTP per il recupero password è:</p>
        <h2 style="font-size: 32px; letter-spacing: 4px; background: #f0f0f0; padding: 12px; text-align: center; border-radius: 8px;">
          ${otp}
        </h2>
        <p><strong>Il codice è valido per 15 minuti.</strong></p>
        <p>Se non hai richiesto tu il recupero password, ignora questa email.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'OTP inviato con successo'
    });

  } catch (err) {
    if (err.code === 'emailError') {
      console.error('Errore invio email OTP:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Errore nell\'invio dell\'email. Riprova più tardi.'
      });
    }

    console.error('Errore in requestOtp:', err);
    res.status(500).json({
      success: false,
      message: 'Errore durante la richiesta OTP'
    });
  }
};

// 2. Verifica OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email e OTP sono obbligatori'
      });
    }

    const isValid = await OtpModel.validate(email, otp);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'OTP non valido o scaduto'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verificato con successo'
    });

  } catch (err) {
    console.error('Errore in verifyOtp:', err);
    res.status(500).json({
      success: false,
      message: 'Errore durante la verifica OTP'
    });
  }
};

// 3. Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword, otp } = req.body;

    // Validazioni base
    if (!email || !newPassword || !confirmPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Tutti i campi sono obbligatori'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Le password non coincidono'
      });
    }

    // Verifica complessità password (minimo 8 caratteri, maiuscola, minuscola, numero)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero'
      });
    }

    // Verifica OTP (non deve essere scaduto)
    const isValidOtp = await OtpModel.validate(email, otp);
    if (!isValidOtp) {
      return res.status(401).json({
        success: false,
        message: 'OTP non valido o scaduto'
      });
    }

    // Hash della nuova password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Aggiorna password nel database
    await User.updatePassword(email, hashedPassword);

    // Elimina OTP (è stato usato)
    await OtpModel.delete(email);

    res.status(200).json({
      success: true,
      message: 'Password aggiornata con successo'
    });

  } catch (err) {
    console.error('Errore in resetPassword:', err);
    res.status(500).json({
      success: false,
      message: 'Errore durante il reset della password'
    });
  }
};
