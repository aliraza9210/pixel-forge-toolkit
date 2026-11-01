'use strict';

const multer = require('multer');
const path = require('path');
const { UPLOADS_DIR, generateFilename } = require('../services/storageService');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/avif',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/heic',
  'image/heif',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/html',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.avif',
  '.svg', '.ico', '.heic', '.heif',
  '.pdf', '.txt', '.md', '.html', '.htm', '.csv',
  '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, generateFilename(ext));
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  // Validate extension
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(`Unsupported file extension "${ext}". Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`),
      false
    );
  }

  // Validate MIME type
  if (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
    // Some browsers send generic octet-stream for certain formats; check if extension is safe
    if (file.mimetype !== 'application/octet-stream') {
      return cb(new Error(`Unsupported MIME type "${file.mimetype}"`), false);
    }
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 35 * 1024 * 1024, // 35 MB max per individual file
    files: 20, // Max 20 files for batch operations
  },
});

/**
 * Validates total aggregated upload size across all files in request
 * Caps aggregate payload at 100 MB to prevent resource exhaustion attacks.
 */
function validateTotalUploadSize(req, res, next) {
  let totalSize = 0;
  const maxAggregateBytes = 100 * 1024 * 1024; // 100 MB total max

  const files = req.files || (req.file ? [req.file] : []);
  for (const f of files) {
    totalSize += f.size || 0;
  }

  if (totalSize > maxAggregateBytes) {
    // Clean up already uploaded files from disk
    for (const f of files) {
      if (f.path) {
        try { require('fs').unlinkSync(f.path); } catch (_) {}
      }
    }
    return res.status(400).json({
      success: false,
      message: 'Aggregate upload size exceeds maximum allowed limit of 100 MB.',
    });
  }

  next();
}

module.exports = {
  upload,
  validateTotalUploadSize,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
