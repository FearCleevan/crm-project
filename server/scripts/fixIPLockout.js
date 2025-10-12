import pool from '../config/db.js';

async function fixIPLockout() {
  try {
    // Set mode to open
    await pool.query(
      "UPDATE system_settings SET setting_value = 'open' WHERE setting_name = 'ip_control_mode'"
    );
    
    // Add localhost IPs to whitelist
    const localIPs = ['127.0.0.1', '::1', 'localhost'];
    
    for (const ip of localIPs) {
      await pool.query(
        "INSERT INTO ip_whitelist (ip_address, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE is_active = 1",
        [ip, 'Localhost access']
      );
    }
    
    console.log('✅ IP lockout fixed! Mode set to "open" and localhost IPs whitelisted.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing IP lockout:', error);
    process.exit(1);
  }
}

fixIPLockout();