const express = require('express');
const router = express.Router();
const { executeQuery } = require('../db');

// Signup Route
router.post('/signup', async (req, res) => {
    const { username, email } = req.body;
    try {
        const query = `INSERT INTO USERS (username, email) VALUES (:username, :email) RETURNING user_id INTO :userId`;
        const result = await executeQuery(query, {
            username,
            email,
            userId: { type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT }
        }, { autoCommit: true });
        
        const newUserId = result.outBinds.userId[0];
        
        // Track the login immediately upon signup success
        await executeQuery(`INSERT INTO USER_LOGINS (user_id) VALUES (:id)`, [newUserId], { autoCommit: true });
        
        res.status(201).json({ user_id: newUserId, username, email });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, email } = req.body;
    try {
        const query = `SELECT user_id, username, email, active_status FROM USERS WHERE username = :username AND email = :email`;
        const result = await executeQuery(query, [username, email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials or user does not exist' });
        }
        
        const user = result.rows[0];
        
        // Tracking: Whenever a user logs in successfully, add a record to the USER_LOGINS table
        await executeQuery(`INSERT INTO USER_LOGINS (user_id) VALUES (:id)`, [user.USER_ID], { autoCommit: true });
        
        res.json({
            user_id: user.USER_ID,
            username: user.USERNAME,
            email: user.EMAIL,
            active_status: user.ACTIVE_STATUS
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Optional: Retrieve a user's login history
router.get('/:userId/history', async (req, res) => {
    try {
        const query = `SELECT login_time FROM USER_LOGINS WHERE user_id = :id ORDER BY login_time DESC`;
        const result = await executeQuery(query, [req.params.userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;