// middleware/verifyBusinessUser.js

const verifyBusinessUser = (req, res, next) => {
  try {
    // req.user is set by verifyToken middleware
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
    }

    // Only allow business users
    if (req.user.type !== "business") {
      return res.status(403).json({ message: "Access denied. Only business users allowed." });
    }

    next(); // User is business → continue

  } catch (err) {
    console.error("Business user check failed:", err);
    res.status(500).json({ message: "Server error validating business user" });
  }
};

export default verifyBusinessUser;

