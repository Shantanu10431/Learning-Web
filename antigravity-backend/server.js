require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
