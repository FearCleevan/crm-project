// server/controllers/authController.js
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: "Username and password are required",
            });
        }

        const [rows] = await pool.query(
            "SELECT * FROM `crm-users` WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

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
        });
    }
};

export const protectedRoute = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                user_id as id,
                first_name as firstName,
                last_name as lastName,
                email,
                role
             FROM \`crm-users\`
             WHERE user_id = ?`,
            [req.user.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: rows[0]
        });
    } catch (error) {
        console.error('Protected route error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
        });
    }
};

export const logoutUser = (req, res) => {
    res.json({ 
        success: true, 
        message: "Logged out successfully"
    });
};