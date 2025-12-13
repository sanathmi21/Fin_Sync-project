import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

// Define router
const router = express.Router();

// Auth routes
router.post("/signup", registerUser);
router.post("/signin", loginUser);

export default router;
