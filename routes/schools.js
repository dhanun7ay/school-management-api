import express from 'express';
const router = express.Router();

import Joi from 'joi';
import pool from '../db.js';


// Validation schema
const schoolSchema = Joi.object({
  name: Joi.string().min(3).required(),
  address: Joi.string().min(5).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required()
});

// Haversine formula for distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// POST /addSchool
router.post('/addSchool', async (req, res) => {
  try {
    const { error, value } = schoolSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, address, latitude, longitude } = value;
    const [result] = await pool.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );
    res.status(201).json({ id: result.insertId, message: 'School added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /listSchools
router.get('/listSchools', async (req, res) => {
  try {
    const lat = parseFloat(req.query.latitude);
    const lon = parseFloat(req.query.longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Latitude and longitude must be numbers' });
    }

    const [schools] = await pool.query('SELECT * FROM schools');

    const sorted = schools
      .map(s => ({
        ...s,
        distance: getDistance(lat, lon, s.latitude, s.longitude)
      }))
      .sort((a, b) => a.distance - b.distance);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

