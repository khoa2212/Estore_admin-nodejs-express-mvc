const express = require('express');
const router = express.Router();
const dashController = require('./dashboardController');

router.get('/', dashController.showPage);

module.exports = router;
