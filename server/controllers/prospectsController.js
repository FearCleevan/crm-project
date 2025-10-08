import pool from "../config/db.js";
import { Readable } from "stream";
import csv from "csv-parser";
import { importQueue } from "../services/importQueue.js";

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
        pp.ProviderName,
        pi.IndustryName
      FROM prospects p
      LEFT JOIN prospects_disposition pd ON p.DispositionCode = pd.DispositionCode
      LEFT JOIN prospects_email_status pes ON p.EmailCode = pes.EmailCode
      LEFT JOIN prospects_provider pp ON p.ProviderCode = pp.ProviderCode
      LEFT JOIN prospects_industry pi ON p.Industry = pi.IndustryCode
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM prospects p 
      WHERE 1=1
    `;

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

    // Apply pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    // Execute queries
    console.log("Executing query:", query);
    console.log("Query params:", queryParams);

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
      error: "Internal server error: " + error.message,
    });
  }
};

// Get single prospect by ID
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
      LEFT JOIN prospects_industry pos ON p.Industry = pos.IndustryCode  -- FIXED: p.Industry not p.IndustryCode
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

    // Validate foreign keys if provided
    if (Industry) {
      const [industryCheck] = await pool.query(
        "SELECT IndustryCode FROM prospects_industry WHERE IndustryCode = ?",
        [Industry]
      );
      if (industryCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid IndustryCode",
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
        Industry || "",
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

    // Validate foreign keys if provided
    if (updates.Industry) {
      const [industryCheck] = await pool.query(
        "SELECT IndustryCode FROM prospects_industry WHERE IndustryCode = ?",
        [updates.Industry]
      );
      if (industryCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid Industrycode",
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
    // Get valid values from reference tables
    const [validDispositions] = await pool.query(
      "SELECT DispositionCode FROM prospects_disposition LIMIT 5"
    );
    const [validEmailStatuses] = await pool.query(
      "SELECT EmailCode FROM prospects_email_status LIMIT 3"
    );
    const [validProviders] = await pool.query(
      "SELECT ProviderCode FROM prospects_provider LIMIT 3"
    );

    const [validIndustries] = await pool.query(
      "SELECT IndustryCode FROM prospects_industry LIMIT 3"
    );

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
        Emailcode: validEmailStatuses[0]?.EmailCode || "EMA000",
        Address: "123 Main St",
        Street: "Main Street",
        City: "San Francisco",
        State: "CA",
        Postalcode: "94101",
        Country: "US",
        Annualrevenue: "1000000.00",
        Industry: validIndustries[0]?.IndustryCode || "IND001",
        Employeesize: "250",
        Siccode: "7372",
        Naicscode: "541511",
        Dispositioncode: validDispositions[0]?.DispositionCode || "DISC001",
        Providercode: validProviders[0]?.ProviderCode || "PROV01",
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

// Alternative CSV parsing method - add this function
// function parseCSV(csvText) {
//   const lines = csvText.split('\n');
//   const results = [];

//   if (lines.length === 0) return results;

//   // Extract headers
//   const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));

//   for (let i = 1; i < lines.length; i++) {
//     const line = lines[i].trim();
//     if (!line) continue;

//     const obj = {};
//     let current = '';
//     let inQuotes = false;
//     let headerIndex = 0;

//     for (let j = 0; j < line.length; j++) {
//       const char = line[j];

//       if (char === '"') {
//         inQuotes = !inQuotes;
//       } else if (char === ',' && !inQuotes) {
//         obj[headers[headerIndex]] = current.trim().replace(/^"|"$/g, '');
//         current = '';
//         headerIndex++;
//       } else {
//         current += char;
//       }
//     }

//     // Add the last field
//     if (headerIndex < headers.length) {
//       obj[headers[headerIndex]] = current.trim().replace(/^"|"$/g, '');
//     }

//     results.push(obj);
//   }

//   return results;
// }

// // Then replace the CSV parsing section with:
// const csvText = req.file.buffer.toString();
// const results = parseCSV(csvText);

// Import prospects from CSV
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
    const maxFileSize = 100 * 1024 * 1024; // 100MB
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

    // Get valid values from reference tables (cache these)
    const [
      validDispositions,
      validEmailStatuses,
      validProviders,
      validIndustries,
    ] = await Promise.all([
      pool.query("SELECT DispositionCode FROM prospects_disposition"),
      pool.query("SELECT EmailCode FROM prospects_email_status"),
      pool.query("SELECT ProviderCode FROM prospects_provider"),
      pool.query("SELECT IndustryCode FROM prospects_industry"),
    ]);

    const validDispositionCodes = validDispositions[0].map(
      (d) => d.DispositionCode
    );
    const validIndustryCodes = validIndustries[0].map((i) => i.IndustryCode);
    const validEmailCodes = validEmailStatuses[0].map((e) => e.EmailCode);
    const validProviderCodes = validProviders[0].map((p) => p.ProviderCode);

    const results = [];
    const validationErrors = [];

    // FIXED: Use csv-parser directly without dynamic import
    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv()) // Use csv() directly since we imported it at the top
        .on("data", (data) => {
          // Process in chunks to avoid memory buildup
          if (results.length < 50000) {
            // Limit to 50k rows
            results.push(data);
          }
        })
        .on("end", resolve)
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          reject(new Error(`CSV parsing failed: ${error.message}`));
        });
    });

    // Continue with the rest of your existing validation logic...
    // Validate all rows first
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

        // Trim and validate all fields
        const dispositionCode = row.Dispositioncode?.trim() || null;
        const industryCode = row.Industry?.trim() || null;
        const emailCode = row.Emailcode?.trim() || null;
        const providerCode = row.Providercode?.trim() || null;

        if (
          dispositionCode &&
          !validDispositionCodes.includes(dispositionCode)
        ) {
          validationErrors.push(
            `Row ${index + 1}: Invalid Dispositioncode '${dispositionCode}'`
          );
          continue;
        }

        if (industryCode && !validIndustryCodes.includes(industryCode)) {
          validationErrors.push(
            `Row ${index + 1}: Invalid IndustryCode '${industryCode}'`
          );
          continue;
        }

        if (emailCode && !validEmailCodes.includes(emailCode)) {
          validationErrors.push(
            `Row ${index + 1}: Invalid Emailcode '${emailCode}'`
          );
          continue;
        }

        if (providerCode && !validProviderCodes.includes(providerCode)) {
          validationErrors.push(
            `Row ${index + 1}: Invalid Providercode '${providerCode}'`
          );
          continue;
        }

        // Prepare prospect data with proper type conversion
        const prospect = {
          Fullname: row.Fullname.trim(),
          Firstname: (row.Firstname || "").trim(),
          Lastname: (row.Lastname || "").trim(),
          Jobtitle: (row.Jobtitle || "").trim(),
          Company: row.Company.trim(),
          Website: (row.Website || "").trim(),
          Personallinkedin: (row.Personallinkedin || "").trim(),
          Companylinkedin: (row.Companylinkedin || "").trim(),
          Altphonenumber: (row.Altphonenumber || "").trim(),
          Companyphonenumber: (row.Companyphonenumber || "").trim(),
          Email: row.Email.trim().toLowerCase(),
          Emailcode: emailCode,
          Address: (row.Address || "").trim(),
          Street: (row.Street || "").trim(),
          City: (row.City || "").trim(),
          State: (row.State || "").trim(),
          Postalcode: (row.Postalcode || "").trim(),
          Country: (row.Country || "").trim(),
          Annualrevenue: parseFloat(row.Annualrevenue) || 0,
          Industry: industryCode,
          Employeesize: parseInt(row.Employeesize) || 0,
          Siccode: parseInt(row.Siccode) || 0,
          Naicscode: parseInt(row.Naicscode) || 0,
          Dispositioncode: dispositionCode,
          Providercode: providerCode,
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
        errors: validationErrors.slice(0, 50), // Limit error response size
      });
    }

    // Use smaller chunks for better performance
    const chunkSize = 50; // Reduced from 100 for better memory management
    const chunks = [];
    for (let i = 0; i < validatedProspects.length; i += chunkSize) {
      chunks.push(validatedProspects.slice(i, i + chunkSize));
    }

    // Create import session
    const importSessionId = `import_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Use database for session storage instead of memory
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
      validationErrors: validationErrors.slice(0, 20), // Limit response size
      validationErrorCount: validationErrors.length,
    });

    // Process chunks in background with better error handling
    processChunksInBackground(chunks, importSessionId, validationErrors);
  } catch (error) {
    console.error("Import prospects error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  }
};

// function to store session in database
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
    // Fallback to memory storage
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

// Background chunk processing
async function processChunksInBackground(chunks, sessionId, validationErrors) {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    try {
      // Increased delay for database breathing room
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
      }

      const result = await processChunk(chunk);

      // Update progress in database
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

  // Mark import as completed
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

// Add these helper functions for database session management
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

      // Merge errors
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
    // Fallback to memory storage
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

// Process a single chunk
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
            prospect.Industry,
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

export const checkImportProgress = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // First, check if import_sessions table exists
    let tableExists = false;
    const connection = await pool.getConnection();

    try {
      // Check if table exists
      const [tables] = await connection.query(
        "SHOW TABLES LIKE 'import_sessions'"
      );
      tableExists = tables.length > 0;

      if (!tableExists) {
        // Table doesn't exist, use memory storage
        if (!global.importSessions || !global.importSessions[sessionId]) {
          return res.status(404).json({
            success: false,
            error: "Import session not found - table not created yet",
          });
        }

        const progress = global.importSessions[sessionId];
        return res.json({
          success: true,
          progress: formatProgressResponse(progress),
        });
      }

      // Table exists, query from database
      const [sessions] = await connection.query(
        "SELECT * FROM import_sessions WHERE session_id = ?",
        [sessionId]
      );

      if (sessions.length === 0) {
        // Fallback to memory storage
        if (!global.importSessions || !global.importSessions[sessionId]) {
          return res.status(404).json({
            success: false,
            error: "Import session not found",
          });
        }

        const progress = global.importSessions[sessionId];
        return res.json({
          success: true,
          progress: formatProgressResponse(progress),
        });
      }

      const session = sessions[0];
      const progress = {
        sessionId: session.session_id,
        status: session.status,
        totalChunks: session.total_chunks,
        processedChunks: session.processed_chunks,
        successfulImports: session.successful_imports,
        failedImports: session.failed_imports,
        chunkErrors: session.chunk_errors
          ? JSON.parse(session.chunk_errors)
          : [],
        startTime: session.created_at,
        endTime: session.completed_at,
        totalTime: session.completed_at
          ? new Date(session.completed_at) - new Date(session.created_at)
          : null,
      };

      res.json({
        success: true,
        progress: formatProgressResponse(progress),
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Check import progress error:", error);

    // If database error, fall back to memory storage
    if (
      !global.importSessions ||
      !global.importSessions[req.params.sessionId]
    ) {
      return res.status(404).json({
        success: false,
        error: "Import session not found: " + error.message,
      });
    }

    const progress = global.importSessions[req.params.sessionId];
    res.json({
      success: true,
      progress: formatProgressResponse(progress),
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

// Clean up completed imports (optional)
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

    // Get industry data - use IndustryCode as value and IndustryName as display text
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
        industries, // This contains {IndustryCode, IndustryName}
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
