const aiService = require('../services/ai.service');

const validateArchitecture = async (req, res, next) => {
  try {
    const architectureJson = req.body;

    if (!architectureJson || typeof architectureJson !== 'object' || Object.keys(architectureJson).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No architecture JSON provided in the request body.',
      });
    }

    const validationResult = await aiService.validateArchitecture(architectureJson);

    res.status(200).json({
      success: true,
      message: 'Architecture validated successfully',
      data: validationResult,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateArchitecture,
};
