const express = require('express');
const { authenticateApiKey } = require('../middleware/auth');
const googleSheetsService = require('../services/googleSheets');

const router = express.Router();

// GET /api/delivery/responses/:key - Get response for bot integration
router.get('/responses/:key', authenticateApiKey, async (req, res, next) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        error: 'Key parameter is required'
      });
    }

    const response = await googleSheetsService.getResponseByKey(key);

    // Return only the essential data for bot integration
    res.json({
      key: response.key,
      response_text: response.response_text,
      last_updated: response.last_updated
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Not found')) {
      return res.status(404).json({
        error: 'Response not found',
        key: req.params.key
      });
    }
    next(error);
  }
});

// GET /api/delivery/responses - Get all responses (for bot integration)
router.get('/responses', authenticateApiKey, async (req, res, next) => {
  try {
    const responses = await googleSheetsService.getSheetData();

    // Return simplified format for bot integration
    const botResponses = responses.map(response => ({
      key: response.key,
      response_text: response.response_text,
      last_updated: response.last_updated
    }));

    res.json({
      responses: botResponses,
      total: botResponses.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
