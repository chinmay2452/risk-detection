const aiService = require('../services/ai.service');

const extractArchitecture = async (req, res, next) => {
  try {
    const { extractedText } = req.body;

    if (!extractedText) {
      return res.status(400).json({
        success: false,
        message: 'No extractedText provided in the request body.',
      });
    }

    // Step 1: Extract architecture from raw text
    const architectureData = await aiService.extractArchitecture(extractedText);

    // Step 2: Automatically validate the extracted architecture
    const validationResult = await aiService.validateArchitecture(architectureData);

    res.status(200).json({
      success: true,
      message: 'Architecture extracted and validated successfully',
      data: architectureData,
      validation: validationResult,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  extractArchitecture,
};
