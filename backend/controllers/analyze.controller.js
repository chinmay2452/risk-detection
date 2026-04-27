/**
 * analyze.controller.js
 * Accepts a validated architecture model and returns detected security risks
 * via the rule engine + risk analysis service.
 */

const { analyseArchitecture } = require('../services/riskAnalysisService');

const analyzeArchitecture = async (req, res, next) => {
  try {
    const architectureModel = req.body;

    if (
      !architectureModel ||
      typeof architectureModel !== 'object' ||
      Object.keys(architectureModel).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'No architecture model provided. Please complete the extraction step first.',
      });
    }

    const { risks, summary } = await analyseArchitecture(architectureModel);

    return res.status(200).json({
      success: true,
      message: risks.length > 0
        ? `Risk analysis complete. ${summary.total} risk(s) detected.`
        : 'Risk analysis complete. No risks detected.',
      data: {
        risks,
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeArchitecture };
