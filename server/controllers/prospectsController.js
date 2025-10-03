import pool from "../config/db.js";
import { Readable } from "stream";
import csv from "csv-parser";

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
export const getProspectById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT p.*, 
        pd.DispositionName,
        pes.EmailName,
        pp.ProviderName
        pos.IndustryName
      FROM prospects p
      LEFT JOIN prospects_disposition pd ON p.DispositionCode = pd.DispositionCode
      LEFT JOIN prospects_email_status pes ON p.EmailCode = pes.EmailCode
      LEFT JOIN prospects_industry pos ON p.IndustryCode = pos.IndustryCode
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

    console.log(
      `File received: ${req.file.originalname}, Size: ${req.file.size} bytes`
    );

    // Get valid values from reference tables
    const [validDispositions] = await pool.query(
      "SELECT DispositionCode FROM prospects_disposition"
    );
    const [validEmailStatuses] = await pool.query(
      "SELECT EmailCode FROM prospects_email_status"
    );
    const [validProviders] = await pool.query(
      "SELECT ProviderCode FROM prospects_provider"
    );
    const [validIndustries] = await pool.query(
      "SELECT IndustryCode FROM prospects_industry"
    );

    const validDispositionCodes = validDispositions.map(
      (d) => d.DispositionCode
    );
    const validIndustryCodes = validIndustries.map((i) => i.IndustryCode);
    const validEmailCodes = validEmailStatuses.map((e) => e.EmailCode);
    const validProviderCodes = validProviders.map((p) => p.ProviderCode);

    const csv = await import("csv-parser");

    const results = [];
    const errors = [];

    // Parse CSV from buffer
    console.log("Starting CSV parsing...");
    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv.default())
        .on("data", (data) => {
          results.push(data);
          // Progress indicator for parsing
          if (results.length % 5000 === 0) {
            console.log(`Parsed ${results.length} rows...`);
          }
        })
        .on("end", resolve)
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          reject(error);
        });
    });

    console.log(`CSV parsing completed. Total rows: ${results.length}`);

    // Validate and prepare data in batches
    const BATCH_SIZE = 1000;
    const importedProspects = [];
    let successfulImports = 0;
    let totalProcessed = 0;
    let totalBatches = Math.ceil(results.length / BATCH_SIZE);

    console.log(
      `Processing ${totalBatches} batches of ${BATCH_SIZE} records each...`
    );

    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);
      const batchProspects = [];
      const batchErrors = [];
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

      console.log(`Processing batch ${currentBatch}/${totalBatches}...`);

      // Validate batch
      for (const [index, row] of batch.entries()) {
        const rowNumber = i + index + 1;
        try {
          // Validate required fields
          if (!row.Fullname || !row.Email || !row.Company) {
            batchErrors.push(
              `Row ${rowNumber}: Missing required fields (Fullname, Email, or Company)`
            );
            continue;
          }

          // Validate foreign key values
          const dispositionCode = row.Dispositioncode?.trim() || null;
          const industryCode = row.Industry?.trim() || null;
          const emailCode = row.Emailcode?.trim() || null;
          const providerCode = row.Providercode?.trim() || null;

          if (
            dispositionCode &&
            !validDispositionCodes.includes(dispositionCode)
          ) {
            batchErrors.push(
              `Row ${rowNumber}: Invalid Dispositioncode '${dispositionCode}'`
            );
            continue;
          }

          if (industryCode && !validIndustryCodes.includes(industryCode)) {
            batchErrors.push(
              `Row ${rowNumber}: Invalid IndustryCode '${industryCode}'`
            );
            continue;
          }

          if (emailCode && !validEmailCodes.includes(emailCode)) {
            batchErrors.push(
              `Row ${rowNumber}: Invalid Emailcode '${emailCode}'`
            );
            continue;
          }

          if (providerCode && !validProviderCodes.includes(providerCode)) {
            batchErrors.push(
              `Row ${rowNumber}: Invalid Providercode '${providerCode}'`
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
            Emailcode: emailCode,
            Address: row.Address || "",
            Street: row.Street || "",
            City: row.City || "",
            State: row.State || "",
            Postalcode: row.Postalcode || "",
            Country: row.Country || "",
            Annualrevenue: parseFloat(row.Annualrevenue) || 0,
            Industry: industryCode,
            Employeesize: parseInt(row.Employeesize) || 0,
            Siccode: parseInt(row.Siccode) || 0,
            Naicscode: parseInt(row.Naicscode) || 0,
            Dispositioncode: dispositionCode,
            Providercode: providerCode,
            Comments: row.Comments || "",
            Department: row.Department || "",
            Seniority: row.Seniority || "",
            Status: row.Status || "New",
            CreatedBy: req.user.userId,
          };

          batchProspects.push(prospect);
        } catch (error) {
          batchErrors.push(`Row ${rowNumber}: ${error.message}`);
        }
      }

      // Insert batch using bulk insert
      if (batchProspects.length > 0) {
        try {
          connection = await pool.getConnection();
          await connection.beginTransaction();

          // Create bulk insert query
          const placeholders = batchProspects
            .map(
              () =>
                `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .join(",");

          const values = [];
          batchProspects.forEach((prospect) => {
            values.push(
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
              prospect.CreatedBy
            );
          });

          const query = `
            INSERT INTO prospects (
              Fullname, Firstname, Lastname, Jobtitle, Company, Website,
              Personallinkedin, Companylinkedin, Altphonenumber, Companyphonenumber,
              Email, Emailcode, Address, Street, City, State, Postalcode, Country,
              Annualrevenue, Industry, Employeesize, Siccode, Naicscode,
              Dispositioncode, Providercode, Comments, Department, Seniority, Status, CreatedBy
            ) VALUES ${placeholders}
          `;

          const [result] = await connection.query(query, values);
          successfulImports += result.affectedRows;
          await connection.commit();

          console.log(
            `✓ Batch ${currentBatch}: Inserted ${batchProspects.length} prospects`
          );
        } catch (error) {
          if (connection) await connection.rollback();
          batchErrors.push(
            `Batch ${currentBatch} insert error: ${error.message}`
          );
          console.error("Batch insert error:", error);
        } finally {
          if (connection) {
            connection.release();
            connection = null;
          }
        }
      }

      errors.push(...batchErrors);
      totalProcessed += batch.length;

      // Progress logging
      const progress = ((totalProcessed / results.length) * 100).toFixed(1);
      console.log(
        `Progress: ${progress}% (${totalProcessed}/${results.length})`
      );
    }

    console.log(
      `Import completed. Successful: ${successfulImports}, Errors: ${errors.length}`
    );

    res.json({
      success: true,
      message: `Import completed. Successfully imported ${successfulImports} out of ${results.length} prospects`,
      importedCount: successfulImports,
      errorCount: errors.length,
      totalRows: results.length,
      errors: errors.slice(0, 50), // Return first 50 errors only
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
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
