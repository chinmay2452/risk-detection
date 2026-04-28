const fs = require('fs');
const Tesseract = require('tesseract.js');
// pdf-parse is lazy-loaded inside the PDF branch to avoid a known startup crash
// where top-level require() triggers an internal self-test that exits the process.

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
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer);
        result.extractedText = data.text;

      } else if (file.mimetype === 'application/json') {
        const fileContent = fs.readFileSync(file.path, 'utf8');
        result.parsedJson = JSON.parse(fileContent);
        result.extractedText = JSON.stringify(result.parsedJson, null, 2);

      } else if (file.mimetype.startsWith('image/')) {
        // Use Tesseract OCR to extract text from architecture diagrams
        console.log(`[FileService] Running OCR on image: ${file.originalname}`);
        try {
          const { data: { text: ocrText } } = await Tesseract.recognize(file.path, 'eng', {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                console.log(`[FileService] OCR progress: ${Math.round(m.progress * 100)}%`);
              }
            }
          });

          const cleanedText = ocrText.trim();
          if (cleanedText && cleanedText.length > 10) {
            console.log(`[FileService] OCR extracted ${cleanedText.length} characters from image`);
            result.extractedText = `[Architecture Diagram OCR Extract from: ${file.originalname}]\n\n${cleanedText}`;
          } else {
            console.log('[FileService] OCR found minimal text, providing image metadata');
            result.extractedText = `[Architectural Image: ${file.originalname}]. OCR found minimal text labels. The image may be a non-text diagram.`;
          }
        } catch (ocrError) {
          console.error('[FileService] OCR failed:', ocrError.message);
          result.extractedText = `[Architectural Image: ${file.originalname}]. OCR extraction failed.`;
        }
      }
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process file: ${error.message}`);
    }

    return result;
  }
}

module.exports = FileService;
