// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

/* =========================
   MIDDLEWARE (REQUIRED)
========================= */
app.use(cors()); // allow frontend / Postman
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse form data

/* =========================
   BASE ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("MarketWeave backend is running");
});

/* =========================
   API ROUTES
========================= */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/checkout", require("./routes/checkout"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/reviews", require("./routes/reviews"));

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(err.status || 500).json({
    error: err.message || "Server error",
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
