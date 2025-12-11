import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth Header:', authHeader);
  console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
    console.log('Token verified for user:', verified.id);
    
    if (!verified.id) {
      console.log('Token missing id field');
      return res.status(400).json({ error: "Invalid token payload" });
    }

    req.user = verified;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: "Token expired. Please login again." });
    } else if (err.name === 'JsonWebTokenError') {
      res.status(400).json({ error: "Invalid token" });
    } else {
      res.status(400).json({ error: "Invalid Token" });
    }
  }
};

export default verifyToken;