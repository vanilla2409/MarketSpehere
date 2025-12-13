const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

// Add to cart
router.post("/", auth, async (req, res) => {
  const { product_id, quantity } = req.body;

  await pool.query(
    "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
    [req.user.user_id, product_id, quantity || 1]
  );

  res.json({ success: true });
});

// Get cart
router.get("/", auth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.*, p.name, p.price
     FROM cart c
     JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?`,
    [req.user.user_id]
  );

  res.json(rows);
});

// ✅ DELETE item from cart
router.delete("/:product_id", auth, async (req, res) => {
  await pool.query(
    "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
    [req.user.user_id, req.params.product_id]
  );

  res.json({ success: true });
});

module.exports = router;
