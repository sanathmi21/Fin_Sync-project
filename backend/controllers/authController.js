import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db.js";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const JWT_EXPIRES_IN = "7d";





//SIGN UP
export const registerUser = async (req, res) => {
  const { username, email, password, type } = req.body;  //  ADDED type

  if (!username || !email || !password || !type) {       //  Validate type
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

    // ⭐ INSERT TYPE INTO DATABASE
    const result = await pool.query(

      `INSERT INTO "Users" ("UserName", "Email", "Password", "Type")
       VALUES ($1, $2, $3, $4)
       RETURNING "UserID", "UserName", "Email", "Type"`,
      [username, email, hashedPassword, type]

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
  const { email, password, loginType } = req.body;

  //  NEW VALIDATION
  if (!email || !password || !loginType) {
    return res
      .status(400)
      .json({ message: "Email, password & account type required" });
  }

  try {
    // CHECK EMAIL + TYPE MATCH
    const result = await pool.query(
      `SELECT * FROM "Users" WHERE "Email" = $1 AND "Type" = $2`,
      [email, loginType]
    );

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid account type or email" });
    }

    const user = result.rows[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }


    const token = jwt.sign(
      {
        id: user.UserID,
        type: user.Type.toLowerCase(),
        email: user.Email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        UserID: user.UserID,
        Username: user.UserName,
        Email: user.Email,
        Type: user.Type,
      },
    });


    

    

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};