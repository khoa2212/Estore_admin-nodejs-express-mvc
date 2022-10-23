const express = require('express');
const router = express.Router();
const profileController = require('./profileController');

router.get('/', profileController.showPage);
router.post('/', profileController.changeProfileInfo);

module.exports = router;
