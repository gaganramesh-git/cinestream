const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDb } = require('./src/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const movieRoutes = require('./src/routes/movies');
const reviewRoutes = require('./src/routes/reviews');
const authRoutes = require('./src/routes/auth');

app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Movie Streaming and Management System APIs are running!' });
});

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
