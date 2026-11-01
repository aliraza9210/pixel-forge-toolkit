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
const REGISTRY_FILE = path.join(UPLOADS_DIR, '.registry.json');

/**
 * Safely read registry from shared disk storage
 */
function readDiskRegistry() {
  try {
    if (!fs.existsSync(REGISTRY_FILE)) return {};
    const content = fs.readFileSync(REGISTRY_FILE, 'utf8');
    if (!content || !content.trim()) return {};
    return JSON.parse(content) || {};
  } catch (err) {
    return {};
  }
}

// Load persisted registry from disk on initialization
try {
  const data = readDiskRegistry();
  const now = new Date();
  for (const [token, fileData] of Object.entries(data)) {
    if (fileData && fileData.expiresAt && new Date(fileData.expiresAt) > now && fs.existsSync(fileData.path)) {
      fileData.createdAt = new Date(fileData.createdAt);
      fileData.expiresAt = new Date(fileData.expiresAt);
      fileRegistry.set(token, fileData);
    }
  }
} catch (err) {
  console.warn('[Storage] Failed to load registry from disk:', err.message);
}

function persistRegistry() {
  try {
    const diskObj = readDiskRegistry();
    const now = new Date();
    const merged = {};

    // Keep active tokens from disk (persisted by other workers)
    for (const [token, data] of Object.entries(diskObj)) {
      if (data && data.expiresAt && new Date(data.expiresAt) > now) {
        merged[token] = data;
      }
    }

    // Merge in-memory active tokens
    for (const [token, fileData] of fileRegistry.entries()) {
      if (fileData && fileData.expiresAt && fileData.expiresAt > now) {
        merged[token] = fileData;
      }
    }

    const jsonStr = JSON.stringify(merged, null, 2);
    const tmpFile = `${REGISTRY_FILE}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpFile, jsonStr, 'utf8');
    try {
      fs.renameSync(tmpFile, REGISTRY_FILE);
    } catch (_) {
      fs.copyFileSync(tmpFile, REGISTRY_FILE);
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
  } catch (err) {
    console.warn('[Storage] Failed to persist registry to disk:', err.message);
  }
}

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
  persistRegistry();
  return fileData;
}

/**
 * Get file metadata by token, validating expiration with dynamic disk fallback
 */
function getFileByToken(token) {
  if (!token) return null;
  let fileData = fileRegistry.get(token);

  // Dynamic fallback: lookup shared disk registry if not cached in memory
  if (!fileData) {
    try {
      const diskObj = readDiskRegistry();
      if (diskObj && diskObj[token]) {
        fileData = diskObj[token];
        fileData.createdAt = new Date(fileData.createdAt);
        fileData.expiresAt = new Date(fileData.expiresAt);
        fileRegistry.set(token, fileData);
      }
    } catch (_) {}
  }

  if (!fileData) return null;

  if (new Date() > fileData.expiresAt) {
    cleanupFile(token);
    return null;
  }

  // Ensure file physically exists
  if (!fs.existsSync(fileData.path)) {
    cleanupFile(token);
    return null;
  }

  return fileData;
}

/**
 * Remove a file immediately by token from memory and shared disk
 */
function cleanupFile(token) {
  let fileData = fileRegistry.get(token);
  if (!fileData) {
    try {
      const diskObj = readDiskRegistry();
      if (diskObj && diskObj[token]) {
        fileData = diskObj[token];
      }
    } catch (_) {}
  }

  if (fileData) {
    try {
      const resolvedTarget = path.resolve(fileData.path);
      const resolvedUploads = path.resolve(UPLOADS_DIR);
      const resolvedProcessed = path.resolve(PROCESSED_DIR);

      const relUploads = path.relative(resolvedUploads, resolvedTarget);
      const relProcessed = path.relative(resolvedProcessed, resolvedTarget);

      const isContained =
        (!relUploads.startsWith('..') && !path.isAbsolute(relUploads)) ||
        (!relProcessed.startsWith('..') && !path.isAbsolute(relProcessed));

      if (isContained && fs.existsSync(resolvedTarget)) {
        fs.unlinkSync(resolvedTarget);
      }
    } catch (err) {
      console.warn(`[Storage] Failed to delete file ${fileData.path}:`, err.message);
    }
    fileRegistry.delete(token);

    // Atomically remove from disk registry
    try {
      const diskObj = readDiskRegistry();
      if (diskObj && diskObj[token]) {
        delete diskObj[token];
        const tmpFile = `${REGISTRY_FILE}.${process.pid}.${Date.now()}.tmp`;
        fs.writeFileSync(tmpFile, JSON.stringify(diskObj, null, 2), 'utf8');
        try {
          fs.renameSync(tmpFile, REGISTRY_FILE);
        } catch (_) {
          fs.copyFileSync(tmpFile, REGISTRY_FILE);
          try { fs.unlinkSync(tmpFile); } catch (_) {}
        }
      }
    } catch (_) {}

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

  // Also sweep disk registry for expired files across workers
  try {
    const diskObj = readDiskRegistry();
    for (const [token, fileData] of Object.entries(diskObj)) {
      if (fileData && fileData.expiresAt && now > new Date(fileData.expiresAt)) {
        cleanupFile(token);
        sweptCount++;
      }
    }
  } catch (_) {}

  // Also sweep physical directories for orphaned files older than 2 hours
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  for (const dir of [UPLOADS_DIR, PROCESSED_DIR]) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file === '.gitkeep' || file === '.registry.json' || file.endsWith('.tmp')) continue;
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
