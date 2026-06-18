const express = require('express');
require('./db/db');
const cors = require('cors');
const path = require('path');

const browseRoutes = require('./routes/browseRoutes');

const app = express();
const PORT = 3000;
const authRoutes = require('./routes/authRoutes');

app.use(cors({
  origin: "*", 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cors());
app.use('/api', authRoutes);

//Rotte per immagini pubbliche
app.use('/resource', express.static(path.join(__dirname, 'public/resource')));
app.use('/api/browse', browseRoutes);

app.get('/', (req, res) => {
    res.send('Server attivo');
});

app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});