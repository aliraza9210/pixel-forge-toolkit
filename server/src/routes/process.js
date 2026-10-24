'use strict';

const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const {
  processImage,
  processBulkCompress,
  processPdf,
  processAi,
  downloadFile,
  cleanupFileEndpoint,
} = require('../controllers/processController');

// Image processing
router.post('/image/bulk-compress', upload.array('files', 20), processBulkCompress);
router.post('/image/:toolId', upload.single('file'), processImage);

// PDF processing
router.post('/pdf/:toolId', upload.array('files', 15), processPdf);

// AI processing
router.post('/ai/:toolId', upload.single('file'), processAi);

// Download and cleanup
router.get('/download/:fileToken', downloadFile);
router.delete('/cleanup/:fileToken', cleanupFileEndpoint);

module.exports = router;
