const express = require('express');
const db = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/progress/complete', authMiddleware, async (req, res) => {
    try {
        const { course_id, lesson_id } = req.body;
        const student_id = req.user.user_id;

        await db.query(`
      INSERT INTO progress (student_id, course_id, lesson_id, status, completed_at)
      VALUES ($1, $2, $3, 'completed', CURRENT_TIMESTAMP)
      ON CONFLICT (student_id, lesson_id) 
      DO UPDATE SET status = 'completed', completed_at = CURRENT_TIMESTAMP
    `, [student_id, course_id, lesson_id]);

        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/progress/:courseId', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const progressRes = await db.query(
            "SELECT lesson_id FROM progress WHERE student_id = $1 AND course_id = $2 AND status = 'completed'",
            [studentId, courseId]
        );

        res.json(progressRes.rows.map(row => row.lesson_id));
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/progress/:courseId/percentage', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const result = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE p.status = 'completed') AS completed_count,
        COUNT(l.lesson_id) AS total_lessons,
        CASE WHEN COUNT(l.lesson_id) > 0 THEN
          ROUND(COUNT(*) FILTER (WHERE p.status = 'completed') * 100.0 / COUNT(l.lesson_id), 0)
        ELSE 0 END AS percentage
      FROM lessons l
      JOIN sections s ON l.section_id = s.section_id
      LEFT JOIN progress p ON l.lesson_id = p.lesson_id AND p.student_id = $1
      WHERE s.course_id = $2
    `, [studentId, courseId]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/progress/:courseId/last-lesson', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const result = await db.query(`
      SELECT lesson_id FROM progress
      WHERE student_id = $1 AND course_id = $2
      ORDER BY completed_at DESC
      LIMIT 1
    `, [studentId, courseId]);

        const last_lesson_id = result.rows.length > 0 ? result.rows[0].lesson_id : null;
        res.json({ last_lesson_id });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
