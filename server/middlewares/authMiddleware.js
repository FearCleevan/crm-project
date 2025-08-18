// server/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: "Authorization token required",
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId || !decoded.role) {
            return res.status(401).json({
                success: false,
                error: "Invalid token structure",
            });
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (err) {
        console.error("Authentication error:", err.message);
        
        let errorMessage = "Invalid token";
        if (err.name === "TokenExpiredError") {
            errorMessage = "Token expired";
        }

        return res.status(401).json({
            success: false,
            error: errorMessage,
        });
    }
};