const FileService = require('../services/file.service');

const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded.',
      });
    }

    const results = [];

    for (const file of req.files) {
      const processedData = await FileService.processFile(file);
      
      results.push({
        fileName: file.originalname,
        fileType: file.mimetype,
        filePath: file.path,
        size: file.size,
        extractedText: processedData.extractedText,
        parsedJson: processedData.parsedJson,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Files uploaded and processed successfully',
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFiles,
};
