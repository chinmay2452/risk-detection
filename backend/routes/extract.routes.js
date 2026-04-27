const express = require('express');
const extractController = require('../controllers/extract.controller');

const router = express.Router();

router.post('/extract', extractController.extractArchitecture);

module.exports = router;
