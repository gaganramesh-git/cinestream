const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all movies
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                M.movie_id, M.title, M.duration_mins, M.release_year, M.description, M.poster_url, M.director, M.main_cast, M.production_id,
                COALESCE(R_AGG.average_rating, 0) AS average_rating,
                COALESCE(R_AGG.total_reviews, 0) AS total_reviews,
                (SELECT LISTAGG(G.name, ', ') WITHIN GROUP (ORDER BY G.name) 
                 FROM MOVIE_GENRE MG JOIN GENRE G ON MG.genre_id = G.genre_id WHERE MG.movie_id = M.movie_id) AS genres
            FROM MOVIE M
            LEFT JOIN (
                SELECT movie_id, AVG(rating) as average_rating, COUNT(review_id) as total_reviews
                FROM REVIEW
                GROUP BY movie_id
            ) R_AGG ON M.movie_id = R_AGG.movie_id
            ORDER BY average_rating DESC, M.release_year DESC
        `;
        const result = await db.executeQuery(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single movie with details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.executeQuery('SELECT * FROM MOVIE WHERE movie_id = :id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
