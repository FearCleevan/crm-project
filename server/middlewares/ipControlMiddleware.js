import pool from "../config/db.js";

export const ipControlMiddleware = async (req, res, next) => {
  try {
    // Get client IP address
    const clientIp = req.ip || req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    // Clean up IP address (remove IPv6 prefix if present)
    const cleanIp = clientIp.replace(/^::ffff:/, '');
    
    // Get IP control mode from settings
    const [settingsRows] = await pool.query(
      "SELECT setting_value FROM system_settings WHERE setting_name = 'ip_control_mode'"
    );
    
    const ipControlMode = settingsRows.length > 0 ? settingsRows[0].setting_value : 'open';
    
    // If mode is open, allow all except blacklisted IPs
    if (ipControlMode === 'open') {
      // Check if IP is blacklisted
      const [blacklistRows] = await pool.query(
        "SELECT id FROM ip_blacklist WHERE ip_address = ? AND is_active = 1",
        [cleanIp]
      );
      
      if (blacklistRows.length > 0) {
        return res.status(403).json({
          success: false,
          error: "Access denied. Your IP has been blacklisted."
        });
      }
      
      return next();
    }
    
    // If mode is whitelist, check if IP is whitelisted
    if (ipControlMode === 'whitelist') {
      // Check if IP is whitelisted
      const [whitelistRows] = await pool.query(
        "SELECT id FROM ip_whitelist WHERE ip_address = ? AND is_active = 1",
        [cleanIp]
      );
      
      if (whitelistRows.length > 0) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        error: "Access denied. Your IP is not whitelisted."
      });
    }
    
    // Default deny if mode is unknown
    return res.status(403).json({
      success: false,
      error: "Access denied. Invalid IP control configuration."
    });
    
  } catch (error) {
    console.error("IP control middleware error:", error);
    // In case of error, deny access for security
    return res.status(403).json({
      success: false,
      error: "Access denied. Security system error."
    });
  }
};