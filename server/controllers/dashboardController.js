import pool from "../config/db.js";

// Get dashboard statistics - FIXED VERSION
export const getDashboardStats = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    console.log('📊 Fetching dashboard statistics...');

    // Get total leads (active prospects) - CORRECT
    const [totalLeadsResult] = await pool.query(
      "SELECT COUNT(*) as total FROM prospects WHERE isactive = 1"
    );
    const totalLeads = totalLeadsResult[0]?.total || 0;
    console.log('👥 Total leads:', totalLeads);

    // FIXED: Get total unique emails (count distinct valid emails)
    const [totalEmailsResult] = await pool.query(
      `SELECT COUNT(DISTINCT Email) as total FROM prospects 
       WHERE isactive = 1 
       AND Email IS NOT NULL 
       AND Email != '' 
       AND Email LIKE '%@%.%'`
    );
    const totalEmails = totalEmailsResult[0]?.total || 0;
    console.log('📧 Total unique emails:', totalEmails);

    // FIXED: Get total phone numbers - count rows that have at least one valid phone number
    const [totalPhonesResult] = await pool.query(
      `SELECT COUNT(*) as total FROM prospects 
       WHERE isactive = 1 
       AND (
         (Companyphonenumber IS NOT NULL AND Companyphonenumber != '' AND Companyphonenumber != '0')
         OR 
         (Altphonenumber IS NOT NULL AND Altphonenumber != '' AND Altphonenumber != '0')
       )`
    );
    const totalPhones = totalPhonesResult[0]?.total || 0;
    console.log('📞 Total prospects with phone numbers:', totalPhones);

    // FIXED: Get count of actual phone number entries (both fields)
    const [phoneNumbersCountResult] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN Companyphonenumber IS NOT NULL AND Companyphonenumber != '' AND Companyphonenumber != '0' THEN 1 END) as company_phones,
        COUNT(CASE WHEN Altphonenumber IS NOT NULL AND Altphonenumber != '' AND Altphonenumber != '0' THEN 1 END) as alt_phones
       FROM prospects 
       WHERE isactive = 1`
    );
    const totalPhoneEntries = (phoneNumbersCountResult[0]?.company_phones || 0) + (phoneNumbersCountResult[0]?.alt_phones || 0);
    console.log('🔢 Total phone number entries:', totalPhoneEntries);

    // FIXED: Get total unique companies
    const [totalCompaniesResult] = await pool.query(
      `SELECT COUNT(DISTINCT Company) as total FROM prospects 
       WHERE isactive = 1 
       AND Company IS NOT NULL 
       AND Company != ''`
    );
    const totalCompanies = totalCompaniesResult[0]?.total || 0;
    console.log('🏢 Total unique companies:', totalCompanies);

    // FIXED: Get duplicate leads - count emails that appear more than once
    const [duplicateLeadsResult] = await pool.query(
      `SELECT COUNT(*) as total_duplicates FROM (
        SELECT Email, COUNT(*) as email_count
        FROM prospects 
        WHERE isactive = 1 
        AND Email IS NOT NULL 
        AND Email != ''
        AND Email LIKE '%@%.%'
        GROUP BY Email 
        HAVING email_count > 1
      ) as duplicate_emails`
    );
    const duplicateLeads = duplicateLeadsResult[0]?.total_duplicates || 0;
    console.log('🔄 Total duplicate email groups:', duplicateLeads);

    // FIXED: Get count of individual duplicate records
    const [duplicateRecordsResult] = await pool.query(
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
    const duplicateRecords = duplicateRecordsResult[0]?.total_duplicate_records || 0;
    console.log('📝 Total duplicate records:', duplicateRecords);

    // FIXED: Get junk leads (prospects missing critical data)
    const [junkLeadsResult] = await pool.query(
      `SELECT COUNT(*) as total FROM prospects 
       WHERE isactive = 1 
       AND (
         (Email IS NULL OR Email = '' OR Email NOT LIKE '%@%.%')
         AND (Companyphonenumber IS NULL OR Companyphonenumber = '' OR Companyphonenumber = '0')
         AND (Altphonenumber IS NULL OR Altphonenumber = '' OR Altphonenumber = '0')
       )`
    );
    const junkLeads = junkLeadsResult[0]?.total || 0;
    console.log('🗑️ Junk leads (no email or phone):', junkLeads);

    // Additional: Get leads with no email
    const [noEmailResult] = await pool.query(
      `SELECT COUNT(*) as total FROM prospects 
       WHERE isactive = 1 
       AND (Email IS NULL OR Email = '' OR Email NOT LIKE '%@%.%')`
    );
    const noEmailLeads = noEmailResult[0]?.total || 0;
    console.log('📭 Leads with no email:', noEmailLeads);

    // Additional: Get leads with no phone
    const [noPhoneResult] = await pool.query(
      `SELECT COUNT(*) as total FROM prospects 
       WHERE isactive = 1 
       AND (
         (Companyphonenumber IS NULL OR Companyphonenumber = '' OR Companyphonenumber = '0')
         AND 
         (Altphonenumber IS NULL OR Altphonenumber = '' OR Altphonenumber = '0')
       )`
    );
    const noPhoneLeads = noPhoneResult[0]?.total || 0;
    console.log('📞 Leads with no phone:', noPhoneLeads);

    const stats = {
      totalLeads,
      totalLeadsChange: 0,
      totalEmails, // Distinct valid emails
      totalEmailsChange: 0,
      totalPhones, // Prospects with at least one phone number
      totalPhonesChange: 0,
      totalCompanies, // Distinct companies
      totalCompaniesChange: 0,
      duplicateLeads: duplicateRecords, // Individual duplicate records
      duplicateGroups: duplicateLeads, // Duplicate email groups
      duplicateLeadsChange: 0,
      junkLeads,
      junkLeadsChange: 0,
      // Additional debug info
      _debug: {
        totalPhoneEntries, // Total phone number fields filled
        noEmailLeads,
        noPhoneLeads,
        duplicateRecords,
        duplicateGroups: duplicateLeads
      }
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

    // Debug total counts
    const [totalCounts] = await pool.query(
      `SELECT 
        COUNT(*) as total_prospects,
        COUNT(CASE WHEN isactive = 1 THEN 1 END) as active_prospects
       FROM prospects`
    );

    // Debug email counts
    const [emailAnalysis] = await pool.query(
      `SELECT 
        COUNT(*) as total_with_email,
        COUNT(DISTINCT Email) as distinct_emails,
        COUNT(CASE WHEN Email IS NULL OR Email = '' THEN 1 END) as no_email,
        COUNT(CASE WHEN Email NOT LIKE '%@%.%' THEN 1 END) as invalid_email_format
       FROM prospects 
       WHERE isactive = 1`
    );

    // Debug phone counts
    const [phoneAnalysis] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN Companyphonenumber IS NOT NULL AND Companyphonenumber != '' AND Companyphonenumber != '0' THEN 1 END) as with_company_phone,
        COUNT(CASE WHEN Altphonenumber IS NOT NULL AND Altphonenumber != '' AND Altphonenumber != '0' THEN 1 END) as with_alt_phone,
        COUNT(CASE WHEN 
          (Companyphonenumber IS NOT NULL AND Companyphonenumber != '' AND Companyphonenumber != '0')
          OR 
          (Altphonenumber IS NOT NULL AND Altphonenumber != '' AND Altphonenumber != '0')
        THEN 1 END) as with_any_phone,
        COUNT(CASE WHEN 
          (Companyphonenumber IS NULL OR Companyphonenumber = '' OR Companyphonenumber = '0')
          AND 
          (Altphonenumber IS NULL OR Altphonenumber = '' OR Altphonenumber = '0')
        THEN 1 END) as with_no_phone
       FROM prospects 
       WHERE isactive = 1`
    );

    // Debug company counts
    const [companyAnalysis] = await pool.query(
      `SELECT 
        COUNT(DISTINCT Company) as distinct_companies,
        COUNT(CASE WHEN Company IS NULL OR Company = '' THEN 1 END) as no_company
       FROM prospects 
       WHERE isactive = 1`
    );

    // Debug duplicates
    const [duplicateAnalysis] = await pool.query(
      `SELECT 
        COUNT(*) as duplicate_groups,
        SUM(email_count) as total_duplicate_records
       FROM (
        SELECT Email, COUNT(*) as email_count
        FROM prospects 
        WHERE isactive = 1 
        AND Email IS NOT NULL 
        AND Email != ''
        AND Email LIKE '%@%.%'
        GROUP BY Email 
        HAVING COUNT(*) > 1
       ) as duplicates`
    );

    // Sample of duplicates
    const [sampleDuplicates] = await pool.query(
      `SELECT Email, COUNT(*) as count 
       FROM prospects 
       WHERE isactive = 1 
       AND Email IS NOT NULL 
       AND Email != '' 
       AND Email LIKE '%@%.%'
       GROUP BY Email 
       HAVING COUNT(*) > 1
       ORDER BY COUNT(*) DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      debug: {
        totalCounts: totalCounts[0],
        emailAnalysis: emailAnalysis[0],
        phoneAnalysis: phoneAnalysis[0],
        companyAnalysis: companyAnalysis[0],
        duplicateAnalysis: duplicateAnalysis[0],
        sampleDuplicates,
        explanation: {
          totalLeads: "All active prospects",
          totalEmails: "Distinct valid email addresses",
          totalPhones: "Prospects with at least one valid phone number",
          totalCompanies: "Distinct company names",
          duplicateLeads: "Individual records that have duplicate emails",
          junkLeads: "Prospects with no email AND no phone number"
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

// Quick stats for real-time updates (optimized)
export const getQuickStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as totalLeads,
        COUNT(DISTINCT CASE WHEN Email IS NOT NULL AND Email != '' AND Email LIKE '%@%.%' THEN Email END) as totalEmails,
        COUNT(CASE WHEN 
          (Companyphonenumber IS NOT NULL AND Companyphonenumber != '' AND Companyphonenumber != '0')
          OR 
          (Altphonenumber IS NOT NULL AND Altphonenumber != '' AND Altphonenumber != '0')
        THEN 1 END) as totalPhones,
        COUNT(DISTINCT CASE WHEN Company IS NOT NULL AND Company != '' THEN Company END) as totalCompanies,
        (SELECT COUNT(*) FROM (
          SELECT Email FROM prospects 
          WHERE isactive = 1 AND Email IS NOT NULL AND Email != '' AND Email LIKE '%@%.%'
          GROUP BY Email HAVING COUNT(*) > 1
        ) as dupes) as duplicateGroups
      FROM prospects 
      WHERE isactive = 1
    `);

    res.json({
      success: true,
      data: {
        stats: {
          totalLeads: stats[0]?.totalLeads || 0,
          totalEmails: stats[0]?.totalEmails || 0,
          totalPhones: stats[0]?.totalPhones || 0,
          totalCompanies: stats[0]?.totalCompanies || 0,
          duplicateLeads: stats[0]?.duplicateGroups || 0,
          junkLeads: 0 // You can calculate this separately if needed
        }
      }
    });
  } catch (error) {
    console.error("Get quick stats error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  }
};