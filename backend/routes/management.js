const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const googleSheetsService = require('../services/googleSheets');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/management/responses - Get all responses with pagination and search
router.get('/responses', async (req, res, next) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    
    let responses;
    if (search) {
      responses = await googleSheetsService.searchResponses(search, parseInt(limit));
    } else {
      const allResponses = await googleSheetsService.getSheetData();
      responses = allResponses.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    }

    res.json({
      responses,
      total: responses.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/management/responses - Create a new response
router.post('/responses', [
  body('key').notEmpty().withMessage('Key is required'),
  body('response_text').notEmpty().withMessage('Response text is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { key, response_text, notes } = req.body;

    // Check if key already exists
    try {
      await googleSheetsService.getResponseByKey(key);
      return res.status(409).json({
        error: 'Key already exists',
        details: `A response with key "${key}" already exists`
      });
    } catch (error) {
      // Key doesn't exist, which is what we want
    }

    const newResponse = await googleSheetsService.addRow({
      key,
      response_text,
      notes: notes || ''
    });

    res.status(201).json({
      message: 'Response created successfully',
      response: newResponse
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/management/responses/:key - Update an existing response
router.put('/responses/:key', [
  body('response_text').notEmpty().withMessage('Response text is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { key } = req.params;
    const { response_text, notes } = req.body;

    const updatedResponse = await googleSheetsService.updateRow(key, {
      response_text,
      notes: notes || ''
    });

    res.json({
      message: 'Response updated successfully',
      response: updatedResponse
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/management/responses/:key - Delete a response
router.delete('/responses/:key', async (req, res, next) => {
  try {
    const { key } = req.params;

    await googleSheetsService.deleteRow(key);

    res.json({
      message: 'Response deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/management/responses/:key - Get a specific response
router.get('/responses/:key', async (req, res, next) => {
  try {
    const { key } = req.params;

    const response = await googleSheetsService.getResponseByKey(key);

    res.json({
      response
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

