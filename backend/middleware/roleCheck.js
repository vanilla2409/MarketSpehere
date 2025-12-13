// middleware/roleCheck.js

module.exports = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ seller role check
    if (requiredRole === "seller" && !req.user.is_seller) {
      return res.status(403).json({ error: "Seller access required" });
    }

    next();
  };
};
