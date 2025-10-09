//server/controllers/dashboardController.js
import pool from "../config/db.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get total leads (active prospects)
    const [totalLeadsResult] = await pool.query(
      "SELECT COUNT(*) as total FROM prospects WHERE isactive = 1"
    );

    // Get total unique emails
    const [totalEmailsResult] = await pool.query(
      "SELECT COUNT(DISTINCT Email) as total FROM prospects WHERE isactive = 1 AND Email IS NOT NULL AND Email != ''"
    );

    // Get total phone numbers (both company and alt phones)
    const [totalPhonesResult] = await pool.query(
      `SELECT COUNT(*) as total FROM prospects 
       WHERE isactive = 1 
       AND (
         (Companyphonenumber IS NOT NULL AND Companyphonenumber != '' AND Companyphonenumber != '0') 
         OR 
         (Altphonenumber IS NOT NULL AND Altphonenumber != '' AND Altphonenumber != '0')
       )`
    );

    // Get total unique companies
    const [totalCompaniesResult] = await pool.query(
      "SELECT COUNT(DISTINCT Company) as total FROM prospects WHERE isactive = 1 AND Company IS NOT NULL AND Company != ''"
    );

    // Get duplicate leads (emails that appear more than once)
    const [duplicateLeadsResult] = await pool.query(
      `SELECT COUNT(*) as total FROM (
        SELECT Email, COUNT(*) as count 
        FROM prospects 
        WHERE isactive = 1 AND Email IS NOT NULL AND Email != ''
        GROUP BY Email 
        HAVING count > 1
      ) as duplicates`
    );

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

    // Calculate changes (you can implement more sophisticated change tracking)
    // For now, using placeholder values - you can implement real change tracking later
    const stats = {
      totalLeads: totalLeadsResult[0]?.total || 0,
      totalLeadsChange: 0, // Placeholder - implement real change tracking
      totalEmails: totalEmailsResult[0]?.total || 0,
      totalEmailsChange: 0, // Placeholder
      totalPhones: totalPhonesResult[0]?.total || 0,
      totalPhonesChange: 0, // Placeholder
      totalCompanies: totalCompaniesResult[0]?.total || 0,
      totalCompaniesChange: 0, // Placeholder
      duplicateLeads: duplicateLeadsResult[0]?.total || 0,
      duplicateLeadsChange: 0, // Placeholder
      junkLeads: junkLeadsResult[0]?.total || 0,
      junkLeadsChange: 0, // Placeholder
    };

    res.json({
      success: true,
      data: {
        stats,
        recentActivity: [] // You can add real activity data later
      }
    });

  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  }
};

// Enhanced version with trend analysis
export const getDashboardStatsWithTrends = async (req, res) => {
  try {
    // Get current stats
    const [totalLeadsResult] = await pool.query(
      "SELECT COUNT(*) as total FROM prospects WHERE isactive = 1"
    );

    const [totalEmailsResult] = await pool.query(
      "SELECT COUNT(DISTINCT Email) as total FROM prospects WHERE isactive = 1 AND Email IS NOT NULL AND Email != ''"
    );

    const [totalPhonesResult] = await pool.query(
      `SELECT COUNT(*) as total FROM prospects 
       WHERE isactive = 1 
       AND (
         (Companyphonenumber IS NOT NULL AND Companyphonenumber != '' AND Companyphonenumber != '0') 
         OR 
         (Altphonenumber IS NOT NULL AND Altphonenumber != '' AND Altphonenumber != '0')
       )`
    );

    const [totalCompaniesResult] = await pool.query(
      "SELECT COUNT(DISTINCT Company) as total FROM prospects WHERE isactive = 1 AND Company IS NOT NULL AND Company != ''"
    );

    const [duplicateLeadsResult] = await pool.query(
      `SELECT COUNT(*) as total FROM (
        SELECT Email, COUNT(*) as count 
        FROM prospects 
        WHERE isactive = 1 AND Email IS NOT NULL AND Email != ''
        GROUP BY Email 
        HAVING count > 1
      ) as duplicates`
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
      totalEmailsChange: 5, // Simplified - implement proper tracking
      totalPhones: totalPhonesResult[0]?.total || 0,
      totalPhonesChange: 3, // Simplified
      totalCompanies: totalCompaniesResult[0]?.total || 0,
      totalCompaniesChange: 2, // Simplified
      duplicateLeads: duplicateLeadsResult[0]?.total || 0,
      duplicateLeadsChange: -1, // Simplified
      junkLeads: junkLeadsResult[0]?.total || 0,
      junkLeadsChange: -2, // Simplified
    };

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
  }
};