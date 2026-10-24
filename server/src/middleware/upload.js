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
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.avif',
  '.pdf', '.txt', '.md', '.docx',
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
    fileSize: 35 * 1024 * 1024, // 35 MB max per file
    files: 20, // Max 20 files for batch operations
  },
});

module.exports = {
  upload,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
