import supabase from "../lib/supabase";
import { saveLongPdf } from "../lib/saveLongPdf";

// Helper function to convert data to CSV format
function convertToCSV(data, tableName) {
  if (!data || data.length === 0) {
    return `Table: ${tableName}\nNo data available\n`;
  }

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(",");
  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        // Handle values that contain commas, quotes, or newlines
        if (value === null || value === undefined) {
          return "";
        }
        const stringValue = String(value);
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(","),
  );

  return `Table: ${tableName}\n${csvHeaders}\n${csvRows.join("\n")}\n\n`;
}

// Helper function to create PDF content (simplified text-based PDF)
export function convertToPDF(data, title) {
  const doc = new jsPDF();
  let y = 10;

  const headers = Object.keys(data[0]);
  let pdfContent = `Table: ${tableName}\n`;
  pdfContent += `Generated: ${new Date().toLocaleString()}\n\n`;

  data.forEach((row, index) => {
    pdfContent += '-'.repeat(100) + '\n';
    pdfContent += `Record ${index + 1}:\n`;
    headers.forEach(header => {
      const value = row[header];
      pdfContent += `  ${header}: ${value || 'N/A'}\n`;
    });

    y += 5;

    if (y > 280) {
      doc.addPage();
      y = 10;
    }
  });

  return doc.output("blob");
}

// Function to export all data from Supabase as JSON files
export async function exportAllData(format = "json") {
  try {
    console.log(
      `🚀 Starting data export from Supabase in ${format.toUpperCase()} format...`,
    );

    const exportData = {
      timestamp: new Date().toISOString(),
      format: format,
      tables: {},
    };

    // List of all tables to export
    const tables = [
      "Clients",
      "Childs",
      "Home Members",
      "Educational Support Persons",
      "Emergency Contacts",
      "Important Family and Friends",
      "EIA Workers",
      "Notes",
      "Advocates",
      "Assigned Advocates",
      "First Nations",
      "CFS Agencies",
      "CFS Status",
      "User Logs",
    ];

    // Export each table
    for (const tableName of tables) {
      try {
        console.log(`📊 Exporting table: ${tableName}`);

        const { data, error } = await supabase.from(tableName).select("*");

        if (error) {
          console.error(`❌ Error exporting ${tableName}:`, error);
          exportData.tables[tableName] = {
            error: error.message,
            data: null,
          };
        } else {
          console.log(
            `✅ Successfully exported ${tableName}: ${data?.length || 0} records`,
          );
          exportData.tables[tableName] = {
            count: data?.length || 0,
            data: data || [],
          };
        }
      } catch (tableError) {
        console.error(
          `❌ Unexpected error exporting ${tableName}:`,
          tableError,
        );
        exportData.tables[tableName] = {
          error: tableError.message,
          data: null,
        };
      }
    }

    // Create downloadable file based on format
    let fileContent, fileName, mimeType;

    if (format === "csv") {
      let csvContent = `Supabase Data Export\nGenerated: ${new Date().toLocaleString()}\n\n`;
      for (const [tableName, tableData] of Object.entries(exportData.tables)) {
        if (tableData.data) {
          csvContent += convertToCSV(tableData.data, tableName);
        }
      }
      fileContent = csvContent;
      fileName = `supabase-export-${new Date().toISOString().split("T")[0]}.csv`;
      mimeType = "text/csv";
    } else if (format === "pdf") {
      let pdfContent = `Supabase Data Export\nGenerated: ${new Date().toLocaleString()}\n\n`;
      for (const [tableName, tableData] of Object.entries(exportData.tables)) {
        if (tableData.data) {
          pdfContent += convertToPDF(tableData.data, tableName);
        }
      }
      fileContent = pdfContent;
      fileName = "export.pdf";
      mimeType = 'application/pdf';
    } else {
      // JSON format (default)
      fileContent = JSON.stringify(exportData, null, 2);
      fileName = `supabase-export-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
    }
    
    // Special handling for pdfs, otherwise regular save
    if (format === 'pdf') {
      saveLongPdf(fileContent, "export.pdf");
    } else {
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    }
    
    console.log(`🎉 Data export completed successfully in ${format.toUpperCase()} format!`);
    console.log("📁 File downloaded:", fileName);

    return {
      success: true,
      message: `Export completed successfully in ${format.toUpperCase()} format`,
      data: exportData,
    };
  } catch (error) {
    console.error("❌ Export failed:", error);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
}

// Function to export specific table
export async function exportTable(tableName, format = "json") {
  try {
    console.log(
      `📊 Exporting single table: ${tableName} in ${format.toUpperCase()} format`,
    );

    const { data, error } = await supabase.from(tableName).select("*");

    if (error) {
      console.error(`❌ Error exporting ${tableName}:`, error);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      table: tableName,
      format: format,
      count: data?.length || 0,
      data: data || [],
    };

    // Create downloadable file based on format
    let fileContent, fileName, mimeType;

    if (format === "csv") {
      fileContent = convertToCSV(data || [], tableName);
      fileName = `${tableName.toLowerCase().replace(/\s+/g, "-")}-export-${new Date().toISOString().split("T")[0]}.csv`;
      mimeType = "text/csv";
    } else if (format === "pdf") {
      fileContent = convertToPDF(data || [], tableName);
      fileName = `export-${tableName}.pdf`;
      mimeType = 'application/pdf';
    } else {
      // JSON format (default)
      fileContent = JSON.stringify(exportData, null, 2);
      fileName = `${tableName.toLowerCase().replace(/\s+/g, "-")}-export-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
    }
    
    // Special handling for pdfs, otherwise regular save
    if (format === 'pdf') {
      saveLongPdf(fileContent, `export-${tableName}.pdf`);
    } else {
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    }
    
    console.log(`✅ Successfully exported ${tableName}: ${data?.length || 0} records in ${format.toUpperCase()} format`);
    
    return {
      success: true,
      message: `${tableName} export completed successfully in ${format.toUpperCase()} format`,
      data: exportData,
    };
  } catch (error) {
    console.error(`❌ Export failed for ${tableName}:`, error);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
}

// Function to export youth intake data specifically
export async function exportYouthIntakeData(format = "json") {
  try {
    console.log(
      `📊 Exporting Youth Intake specific data in ${format.toUpperCase()} format...`,
    );

    const exportData = {
      timestamp: new Date().toISOString(),
      type: "Youth Intake Export",
      format: format,
      tables: {},
    };

    // Get youth intake clients
    const { data: youthClients, error: clientsError } = await supabase
      .from("Clients")
      .select("*")
      .eq("clientType", "Youth Intake");

    if (clientsError) {
      console.error("❌ Error exporting youth clients:", clientsError);
      exportData.tables.Clients = { error: clientsError.message, data: null };
    } else {
      console.log(`✅ Youth clients: ${youthClients?.length || 0} records`);
      exportData.tables.Clients = {
        count: youthClients?.length || 0,
        data: youthClients || [],
      };
    }

    // Get related data for youth clients
    if (youthClients && youthClients.length > 0) {
      const clientIds = youthClients.map((client) => client.client_id);

      // Get home members for youth clients
      const { data: homeMembers, error: homeError } = await supabase
        .from("Home Members")
        .select("*")
        .in("client_id", clientIds);

      if (homeError) {
        console.error("❌ Error exporting home members:", homeError);
        exportData.tables["Home Members"] = {
          error: homeError.message,
          data: null,
        };
      } else {
        console.log(`✅ Home members: ${homeMembers?.length || 0} records`);
        exportData.tables["Home Members"] = {
          count: homeMembers?.length || 0,
          data: homeMembers || [],
        };
      }

      // Get educational support persons for youth clients
      const { data: educationalPersons, error: eduError } = await supabase
        .from("Educational Support Persons")
        .select("*")
        .in("client_id", clientIds);

      if (eduError) {
        console.error("❌ Error exporting educational persons:", eduError);
        exportData.tables["Educational Support Persons"] = {
          error: eduError.message,
          data: null,
        };
      } else {
        console.log(
          `✅ Educational persons: ${educationalPersons?.length || 0} records`,
        );
        exportData.tables["Educational Support Persons"] = {
          count: educationalPersons?.length || 0,
          data: educationalPersons || [],
        };
      }

      // Get emergency contacts for youth clients
      const { data: emergencyContacts, error: emergencyError } = await supabase
        .from("Emergency Contacts")
        .select("*")
        .in("client_id", clientIds);

      if (emergencyError) {
        console.error("❌ Error exporting emergency contacts:", emergencyError);
        exportData.tables["Emergency Contacts"] = {
          error: emergencyError.message,
          data: null,
        };
      } else {
        console.log(
          `✅ Emergency contacts: ${emergencyContacts?.length || 0} records`,
        );
        exportData.tables["Emergency Contacts"] = {
          count: emergencyContacts?.length || 0,
          data: emergencyContacts || [],
        };
      }
    }

    // Create downloadable file based on format
    let fileContent, fileName, mimeType;

    if (format === "csv") {
      let csvContent = `Youth Intake Data Export\nGenerated: ${new Date().toLocaleString()}\n\n`;
      for (const [tableName, tableData] of Object.entries(exportData.tables)) {
        if (tableData.data) {
          csvContent += convertToCSV(tableData.data, tableName);
        }
      }
      fileContent = csvContent;
      fileName = `youth-intake-export-${new Date().toISOString().split("T")[0]}.csv`;
      mimeType = "text/csv";
    } else if (format === "pdf") {
      let pdfContent = `Youth Intake Data Export\nGenerated: ${new Date().toLocaleString()}\n\n`;
      for (const [tableName, tableData] of Object.entries(exportData.tables)) {
        if (tableData.data) {
          pdfContent += convertToPDF(tableData.data, tableName);
        }
      }
      fileContent = pdfContent;
      fileName = "export-youth.pdf";
      mimeType = 'application/pdf';
    } else {
      // JSON format (default)
      fileContent = JSON.stringify(exportData, null, 2);
      fileName = `youth-intake-export-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
    }
    
    // Special handling for pdfs, otherwise regular save
    if (format === 'pdf') {
      saveLongPdf(fileContent, `export-youth.pdf`);
    } else {
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    }
    
    console.log(`🎉 Youth Intake export completed successfully in ${format.toUpperCase()} format!`);
    
    return {
      success: true,
      message: `Youth Intake export completed successfully in ${format.toUpperCase()} format`,
      data: exportData,
    };
  } catch (error) {
    console.error("❌ Youth Intake export failed:", error);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
}
