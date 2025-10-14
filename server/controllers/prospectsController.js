import pool from "../config/db.js";
import { Readable } from "stream";
import csv from "csv-parser";
import { importQueue } from "../services/importQueue.js";

// Add this function to your prospectsController.js
export const getFilterOptions = async (req, res) => {
  let connection;
  try {
    const { field, search } = req.query;

    const validFields = [
      "Jobtitle",
      "Industry",
      "Department",
      "Seniority",
      "Fullname",
      "Firstname",
      "Lastname",
      "Company",
      "State",
      "Country",
      "Email",
    ];

    if (!validFields.includes(field)) {
      return res.status(400).json({
        success: false,
        error: `Invalid field specified. Valid fields: ${validFields.join(
          ", "
        )}`,
      });
    }

    connection = await pool.getConnection();

    let query;
    let params = [];

    if (field === "Industry") {
      query = `
        SELECT DISTINCT 
          COALESCE(pi.IndustryName, p.Industry) as value 
        FROM prospects p
        LEFT JOIN prospects_industry pi ON p.Industry = pi.IndustryCode
        WHERE p.isactive = 1 
        AND (pi.IndustryName IS NOT NULL OR p.Industry IS NOT NULL)
        AND (pi.IndustryName != '' OR p.Industry != '')
      `;

      if (search && search.trim() !== "") {
        query += ` AND (pi.IndustryName LIKE ? OR p.Industry LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY value LIMIT 50`;
    } else {
      query = `
        SELECT DISTINCT ${field} as value 
        FROM prospects 
        WHERE isactive = 1 
        AND ${field} IS NOT NULL 
        AND ${field} != ''
      `;

      if (search && search.trim() !== "") {
        query += ` AND ${field} LIKE ?`;
        params.push(`%${search}%`);
      }

      query += ` ORDER BY ${field} LIMIT 50`;
    }

    const [results] = await connection.query(query, params);

    const options = results
      .map((row) => {
        const value = row.value;
        return value && typeof value === "string" ? value.trim() : value;
      })
      .filter((value) => value && value !== "")
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    res.json({
      success: true,
      options,
      count: options.length,
      field,
      searchTerm: search,
    });
  } catch (error) {
    console.error("Get filter options error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching filter options",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Test function to debug database connection and data
export const debugFilterOptions = async (req, res) => {
  try {
    const { field = "Industry", search = "" } = req.query;

    console.log("🐛 DEBUG: Checking database state for field:", field);

    const connection = await pool.getConnection();

    // Check if prospects table has data
    const [prospectCount] = await connection.query(
      "SELECT COUNT(*) as count FROM prospects WHERE isactive = 1"
    );
    console.log("📊 Total active prospects:", prospectCount[0].count);

    // Check if industry table has data
    const [industryData] = await connection.query(
      "SELECT * FROM prospects_industry LIMIT 5"
    );
    console.log("🏭 Industry table sample:", industryData);

    // Check distinct values for the requested field
    let distinctQuery;
    if (field === "Industry") {
      distinctQuery = `
        SELECT DISTINCT p.Industry as industry_code, pi.IndustryName as industry_name
        FROM prospects p
        LEFT JOIN prospects_industry pi ON p.Industry = pi.IndustryCode
        WHERE p.isactive = 1 AND (p.Industry IS NOT NULL OR pi.IndustryName IS NOT NULL)
        LIMIT 10
      `;
    } else {
      distinctQuery = `
        SELECT DISTINCT ${field} as value 
        FROM prospects 
        WHERE isactive = 1 AND ${field} IS NOT NULL
        LIMIT 10
      `;
    }

    const [distinctValues] = await connection.query(distinctQuery);
    console.log(`🔍 Distinct ${field} values:`, distinctValues);

    connection.release();

    res.json({
      success: true,
      debug: {
        totalProspects: prospectCount[0].count,
        industrySample: industryData,
        distinctValues: distinctValues,
        field: field,
        search: search,
      },
    });
  } catch (error) {
    console.error("💥 Debug error:", error);
    res.status(500).json({
      success: false,
      error: "Debug failed: " + error.message,
    });
  }
};

// Get all prospects with optional filtering
export const getProspects = async (req, res) => {
  let connection;
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "CreatedOn",
      sortOrder = "DESC",
      jobTitles,
      industries,
      departments,
      seniorities,
      employeeSizeMin,
      employeeSizeMax,
      annualRevenueMin,
      annualRevenueMax,
      fullname,
      firstname,
      lastname,
      company,
      state,
      country,
      email,
    } = req.query;

    connection = await pool.getConnection();

    let query = `
      SELECT p.*, 
        pd.DispositionName,
        pes.EmailName,
        pp.ProviderName,
        pi.IndustryName
      FROM prospects p
      LEFT JOIN prospects_disposition pd ON p.DispositionCode = pd.DispositionCode
      LEFT JOIN prospects_email_status pes ON p.EmailCode = pes.EmailCode
      LEFT JOIN prospects_provider pp ON p.ProviderCode = pp.ProviderCode
      LEFT JOIN prospects_industry pi ON p.Industry = pi.IndustryCode
      WHERE p.isactive = 1
    `;

    let countQuery = `SELECT COUNT(*) as total FROM prospects p WHERE p.isactive = 1`;
    let queryParams = [];
    let countParams = [];

    if (search) {
      const searchCondition = `(p.Fullname LIKE ? OR p.Company LIKE ? OR p.Email LIKE ? OR p.Jobtitle LIKE ?)`;
      query += ` AND ${searchCondition}`;
      countQuery += ` AND ${searchCondition}`;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }

    const applyArrayFilter = (field, values, isIndustry = false) => {
      if (values && values.length > 0) {
        const valueArray = Array.isArray(values) ? values : values.split(",");
        if (valueArray.length > 0) {
          const placeholders = valueArray.map(() => "?").join(",");
          if (isIndustry) {
            query += ` AND pi.IndustryName IN (${placeholders})`;
            countQuery += ` AND pi.IndustryName IN (${placeholders})`;
          } else {
            query += ` AND p.${field} IN (${placeholders})`;
            countQuery += ` AND p.${field} IN (${placeholders})`;
          }
          valueArray.forEach((val) => {
            queryParams.push(val);
            countParams.push(val);
          });
        }
      }
    };

    const applyTextFilter = (field, value) => {
      if (value && value.trim() !== "") {
        query += ` AND p.${field} LIKE ?`;
        countQuery += ` AND p.${field} LIKE ?`;
        queryParams.push(`%${value}%`);
        countParams.push(`%${value}%`);
      }
    };

    const applyRangeFilter = (field, min, max) => {
      if (min || max) {
        const conditions = [];
        if (min) {
          conditions.push(`p.${field} >= ?`);
          queryParams.push(parseFloat(min));
          countParams.push(parseFloat(min));
        }
        if (max) {
          conditions.push(`p.${field} <= ?`);
          queryParams.push(parseFloat(max));
          countParams.push(parseFloat(max));
        }
        if (conditions.length > 0) {
          query += ` AND ${conditions.join(" AND ")}`;
          countQuery += ` AND ${conditions.join(" AND ")}`;
        }
      }
    };

    applyArrayFilter("Jobtitle", jobTitles);
    applyArrayFilter("Industry", industries, true);
    applyArrayFilter("Department", departments);
    applyArrayFilter("Seniority", seniorities);

    applyRangeFilter("Employeesize", employeeSizeMin, employeeSizeMax);
    applyRangeFilter("Annualrevenue", annualRevenueMin, annualRevenueMax);

    applyTextFilter("Fullname", fullname);
    applyTextFilter("Firstname", firstname);
    applyTextFilter("Lastname", lastname);
    applyTextFilter("Company", company);
    applyTextFilter("State", state);
    applyTextFilter("Country", country);
    applyTextFilter("Email", email);

    const validSortColumns = [
      "Fullname",
      "Jobtitle",
      "Company",
      "Email",
      "City",
      "State",
      "Country",
      "Industry",
      "Employeesize",
      "Status",
      "CreatedOn",
    ];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "CreatedOn";
    const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
    query += ` ORDER BY p.${sortColumn} ${order}`;

    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    const [prospects] = await connection.query(query, queryParams);
    const [countResult] = await connection.query(countQuery, countParams);
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
      error: "Internal server error: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
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
        pp.ProviderName,
        pos.IndustryName
      FROM prospects p
      LEFT JOIN prospects_disposition pd ON p.DispositionCode = pd.DispositionCode
      LEFT JOIN prospects_email_status pes ON p.EmailCode = pes.EmailCode
      LEFT JOIN prospects_industry pos ON p.Industry = pos.IndustryCode
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

    // Validate required fields
    if (!Fullname || !Email || !Company) {
      return res.status(400).json({
        success: false,
        error: "Fullname, Email, and Company are required fields",
      });
    }

    // Validate foreign keys if provided
    if (Dispositioncode) {
      const [dispositionCheck] = await pool.query(
        "SELECT DispositionCode FROM prospects_disposition WHERE DispositionCode = ?",
        [Dispositioncode]
      );
      if (dispositionCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid Dispositioncode",
        });
      }
    }

    if (Emailcode) {
      const [emailCheck] = await pool.query(
        "SELECT EmailCode FROM prospects_email_status WHERE EmailCode = ?",
        [Emailcode]
      );
      if (emailCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid Emailcode",
        });
      }
    }

    if (Providercode) {
      const [providerCheck] = await pool.query(
        "SELECT ProviderCode FROM prospects_provider WHERE ProviderCode = ?",
        [Providercode]
      );
      if (providerCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid Providercode",
        });
      }
    }

    // Insert the new prospect
    const [result] = await pool.query(
      `
      INSERT INTO prospects (
        Fullname, Firstname, Lastname, Jobtitle, Company, Website,
        Personallinkedin, Companylinkedin, Altphonenumber, Companyphonenumber,
        Email, Emailcode, Address, Street, City, State, Postalcode, Country,
        Annualrevenue, Industry, Employeesize, Siccode, Naicscode,
        Dispositioncode, Providercode, Comments, Department, Seniority, Status, CreatedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        Fullname,
        Firstname || "",
        Lastname || "",
        Jobtitle || "",
        Company,
        Website || "",
        Personallinkedin || "",
        Companylinkedin || "",
        Altphonenumber || "",
        Companyphonenumber || "",
        Email,
        Emailcode || null,
        Address || "",
        Street || "",
        City || "",
        State || "",
        Postalcode || "",
        Country || "",
        Annualrevenue || 0,
        Industry || null,
        Employeesize || 0,
        Siccode || 0,
        Naicscode || 0,
        Dispositioncode || null,
        Providercode || null,
        Comments || "",
        Department || "",
        Seniority || "",
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

    // Validate foreign keys if provided
    if (updates.Dispositioncode) {
      const [dispositionCheck] = await pool.query(
        "SELECT DispositionCode FROM prospects_disposition WHERE DispositionCode = ?",
        [updates.Dispositioncode]
      );
      if (dispositionCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid Dispositioncode",
        });
      }
    }

    if (updates.Emailcode) {
      const [emailCheck] = await pool.query(
        "SELECT EmailCode FROM prospects_email_status WHERE EmailCode = ?",
        [updates.Emailcode]
      );
      if (emailCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid Emailcode",
        });
      }
    }

    if (updates.Providercode) {
      const [providerCheck] = await pool.query(
        "SELECT ProviderCode FROM prospects_provider WHERE ProviderCode = ?",
        [updates.Providercode]
      );
      if (providerCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid Providercode",
        });
      }
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
      `DELETE FROM prospects WHERE id IN (${placeholders})`,
      [...ids]
    );

    res.json({
      success: true,
      message: `${result.affectedRows} prospects deleted permanently`,
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

// Download CSV template
export const downloadCSVTemplate = async (req, res) => {
  try {
    const templateData = [
      {
        Fullname: "John Smith",
        Firstname: "John",
        Lastname: "Smith",
        Jobtitle: "IT Manager",
        Company: "TechNova Inc",
        Website: "https://technova.com",
        Personallinkedin: "https://linkedin.com/in/johnsmith",
        Companylinkedin: "https://linkedin.com/company/technova",
        Altphonenumber: "555-123-4567",
        Companyphonenumber: "555-111-2222",
        Email: "john.smith@technova.com",
        Emailcode: "EMA000",
        Address: "123 Main St",
        Street: "Main Street",
        City: "San Francisco",
        State: "CA",
        Postalcode: "94101",
        Country: "US",
        Annualrevenue: "1000000.00",
        Industry: "TECH",
        Employeesize: "250",
        Siccode: "7372",
        Naicscode: "541511",
        Dispositioncode: "DISC001",
        Providercode: "PROV01",
        Comments: "Interested in our enterprise solution",
        Department: "IT",
        Seniority: "Manager",
        Status: "New",
      },
    ];

    const headers = Object.keys(templateData[0]).join(",");
    const csvData = templateData
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
      `attachment; filename=prospects_import_template.csv`
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Download template error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Import prospects from CSV - ULTIMATE FIXED VERSION
export const importProspects = async (req, res) => {
  let connection;
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: "CSV file is required",
      });
    }

    // Validate file size (max 100MB)
    const maxFileSize = 100 * 1024 * 1024;
    if (req.file.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        error: "File size too large. Maximum 100MB allowed.",
      });
    }

    // Validate file type
    if (
      !req.file.mimetype.includes("csv") &&
      !req.file.originalname.toLowerCase().endsWith(".csv")
    ) {
      return res.status(400).json({
        success: false,
        error: "Only CSV files are allowed",
      });
    }

    // Get valid values from reference tables
    const [
      validDispositions,
      validEmailStatuses,
      validProviders,
      validIndustries,
    ] = await Promise.all([
      pool.query(
        "SELECT DispositionCode, DispositionName FROM prospects_disposition"
      ),
      pool.query("SELECT EmailCode, EmailName FROM prospects_email_status"),
      pool.query("SELECT ProviderCode, ProviderName FROM prospects_provider"),
      pool.query("SELECT IndustryCode, IndustryName FROM prospects_industry"),
    ]);

    // Create lookup maps for flexible validation
    const validDispositionMap = new Map();
    validDispositions[0].forEach((d) => {
      validDispositionMap.set(d.DispositionCode, true);
      validDispositionMap.set(d.DispositionName, d.DispositionCode);
    });

    const validEmailMap = new Map();
    validEmailStatuses[0].forEach((e) => {
      validEmailMap.set(e.EmailCode, true);
      validEmailMap.set(e.EmailName, e.EmailCode);
    });

    const validProviderMap = new Map();
    validProviders[0].forEach((p) => {
      validProviderMap.set(p.ProviderCode, true);
      validProviderMap.set(p.ProviderName, p.ProviderCode);
    });

    const validIndustryMap = new Map();
    validIndustries[0].forEach((i) => {
      validIndustryMap.set(i.IndustryCode, true);
      validIndustryMap.set(i.IndustryName, i.IndustryCode);
    });

    const results = [];
    const validationErrors = [];

    // Parse CSV
    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (data) => {
          if (results.length < 100000) {
            // Increased limit
            results.push(data);
          }
        })
        .on("end", resolve)
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          reject(new Error(`CSV parsing failed: ${error.message}`));
        });
    });

    // Validate and process all rows
    const validatedProspects = [];
    let rowCount = 0;

    for (const [index, row] of results.entries()) {
      rowCount++;
      try {
        // Validate required fields
        if (!row.Fullname || !row.Email || !row.Company) {
          validationErrors.push(
            `Row ${
              index + 1
            }: Missing required fields (Fullname, Email, or Company)`
          );
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.Email)) {
          validationErrors.push(
            `Row ${index + 1}: Invalid email format '${row.Email}'`
          );
          continue;
        }

        // Flexible validation for foreign keys
        const dispositionValue = row.Dispositioncode?.trim() || null;
        const industryValue = row.Industry?.trim() || null;
        const emailValue = row.Emailcode?.trim() || null;
        const providerValue = row.Providercode?.trim() || null;

        let finalDispositionCode = null;
        let finalIndustryCode = null;
        let finalEmailCode = null;
        let finalProviderCode = null;

        // Validate and map disposition
        if (dispositionValue) {
          if (validDispositionMap.has(dispositionValue)) {
            finalDispositionCode =
              validDispositionMap.get(dispositionValue) || dispositionValue;
          } else {
            validationErrors.push(
              `Row ${index + 1}: Invalid Disposition '${dispositionValue}'`
            );
            continue;
          }
        }

        // Validate and map industry - MAKE THIS OPTIONAL
        if (industryValue) {
          if (validIndustryMap.has(industryValue)) {
            finalIndustryCode =
              validIndustryMap.get(industryValue) || industryValue;
          } else {
            // Industry is optional, so don't fail the row, just set to null
            finalIndustryCode = null;
            validationErrors.push(
              `Row ${
                index + 1
              }: Invalid Industry '${industryValue}' - setting to NULL`
            );
            // Don't continue - allow the row to be imported without industry
          }
        }

        // Validate and map email status
        if (emailValue) {
          if (validEmailMap.has(emailValue)) {
            finalEmailCode = validEmailMap.get(emailValue) || emailValue;
          } else {
            validationErrors.push(
              `Row ${index + 1}: Invalid Email Status '${emailValue}'`
            );
            continue;
          }
        }

        // Validate and map provider
        if (providerValue) {
          if (validProviderMap.has(providerValue)) {
            finalProviderCode =
              validProviderMap.get(providerValue) || providerValue;
          } else {
            validationErrors.push(
              `Row ${index + 1}: Invalid Provider '${providerValue}'`
            );
            continue;
          }
        }

        // Prepare prospect data with proper type conversion and NULL handling
        const prospect = {
          Fullname: (row.Fullname || "").trim(),
          Firstname: (row.Firstname || "").trim(),
          Lastname: (row.Lastname || "").trim(),
          Jobtitle: (row.Jobtitle || "").trim(),
          Company: (row.Company || "").trim(),
          Website: (row.Website || "").trim(),
          Personallinkedin: (row.Personallinkedin || "").trim(),
          Companylinkedin: (row.Companylinkedin || "").trim(),
          Altphonenumber: (row.Altphonenumber || "").trim(),
          Companyphonenumber: (row.Companyphonenumber || "").trim(),
          Email: (row.Email || "").trim().toLowerCase(),
          Emailcode: finalEmailCode,
          Address: (row.Address || "").trim(),
          Street: (row.Street || "").trim(),
          City: (row.City || "").trim(),
          State: (row.State || "").trim(),
          Postalcode: (row.Postalcode || "").trim(),
          Country: (row.Country || "").trim(),
          Annualrevenue: parseFloat(row.Annualrevenue) || 0,
          Industry: finalIndustryCode, // Can be null
          Employeesize: parseInt(row.Employeesize) || 0,
          Siccode: parseInt(row.Siccode) || 0,
          Naicscode: parseInt(row.Naicscode) || 0,
          Dispositioncode: finalDispositionCode,
          Providercode: finalProviderCode,
          Comments: (row.Comments || "").trim(),
          Department: (row.Department || "").trim(),
          Seniority: (row.Seniority || "").trim(),
          Status: (row.Status || "New").trim(),
          CreatedBy: req.user.userId,
        };

        validatedProspects.push(prospect);
      } catch (error) {
        validationErrors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    if (validatedProspects.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid prospects found in CSV",
        errors: validationErrors.slice(0, 50),
      });
    }

    // Use optimized chunk size
    const chunkSize = 100;
    const chunks = [];
    for (let i = 0; i < validatedProspects.length; i += chunkSize) {
      chunks.push(validatedProspects.slice(i, i + chunkSize));
    }

    // Create import session
    const importSessionId = `import_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await initializeImportSession(
      importSessionId,
      chunks.length,
      validatedProspects.length
    );

    // Send immediate response
    res.json({
      success: true,
      message: `Import started. Processing ${validatedProspects.length} prospects in ${chunks.length} chunks`,
      sessionId: importSessionId,
      totalProspects: validatedProspects.length,
      totalChunks: chunks.length,
      validationErrors: validationErrors.slice(0, 20),
      validationErrorCount: validationErrors.length,
    });

    // Process chunks in background
    processChunksInBackground(chunks, importSessionId, validationErrors);
  } catch (error) {
    console.error("Import prospects error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  }
};

// Database session management functions
async function initializeImportSession(sessionId, totalChunks, totalProspects) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `INSERT INTO import_sessions 
       (session_id, total_chunks, total_prospects, status, created_at) 
       VALUES (?, ?, ?, 'processing', NOW())`,
      [sessionId, totalChunks, totalProspects]
    );
  } catch (error) {
    console.error("Error initializing import session:", error);
    global.importSessions = global.importSessions || {};
    global.importSessions[sessionId] = {
      sessionId,
      totalChunks,
      processedChunks: 0,
      successfulImports: 0,
      failedImports: 0,
      chunkErrors: [],
      startTime: new Date(),
      status: "processing",
    };
  } finally {
    connection.release();
  }
}

async function processChunksInBackground(chunks, sessionId, validationErrors) {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    try {
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const result = await processChunk(chunk);
      await updateImportProgress(sessionId, result.successful, result.errors);

      console.log(
        `Processed chunk ${i + 1}/${chunks.length}: ${
          result.successful
        } successful, ${result.errors?.length || 0} failed`
      );
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
      await updateImportProgress(
        sessionId,
        0,
        [`Chunk ${i + 1}: ${error.message}`],
        chunk.length
      );
    }
  }

  await completeImportSession(sessionId);
  console.log(`Import session ${sessionId} completed`);
}

async function completeImportSession(sessionId) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `UPDATE import_sessions 
       SET status = 'completed', completed_at = NOW(), updated_at = NOW()
       WHERE session_id = ?`,
      [sessionId]
    );
  } catch (error) {
    console.error("Error completing import session:", error);
    if (global.importSessions && global.importSessions[sessionId]) {
      global.importSessions[sessionId].status = "completed";
      global.importSessions[sessionId].endTime = new Date();
    }
  } finally {
    connection.release();
  }
}

async function updateImportProgress(
  sessionId,
  successful,
  errors = [],
  failedCount = null
) {
  const connection = await pool.getConnection();
  try {
    const [current] = await connection.query(
      "SELECT processed_chunks, successful_imports, failed_imports, chunk_errors FROM import_sessions WHERE session_id = ?",
      [sessionId]
    );

    if (current.length > 0) {
      const currentSession = current[0];
      const newProcessedChunks = currentSession.processed_chunks + 1;
      const newSuccessful = currentSession.successful_imports + successful;
      const newFailed =
        failedCount !== null
          ? currentSession.failed_imports + failedCount
          : currentSession.failed_imports + (errors?.length || 0);

      const currentErrors = currentSession.chunk_errors
        ? JSON.parse(currentSession.chunk_errors)
        : [];
      const newErrors = [...currentErrors, ...errors];

      await connection.query(
        `UPDATE import_sessions 
         SET processed_chunks = ?, successful_imports = ?, failed_imports = ?, chunk_errors = ?, updated_at = NOW()
         WHERE session_id = ?`,
        [
          newProcessedChunks,
          newSuccessful,
          newFailed,
          JSON.stringify(newErrors),
          sessionId,
        ]
      );
    }
  } catch (error) {
    console.error("Error updating import progress:", error);
    if (global.importSessions && global.importSessions[sessionId]) {
      const session = global.importSessions[sessionId];
      session.processedChunks++;
      session.successfulImports += successful;
      session.failedImports +=
        failedCount !== null ? failedCount : errors.length;
      session.chunkErrors.push(...errors);
    }
  } finally {
    connection.release();
  }
}

// Process a single chunk - ULTIMATE FIXED VERSION
async function processChunk(chunk) {
  const chunkErrors = [];
  let successfulImports = 0;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const prospect of chunk) {
      try {
        // Check for duplicate email before insert
        const [existing] = await connection.query(
          "SELECT id FROM prospects WHERE Email = ? AND isactive = 1",
          [prospect.Email]
        );

        if (existing.length > 0) {
          chunkErrors.push(
            `Prospect with email ${prospect.Email} already exists`
          );
          continue;
        }

        const [result] = await connection.query(
          `INSERT INTO prospects (
            Fullname, Firstname, Lastname, Jobtitle, Company, Website,
            Personallinkedin, Companylinkedin, Altphonenumber, Companyphonenumber,
            Email, Emailcode, Address, Street, City, State, Postalcode, Country,
            Annualrevenue, Industry, Employeesize, Siccode, Naicscode,
            Dispositioncode, Providercode, Comments, Department, Seniority, Status, CreatedBy
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            prospect.Fullname,
            prospect.Firstname,
            prospect.Lastname,
            prospect.Jobtitle,
            prospect.Company,
            prospect.Website,
            prospect.Personallinkedin,
            prospect.Companylinkedin,
            prospect.Altphonenumber,
            prospect.Companyphonenumber,
            prospect.Email,
            prospect.Emailcode,
            prospect.Address,
            prospect.Street,
            prospect.City,
            prospect.State,
            prospect.Postalcode,
            prospect.Country,
            prospect.Annualrevenue,
            prospect.Industry, // Can be NULL now
            prospect.Employeesize,
            prospect.Siccode,
            prospect.Naicscode,
            prospect.Dispositioncode,
            prospect.Providercode,
            prospect.Comments,
            prospect.Department,
            prospect.Seniority,
            prospect.Status,
            prospect.CreatedBy,
          ]
        );
        successfulImports++;
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          chunkErrors.push(`Duplicate entry for email ${prospect.Email}`);
        } else {
          chunkErrors.push(
            `Error inserting prospect ${prospect.Email}: ${error.message}`
          );
        }
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return { successful: successfulImports, errors: chunkErrors };
}


// In your backend controller, update the checkImportProgress function
export const checkImportProgress = async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log(`🔍 Checking import progress for session: ${sessionId}`);

    let tableExists = false;
    const connection = await pool.getConnection();

    try {
      // Check if import_sessions table exists
      const [tables] = await connection.query(
        "SHOW TABLES LIKE 'import_sessions'"
      );
      tableExists = tables.length > 0;

      let progress;

      if (!tableExists) {
        console.log('📊 import_sessions table does not exist, using memory storage');
        if (!global.importSessions || !global.importSessions[sessionId]) {
          return res.status(404).json({
            success: false,
            error: "Import session not found",
          });
        }
        progress = global.importSessions[sessionId];
      } else {
        // Check database for session
        const [sessions] = await connection.query(
          "SELECT * FROM import_sessions WHERE session_id = ?",
          [sessionId]
        );

        if (sessions.length === 0) {
          console.log('📊 Session not found in database, checking memory');
          if (!global.importSessions || !global.importSessions[sessionId]) {
            return res.status(404).json({
              success: false,
              error: "Import session not found",
            });
          }
          progress = global.importSessions[sessionId];
        } else {
          const session = sessions[0];
          console.log(`📊 Found session in database:`, {
            status: session.status,
            processed: session.processed_chunks,
            total: session.total_chunks,
            successful: session.successful_imports,
            failed: session.failed_imports
          });

          progress = {
            sessionId: session.session_id,
            stage: session.status === 'completed' ? 'completed' : 'inserting',
            totalRows: session.total_prospects,
            validRows: session.total_prospects - session.failed_imports,
            insertedRows: session.successful_imports,
            errorCount: session.failed_imports,
            totalChunks: session.total_chunks,
            processedChunks: session.processed_chunks,
            logs: [
              {
                type: 'info',
                message: `Processing chunk ${session.processed_chunks} of ${session.total_chunks}`,
                timestamp: session.updated_at || session.created_at
              },
              {
                type: 'info', 
                message: `Successfully imported ${session.successful_imports} of ${session.total_prospects} prospects`,
                timestamp: session.updated_at || session.created_at
              }
            ],
            errors: session.chunk_errors ? JSON.parse(session.chunk_errors) : [],
            progressPercentage: session.total_chunks > 0 
              ? Math.round((session.processed_chunks / session.total_chunks) * 100)
              : 0
          };
        }
      }

      // Add real-time logs based on current progress
      if (!progress.logs) progress.logs = [];
      
      // Add current status log
      progress.logs.push({
        type: 'info',
        message: `Progress: ${progress.processedChunks || 0}/${progress.totalChunks || 0} chunks processed`,
        timestamp: new Date()
      });

      res.json({ 
        success: true, 
        progress: progress
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("💥 Check import progress error:", error);

    // Final fallback to memory storage
    if (!global.importSessions || !global.importSessions[req.params.sessionId]) {
      return res.status(404).json({
        success: false,
        error: "Import session not found: " + error.message,
      });
    }

    const progress = global.importSessions[req.params.sessionId];
    res.json({ 
      success: true, 
      progress: progress
    });
  }
};

function formatProgressResponse(progress) {
  return {
    ...progress,
    progressPercentage:
      progress.totalChunks > 0
        ? Math.round((progress.processedChunks / progress.totalChunks) * 100)
        : 0,
  };
}

// Clean up completed imports
export const cleanupImportSessions = async (req, res) => {
  try {
    const { olderThanHours = 24 } = req.query;
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    let cleanedCount = 0;

    if (global.importSessions) {
      Object.keys(global.importSessions).forEach((sessionId) => {
        const session = global.importSessions[sessionId];
        if (session.endTime && session.endTime < cutoffTime) {
          delete global.importSessions[sessionId];
          cleanedCount++;
        }
      });
    }

    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} import sessions`,
    });
  } catch (error) {
    console.error("Cleanup import sessions error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
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
    const [industries] = await pool.query(
      "SELECT * FROM prospects_industry ORDER BY IndustryName"
    );

    const [countriesResult] = await pool.query(
      "SELECT DISTINCT Country FROM prospects WHERE Country IS NOT NULL AND Country != '' ORDER BY Country"
    );
    const [statusesResult] = await pool.query(
      "SELECT DISTINCT Status FROM prospects WHERE Status IS NOT NULL AND Status != '' ORDER BY Status"
    );

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
