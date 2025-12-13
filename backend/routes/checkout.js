const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Get cart items
    const [cartItems] = await conn.query(
      `SELECT c.product_id, c.quantity, p.price
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.user_id]
    );

    if (cartItems.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 2. Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 3. Create order (✅ uses `total`)
    const [orderResult] = await conn.query(
      "INSERT INTO orders (user_id, total) VALUES (?, ?)",
      [req.user.user_id, total]
    );

    const orderId = orderResult.insertId;

    // 4. Insert order items + update stock
    for (const item of cartItems) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );

      await conn.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    // 5. Clear cart
    await conn.query(
      "DELETE FROM cart WHERE user_id = ?",
      [req.user.user_id]
    );

    await conn.commit();
    res.json({ success: true, order_id: orderId });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  } finally {
    conn.release();
  }
});

module.exports = router;
