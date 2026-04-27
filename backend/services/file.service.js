const pdfParse = require('pdf-parse');
const fs = require('fs');

class FileService {
  /**
   * Process an uploaded file based on its mime type
   * @param {Object} file - The file object from multer
   * @returns {Object} Extracted data
   */
  static async processFile(file) {
    const result = {
      extractedText: null,
      parsedJson: null,
    };

    try {
      if (file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer);
        result.extractedText = data.text;
      } else if (file.mimetype === 'application/json') {
        const fileContent = fs.readFileSync(file.path, 'utf8');
        result.parsedJson = JSON.parse(fileContent);
        // Stringify the JSON back to text for easy display
        result.extractedText = JSON.stringify(result.parsedJson, null, 2);
      } else if (file.mimetype.startsWith('image/')) {
        // Future: Add OCR processing here
        result.extractedText = '[Image uploaded. OCR extraction pending in future updates.]';
      }
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process file: ${error.message}`);
    }

    return result;
  }
}

module.exports = FileService;
