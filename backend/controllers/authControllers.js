// Libreria per criptare le informazioni
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const SECRET = "secretkey2026";

exports.register = async (req, res) => {
    try {
        const { email, password, nome, cognome, telefono, dataNascita} = req.body;

        if (!email || !password) {
            return res.status(400).json({ message : "Sono richiesti email e password"});
        }

        console.log("Registering user: ", email);
        console.log("Password: ", password);

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Utente già registrato" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create(email, hashedPassword, nome, cognome, telefono, dataNascita);

        res.status(201).json(user);
    } catch (err) {
        console.error("ERRORE DETTAGLIATO NEL CONTROLLER:", err);
        res.status(500).json({ error: err.message });
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

        res.json({ token, userEmail: user.email });

    } catch (err) {
        console.error("ERRORE DETTAGLIATO NEL CONTROLLER:", err);
        res.status(500).json({ error: err.message });
    }
};