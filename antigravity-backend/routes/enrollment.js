const express = require('express');
const db = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/enroll/:courseId', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const courseRes = await db.query('SELECT course_id FROM courses WHERE course_id = $1', [courseId]);
        if (courseRes.rows.length === 0) return res.status(404).json({ error: 'Course not found' });

        const enrollRes = await db.query('SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
        if (enrollRes.rows.length > 0) return res.status(400).json({ error: 'Already enrolled' });

        const newEnrollment = await db.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
            [studentId, courseId]
        );

        res.json(newEnrollment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/my-courses', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.user_id;

        const result = await db.query(`
      SELECT c.*, e.enrolled_at, u.name as instructor_name
      FROM courses c 
      JOIN enrollments e ON c.course_id = e.course_id 
      JOIN users u ON c.instructor_id = u.user_id
      WHERE e.student_id = $1
      ORDER BY e.enrolled_at DESC
    `, [studentId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/enrollments/:courseId', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const enrollRes = await db.query('SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);

        res.json({ isEnrolled: enrollRes.rows.length > 0 });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/enroll/:courseId', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const deleteRes = await db.query(
            'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2 RETURNING *',
            [studentId, courseId]
        );

        if (deleteRes.rows.length === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        res.json({ success: true, message: 'Unenrolled successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
