const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const SMTP = require("../config/mailer");


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
                tipoUtente: user.tipoUtente
            }
        });
    } catch (err) {
        console.error("ERRORE DETTAGLIATO NEL CONTROLLER:", err);
        res.status(500).json({ success: false, message: "Errore nel recupero dell'utente" });
    }
};
