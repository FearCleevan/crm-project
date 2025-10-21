function transferAndCleanData() {
  try {
    console.log('Starting data transfer process...');
    
    // SOURCE 1: Original Masterlist (Uncleaned) - Sheet1
    const source1 = {
      id: '1daK1DsThWH_wW8FyX-Oeu399RlVcpQCve6dybSecfNA',
      sheetName: 'Sheet1',
      type: 'original'
    };
    
    // SOURCE 2: New Masterlist Format - Restaurant
    const source2 = {
      id: '1daK1DsThWH_wW8FyX-Oeu399RlVcpQCve6dybSecfNA',
      sheetName: 'Restaurant',
      type: 'new'
    };
    
    // SOURCE 3: Additional Sheet - Sheet3
    const source3 = {
      id: '1daK1DsThWH_wW8FyX-Oeu399RlVcpQCve6dybSecfNA',
      sheetName: 'Sheet3',
      type: 'original'
    };
    
    // SOURCE 4: USA Sheet - New Uncleaned Masterlist
    const source4 = {
      id: '17ofQ1xJX1Ue8WWCAFIO_OloVRezFsSijGymuEu6aUoc',
      sheetName: 'USA',
      type: 'usa'
    };
    
    // Destination spreadsheet (Cleaned Masterlist)
    const destSpreadsheetId = '18m5GMfnLA4VNtCWkXpSTkXX-dwpwwstYOImaPOQuR4g';
    const destSheetName = 'Paul List';
    
    // Determine which source to use - default to source4 (USA format) for now
    let selectedSource = source4; // Default to USA sheet
    
    console.log('Selected source:', selectedSource.type, 'Sheet:', selectedSource.sheetName);
    
    // Open spreadsheets and sheets
    const sourceSS = SpreadsheetApp.openById(selectedSource.id);
    const destSS = SpreadsheetApp.openById(destSpreadsheetId);
    const sourceSheet = sourceSS.getSheetByName(selectedSource.sheetName);
    const destSheet = destSS.getSheetByName(destSheetName);
    
    if (!sourceSheet) {
      throw new Error('Source sheet not found: ' + selectedSource.sheetName);
    }
    if (!destSheet) {
      throw new Error('Destination sheet not found: ' + destSheetName);
    }
    
    console.log('Reading source data...');
    
    // Get all data from source sheet
    const sourceData = sourceSheet.getDataRange().getValues();
    const sourceHeaders = sourceData[0];
    
    console.log('Source headers:', sourceHeaders);
    console.log('Source data rows:', sourceData.length - 1);
    
    // Get headers from destination sheet
    const destHeadersRange = destSheet.getRange(1, 1, 1, destSheet.getLastColumn());
    const destHeaders = destHeadersRange.getValues()[0];
    
    console.log('Destination headers:', destHeaders);
    
    // Create mapping based on source type
    let columnMapping;
    if (selectedSource.type === 'new') {
      columnMapping = createNewFormatMapping(sourceHeaders, destHeaders);
    } else if (selectedSource.type === 'usa') {
      columnMapping = createUSAMapping(sourceHeaders, destHeaders);
    } else {
      columnMapping = createOriginalMapping(sourceHeaders, destHeaders);
    }
    
    console.log('Column mapping created');
    
    // Process and transform the data
    const processedData = processData(sourceData, columnMapping, sourceHeaders, destHeaders);
    
    console.log('Data processed. Rows to transfer:', processedData.length - 1);
    
    // Find the next empty row for appending (skip header row)
    const lastRow = destSheet.getLastRow();
    const startRow = lastRow > 1 ? lastRow + 1 : 2;
    
    console.log('Last row in destination:', lastRow);
    console.log('Starting to append from row:', startRow);
    
    // Write processed data to destination sheet (APPEND, don't overwrite)
    if (processedData.length > 1) {
      console.log('Appending new data to destination...');
      const outputRange = destSheet.getRange(startRow, 1, processedData.length - 1, processedData[0].length);
      outputRange.setValues(processedData.slice(1));
    }
    
    console.log(`Successfully appended ${processedData.length - 1} rows of data`);
    
    return `Successfully appended ${processedData.length - 1} rows from ${selectedSource.sheetName} to ${destSheetName} (starting from row ${startRow})`;
    
  } catch (error) {
    console.error('Error in transferAndCleanData:', error);
    throw error;
  }
}

// NEW: Mapping for USA format with intelligent data detection
function createUSAMapping(sourceHeaders, destHeaders) {
  const mapping = {};
  
  const sourceHeadersLower = sourceHeaders.map(h => h.toString().toLowerCase().trim());
  const destHeadersLower = destHeaders.map(h => h.toString().toLowerCase().trim());
  
  console.log('USA Format - Source headers (lower):', sourceHeadersLower);
  console.log('USA Format - Dest headers (lower):', destHeadersLower);
  
  // Direct mappings for USA format
  const usaMappings = {
    'fullname': 'contact full name',
    'firstname': 'contact full name',
    'lastname': 'contact full name',
    'jobtitle': 'title',
    'company': 'company name - cleaned',
    'website': 'website',
    'personallinkedin': 'contact li profile url',
    'companylinkedin': 'company li profile url',
    'altphonenumber': 'contact phone 1',
    'companyphonenumber': 'company phone 1',
    'email': ['primary email', 'email 1'],
    'address': 'company location',
    'street': 'company street 1',
    'city': 'company city',
    'state': 'company state',
    'postalcode': 'company post code',
    'country': 'company country',
    'annualrevenue': 'company annual revenue',
    'industry': 'company industry',
    'employeesize': 'company staff count'
  };
  
  // Create basic mapping
  for (const [destHeader, sourceHeader] of Object.entries(usaMappings)) {
    const destIndex = destHeadersLower.indexOf(destHeader);
    
    if (destIndex !== -1) {
      let sourceIndex = -1;
      
      if (Array.isArray(sourceHeader)) {
        for (const header of sourceHeader) {
          sourceIndex = sourceHeadersLower.indexOf(header.toLowerCase());
          if (sourceIndex !== -1) break;
        }
      } else if (sourceHeader) {
        sourceIndex = sourceHeadersLower.indexOf(sourceHeader.toLowerCase());
      }
      
      console.log(`USA Mapping ${destHeader} to ${sourceHeader}: destIndex=${destIndex}, sourceIndex=${sourceIndex}`);
      
      if (sourceIndex !== -1) {
        mapping[destIndex] = {
          sourceIndex: sourceIndex,
          transform: getTransformationFunction(destHeader),
          dataType: getDataTypeForColumn(destHeader)
        };
      } else {
        mapping[destIndex] = {
          sourceIndex: -1,
          transform: () => '',
          dataType: getDataTypeForColumn(destHeader)
        };
      }
    }
  }
  
  // Handle columns without direct mapping
  destHeadersLower.forEach((header, index) => {
    if (!mapping[index]) {
      mapping[index] = {
        sourceIndex: -1,
        transform: () => '',
        dataType: getDataTypeForColumn(header)
      };
    }
  });
  
  return mapping;
}

// NEW: Function to detect data type for intelligent mapping
function getDataTypeForColumn(columnName) {
  const dataTypes = {
    'email': 'email',
    'website': 'website',
    'phone': 'phone',
    'address': 'address',
    'city': 'city',
    'state': 'state',
    'postalcode': 'postalcode',
    'country': 'country',
    'company': 'company',
    'fullname': 'name',
    'firstname': 'name',
    'lastname': 'name',
    'jobtitle': 'jobtitle'
  };
  
  return dataTypes[columnName] || 'text';
}

// NEW: Function to intelligently detect and extract data from mixed columns
function intelligentDataExtraction(value, expectedDataType, allRowData = []) {
  if (!value) return '';
  
  const stringValue = String(value).trim();
  if (!stringValue) return '';
  
  // Regex patterns for different data types
  const patterns = {
    'email': /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    'phone': /(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
    'website': /(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/g,
    'postalcode': /\b\d{5}(?:-\d{4})?\b/g,
    'state': /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/gi
  };
  
  // If we're looking for a specific data type and it matches, return it
  if (expectedDataType && patterns[expectedDataType]) {
    const match = stringValue.match(patterns[expectedDataType]);
    if (match) return match[0];
  }
  
  // If no specific type or not found, try to detect what type of data this is
  if (patterns.email.test(stringValue)) {
    const emailMatch = stringValue.match(patterns.email);
    if (emailMatch) return emailMatch[0];
  }
  
  if (patterns.website.test(stringValue)) {
    const websiteMatch = stringValue.match(patterns.website);
    if (websiteMatch) return websiteMatch[0];
  }
  
  if (patterns.phone.test(stringValue)) {
    const phoneMatch = stringValue.match(patterns.phone);
    if (phoneMatch) return phoneMatch[0];
  }
  
  // For addresses, look for common address indicators
  if (stringValue.match(/\b(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\b/gi)) {
    return stringValue;
  }
  
  // For company names, look for common business suffixes
  if (stringValue.match(/\b(inc|llc|corp|corporation|company|co|ltd|limited|group)\b/gi)) {
    return stringValue;
  }
  
  // For job titles, look for common title words
  if (stringValue.match(/\b(manager|director|president|ceo|cfo|cto|vp|vice president|assistant|executive|head of|specialist|analyst)\b/gi)) {
    return stringValue;
  }
  
  return stringValue;
}

// UPDATED processData function with intelligent data detection
function processData(sourceData, columnMapping, sourceHeaders, destHeaders) {
  const processedData = [destHeaders];
  
  for (let i = 1; i < sourceData.length; i++) {
    const sourceRow = sourceData[i];
    let processedRow = new Array(destHeaders.length).fill('');
    
    // First pass: Apply direct mappings
    for (const [destIndex, mapping] of Object.entries(columnMapping)) {
      const destIdx = parseInt(destIndex);
      
      if (mapping.sourceIndex !== -1 && mapping.sourceIndex < sourceRow.length) {
        const sourceValue = sourceRow[mapping.sourceIndex];
        processedRow[destIdx] = mapping.transform(sourceValue);
      } else {
        processedRow[destIdx] = mapping.transform();
      }
    }
    
    // Second pass: Intelligent data detection for empty fields
    processedRow = applyIntelligentDataDetection(processedRow, sourceRow, sourceHeaders, destHeaders, columnMapping);
    
    // Third pass: Fix mixed data
    processedRow = fixMixedTitleCompanyData(processedRow, sourceRow, sourceHeaders, destHeaders);
    
    processedData.push(processedRow);
  }
  
  return processedData;
}

// NEW: Function to apply intelligent data detection
function applyIntelligentDataDetection(processedRow, sourceRow, sourceHeaders, destHeaders, columnMapping) {
  const updatedRow = [...processedRow];
  
  // Get destination column indices for key fields
  const emailIndex = destHeaders.indexOf('Email');
  const websiteIndex = destHeaders.indexOf('Website');
  const phoneIndex = destHeaders.indexOf('Companyphonenumber');
  const altPhoneIndex = destHeaders.indexOf('Altphonenumber');
  const addressIndex = destHeaders.indexOf('Address');
  const cityIndex = destHeaders.indexOf('City');
  const stateIndex = destHeaders.indexOf('State');
  const postalCodeIndex = destHeaders.indexOf('Postalcode');
  const companyIndex = destHeaders.indexOf('Company');
  const jobTitleIndex = destHeaders.indexOf('Jobtitle');
  
  // Scan all source columns for misplaced data
  for (let srcCol = 0; srcCol < sourceRow.length; srcCol++) {
    const sourceValue = sourceRow[srcCol];
    if (!sourceValue) continue;
    
    const stringValue = String(sourceValue).trim();
    if (!stringValue) continue;
    
    // Check for emails in non-email columns
    if (emailIndex !== -1 && (!updatedRow[emailIndex] || updatedRow[emailIndex] === '')) {
      const email = intelligentDataExtraction(stringValue, 'email');
      if (email && email !== stringValue) {
        updatedRow[emailIndex] = email;
      }
    }
    
    // Check for websites in non-website columns
    if (websiteIndex !== -1 && (!updatedRow[websiteIndex] || updatedRow[websiteIndex] === '')) {
      const website = intelligentDataExtraction(stringValue, 'website');
      if (website && website !== stringValue) {
        updatedRow[websiteIndex] = cleanWebsite(website);
      }
    }
    
    // Check for phones in non-phone columns
    if ((phoneIndex !== -1 && (!updatedRow[phoneIndex] || updatedRow[phoneIndex] === '')) ||
        (altPhoneIndex !== -1 && (!updatedRow[altPhoneIndex] || updatedRow[altPhoneIndex] === ''))) {
      const phone = intelligentDataExtraction(stringValue, 'phone');
      if (phone) {
        if (phoneIndex !== -1 && (!updatedRow[phoneIndex] || updatedRow[phoneIndex] === '')) {
          updatedRow[phoneIndex] = phone;
        } else if (altPhoneIndex !== -1 && (!updatedRow[altPhoneIndex] || updatedRow[altPhoneIndex] === '')) {
          updatedRow[altPhoneIndex] = phone;
        }
      }
    }
    
    // Check for addresses
    if (addressIndex !== -1 && (!updatedRow[addressIndex] || updatedRow[addressIndex] === '')) {
      const address = intelligentDataExtraction(stringValue, 'address');
      if (address && address !== stringValue) {
        updatedRow[addressIndex] = address;
      }
    }
    
    // Check for company names in non-company columns
    if (companyIndex !== -1 && (!updatedRow[companyIndex] || updatedRow[companyIndex] === '')) {
      const company = intelligentDataExtraction(stringValue, 'company');
      if (company && company !== stringValue) {
        updatedRow[companyIndex] = company;
      }
    }
    
    // Check for job titles in non-title columns
    if (jobTitleIndex !== -1 && (!updatedRow[jobTitleIndex] || updatedRow[jobTitleIndex] === '')) {
      const jobTitle = intelligentDataExtraction(stringValue, 'jobtitle');
      if (jobTitle && jobTitle !== stringValue) {
        updatedRow[jobTitleIndex] = jobTitle;
      }
    }
  }
  
  return updatedRow;
}

// Specific function for USA format
function transferFromUSA() {
  const sourceSpreadsheetId = '17ofQ1xJX1Ue8WWCAFIO_OloVRezFsSijGymuEu6aUoc';
  const sourceSheetName = 'USA';
  
  return transferFromSpecificSource(sourceSpreadsheetId, sourceSheetName, 'usa');
}

// Updated transferFromSpecificSource to handle USA format
function transferFromSpecificSource(sourceSpreadsheetId, sourceSheetName, formatType) {
  try {
    console.log(`Transferring from ${formatType} format - Sheet: ${sourceSheetName}...`);
    
    const destSpreadsheetId = '18m5GMfnLA4VNtCWkXpSTkXX-dwpwwstYOImaPOQuR4g';
    const destSheetName = 'Paul List';
    
    // Open spreadsheets
    const sourceSS = SpreadsheetApp.openById(sourceSpreadsheetId);
    const destSS = SpreadsheetApp.openById(destSpreadsheetId);
    const sourceSheet = sourceSS.getSheetByName(sourceSheetName);
    const destSheet = destSS.getSheetByName(destSheetName);
    
    if (!sourceSheet) {
      throw new Error('Source sheet not found: ' + sourceSheetName);
    }
    if (!destSheet) {
      throw new Error('Destination sheet not found: ' + destSheetName);
    }
    
    // Get data
    const sourceData = sourceSheet.getDataRange().getValues();
    const sourceHeaders = sourceData[0];
    const destHeaders = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0];
    
    // Choose mapping based on format type
    let columnMapping;
    if (formatType === 'new') {
      columnMapping = createNewFormatMapping(sourceHeaders, destHeaders);
    } else if (formatType === 'usa') {
      columnMapping = createUSAMapping(sourceHeaders, destHeaders);
    } else {
      columnMapping = createOriginalMapping(sourceHeaders, destHeaders);
    }
    
    // Process data
    const processedData = processData(sourceData, columnMapping, sourceHeaders, destHeaders);
    
    // Find the next empty row for appending
    const lastRow = destSheet.getLastRow();
    const startRow = lastRow > 1 ? lastRow + 1 : 2;
    
    console.log(`Last row in destination: ${lastRow}, starting from row: ${startRow}`);
    
    // Append data (don't clear existing data)
    if (processedData.length > 1) {
      destSheet.getRange(startRow, 1, processedData.length - 1, processedData[0].length)
        .setValues(processedData.slice(1));
    }
    
    console.log(`Successfully appended ${processedData.length - 1} rows from ${sourceSheetName}`);
    return `Appended ${processedData.length - 1} rows from ${sourceSheetName} (starting from row ${startRow})`;
    
  } catch (error) {
    console.error(`Error in transferFromSpecificSource (${sourceSheetName}):`, error);
    throw error;
  }
}

// Updated transferFromAllSheets to include USA sheet
function transferFromAllSheets() {
  try {
    const sheetsToTransfer = [
      { name: 'Sheet1', type: 'original' },
      { name: 'Restaurant', type: 'new' },
      { name: 'Sheet3', type: 'original' },
      { name: 'USA', type: 'usa', id: '17ofQ1xJX1Ue8WWCAFIO_OloVRezFsSijGymuEu6aUoc' }
    ];
    
    let totalTransferred = 0;
    let results = [];
    
    for (const sheet of sheetsToTransfer) {
      try {
        console.log(`Transferring from ${sheet.name}...`);
        const sourceId = sheet.id || '1daK1DsThWH_wW8FyX-Oeu399RlVcpQCve6dybSecfNA';
        const result = transferFromSpecificSource(sourceId, sheet.name, sheet.type);
        results.push(result);
        
        // Extract number of rows transferred from result message
        const match = result.match(/Appended (\d+) rows/);
        if (match) {
          totalTransferred += parseInt(match[1]);
        }
        
      } catch (error) {
        console.error(`Error transferring from ${sheet.name}:`, error);
        results.push(`Error transferring from ${sheet.name}: ${error.message}`);
      }
    }
    
    return `All sheets transfer completed! Total rows appended: ${totalTransferred}\n\nDetails:\n- ${results.join('\n- ')}`;
    
  } catch (error) {
    console.error('Error in transferFromAllSheets:', error);
    throw error;
  }
}

// Updated menu function to include USA sheet
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('Data Transfer');
    
    // Transfer from uncleaned sources to Paul List
    menu.addItem('Transfer from Sheet1 (Sheet1)', 'transferFromOriginalFormat');
    menu.addItem('Transfer from Restaurant (Restaurant)', 'transferFromNewFormat');
    menu.addItem('Transfer from Sheet3 (Sheet3)', 'transferFromSheet3');
    menu.addItem('Transfer from USA (USA)', 'transferFromUSA'); // NEW
    menu.addSeparator();
    menu.addItem('Transfer from ALL Sheets', 'transferFromAllSheets');
    menu.addItem('Transfer Data (Auto)', 'transferAndCleanData');
    menu.addSeparator();
    menu.addItem('Transfer with Duplicate Check', 'transferWithDuplicateCheck');
    menu.addSeparator();
    
    // Transfer from Paul List to ALL List
    menu.addItem('▶ Paul List → ALL List (Full)', 'transferPaulListToAllList');
    menu.addItem('▶ Paul List → ALL List (New Rows Only)', 'transferNewRowsToAllList');
    menu.addItem('▶ Paul List → ALL List (ALL DATA - No Duplicate Check)', 'transferAllPaulListToAllList');
    menu.addSeparator();
    
    // Status and management
    menu.addItem('Check Destination Status', 'getDestinationStatus');
    menu.addItem('Check Transfer Status', 'getTransferStatus');
    menu.addItem('Reset Transfer Tracking', 'resetTransferTracking');
    
    menu.addToUi();
    
  } catch (error) {
    console.error('Error creating menu:', error);
  }
}

// Add test function for USA sheet
function testUSAAccess() {
  try {
    const sourceSS = SpreadsheetApp.openById('17ofQ1xJX1Ue8WWCAFIO_OloVRezFsSijGymuEu6aUoc');
    const destSS = SpreadsheetApp.openById('18m5GMfnLA4VNtCWkXpSTkXX-dwpwwstYOImaPOQuR4g');
    
    console.log('USA Source spreadsheet accessible:', sourceSS.getName());
    console.log('Destination spreadsheet accessible:', destSS.getName());
    
    const usaSheet = sourceSS.getSheetByName('USA');
    console.log('USA sheet exists:', !!usaSheet);
    
    if (usaSheet) {
      const data = usaSheet.getDataRange().getValues();
      console.log('USA sheet headers:', data[0]);
      console.log('USA sheet rows:', data.length - 1);
    }
    
    return 'USA access test successful!';
  } catch (error) {
    console.error('USA access test failed:', error);
    return 'USA access test failed: ' + error.message;
  }
}

// Keep all the existing functions below (they remain the same)
// [Include all the previous functions: createOriginalMapping, createNewFormatMapping, 
// transferFromNewFormat, transferFromOriginalFormat, transferFromSheet3, 
// transferWithDuplicateCheck, getDestinationStatus, transferPaulListToAllList, 
// transferNewRowsToAllList, transferAllPaulListToAllList, resetTransferTracking, 
// getTransferStatus, getTransformationFunction, extractFirstName, extractLastName, 
// cleanJobTitle, cleanCompanyName, cleanEmail, cleanWebsite, cleanRevenue, 
// cleanEmployeeSize, fixMixedTitleCompanyData, testAllSheetsAccess, testInternalSheetsAccess]