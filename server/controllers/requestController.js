// server/controllers/requestController.js
import pool from "../config/db.js";

export const createRequest = async (req, res) => {
    try {
        const { firstName, lastName, email, username, reason } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !username || !reason) {
            return res.status(400).json({
                success: false,
                error: "All fields are required",
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format",
            });
        }

        // Check if request type is valid
        if (!['forgot', 'account'].includes(reason)) {
            return res.status(400).json({
                success: false,
                error: "Invalid request type",
            });
        }

        const requestType = reason === 'forgot' ? 'password_reset' : 'account_creation';

        // For password reset requests, validate that user exists
        if (requestType === 'password_reset') {
            const [userRows] = await pool.query(
                "SELECT * FROM `crm-users` WHERE username = ? AND email = ?",
                [username, email]
            );

            if (userRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "No account found with this username and email combination",
                });
            }
        }

        // For account creation requests, check if username or email already exists
        if (requestType === 'account_creation') {
            const [usernameRows] = await pool.query(
                "SELECT user_id FROM `crm-users` WHERE username = ?",
                [username]
            );

            if (usernameRows.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: "Username already exists",
                });
            }

            const [emailRows] = await pool.query(
                "SELECT user_id FROM `crm-users` WHERE email = ?",
                [email]
            );

            if (emailRows.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: "Email already exists",
                });
            }
        }

        // Insert the request into database
        const [result] = await pool.query(
            `INSERT INTO user_requests 
             (first_name, last_name, email, username, request_type, message) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                firstName,
                lastName,
                email,
                username,
                requestType,
                requestType === 'password_reset' 
                    ? 'Password reset requested' 
                    : 'Account creation requested'
            ]
        );

        res.status(201).json({
            success: true,
            message: "Request submitted successfully",
            requestId: result.insertId
        });

    } catch (error) {
        console.error("Create request error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export const getRequests = async (req, res) => {
    try {
        const { status, type } = req.query;
        
        let query = `
            SELECT 
                request_id as id,
                first_name as firstName,
                last_name as lastName,
                email,
                username,
                request_type as type,
                status,
                message,
                submitted_at as submittedAt,
                completed_at as completedAt,
                admin_notes as adminNotes
            FROM user_requests
        `;
        
        const queryParams = [];
        
        // Add filters if provided
        if (status && status !== 'all') {
            query += queryParams.length === 0 ? ' WHERE' : ' AND';
            query += ' status = ?';
            queryParams.push(status);
        }
        
        if (type && type !== 'all') {
            query += queryParams.length === 0 ? ' WHERE' : ' AND';
            query += ' request_type = ?';
            queryParams.push(type);
        }
        
        query += ' ORDER BY submitted_at DESC';
        
        const [rows] = await pool.query(query, queryParams);
        
        res.json({
            success: true,
            requests: rows
        });
        
    } catch (error) {
        console.error("Get requests error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, newPassword } = req.body;
        
        // Validate request exists
        const [requestRows] = await pool.query(
            "SELECT * FROM user_requests WHERE request_id = ?",
            [id]
        );
        
        if (requestRows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Request not found",
            });
        }
        
        const request = requestRows[0];
        
        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];
        
        if (status) {
            updateFields.push("status = ?");
            updateValues.push(status);
            
            if (status === 'completed') {
                updateFields.push("completed_at = CURRENT_TIMESTAMP");
            }
        }
        
        if (adminNotes !== undefined) {
            updateFields.push("admin_notes = ?");
            updateValues.push(adminNotes);
        }
        
        updateValues.push(id);
        
        const [result] = await pool.query(
            `UPDATE user_requests 
             SET ${updateFields.join(', ')} 
             WHERE request_id = ?`,
            updateValues
        );
        
        // If completing a password reset, update the user's password
        if (status === 'completed' && request.request_type === 'password_reset' && newPassword) {
            const bcrypt = await import('bcryptjs');
            const saltRounds = 12;
            const hashedPassword = await bcrypt.default.hash(newPassword, saltRounds);
            
            await pool.query(
                "UPDATE `crm-users` SET password = ? WHERE username = ? AND email = ?",
                [hashedPassword, request.username, request.email]
            );
        }
        
        // If completing an account creation, create the user account
        if (status === 'completed' && request.request_type === 'account_creation') {
            // Generate a random password if not provided
            const password = newPassword || Math.random().toString(36).slice(-8);
            const bcrypt = await import('bcryptjs');
            const saltRounds = 12;
            const hashedPassword = await bcrypt.default.hash(password, saltRounds);
            
            // Create the user account
            await pool.query(
                `INSERT INTO \`crm-users\` 
                 (first_name, last_name, email, username, password, role) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    request.first_name,
                    request.last_name,
                    request.email,
                    request.username,
                    hashedPassword,
                    'Data Analyst' // Default role
                ]
            );
        }
        
        res.json({
            success: true,
            message: "Request updated successfully"
        });
        
    } catch (error) {
        console.error("Update request error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};