require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Hardcoded Vercel Fallbacks
process.env.DB_URL = process.env.DB_URL || Buffer.from('cG9zdGdyZXM6Ly9hdm5hZG1pbjpBVk5TX1dHUjVPR2haN3BVMG1LdVZkTEpAcGctZjI2NjFjNS1haWZ1bGxsZWFybmluZy5mLmFpdmVuY2xvdWQuY29tOjIyMjQwL2RlZmF1bHRkYj9zc2xtb2RlPXJlcXVpcmU=', 'base64').toString('utf8');
process.env.JWT_SECRET3 = process.env.JWT_SECRET3 || Buffer.from('c3VwZXJzZWNyZXRqd3RrZXlfMTIz', 'base64').toString('utf8');
process.env.YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || Buffer.from('QUl6YVN5QWUxMkxhUUxvWlFVdzJXaDJYbThVbngtcEptVGxHQ0k=', 'base64').toString('utf8');
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://learning-web-lac.vercel.app';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Import Routes
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const lessonsRoutes = require('./routes/lessons');
const enrollmentRoutes = require('./routes/enrollment');
const progressRoutes = require('./routes/progress');

// Mount Routes
app.get('/api/debug-env', (req, res) => {
    res.json({
        keys: Object.keys(process.env),
        hasDbUrl: !!process.env.DB_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasJwtSecret3: !!process.env.JWT_SECRET3,
        nodeEnv: process.env.NODE_ENV
    });
});

app.use('/api/auth', authRoutes);
app.use('/api', coursesRoutes);
app.use('/api', lessonsRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', progressRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
