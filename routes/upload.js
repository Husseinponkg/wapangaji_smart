const express = require('express');
const router = express.Router();
const { uploadSingle } = require('../controllers/uploadController');

// Upload image route
router.post('/image', uploadSingle);

module.exports = router;