import pool from "../config/db.js";

// Get dashboard statistics - FIXED VERSION
export const getDashboardStats = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    console.log('📊 Fetching dashboard statistics...');

    // Get total leads (active prospects)
    const [totalLeadsResult] = await pool.query(
      "SELECT COUNT(*) as total FROM prospects WHERE isactive = 1"
    );
    const totalLeads = totalLeadsResult[0]?.total || 0;
    console.log('👥 Total leads:', totalLeads);

    // Get total unique emails (excluding empty/invalid)
    const [totalEmailsResult] = await pool.query(
      `SELECT COUNT(DISTINCT Email) as total FROM prospects 
       WHERE isactive = 1 
       AND Email IS NOT NULL 
       AND Email != '' 
       AND Email LIKE '%@%.%'`
    );
    const totalEmails = totalEmailsResult[0]?.total || 0;
    console.log('📧 Total unique emails:', totalEmails);

    // FIXED: Get total phone numbers - count actual phone numbers, not prospects
    const [totalPhonesResult] = await pool.query(
      `SELECT 
        SUM(
          CASE 
            WHEN Companyphonenumber IS NOT NULL AND Companyphonenumber != '' AND Companyphonenumber != '0' THEN 1 
            ELSE 0 
          END +
          CASE 
            WHEN Altphonenumber IS NOT NULL AND Altphonenumber != '' AND Altphonenumber != '0' THEN 1 
            ELSE 0 
          END
        ) as total_phones
       FROM prospects 
       WHERE isactive = 1`
    );
    const totalPhones = totalPhonesResult[0]?.total_phones || 0;
    console.log('📞 Total phone numbers:', totalPhones);

    // Get total unique companies
    const [totalCompaniesResult] = await pool.query(
      `SELECT COUNT(DISTINCT Company) as total FROM prospects 
       WHERE isactive = 1 
       AND Company IS NOT NULL 
       AND Company != ''`
    );
    const totalCompanies = totalCompaniesResult[0]?.total || 0;
    console.log('🏢 Total unique companies:', totalCompanies);

    // FIXED: Get duplicate leads - count individual duplicate records, not just groups
    const [duplicateLeadsResult] = await pool.query(
      `SELECT COUNT(*) as total_duplicate_records FROM (
        SELECT id, Email, COUNT(*) OVER (PARTITION BY Email) as duplicate_count
        FROM prospects 
        WHERE isactive = 1 
        AND Email IS NOT NULL 
        AND Email != ''
        AND Email LIKE '%@%.%'
      ) as email_counts 
      WHERE duplicate_count > 1`
    );
    const duplicateLeads = duplicateLeadsResult[0]?.total_duplicate_records || 0;
    console.log('🔄 Total duplicate records:', duplicateLeads);

    // Get count of duplicate groups (for reference)
    const [duplicateGroupsResult] = await pool.query(
      `SELECT COUNT(*) as duplicate_groups FROM (
        SELECT Email, COUNT(*) as count 
        FROM prospects 
        WHERE isactive = 1 AND Email IS NOT NULL AND Email != '' AND Email LIKE '%@%.%'
        GROUP BY Email 
        HAVING count > 1
      ) as duplicate_emails`
    );
    const duplicateGroups = duplicateGroupsResult[0]?.duplicate_groups || 0;
    console.log('📦 Duplicate email groups:', duplicateGroups);

    // Get junk leads (prospects with invalid or empty critical data)
    const [junkLeadsResult] = await pool.query(
      `SELECT COUNT(*) as total FROM prospects 
       WHERE isactive = 1 
       AND (
         (Email IS NULL OR Email = '' OR Email NOT LIKE '%@%.%')
         OR (Fullname IS NULL OR Fullname = '')
         OR (Company IS NULL OR Company = '')
       )`
    );
    const junkLeads = junkLeadsResult[0]?.total || 0;
    console.log('🗑️ Junk leads:', junkLeads);

    // Calculate changes (placeholder - implement real change tracking later)
    const stats = {
      totalLeads,
      totalLeadsChange: 0,
      totalEmails,
      totalEmailsChange: 0,
      totalPhones,
      totalPhonesChange: 0,
      totalCompanies,
      totalCompaniesChange: 0,
      duplicateLeads, // This now shows individual duplicate records (e.g., 4 records across 2 duplicate groups)
      duplicateGroups, // Additional info: number of duplicate email groups
      duplicateLeadsChange: 0,
      junkLeads,
      junkLeadsChange: 0,
    };

    console.log('✅ Final dashboard stats:', stats);

    res.json({
      success: true,
      data: {
        stats,
        recentActivity: []
      }
    });

  } catch (error) {
    console.error("💥 Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Enhanced debugging function to analyze specific data issues
export const debugDashboardData = async (req, res) => {
  try {
    console.log('🐛 Debugging dashboard data...');

    // Debug phone numbers
    const [phoneDebug] = await pool.query(
      `SELECT 
        COUNT(*) as total_prospects,
        SUM(CASE WHEN Companyphonenumber IS NOT NULL AND Companyphonenumber != '' AND Companyphonenumber != '0' THEN 1 ELSE 0 END) as with_company_phone,
        SUM(CASE WHEN Altphonenumber IS NOT NULL AND Altphonenumber != '' AND Altphonenumber != '0' THEN 1 ELSE 0 END) as with_alt_phone,
        SUM(
          CASE 
            WHEN Companyphonenumber IS NOT NULL AND Companyphonenumber != '' AND Companyphonenumber != '0' THEN 1 
            ELSE 0 
          END +
          CASE 
            WHEN Altphonenumber IS NOT NULL AND Altphonenumber != '' AND Altphonenumber != '0' THEN 1 
            ELSE 0 
          END
        ) as total_phone_numbers
       FROM prospects 
       WHERE isactive = 1`
    );

    // Debug duplicates
    const [duplicateDebug] = await pool.query(
      `SELECT Email, COUNT(*) as count 
       FROM prospects 
       WHERE isactive = 1 AND Email IS NOT NULL AND Email != '' AND Email LIKE '%@%.%'
       GROUP BY Email 
       HAVING count > 1
       ORDER BY count DESC
       LIMIT 10`
    );

    // Sample phone data
    const [samplePhones] = await pool.query(
      `SELECT Companyphonenumber, Altphonenumber 
       FROM prospects 
       WHERE isactive = 1 
       AND (Companyphonenumber IS NOT NULL OR Altphonenumber IS NOT NULL)
       LIMIT 10`
    );

    res.json({
      success: true,
      debug: {
        phoneAnalysis: phoneDebug[0],
        topDuplicates: duplicateDebug,
        samplePhoneData: samplePhones,
        explanation: {
          totalPhoneNumbers: "Counts each phone number field separately (Company + Alt phones)",
          duplicateRecords: "Counts individual records that have duplicate emails",
          duplicateGroups: "Counts unique email addresses that have duplicates"
        }
      }
    });

  } catch (error) {
    console.error("Debug dashboard data error:", error);
    res.status(500).json({
      success: false,
      error: "Debug failed: " + error.message,
    });
  }
};

// Enhanced version with trend analysis
export const getDashboardStatsWithTrends = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Get current stats using the fixed logic
    const [totalLeadsResult] = await pool.query(
      "SELECT COUNT(*) as total FROM prospects WHERE isactive = 1"
    );

    const [totalEmailsResult] = await pool.query(
      `SELECT COUNT(DISTINCT Email) as total FROM prospects 
       WHERE isactive = 1 
       AND Email IS NOT NULL 
       AND Email != '' 
       AND Email LIKE '%@%.%'`
    );

    const [totalPhonesResult] = await pool.query(
      `SELECT 
        SUM(
          CASE 
            WHEN Companyphonenumber IS NOT NULL AND Companyphonenumber != '' AND Companyphonenumber != '0' THEN 1 
            ELSE 0 
          END +
          CASE 
            WHEN Altphonenumber IS NOT NULL AND Altphonenumber != '' AND Altphonenumber != '0' THEN 1 
            ELSE 0 
          END
        ) as total_phones
       FROM prospects 
       WHERE isactive = 1`
    );

    const [totalCompaniesResult] = await pool.query(
      "SELECT COUNT(DISTINCT Company) as total FROM prospects WHERE isactive = 1 AND Company IS NOT NULL AND Company != ''"
    );

    const [duplicateLeadsResult] = await pool.query(
      `SELECT COUNT(*) as total_duplicate_records FROM (
        SELECT id, Email, COUNT(*) OVER (PARTITION BY Email) as duplicate_count
        FROM prospects 
        WHERE isactive = 1 
        AND Email IS NOT NULL 
        AND Email != ''
        AND Email LIKE '%@%.%'
      ) as email_counts 
      WHERE duplicate_count > 1`
    );

    const [junkLeadsResult] = await pool.query(
      `SELECT COUNT(*) as total FROM prospects 
       WHERE isactive = 1 
       AND (
         (Email IS NULL OR Email = '' OR Email NOT LIKE '%@%.%')
         OR (Fullname IS NULL OR Fullname = '')
         OR (Company IS NULL OR Company = '')
       )`
    );

    // Get stats from 30 days ago for trend calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [previousLeadsResult] = await pool.query(
      "SELECT COUNT(*) as total FROM prospects WHERE isactive = 1 AND CreatedOn <= ?",
      [thirtyDaysAgo]
    );

    // Calculate percentage changes
    const currentLeads = totalLeadsResult[0]?.total || 0;
    const previousLeads = previousLeadsResult[0]?.total || 0;
    const leadsChange = previousLeads > 0 ? 
      Math.round(((currentLeads - previousLeads) / previousLeads) * 100) : 0;

    const stats = {
      totalLeads: currentLeads,
      totalLeadsChange: leadsChange,
      totalEmails: totalEmailsResult[0]?.total || 0,
      totalEmailsChange: 0, // Simplified - implement proper tracking
      totalPhones: totalPhonesResult[0]?.total_phones || 0,
      totalPhonesChange: 0, // Simplified
      totalCompanies: totalCompaniesResult[0]?.total || 0,
      totalCompaniesChange: 0, // Simplified
      duplicateLeads: duplicateLeadsResult[0]?.total_duplicate_records || 0,
      duplicateLeadsChange: 0, // Simplified
      junkLeads: junkLeadsResult[0]?.total || 0,
      junkLeadsChange: 0, // Simplified
    };

    console.log('📈 Dashboard stats with trends:', stats);

    res.json({
      success: true,
      data: {
        stats,
        recentActivity: []
      }
    });

  } catch (error) {
    console.error("Get dashboard stats with trends error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};