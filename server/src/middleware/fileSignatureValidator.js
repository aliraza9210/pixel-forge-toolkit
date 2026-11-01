'use strict';

const fs = require('fs');

/**
 * Known magic number signatures for supported file types.
 */
const MAGIC_SIGNATURES = [
  { ext: '.jpg', mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { ext: '.jpeg', mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { ext: '.png', mime: 'image/png', bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  { ext: '.gif', mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8
  { ext: '.webp', mime: 'image/webp', check: (buf) => buf.length >= 12 && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP' },
  { ext: '.pdf', mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { ext: '.bmp', mime: 'image/bmp', bytes: [0x42, 0x4D] }, // BM
  { ext: '.tiff', mime: 'image/tiff', check: (buf) => (buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2A && buf[3] === 0x00) || (buf[0] === 0x4D && buf[1] === 0x4D && buf[2] === 0x00 && buf[3] === 0x2A) },
  // ZIP-based Office formats (DOCX, XLSX, PPTX)
  { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', bytes: [0x50, 0x4B, 0x03, 0x04] },
  { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', bytes: [0x50, 0x4B, 0x03, 0x04] },
  { ext: '.pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', bytes: [0x50, 0x4B, 0x03, 0x04] },
];

/**
 * Validates actual binary content of uploaded files against their claimed extension.
 * Rejects disguised executable binaries (e.g. an EXE renamed to .jpg or .pdf).
 */
function validateFileContent(req, res, next) {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files || files.length === 0) return next();

  for (const f of files) {
    if (!f.path || !fs.existsSync(f.path)) continue;

    const ext = require('path').extname(f.originalname || f.filename || '').toLowerCase();
    const sig = MAGIC_SIGNATURES.find((s) => s.ext === ext);

    if (sig) {
      let buffer;
      try {
        const fd = fs.openSync(f.path, 'r');
        buffer = Buffer.alloc(16);
        fs.readSync(fd, buffer, 0, 16, 0);
        fs.closeSync(fd);
      } catch (err) {
        continue;
      }

      let matches = false;
      if (sig.bytes) {
        matches = sig.bytes.every((byte, idx) => buffer[idx] === byte);
      } else if (typeof sig.check === 'function') {
        matches = sig.check(buffer);
      }

      if (!matches) {
        // Clean up all uploaded files
        for (const fileToClean of files) {
          if (fileToClean.path && fs.existsSync(fileToClean.path)) {
            try { fs.unlinkSync(fileToClean.path); } catch (_) {}
          }
        }
        return res.status(400).json({
          success: false,
          message: `File content does not match the claimed file extension "${ext}". Potential MIME spoofing detected.`,
        });
      }
    }
  }

  next();
}

module.exports = { validateFileContent, MAGIC_SIGNATURES };

