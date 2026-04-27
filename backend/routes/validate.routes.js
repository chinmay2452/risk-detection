const express = require('express');
const validateController = require('../controllers/validate.controller');

const router = express.Router();

router.post('/validate', validateController.validateArchitecture);

module.exports = router;
