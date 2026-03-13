require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const lessonsRoutes = require('./routes/lessons');
const enrollmentRoutes = require('./routes/enrollment');
const progressRoutes = require('./routes/progress');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', coursesRoutes);
app.use('/api', lessonsRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', progressRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
