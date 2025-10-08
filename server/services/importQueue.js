// services/importQueue.js
import Queue from 'bull';
import pool from "../config/db.js";

export const importQueue = new Queue('prospect import', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  limiter: {
    max: 1, // Process 1 job at a time
    duration: 1000 // per second
  }
});

// Process jobs
importQueue.process('import-chunk', async (job) => {
  const { chunk, sessionId } = job.data;
  
  try {
    const result = await processChunk(chunk);
    
    // Update progress
    if (global.importSessions && global.importSessions[sessionId]) {
      global.importSessions[sessionId].processedChunks++;
      global.importSessions[sessionId].successfulImports += result.successful;
      global.importSessions[sessionId].failedImports += result.errors.length;
      global.importSessions[sessionId].chunkErrors.push(...result.errors);
    }
    
    return result;
  } catch (error) {
    console.error(`Error processing chunk in queue:`, error);
    throw error;
  }
});

async function processChunk(chunk) {
  const chunkErrors = [];
  let successfulImports = 0;
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    for (const prospect of chunk) {
      try {
        const [result] = await connection.query(
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
        chunkErrors.push(`Error inserting prospect ${prospect.Email}: ${error.message}`);
        // Continue with next prospect in chunk
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

export default importQueue;