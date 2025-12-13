const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const [orders] = await pool.query(
    "SELECT * FROM orders WHERE user_id=?",
    [req.user.user_id]
  );
  res.json(orders);
});

module.exports = router;
