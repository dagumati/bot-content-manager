const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const moment = require('moment');

class GoogleSheetsService {
  constructor() {
    this.sheetId = process.env.GOOGLE_SHEET_ID;
    this.serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    this.privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    this.sheets = null;
    
    this.initializeAuth();
  }

  async initializeAuth() {
    try {
      const auth = new GoogleAuth({
        credentials: {
          client_email: this.serviceAccountEmail,
          private_key: this.privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      console.log('Google Sheets API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets API:', error.message);
      throw error;
    }
  }

  async getSheetData(range = 'Sheet1!A:D') {
    try {
      if (!this.sheets) {
        await this.initializeAuth();
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: range,
      });

      const rows = response.data.values || [];
      
      // Skip header row and map to objects
      const headers = rows[0] || ['key', 'response_text', 'notes', 'last_updated'];
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      return data;
    } catch (error) {
      console.error('Error fetching sheet data:', error.message);
      throw new Error('Failed to fetch data from Google Sheet');
    }
  }

  async addRow(data) {
    try {
      if (!this.sheets) {
        await this.initializeAuth();
      }

      const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
      const row = [data.key, data.response_text, data.notes || '', timestamp];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetId,
        range: 'Sheet1!A:D',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [row],
        },
      });

      return { ...data, last_updated: timestamp };
    } catch (error) {
      console.error('Error adding row:', error.message);
      throw new Error('Failed to add new response to Google Sheet');
    }
  }

  async updateRow(key, data) {
    try {
      if (!this.sheets) {
        await this.initializeAuth();
      }

      // First, get all data to find the row index
      const allData = await this.getSheetData();
      const rowIndex = allData.findIndex(row => row.key === key);

      if (rowIndex === -1) {
        throw new Error('Response not found');
      }

      // Row index in Google Sheets is 1-based, and we need to account for header row
      const actualRowIndex = rowIndex + 2;

      const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
      
      // Update specific cells
      const updates = [
        {
          range: `Sheet1!B${actualRowIndex}`,
          values: [[data.response_text]],
        },
        {
          range: `Sheet1!C${actualRowIndex}`,
          values: [[data.notes || '']],
        },
        {
          range: `Sheet1!D${actualRowIndex}`,
          values: [[timestamp]],
        },
      ];

      const batchUpdateRequests = updates.map(update => ({
        updateCells: {
          range: {
            sheetId: 0,
            startRowIndex: actualRowIndex - 1,
            endRowIndex: actualRowIndex,
            startColumnIndex: update.range.includes('B') ? 1 : update.range.includes('C') ? 2 : 3,
            endColumnIndex: update.range.includes('B') ? 2 : update.range.includes('C') ? 3 : 4,
          },
          rows: [{
            values: [{
              userEnteredValue: { stringValue: update.values[0][0] }
            }]
          }],
          fields: 'userEnteredValue.stringValue',
        },
      }));

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: batchUpdateRequests,
        },
      });

      return { key, ...data, last_updated: timestamp };
    } catch (error) {
      console.error('Error updating row:', error.message);
      throw new Error('Failed to update response in Google Sheet');
    }
  }

  async deleteRow(key) {
    try {
      if (!this.sheets) {
        await this.initializeAuth();
      }

      // First, get all data to find the row index
      const allData = await this.getSheetData();
      const rowIndex = allData.findIndex(row => row.key === key);

      if (rowIndex === -1) {
        throw new Error('Response not found');
      }

      // Row index in Google Sheets is 1-based, and we need to account for header row
      const actualRowIndex = rowIndex + 2;

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: actualRowIndex - 1,
                endIndex: actualRowIndex,
              },
            },
          }],
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting row:', error.message);
      throw new Error('Failed to delete response from Google Sheet');
    }
  }

  async getResponseByKey(key) {
    try {
      const allData = await this.getSheetData();
      const response = allData.find(row => row.key === key);
      
      if (!response) {
        throw new Error('Response not found');
      }

      return response;
    } catch (error) {
      console.error('Error getting response by key:', error.message);
      throw new Error('Failed to fetch response from Google Sheet');
    }
  }

  async searchResponses(query, limit = 100) {
    try {
      const allData = await this.getSheetData();
      
      if (!query) {
        return allData.slice(0, limit);
      }

      const searchTerm = query.toLowerCase();
      const filtered = allData.filter(row => 
        row.key.toLowerCase().includes(searchTerm) ||
        row.response_text.toLowerCase().includes(searchTerm) ||
        (row.notes && row.notes.toLowerCase().includes(searchTerm))
      );

      return filtered.slice(0, limit);
    } catch (error) {
      console.error('Error searching responses:', error.message);
      throw new Error('Failed to search responses in Google Sheet');
    }
  }
}

module.exports = new GoogleSheetsService();
