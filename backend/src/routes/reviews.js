const express = require('express');
const router = express.Router();
const db = require('../db');
const oracledb = require('oracledb');

// Get all reviews for a movie
router.get('/movie/:movieId', async (req, res) => {
    try {
        const { movieId } = req.params;
        const result = await db.executeQuery(`
            SELECT r.review_id, r.rating, r.review_text, r.review_date, u.username 
            FROM REVIEW r 
            JOIN USERS u ON r.user_id = u.user_id 
            WHERE r.movie_id = :movieId
            ORDER BY r.review_date DESC
        `, [movieId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a review
router.post('/', async (req, res) => {
    try {
        const { userId, movieId, rating, text } = req.body;
        const sql = `
            INSERT INTO REVIEW (user_id, movie_id, rating, review_text) 
            VALUES (:userId, :movieId, :rating, :text)
        `;
        const result = await db.executeQuery(sql, { userId, movieId, rating, text }, { autoCommit: true });
        res.status(201).json({ message: 'Review successfully created', rowsAffected: result.rowsAffected });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
