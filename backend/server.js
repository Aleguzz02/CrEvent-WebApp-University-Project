require('dotenv').config();
const express = require('express');
require('./db/db');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

const authRoutes = require('./routes/authRoutes');
const browseRoutes = require('./routes/browseRoutes');
const eventRoutes = require('./routes/eventRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use(cors({
  origin: "*", 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cors());
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', uploadRoutes);

app.use('/resource', express.static(path.join(__dirname, 'public/resource')));

app.use('/api/browse', browseRoutes);
app.use('/api/event', eventRoutes);

app.get('/', (req, res) => {
    res.send('Server attivo');
});

app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});
