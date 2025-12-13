const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

// -------------------------
// GET all active products (PUBLIC)
// -------------------------
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE is_active = 1"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------
// POST create product (SELLER ONLY)
// -------------------------
router.post("/", auth, roleCheck("seller"), async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `
      INSERT INTO products (name, description, price, stock, is_active)
      VALUES (?, ?, ?, ?, 1)
    `;

    const [result] = await pool.query(sql, [
      name,
      description || null,
      price,
      stock
    ]);

    res.status(201).json({
      success: true,
      product_id: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------
// PUT update product (SELLER ONLY)
// -------------------------
router.put("/:id", auth, roleCheck("seller"), async (req, res) => {
  try {
    const product_id = req.params.id;
    const { name, description, price, stock } = req.body;

    const [check] = await pool.query(
      "SELECT id FROM products WHERE id = ? AND is_active = 1",
      [product_id]
    );

    if (!check.length) {
      return res.status(404).json({ error: "Product not found" });
    }

    await pool.query(
      `
      UPDATE products
      SET name=?, description=?, price=?, stock=?
      WHERE id=?
      `,
      [name, description, price, stock, product_id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------
// DELETE product (SOFT DELETE)
// -------------------------
router.delete("/:id", auth, roleCheck("seller"), async (req, res) => {
  try {
    const product_id = req.params.id;

    const [check] = await pool.query(
      "SELECT id FROM products WHERE id = ? AND is_active = 1",
      [product_id]
    );

    if (!check.length) {
      return res.status(404).json({ error: "Product not found" });
    }

    await pool.query(
      "UPDATE products SET is_active = 0 WHERE id = ?",
      [product_id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
