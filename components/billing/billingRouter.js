const express = require('express');
const router = express.Router();
const billingController = require('./billingController');

router.get('/', billingController.showPage);

module.exports = router;
