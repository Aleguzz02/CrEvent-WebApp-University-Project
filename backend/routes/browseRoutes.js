const express = require('express');
const router = express.Router();
const browseController = require('../controllers/browseController');

router.get('/', browseController.getBrowseData);

module.exports = router;