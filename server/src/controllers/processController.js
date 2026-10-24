'use strict';

const fs = require('fs');
const path = require('path');
const imageService = require('../services/imageService');
const pdfService = require('../services/pdfService');
const aiService = require('../services/aiService');
const {
  PROCESSED_DIR,
  generateFilename,
  registerFile,
  getFileByToken,
  cleanupFile,
} = require('../services/storageService');
const ProcessingJob = require('../models/ProcessingJob');
const ToolUsageEvent = require('../models/ToolUsageEvent');

/**
 * Record job in database if MongoDB is available
 */
async function recordJob({ user, toolId, status, inputFileCount, outputFileCount, durationMs, error }) {
  try {
    if (ProcessingJob && ProcessingJob.db && ProcessingJob.db.readyState === 1) {
      await ProcessingJob.create({
        user: user?._id || null,
        toolId,
        status: status || 'completed',
        inputFileCount: inputFileCount || 1,
        outputFileCount: outputFileCount || 1,
        processingTimeMs: durationMs || null,
        errorMessage: error || null,
        completedAt: new Date(),
      });

      if (ToolUsageEvent && ToolUsageEvent.db && ToolUsageEvent.db.readyState === 1) {
        await ToolUsageEvent.create({
          toolId,
          user: user?._id || null,
          outcome: status === 'completed' ? 'success' : 'failure',
          processingTimeMs: durationMs || null,
        });
      }
    }
  } catch (err) {
    // Non-fatal logging
    // console.warn('Could not record job in DB:', err.message);
  }
}

/**
 * Helper to save buffer to processed file and register for download
 */
function saveBufferAndRegister(buffer, originalName, extension, mimeType) {
  const filename = generateFilename(extension);
  const outPath = path.join(PROCESSED_DIR, filename);
  fs.writeFileSync(outPath, buffer);

  const baseOriginal = path.parse(originalName || 'output').name;
  const ext = extension.startsWith('.') ? extension : `.${extension}`;

  return registerFile({
    filename,
    originalName: `${baseOriginal}_pixelforge${ext}`,
    mimeType,
  });
}

/**
 * Process Image Tool Request
 */
async function processImage(req, res) {
  const startTime = Date.now();
  const { toolId } = req.params;
  const options = req.body || {};
  const file = req.file;

  if (!file && toolId !== 'bulk-compress') {
    return res.status(400).json({ success: false, message: 'No image file uploaded.' });
  }

  try {
    let resultBuffer;
    let outExt = 'webp';
    let mimeType = 'image/webp';

    switch (toolId) {
      case 'crop-image': {
        resultBuffer = await imageService.cropImage(file.path, options);
        outExt = options.format || 'png';
        mimeType = `image/${outExt}`;
        break;
      }
      case 'resize-image': {
        resultBuffer = await imageService.resizeImage(file.path, options);
        outExt = options.format || 'webp';
        mimeType = `image/${outExt}`;
        break;
      }
      case 'rotate-image': {
        resultBuffer = await imageService.rotateFlip(file.path, options);
        outExt = options.format || 'png';
        mimeType = `image/${outExt}`;
        break;
      }
      case 'watermark-image': {
        resultBuffer = await imageService.addWatermark(file.path, options);
        outExt = options.format || 'png';
        mimeType = `image/${outExt}`;
        break;
      }
      case 'compress-image': {
        const fmt = options.format || 'webp';
        resultBuffer = await imageService.convertAndCompress(file.path, {
          format: fmt,
          quality: options.quality || 80,
        });
        outExt = fmt;
        mimeType = `image/${fmt}`;
        break;
      }
      case 'convert-image':
      case 'jpg-to-png':
      case 'png-to-jpg':
      case 'webp-converter': {
        const targetFormat =
          toolId === 'jpg-to-png'
            ? 'png'
            : toolId === 'png-to-jpg'
            ? 'jpeg'
            : toolId === 'webp-converter'
            ? 'webp'
            : options.format || 'webp';

        resultBuffer = await imageService.convertAndCompress(file.path, {
          format: targetFormat,
          quality: options.quality || 85,
        });
        outExt = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
        mimeType = `image/${outExt}`;
        break;
      }
      case 'image-filters':
      case 'adjust-colors':
      case 'optimize-for-web': {
        resultBuffer = await imageService.applyEffects(file.path, options);
        outExt = options.format || 'webp';
        mimeType = `image/${outExt}`;
        break;
      }
      case 'change-background': {
        resultBuffer = await imageService.changeBackground(file.path, options);
        outExt = 'png';
        mimeType = 'image/png';
        break;
      }
      case 'remove-background': {
        resultBuffer = await imageService.removeBackground(file.path, options);
        outExt = 'png';
        mimeType = 'image/png';
        break;
      }
      case 'image-metadata': {
        const metadata = await imageService.getImageMetadata(file.path);
        // Clean up uploaded input file
        try { fs.unlinkSync(file.path); } catch (_) {}

        const durationMs = Date.now() - startTime;
        await recordJob({ user: req.user, toolId, status: 'completed', durationMs });

        return res.json({
          success: true,
          toolId,
          data: metadata,
          processingTimeMs: durationMs,
        });
      }
      default: {
        return res.status(400).json({ success: false, message: `Tool "${toolId}" is not supported.` });
      }
    }

    const fileRecord = saveBufferAndRegister(resultBuffer, file.originalname, outExt, mimeType);

    // Clean up temporary upload
    try { fs.unlinkSync(file.path); } catch (_) {}

    const durationMs = Date.now() - startTime;
    await recordJob({ user: req.user, toolId, status: 'completed', durationMs });

    return res.json({
      success: true,
      toolId,
      file: {
        token: fileRecord.token,
        filename: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        downloadUrl: `/api/process/download/${fileRecord.token}`,
        expiresAt: fileRecord.expiresAt,
      },
      processingTimeMs: durationMs,
    });
  } catch (err) {
    if (file && file.path) {
      try { fs.unlinkSync(file.path); } catch (_) {}
    }
    const durationMs = Date.now() - startTime;
    await recordJob({ user: req.user, toolId, status: 'failed', durationMs, error: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Bulk Image Compression
 */
async function processBulkCompress(req, res) {
  const startTime = Date.now();
  const files = req.files || [];
  if (files.length === 0) {
    return res.status(400).json({ success: false, message: 'Please upload at least one image file.' });
  }

  try {
    const options = req.body || {};
    const fileRecord = await imageService.bulkCompress(files, {
      quality: options.quality || 80,
      format: options.format || 'webp',
    });

    // Cleanup uploaded input files
    for (const f of files) {
      try { fs.unlinkSync(f.path); } catch (_) {}
    }

    const durationMs = Date.now() - startTime;
    await recordJob({
      user: req.user,
      toolId: 'bulk-compress',
      status: 'completed',
      inputFileCount: files.length,
      durationMs,
    });

    return res.json({
      success: true,
      toolId: 'bulk-compress',
      file: {
        token: fileRecord.token,
        filename: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        downloadUrl: `/api/process/download/${fileRecord.token}`,
        expiresAt: fileRecord.expiresAt,
      },
      processingTimeMs: durationMs,
    });
  } catch (err) {
    for (const f of files) {
      try { fs.unlinkSync(f.path); } catch (_) {}
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Process PDF Tool Request
 */
async function processPdf(req, res) {
  const startTime = Date.now();
  const { toolId } = req.params;
  const options = req.body || {};
  const files = req.files || (req.file ? [req.file] : []);

  if (files.length === 0 && toolId !== 'text-to-pdf') {
    return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
  }

  try {
    let resultBuffer;
    let outName = 'document.pdf';
    let outExt = 'pdf';
    let mimeType = 'application/pdf';

    switch (toolId) {
      case 'merge-pdf': {
        if (files.length < 2) {
          throw new Error('Please select at least 2 PDF files to merge.');
        }
        const inputBuffers = files.map((f) => fs.readFileSync(f.path));
        resultBuffer = await pdfService.mergePdfs(inputBuffers);
        outName = 'merged_document.pdf';
        break;
      }
      case 'split-pdf': {
        const primaryFile = files[0];
        const splitResult = await pdfService.splitPdf(primaryFile.path, {
          mode: options.mode || 'range',
          ranges: options.ranges || '1',
        });

        if (splitResult.type === 'zip') {
          // Cleanup uploaded files
          files.forEach((f) => { try { fs.unlinkSync(f.path); } catch (_) {} });
          return res.json({
            success: true,
            toolId,
            file: {
              token: splitResult.fileData.token,
              filename: splitResult.fileData.originalName,
              size: splitResult.fileData.size,
              mimeType: splitResult.fileData.mimeType,
              downloadUrl: `/api/process/download/${splitResult.fileData.token}`,
              expiresAt: splitResult.fileData.expiresAt,
            },
            processingTimeMs: Date.now() - startTime,
          });
        }

        resultBuffer = splitResult.buffer;
        outName = 'split_pages.pdf';
        break;
      }
      case 'rotate-pdf': {
        resultBuffer = await pdfService.rotatePdfPages(files[0].path, {
          angle: options.angle || 90,
          pageNumbers: options.pageNumbers ? JSON.parse(options.pageNumbers) : [],
        });
        outName = files[0].originalname;
        break;
      }
      case 'reorder-pdf': {
        const order = options.order ? (Array.isArray(options.order) ? options.order : JSON.parse(options.order)) : [];
        resultBuffer = await pdfService.reorderPdfPages(files[0].path, { order });
        outName = files[0].originalname;
        break;
      }
      case 'watermark-pdf': {
        resultBuffer = await pdfService.addWatermark(files[0].path, options);
        outName = files[0].originalname;
        break;
      }
      case 'page-numbers-pdf': {
        resultBuffer = await pdfService.addPageNumbers(files[0].path, options);
        outName = files[0].originalname;
        break;
      }
      case 'protect-pdf': {
        resultBuffer = await pdfService.protectPdf(files[0].path, options);
        outName = `protected_${files[0].originalname}`;
        break;
      }
      case 'unlock-pdf': {
        resultBuffer = await pdfService.unlockPdf(files[0].path, options);
        outName = `unlocked_${files[0].originalname}`;
        break;
      }
      case 'extract-text':
      case 'pdf-metadata': {
        const textData = await pdfService.extractTextFromPdf(files[0].path);
        files.forEach((f) => { try { fs.unlinkSync(f.path); } catch (_) {} });

        return res.json({
          success: true,
          toolId,
          data: textData,
          processingTimeMs: Date.now() - startTime,
        });
      }
      case 'text-to-pdf': {
        const text = options.text || (files[0] ? fs.readFileSync(files[0].path, 'utf8') : '');
        if (!text.trim()) {
          throw new Error('Please provide text content or upload a text file.');
        }
        resultBuffer = await pdfService.textToPdf(text, options);
        outName = 'document.pdf';
        break;
      }
      case 'jpg-to-pdf': {
        const imageBuffers = files.map((f) => fs.readFileSync(f.path));
        resultBuffer = await pdfService.imagesToPdf(imageBuffers, options);
        outName = 'converted_images.pdf';
        break;
      }
      case 'compare-pdf': {
        if (files.length < 2) {
          throw new Error('Please upload 2 PDF files to compare.');
        }
        const comparison = await pdfService.comparePdfs(files[0].path, files[1].path);
        files.forEach((f) => { try { fs.unlinkSync(f.path); } catch (_) {} });

        return res.json({
          success: true,
          toolId,
          data: comparison,
          processingTimeMs: Date.now() - startTime,
        });
      }
      case 'compress-pdf': {
        const comp = await pdfService.compressPdf(files[0].path, options);
        resultBuffer = comp.buffer;
        outName = `compressed_${files[0].originalname}`;
        break;
      }
      case 'pdf-to-word': {
        resultBuffer = await pdfService.pdfToWord(files[0].path, options);
        const baseName = path.parse(files[0].originalname).name;
        outName = `${baseName}.docx`;
        outExt = 'docx';
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      }
      case 'word-to-pdf': {
        resultBuffer = await pdfService.wordToPdf(files[0].path, options);
        const baseName = path.parse(files[0].originalname).name;
        outName = `${baseName}.pdf`;
        outExt = 'pdf';
        mimeType = 'application/pdf';
        break;
      }
      case 'ocr-pdf': {
        const ocrData = await pdfService.ocrDocument(files[0].path, options);
        files.forEach((f) => { try { fs.unlinkSync(f.path); } catch (_) {} });

        return res.json({
          success: true,
          toolId,
          data: ocrData,
          processingTimeMs: Date.now() - startTime,
        });
      }
      default: {
        return res.status(400).json({ success: false, message: `PDF tool "${toolId}" is not implemented.` });
      }
    }

    const fileRecord = saveBufferAndRegister(resultBuffer, outName, outExt, mimeType);

    // Clean up temporary files
    files.forEach((f) => { try { fs.unlinkSync(f.path); } catch (_) {} });

    const durationMs = Date.now() - startTime;
    await recordJob({ user: req.user, toolId, status: 'completed', durationMs });

    return res.json({
      success: true,
      toolId,
      file: {
        token: fileRecord.token,
        filename: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        downloadUrl: `/api/process/download/${fileRecord.token}`,
        expiresAt: fileRecord.expiresAt,
      },
      processingTimeMs: durationMs,
    });
  } catch (err) {
    files.forEach((f) => { try { fs.unlinkSync(f.path); } catch (_) {} });
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Process AI Document Request
 */
async function processAi(req, res) {
  const startTime = Date.now();
  const { toolId } = req.params;
  const options = req.body || {};
  const file = req.file;

  try {
    let documentText = options.text || '';

    // If file provided, extract text from PDF or text file
    if (file) {
      if (file.mimetype === 'application/pdf') {
        const extracted = await pdfService.extractTextFromPdf(file.path);
        documentText = extracted.text;
      } else {
        documentText = fs.readFileSync(file.path, 'utf8');
      }
      try { fs.unlinkSync(file.path); } catch (_) {}
    }

    if (!documentText || !documentText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'No readable text provided. Please enter text or upload a readable PDF document.',
      });
    }

    let task = 'summarize';
    if (toolId === 'ask-pdf' || toolId === 'ask-question') task = 'ask';
    else if (toolId === 'key-points') task = 'key-points';
    else if (toolId === 'study-questions') task = 'study-questions';
    else if (toolId === 'outline') task = 'outline';
    else if (toolId === 'translate-document') task = 'translate';

    const aiResult = await aiService.processDocumentAi(documentText, task, options);

    const durationMs = Date.now() - startTime;
    await recordJob({ user: req.user, toolId, status: 'completed', durationMs });

    return res.json({
      success: true,
      toolId,
      data: aiResult,
      processingTimeMs: durationMs,
    });
  } catch (err) {
    if (file && file.path) {
      try { fs.unlinkSync(file.path); } catch (_) {}
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Download Processed File by Token
 */
function downloadFile(req, res) {
  const { fileToken } = req.params;
  const fileData = getFileByToken(fileToken);

  if (!fileData) {
    return res.status(404).json({
      success: false,
      message: 'File not found or download link has expired. Please reprocess your document.',
    });
  }

  res.setHeader('Content-Type', fileData.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${fileData.originalName}"`);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  const stream = fs.createReadStream(fileData.path);
  stream.on('error', (err) => {
    res.status(500).json({ success: false, message: 'Failed to stream file.' });
  });
  stream.pipe(res);
}

/**
 * Immediate cleanup of temporary file
 */
function cleanupFileEndpoint(req, res) {
  const { fileToken } = req.params;
  const cleaned = cleanupFile(fileToken);

  if (!cleaned) {
    return res.status(404).json({
      success: false,
      message: 'File not found or already cleaned.',
    });
  }

  return res.json({
    success: true,
    message: 'Temporary file deleted securely.',
  });
}

module.exports = {
  processImage,
  processBulkCompress,
  processPdf,
  processAi,
  downloadFile,
  cleanupFileEndpoint,
};
