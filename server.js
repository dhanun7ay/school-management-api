import express from 'express';
import dotenv from 'dotenv';

import pool from './db.js';                 
import schoolRoutes from './routes/schools.js'; 

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/', schoolRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('School Management API is running');
});

// Start server
(async () => {
  try {
    await pool.query('SELECT 1'); // test DB connection
    console.log('Connected to MySQL');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  }
})();

