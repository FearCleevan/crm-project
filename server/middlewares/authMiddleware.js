// server/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    console.log("Authorization header:", req.headers.authorization); // Debug log

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({
        success: false,
        error: "Authorization token required",
      });
    }

    console.log("Verifying token:", token); // Debug log
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId || !decoded.role) {
      console.log("Invalid token payload:", decoded);
      return res.status(401).json({
        success: false,
        error: "Invalid token structure",
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    console.log("Authenticated user:", req.user); // Debug log
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);

    let errorMessage = "Invalid token";
    if (err.name === "TokenExpiredError") {
      errorMessage = "Token expired";
    } else if (err.name === "JsonWebTokenError") {
      errorMessage = "Invalid token";
    }

    return res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
};
