// server/controllers/authController.js
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  console.log("Login request received"); // Debug log

  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    // Check user exists
    const [rows] = await pool.query(
      "SELECT * FROM `crm-users` WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      console.log("User not found:", username);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", username);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login successful for user:", user.user_id);

    // Successful response
    res.json({
      success: true,
      token,
      user: {
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login controller error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};

export const protectedRoute = async (req, res) => {
  try {
    // The user is already verified by authMiddleware
    res.json({ 
      success: true,
      user: req.user 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const logoutUser = (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({ success: true, message: 'Logged out successfully' });
};