import jwt from 'jsonwebtoken';

// This middleware checks if the user sends a valid token
// It replaces the hardcoded "getUserId" function
const verifyToken = (req, res, next) => {
  // 1. Get token from header (Format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  try {
    // 2. Verify the token using your secret key (Must match your friend's login code)
    // Make sure process.env.JWT_SECRET is in your .env file
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret_key');
    
    // 3. Add the user payload to the request object
    // Assuming your friend stored { id: 1, ... } in the token
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

export default verifyToken;