const aiService = require('../services/ai.service');

const extractArchitecture = async (req, res, next) => {
  try {
    const { extractedText, inputType, filePath } = req.body;

    if (!extractedText) {
      return res.status(400).json({
        success: false,
        message: 'No extractedText provided in the request body.',
      });
    }

    // Extraction now handles multi-model fallback and self-correction internally
    const architectureData = await aiService.extractArchitecture(extractedText, inputType || 'text', filePath);

    res.status(200).json({
      success: true,
      message: 'Architecture extracted successfully',
      data: architectureData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  extractArchitecture,
};
