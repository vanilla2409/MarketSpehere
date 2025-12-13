// routes/auth.js

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

/* =========================
   REGISTER
========================= */
router.post(
  '/register',
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  body('name').notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, phone, is_seller } = req.body;

      const [existing] = await pool.query(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );

      if (existing.length) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const hash = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        `INSERT INTO users
         (email, password_hash, name, phone, is_seller, is_buyer)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [email, hash, name, phone || null, is_seller ? 1 : 0]
      );

      const user_id = result.insertId;

      // ✅ is_seller included
      const token = jwt.sign(
        { user_id, email, is_seller: !!is_seller },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXP }
      );

      res.json({
        token,
        user: { user_id, email, name, phone, is_seller: !!is_seller }
      });
    } catch (err) {
      next(err);
    }
  }
);

/* =========================
   LOGIN
========================= */
router.post(
  '/login',
  body('email').isEmail(),
  body('password').exists(),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const [rows] = await pool.query(
        'SELECT user_id, password_hash, name, is_seller FROM users WHERE email = ?',
        [email]
      );

      if (!rows.length) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // ✅ is_seller included
      const token = jwt.sign(
        { user_id: user.user_id, email, is_seller: !!user.is_seller },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXP }
      );

      res.json({
        token,
        user: {
          user_id: user.user_id,
          email,
          name: user.name,
          is_seller: !!user.is_seller
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

/* =========================
   ME
========================= */
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
