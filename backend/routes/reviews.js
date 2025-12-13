const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  const { product_id, rating, comment } = req.body;

  await pool.query(
    "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)",
    [req.user.user_id, product_id, rating, comment]
  );

  res.json({ success: true });
});

router.get("/:productId", async (req, res) => {
  const [reviews] = await pool.query(
    "SELECT * FROM reviews WHERE product_id=?",
    [req.params.productId]
  );

  res.json(reviews);
});

module.exports = router;
