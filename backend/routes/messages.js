const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  const { receiver_id, message } = req.body;

  await pool.query(
    "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
    [req.user.user_id, receiver_id, message]
  );

  res.json({ success: true });
});

router.get("/:userId", auth, async (req, res) => {
  const [msgs] = await pool.query(
    `SELECT * FROM messages 
     WHERE sender_id=? OR receiver_id=?`,
    [req.params.userId, req.params.userId]
  );

  res.json(msgs);
});

module.exports = router;
