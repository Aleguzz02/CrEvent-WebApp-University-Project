const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const db = require('./db/db.js');

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
    res.send('Server attivo');
});

app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});

app.post('/api/signup', async (req, res) => {
    const { nome, cognome, dataNascita, email, telefono, password } = req.body;
    const bcrypt = require('bcrypt');
    const saltRounds = 10;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sql = `INSERT INTO User (email, password, nome, cognome, telefono, dataNascita, tipoUtente) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [email, hashedPassword, nome, cognome, telefono, dataNascita, 0], (err) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Database insertion failed' });
            }
            res.status(201).json({ message: 'User registered successfully!' });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});