const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const db = require('./db/db.js');
const authRoutes = require('./routes/authRoutes');

app.use(express.json());
app.use(cors());
app.use('/api', authRoutes);

app.get('/', (req, res) => {
    res.send('Server attivo');
});

app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});