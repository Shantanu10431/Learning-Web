require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// predefined playlists for course injection
const playlists = [
    { id: 'PLZPZq0r_RZOMhMvvhyL8c1gM-b-02v-H-', price: 49.99, category: 'Web Development', title: 'React JS Full Course' },
    { id: 'PLoYCgNOvdVACAOGSquJ8B_LDE340a6XlO', price: 99.99, category: 'Blockchain', title: 'Web3 and Solidity' },
    { id: 'PLu0W_9lII9agwh1XjRt242xIpHhPT2llg', price: 29.99, category: 'Programming', title: 'Python for Beginners' },
];

async function seedYouTubeCourses() {
    if (!YOUTUBE_API_KEY) {
        console.error('YOUTUBE_API_KEY missing from .env');
        process.exit(1);
    }

    try {
        console.log('Fetching super admin / first user...');
        let adminRes = await pool.query('SELECT user_id FROM users WHERE role = $1 LIMIT 1', ['instructor']);

        // Create instructor if none
        if (adminRes.rows.length === 0) {
            adminRes = await pool.query(`
            INSERT INTO users (name, email, password_hash, role) 
            VALUES ('Platform AI', 'ai@antigravity.io', 'hashed', 'instructor') 
            RETURNING user_id
        `);
        }
        const instructorId = adminRes.rows[0].user_id;

        for (const playlist of playlists) {
            console.log(`\nFetching playlist: ${playlist.id}`);

            const pRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlist.id}&key=${YOUTUBE_API_KEY}`);
            if (!pRes.data.items || pRes.data.items.length === 0) continue;

            const snippet = pRes.data.items[0].snippet;
            const title = snippet.title;
            const desc = snippet.description || 'A comprehensive YouTube course.';
            const thumb = snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url;

            const courseRes = await pool.query(`
        INSERT INTO courses (title, description, thumbnail_url, category, price, instructor_id, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING course_id
      `, [title, desc, thumb, playlist.category, playlist.price, instructorId, true]);

            const courseId = courseRes.rows[0].course_id;

            const sectionRes = await pool.query(`
        INSERT INTO sections (course_id, title, order_number)
        VALUES ($1, 'Main Modules', 1) RETURNING section_id
      `, [courseId]);

            const sectionId = sectionRes.rows[0].section_id;

            // Get videos
            let pageToken = '';
            let videoCount = 0;
            do {
                const vRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlist.id}&key=${YOUTUBE_API_KEY}${pageToken ? '&pageToken=' + pageToken : ''}`);

                for (const item of vRes.data.items) {
                    const vTitle = item.snippet.title;
                    const vId = item.snippet.resourceId.videoId;

                    if (vTitle.includes('Private') || vTitle.includes('Deleted')) continue;

                    videoCount++;
                    await pool.query(`
             INSERT INTO lessons (section_id, title, youtube_url, order_number, description)
             VALUES ($1, $2, $3, $4, $5)
          `, [sectionId, vTitle, `https://www.youtube.com/watch?v=${vId}`, videoCount, 'Enjoy the lesson!']);
                }
                pageToken = vRes.data.nextPageToken;
            } while (pageToken);

            console.log(`-> Inserted course "${title}" with ${videoCount} videos.`);
        }
        console.log('\n✅ Database seeding complete!');
    } catch (e) {
        console.error('Migration failed:', e.response?.data || e.message);
    } finally {
        await pool.end();
    }
}

seedYouTubeCourses();
