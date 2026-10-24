'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
const PROCESSED_DIR = process.env.PROCESSED_DIR || path.join(__dirname, '../../processed');

// Ensure directories exist
for (const dir of [UPLOADS_DIR, PROCESSED_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// In-memory file registry for temporary download tokens and metadata
// Key: fileToken -> { originalName, filename, path, mimeType, size, createdAt, expiresAt }
const fileRegistry = new Map();

/**
 * Register a processed file for secure download
 */
function registerFile({ filename, originalName, mimeType, isUpload = false, ttlMinutes = 60 }) {
  const fileToken = uuidv4();
  const baseDir = isUpload ? UPLOADS_DIR : PROCESSED_DIR;
  const filePath = path.join(baseDir, filename);

  let size = 0;
  try {
    const stats = fs.statSync(filePath);
    size = stats.size;
  } catch (err) {
    // Ignore if not on disk yet
  }

  const fileData = {
    token: fileToken,
    filename,
    originalName: sanitizeOriginalName(originalName || filename),
    path: filePath,
    mimeType: mimeType || 'application/octet-stream',
    size,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
  };

  fileRegistry.set(fileToken, fileData);
  return fileData;
}

/**
 * Get file metadata by token, validating expiration
 */
function getFileByToken(token) {
  if (!token) return null;
  const fileData = fileRegistry.get(token);
  if (!fileData) return null;

  if (new Date() > fileData.expiresAt) {
    cleanupFile(token);
    return null;
  }

  // Ensure file physically exists
  if (!fs.existsSync(fileData.path)) {
    fileRegistry.delete(token);
    return null;
  }

  return fileData;
}

/**
 * Remove a file immediately by token
 */
function cleanupFile(token) {
  const fileData = fileRegistry.get(token);
  if (fileData) {
    try {
      if (fs.existsSync(fileData.path)) {
        fs.unlinkSync(fileData.path);
      }
    } catch (err) {
      console.warn(`[Storage] Failed to delete file ${fileData.path}:`, err.message);
    }
    fileRegistry.delete(token);
    return true;
  }
  return false;
}

/**
 * Sweep expired files from disk and registry
 */
function sweepExpiredFiles() {
  const now = new Date();
  let sweptCount = 0;

  // Sweep memory registry
  for (const [token, fileData] of fileRegistry.entries()) {
    if (now > fileData.expiresAt) {
      cleanupFile(token);
      sweptCount++;
    }
  }

  // Also sweep physical directories for orphaned files older than 2 hours
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  for (const dir of [UPLOADS_DIR, PROCESSED_DIR]) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file === '.gitkeep') continue;
        const filePath = path.join(dir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs < twoHoursAgo) {
            fs.unlinkSync(filePath);
            sweptCount++;
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  return sweptCount;
}

/**
 * Sanitize original filename to prevent path traversal or header injection
 */
function sanitizeOriginalName(rawName) {
  if (!rawName) return 'processed-file';
  // Strip paths, control characters, keep safe filename characters
  return path.basename(rawName).replace(/[^\w\s.-]/g, '_');
}

/**
 * Generate a safe unique filename with given extension
 */
function generateFilename(extension = '') {
  const ext = extension.startsWith('.') ? extension : (extension ? `.${extension}` : '');
  return `${uuidv4()}${ext}`;
}

module.exports = {
  UPLOADS_DIR,
  PROCESSED_DIR,
  registerFile,
  getFileByToken,
  cleanupFile,
  sweepExpiredFiles,
  sanitizeOriginalName,
  generateFilename,
};
