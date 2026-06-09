const express = require('express');
const app = express();
const PORT = 3000;
const db = require('./db/db.js');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server attivo');
});

app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});