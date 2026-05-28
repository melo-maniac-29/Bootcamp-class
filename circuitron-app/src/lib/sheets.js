import { google } from 'googleapis';

let sheetsClient = null;

export async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    return null;
  }
}

/**
 * Appends a row of data to a specific tab in the Google Spreadsheet
 * @param {string} tabName - The name of the tab (e.g., 'Participants', 'Submissions')
 * @param {Array<string|number>} rowData - An array representing columns in the row
 */
export async function appendToSheet(tabName, rowData) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (!sheets || !spreadsheetId) {
    console.warn('Google Sheets integration is not configured. Skipping sync.');
    return { success: false, reason: 'unconfigured' };
  }

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tabName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });
    
    return { success: true, data: response.data };
  } catch (err) {
    console.error(`Error appending to sheet [${tabName}]:`, err.message);
    throw err;
  }
}
