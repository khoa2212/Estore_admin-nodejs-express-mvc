const express = require('express');
const router = express.Router();
const path = require('path')
const upload = require('../../uploads/uploadMulter');
const productsController = require('./productsController');

router.get('/', productsController.showPage);
router.post('/', productsController.postProduct);
router.post('/upload', upload.single('file'), productsController.uploadImage);

module.exports = router;
