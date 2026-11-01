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

// Multi-field upload middleware supporting single ('file') and multiple ('files') form fields
const uploadFlexible = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'files', maxCount: 20 },
]);

/**
 * Normalizes uploaded files so controllers consistently receive both req.files array
 * and req.file (first file) regardless of whether 'file' or 'files' field name was used.
 */
function normalizeUploadFiles(req, res, next) {
  if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
    const list = [
      ...(req.files.files || []),
      ...(req.files.file || []),
    ];
    req.files = list;
    if (list.length > 0 && !req.file) {
      req.file = list[0];
    }
  } else if (req.file && (!req.files || req.files.length === 0)) {
    req.files = [req.file];
  }
  next();
}

// Image processing
router.post('/image/bulk-compress', uploadFlexible, normalizeUploadFiles, processBulkCompress);
router.post('/image/:toolId', uploadFlexible, normalizeUploadFiles, processImage);

// PDF processing - supports both single-file ('file') and multi-file ('files') uploads
router.post('/pdf/:toolId', uploadFlexible, normalizeUploadFiles, processPdf);

// AI processing
router.post('/ai/:toolId', uploadFlexible, normalizeUploadFiles, processAi);

// Download and cleanup
router.get('/download/:fileToken', downloadFile);
router.delete('/cleanup/:fileToken', cleanupFileEndpoint);

module.exports = router;
