//src/controllers/prospectsController.js
import pool from "../config/db.js";
import { Readable } from "stream";
import csv from 'csv-parser';

// Get all prospects with optional filtering
export const getProspects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      industry,
      country,
      sortBy = "CreatedOn",
      sortOrder = "DESC",
    } = req.query;

    let query = `
      SELECT p.*, 
        pd.DispositionName,
        pes.EmailName,
        pp.ProviderName
      FROM prospects p
      LEFT JOIN prospects_disposition pd ON p.DispositionCode = pd.DispositionCode
      LEFT JOIN prospects_email_status pes ON p.EmailCode = pes.EmailCode
      LEFT JOIN prospects_provider pp ON p.ProviderCode = pp.ProviderCode
      WHERE p.isactive = 1
    `;
    let countQuery = `SELECT COUNT(*) as total FROM prospects p WHERE p.isactive = 1`;
    let queryParams = [];
    let countParams = [];

    // Apply filters
    if (search) {
      const searchCondition = `
        (p.Fullname LIKE ? OR p.Company LIKE ? OR p.Email LIKE ? OR p.Jobtitle LIKE ?)
      `;
      query += ` AND ${searchCondition}`;
      countQuery += ` AND ${searchCondition}`;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (status && status !== "all") {
      query += ` AND p.Status = ?`;
      countQuery += ` AND p.Status = ?`;
      queryParams.push(status);
      countParams.push(status);
    }

    if (industry && industry !== "all") {
      query += ` AND p.Industry = ?`;
      countQuery += ` AND p.Industry = ?`;
      queryParams.push(industry);
      countParams.push(industry);
    }

    if (country && country !== "all") {
      query += ` AND p.Country = ?`;
      countQuery += ` AND p.Country = ?`;
      queryParams.push(country);
      countParams.push(country);
    }

    // Apply sorting
    const validSortColumns = [
      "Fullname", "Jobtitle", "Company", "Email", "City", 
      "State", "Country", "Industry", "Employeesize", 
      "Status", "CreatedOn"
    ];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "CreatedOn";
    const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
    query += ` ORDER BY p.${sortColumn} ${order}`;

    // Apply pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    // Execute queries
    const [prospects] = await pool.query(query, queryParams);
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      prospects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get prospects error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get single prospect by ID
export const getProspectById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT p.*, 
        pd.DispositionName,
        pes.EmailName,
        pp.ProviderName
      FROM prospects p
      LEFT JOIN prospects_disposition pd ON p.DispositionCode = pd.DispositionCode
      LEFT JOIN prospects_email_status pes ON p.EmailCode = pes.EmailCode
      LEFT JOIN prospects_provider pp ON p.ProviderCode = pp.ProviderCode
      WHERE p.id = ? AND p.isactive = 1
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Prospect not found",
      });
    }

    res.json({
      success: true,
      prospect: rows[0],
    });
  } catch (error) {
    console.error("Get prospect error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Create new prospect
export const createProspect = async (req, res) => {
  try {
    const {
      Fullname,
      Firstname,
      Lastname,
      Jobtitle,
      Company,
      Website,
      Personallinkedin,
      Companylinkedin,
      Altphonenumber,
      Companyphonenumber,
      Email,
      Emailcode,
      Address,
      Street,
      City,
      State,
      Postalcode,
      Country,
      Annualrevenue,
      Industry,
      Employeesize,
      Siccode,
      Naicscode,
      Dispositioncode,
      Providercode,
      Comments,
      Department,
      Seniority,
      Status,
    } = req.body;

    // Required fields validation
    if (!Fullname || !Email || !Company) {
      return res.status(400).json({
        success: false,
        error: "Fullname, Email, and Company are required fields",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO prospects (
        Fullname, Firstname, Lastname, Jobtitle, Company, Website,
        Personallinkedin, Companylinkedin, Altphonenumber, Companyphonenumber,
        Email, Emailcode, Address, Street, City, State, Postalcode, Country,
        Annualrevenue, Industry, Employeesize, Siccode, Naicscode,
        Dispositioncode, Providercode, Comments, Department, Seniority, Status,
        CreatedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        Fullname,
        Firstname,
        Lastname,
        Jobtitle,
        Company,
        Website,
        Personallinkedin,
        Companylinkedin,
        Altphonenumber,
        Companyphonenumber,
        Email,
        Emailcode,
        Address,
        Street,
        City,
        State,
        Postalcode,
        Country,
        Annualrevenue || 0,
        Industry,
        Employeesize || 0,
        Siccode || 0,
        Naicscode || 0,
        Dispositioncode,
        Providercode,
        Comments,
        Department,
        Seniority,
        Status || "New",
        req.user.userId,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Prospect created successfully",
      prospectId: result.insertId,
    });
  } catch (error) {
    console.error("Create prospect error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Update prospect
export const updateProspect = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if prospect exists
    const [existing] = await pool.query(
      "SELECT id FROM prospects WHERE id = ? AND isactive = 1",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Prospect not found",
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    updateValues.push(req.user.userId);
    updateValues.push(id);

    const query = `
      UPDATE prospects 
      SET ${updateFields.join(
        ", "
      )}, UpdatedBy = ?, UpdatedOn = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await pool.query(query, updateValues);

    res.json({
      success: true,
      message: "Prospect updated successfully",
    });
  } catch (error) {
    console.error("Update prospect error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Delete prospect (soft delete)
export const deleteProspect = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `
      UPDATE prospects 
      SET isactive = 0, UpdatedBy = ?, UpdatedOn = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [req.user.userId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Prospect not found",
      });
    }

    res.json({
      success: true,
      message: "Prospect deleted successfully",
    });
  } catch (error) {
    console.error("Delete prospect error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Bulk delete prospects
export const bulkDeleteProspects = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Array of prospect IDs is required",
      });
    }

    const placeholders = ids.map(() => "?").join(",");
    const [result] = await pool.query(
      `
      UPDATE prospects 
      SET isactive = 0, UpdatedBy = ?, UpdatedOn = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
    `,
      [req.user.userId, ...ids]
    );

    res.json({
      success: true,
      message: `${result.affectedRows} prospects deleted successfully`,
    });
  } catch (error) {
    console.error("Bulk delete prospects error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Export prospects to CSV
export const exportProspects = async (req, res) => {
  try {
    const { ids } = req.query;
    let query = `
      SELECT 
        Fullname, Firstname, Lastname, Jobtitle, Company, Website,
        Personallinkedin, Companylinkedin, Altphonenumber, Companyphonenumber,
        Email, Emailcode, Address, Street, City, State, Postalcode, Country,
        Annualrevenue, Industry, Employeesize, Siccode, Naicscode,
        Dispositioncode, Providercode, Comments, Department, Seniority, Status,
        CreatedOn
      FROM prospects 
      WHERE isactive = 1
    `;
    let queryParams = [];

    if (ids) {
      const idArray = ids.split(",").map((id) => parseInt(id.trim()));
      query += ` AND id IN (${idArray.map(() => "?").join(",")})`;
      queryParams = [...idArray];
    }

    const [prospects] = await pool.query(query, queryParams);

    if (prospects.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No prospects found to export",
      });
    }

    // Convert to CSV
    const headers = Object.keys(prospects[0]).join(",");
    const csvData = prospects
      .map((prospect) =>
        Object.values(prospect)
          .map((value) => {
            if (value === null || value === undefined) return '""';
            const stringValue = String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const csvContent = `${headers}\n${csvData}`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=prospects_export_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Export prospects error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Import prospects from CSV
export const importProspects = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: "CSV file is required",
      });
    }

    const csv = await import("csv-parser");

    const results = [];
    const errors = [];

    // Parse CSV from buffer
    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv.default())
        .on("data", (data) => results.push(data))
        .on("end", resolve)
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          reject(error);
        });
    });

    const importedProspects = [];

    for (const [index, row] of results.entries()) {
      try {
        // Validate required fields
        if (!row.Fullname || !row.Email || !row.Company) {
          errors.push(
            `Row ${
              index + 1
            }: Missing required fields (Fullname, Email, or Company)`
          );
          continue;
        }

        // Prepare prospect data
        const prospect = {
          Fullname: row.Fullname,
          Firstname: row.Firstname || "",
          Lastname: row.Lastname || "",
          Jobtitle: row.Jobtitle || "",
          Company: row.Company,
          Website: row.Website || "",
          Personallinkedin: row.Personallinkedin || "",
          Companylinkedin: row.Companylinkedin || "",
          Altphonenumber: row.Altphonenumber || "",
          Companyphonenumber: row.Companyphonenumber || "",
          Email: row.Email,
          Emailcode: row.Emailcode || "",
          Address: row.Address || "",
          Street: row.Street || "",
          City: row.City || "",
          State: row.State || "",
          Postalcode: row.Postalcode || "",
          Country: row.Country || "",
          Annualrevenue: parseFloat(row.Annualrevenue) || 0,
          Industry: row.Industry || "",
          Employeesize: parseInt(row.Employeesize) || 0,
          Siccode: parseInt(row.Siccode) || 0,
          Naicscode: parseInt(row.Naicscode) || 0,
          Dispositioncode: row.Dispositioncode || "",
          Providercode: row.Providercode || "",
          Comments: row.Comments || "",
          Department: row.Department || "",
          Seniority: row.Seniority || "",
          Status: row.Status || "New",
          CreatedBy: req.user.userId,
        };

        importedProspects.push(prospect);
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    // Insert prospects in batch
    if (importedProspects.length > 0) {
      const values = importedProspects.map((p) => Object.values(p));

      // Build the query with the correct number of placeholders
      const placeholders = importedProspects
        .map(
          () =>
            "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .join(",");

      const query = `
        INSERT INTO prospects (
          Fullname, Firstname, Lastname, Jobtitle, Company, Website,
          Personallinkedin, Companylinkedin, Altphonenumber, Companyphonenumber,
          Email, Emailcode, Address, Street, City, State, Postalcode, Country,
          Annualrevenue, Industry, Employeesize, Siccode, Naicscode,
          Dispositioncode, Providercode, Comments, Department, Seniority, Status, CreatedBy
        ) VALUES ${placeholders}
      `;

      // Flatten the values array
      const flatValues = values.flat();

      const [result] = await pool.query(query, flatValues);

      res.json({
        success: true,
        message: `Successfully imported ${importedProspects.length} prospects`,
        importedCount: importedProspects.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "No valid prospects found in CSV",
        errors,
      });
    }
  } catch (error) {
    console.error("Import prospects error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  }
};

// Get lookup data for dropdowns
export const getLookupData = async (req, res) => {
  try {
    const [dispositions] = await pool.query(
      "SELECT * FROM prospects_disposition ORDER BY DispositionName"
    );
    const [emailStatuses] = await pool.query(
      "SELECT * FROM prospects_email_status ORDER BY EmailName"
    );
    const [providers] = await pool.query(
      "SELECT * FROM prospects_provider ORDER BY ProviderName"
    );

    // Get unique values for filters
    const [industriesResult] = await pool.query(
      "SELECT DISTINCT Industry FROM prospects WHERE Industry IS NOT NULL AND Industry != '' ORDER BY Industry"
    );
    const [countriesResult] = await pool.query(
      "SELECT DISTINCT Country FROM prospects WHERE Country IS NOT NULL AND Country != '' ORDER BY Country"
    );
    const [statusesResult] = await pool.query(
      "SELECT DISTINCT Status FROM prospects WHERE Status IS NOT NULL AND Status != '' ORDER BY Status"
    );

    const industries = industriesResult.map((i) => i.Industry);
    const countries = countriesResult.map((c) => c.Country);
    const statuses = statusesResult.map((s) => s.Status);

    res.json({
      success: true,
      data: {
        dispositions,
        emailStatuses,
        providers,
        industries,
        countries,
        statuses,
      },
    });
  } catch (error) {
    console.error("Get lookup data error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
