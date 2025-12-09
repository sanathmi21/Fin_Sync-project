import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  try {



    const verified = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
    
    // Ensure req.user has an id field
    if (!verified.id) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    req.user = verified;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    res.status(400).json({ error: "Invalid Token" });
  }
};

export default verifyToken;