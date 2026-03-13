const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const generateTokens = async (userId, email, role) => {
    const accessToken = jwt.sign(
        { user_id: userId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshTokenString = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(refreshTokenString).digest('hex');

    // 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.query(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, tokenHash, expiresAt]
    );

    return { accessToken, refreshTokenString };
};

const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // or 'none' if cross origin
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
};

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role',
            [name, email, password_hash, role || 'student']
        );

        const user = newUser.rows[0];
        const { accessToken, refreshTokenString } = await generateTokens(user.user_id, user.email, user.role);

        setRefreshCookie(res, refreshTokenString);
        res.json({ token: accessToken, user });
    } catch (err) {
        console.error('VERCEL SIGNUP ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message, stack: err.stack });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) return res.status(400).json({ error: 'Invalid Credentials' });

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid Credentials' });

        const { accessToken, refreshTokenString } = await generateTokens(user.user_id, user.email, user.role);

        setRefreshCookie(res, refreshTokenString);
        res.json({ token: accessToken, user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error('VERCEL LOGIN ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message, stack: err.stack });
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const tokenString = req.cookies.refreshToken;
        if (!tokenString) return res.status(401).json({ error: 'No refresh token' });

        const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex');

        const tokenRes = await db.query(
            'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()',
            [tokenHash]
        );

        if (tokenRes.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        const userId = tokenRes.rows[0].user_id;
        const userRes = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);

        if (userRes.rows.length === 0) return res.status(401).json({ error: 'User not found' });

        const user = userRes.rows[0];

        // Revoke old token
        await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [tokenRes.rows[0].id]);

        // Issue new tokens (rotation)
        const { accessToken, refreshTokenString } = await generateTokens(user.user_id, user.email, user.role);
        setRefreshCookie(res, refreshTokenString);

        res.json({ token: accessToken });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/logout', async (req, res) => {
    try {
        const tokenString = req.cookies.refreshToken;
        if (tokenString) {
            const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex');
            await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
        }
        res.clearCookie('refreshToken');
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userResult = await db.query('SELECT user_id, name, email, role, profile_image_url FROM users WHERE user_id = $1', [req.user.user_id]);
        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
