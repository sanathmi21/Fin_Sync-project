import bcrypt from "bcryptjs";
import {pool} from "../db.js";
import jwt from "jsonwebtoken";

//SIGN UP
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email exists
    const existCheck = await pool.query(
      `SELECT * FROM "Users" WHERE "Email" = $1`,
      [email]
    );

    if (existCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO "Users" ("UserName", "Email", "Password")
       VALUES ($1, $2, $3)
       RETURNING *`,
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: "Account created successfully !",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//SIGN IN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email & password required" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM "Users" WHERE "Email" = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }


    // Generate JWT
    const token = jwt.sign(
      { userId: user.UserID, username: user.UserName, userType: user.Type },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful !", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};