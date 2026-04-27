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

    const architectureData = await aiService.extractArchitecture(extractedText);

    res.status(200).json({
      success: true,
      message: 'Architecture extracted successfully',
      data: architectureData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  extractArchitecture,
};
