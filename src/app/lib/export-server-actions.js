"use server";

import supabase from "./supabase.server";
import { saveLongPdf } from "./saveLongPdf";

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

// Helper function to create PDF content
function convertToPDF(data, title) {
  if (!data || data.length === 0) {
    return `Table: ${title}\nNo data available\n`;
  }

  const headers = Object.keys(data[0]);
  let pdfContent = `Table: ${title}\n`;
  pdfContent += `Generated: ${new Date().toLocaleString()}\n\n`;

  data.forEach((row, index) => {
    pdfContent += "-".repeat(100) + "\n";
    pdfContent += `Record ${index + 1}:\n`;
    headers.forEach((header) => {
      const value = row[header];
      pdfContent += `  ${header}: ${value || "N/A"}\n`;
    });
  });

  return pdfContent;
}

// Function to export all data from Supabase
export async function exportAllDataAction(format = "json") {
  try {

    const exportData = {
      timestamp: new Date().toISOString(),
      format: format,
      tables: {},
    };

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

    for (const tableName of tables) {
      try {

        const { data, error } = await supabase.from(tableName).select("*");

        if (error) {
          console.error(`Error exporting ${tableName}:`, error);
          exportData.tables[tableName] = {
            error: error.message,
            data: null,
          };
        } else {
          exportData.tables[tableName] = {
            count: data?.length || 0,
            data: data || [],
          };
        }
      } catch (tableError) {
        console.error(
          `Unexpected error exporting ${tableName}:`,
          tableError,
        );
        exportData.tables[tableName] = {
          error: tableError.message,
          data: null,
        };
      }
    }

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
      mimeType = "application/pdf";
    } else {
      fileContent = JSON.stringify(exportData, null, 2);
      fileName = `supabase-export-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
    }

    return {
      success: true,
      message: `Export prepared successfully in ${format.toUpperCase()} format`,
      fileContent,
      fileName,
      mimeType,
      format,
    };
  } catch (error) {
    console.error("Export failed:", error);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
}

// Function to export specific table
export async function exportTableAction(tableName, format = "json") {
  try {

    const { data, error } = await supabase.from(tableName).select("*");

    if (error) {
      console.error(`Error exporting ${tableName}:`, error);
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

    let fileContent, fileName, mimeType;

    if (format === "csv") {
      fileContent = convertToCSV(data || [], tableName);
      fileName = `${tableName.toLowerCase().replace(/\s+/g, "-")}-export-${new Date().toISOString().split("T")[0]}.csv`;
      mimeType = "text/csv";
    } else if (format === "pdf") {
      fileContent = convertToPDF(data || [], tableName);
      fileName = `export-${tableName}.pdf`;
      mimeType = "application/pdf";
    } else {
      fileContent = JSON.stringify(exportData, null, 2);
      fileName = `${tableName.toLowerCase().replace(/\s+/g, "-")}-export-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
    }

    return {
      success: true,
      message: `${tableName} export prepared successfully in ${format.toUpperCase()} format`,
      fileContent,
      fileName,
      mimeType,
      format,
    };
  } catch (error) {
    console.error(`Error exporting ${tableName}:`, error);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
}

// Function to export youth intake data
export async function exportYouthIntakeDataAction(format = "json") {
  try {

    const exportData = {
      timestamp: new Date().toISOString(),
      type: "Youth Intake Export",
      format: format,
      tables: {},
    };

    const { data: youthClients, error: clientsError } = await supabase
      .from("Clients")
      .select("*")
      .eq("clientType", "Youth Intake");

    if (clientsError) {
      console.error("Error exporting youth clients:", clientsError);
      exportData.tables.Clients = { error: clientsError.message, data: null };
    } else {
      exportData.tables.Clients = {
        count: youthClients?.length || 0,
        data: youthClients || [],
      };
    }

    if (youthClients && youthClients.length > 0) {
      const clientIds = youthClients.map((client) => client.client_id);

      const { data: homeMembers, error: homeError } = await supabase
        .from("Home Members")
        .select("*")
        .in("client_id", clientIds);

      if (homeError) {
        console.error("Error exporting home members:", homeError);
        exportData.tables["Home Members"] = {
          error: homeError.message,
          data: null,
        };
      } else {
        exportData.tables["Home Members"] = {
          count: homeMembers?.length || 0,
          data: homeMembers || [],
        };
      }

      const { data: educationalPersons, error: eduError } = await supabase
        .from("Educational Support Persons")
        .select("*")
        .in("client_id", clientIds);

      if (eduError) {
        console.error("Error exporting educational persons:", eduError);
        exportData.tables["Educational Support Persons"] = {
          error: eduError.message,
          data: null,
        };
      } else {
        exportData.tables["Educational Support Persons"] = {
          count: educationalPersons?.length || 0,
          data: educationalPersons || [],
        };
      }

      const { data: emergencyContacts, error: emergencyError } = await supabase
        .from("Emergency Contacts")
        .select("*")
        .in("client_id", clientIds);

      if (emergencyError) {
        console.error("Error exporting emergency contacts:", emergencyError);
        exportData.tables["Emergency Contacts"] = {
          error: emergencyError.message,
          data: null,
        };
      } else {
        exportData.tables["Emergency Contacts"] = {
          count: emergencyContacts?.length || 0,
          data: emergencyContacts || [],
        };
      }
    }

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
      mimeType = "application/pdf";
    } else {
      fileContent = JSON.stringify(exportData, null, 2);
      fileName = `youth-intake-export-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
    }

    return {
      success: true,
      message: `Youth Intake export prepared successfully in ${format.toUpperCase()} format`,
      fileContent,
      fileName,
      mimeType,
      format,
    };
  } catch (error) {
    console.error("Error exporting youth intake data:", error);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
}
