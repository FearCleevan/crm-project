import pool from '../config/db.js';

// Helper function to get real client IP
const getClientIP = (req) => {
  // Check forwarded headers first (behind proxy)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',');
    return ips[0].trim();
  }
  
  // Check other common headers
  const realIP = req.headers['x-real-ip'];
  if (realIP) return realIP;
  
  // Fall back to connection remote address
  return req.connection.remoteAddress || req.socket.remoteAddress || req.ip || '127.0.0.1';
};

export const ipControlMiddleware = async (req, res, next) => {
  try {
    const clientIP = getClientIP(req);
    console.log('🔍 IP Check - Client IP:', clientIP, 'Path:', req.path);

    // Always allow login and health endpoints
    if (req.path === '/api/auth/login' || req.path === '/api/health' || req.path === '/api/requests/submit') {
      console.log('✅ Allowing access to public endpoint:', req.path);
      return next();
    }

    // Get IP control settings
    const [settingsRows] = await pool.query(
      "SELECT setting_name, setting_value FROM system_settings WHERE setting_name LIKE 'ip_%'"
    );
    
    const settings = {};
    settingsRows.forEach(row => {
      settings[row.setting_name] = row.setting_value;
    });

    const ipControlMode = settings.ip_control_mode || 'open';
    console.log('🔧 IP Control Mode:', ipControlMode);

    // Check if IP is blacklisted (regardless of mode)
    const [blacklistRows] = await pool.query(
      "SELECT * FROM ip_blacklist WHERE ip_address = ? AND is_active = 1",
      [clientIP]
    );

    if (blacklistRows.length > 0) {
      console.log('🚫 IP blocked - blacklisted:', clientIP);
      return res.status(403).json({
        success: false,
        error: 'Access denied from this IP address'
      });
    }

    console.log('✅ IP not blacklisted');

    // If whitelist mode is active, check if IP is whitelisted
    if (ipControlMode === 'whitelist') {
      console.log('🔒 Whitelist mode active, checking IP...');
      
      const [whitelistRows] = await pool.query(
        "SELECT * FROM ip_whitelist WHERE ip_address = ? AND is_active = 1",
        [clientIP]
      );

      if (whitelistRows.length === 0) {
        console.log('🚫 IP blocked - not in whitelist:', clientIP);
        return res.status(403).json({
          success: false,
          error: 'IP address not authorized. Please contact administrator.'
        });
      }
      
      console.log('✅ IP whitelisted:', clientIP);
    } else {
      console.log('🔓 Open mode - allowing access');
    }

    next();
  } catch (error) {
    console.error('❌ IP control middleware error:', error);
    // In case of error, allow access to prevent locking everyone out
    console.log('⚠️ Allowing access due to error');
    next();
  }
};