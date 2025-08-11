import pool from './db.js';


(async () => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS currentTime');
    console.log('✅ Database connected:', rows[0].currentTime);
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
})();

