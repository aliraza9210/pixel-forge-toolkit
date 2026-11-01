'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
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
      case 'flip-image': {
        const flipH = options.flipH !== undefined ? options.flipH === 'true' || options.flipH === true : true;
        const flipV = options.flipV === 'true' || options.flipV === true;
        resultBuffer = await imageService.rotateFlip(file.path, {
          angle: 0,
          flipH,
          flipV,
        });
        outExt = options.format || 'png';
        mimeType = `image/${outExt}`;
        break;
      }
      case 'straighten-image': {
        const angle = options.angle ? parseInt(options.angle, 10) : 0;
        resultBuffer = await imageService.rotateFlip(file.path, { angle });
        outExt = options.format || 'jpg';
        mimeType = `image/${outExt === 'jpg' ? 'jpeg' : outExt}`;
        break;
      }
      case 'circle-crop': {
        resultBuffer = await imageService.circleCrop(file.path);
        outExt = 'png';
        mimeType = 'image/png';
        break;
      }
      case 'round-corners': {
        resultBuffer = await imageService.roundCorners(file.path, options);
        outExt = 'png';
        mimeType = 'image/png';
        break;
      }
      case 'square-crop': {
        resultBuffer = await imageService.squareCrop(file.path);
        outExt = options.format || 'jpg';
        mimeType = `image/${outExt === 'jpg' ? 'jpeg' : outExt}`;
        break;
      }
      case 'add-name-date-photo': {
        resultBuffer = await imageService.addNameDateToPhoto(file.path, options);
        outExt = 'jpg';
        mimeType = 'image/jpeg';
        break;
      }
      case 'remove-metadata': {
        resultBuffer = await imageService.removeMetadata(file.path, options);
        outExt = options.format || 'jpg';
        mimeType = `image/${outExt === 'jpg' ? 'jpeg' : outExt}`;
        break;
      }
      case 'heic-to-jpg':
      case 'avif-to-jpg':
      case 'gif-to-jpg':
      case 'tiff-to-jpg':
      case 'clean-metadata': {
        resultBuffer = await imageService.convertAndCompress(file.path, {
          format: 'jpeg',
          quality: options.quality || 85,
        });
        outExt = 'jpg';
        mimeType = 'image/jpeg';
        break;
      }
      case 'svg-to-png':
      case 'image-to-ico':
      case 'transparent-png':
      case 'remove-white-bg': {
        resultBuffer = await imageService.convertAndCompress(file.path, {
          format: 'png',
          quality: 95,
        });
        outExt = 'png';
        mimeType = 'image/png';
        break;
      }
      case 'grayscale-image': {
        resultBuffer = await imageService.applyEffects(file.path, { grayscale: true });
        outExt = options.format || 'jpg';
        mimeType = `image/${outExt === 'jpg' ? 'jpeg' : outExt}`;
        break;
      }
      case 'instant-blur': {
        resultBuffer = await imageService.applyEffects(file.path, { blur: 12 });
        outExt = options.format || 'jpg';
        mimeType = `image/${outExt === 'jpg' ? 'jpeg' : outExt}`;
        break;
      }
      case 'pencil-effect':
      case 'anime-effect':
      case 'deep-fry-photo':
      case 'distort-image':
      case 'canvas-photo':
      case 'pixelate-image': {
        resultBuffer = await imageService.applyEffects(file.path, {
          grayscale: toolId === 'pencil-effect',
          blur: options.blur ? parseFloat(options.blur) : (toolId === 'distort-image' ? 4 : (toolId === 'pixelate-image' ? 6 : 0)),
          sharpen: toolId === 'deep-fry-photo' || toolId === 'anime-effect' ? 5 : 0,
          brightness: toolId === 'deep-fry-photo' ? 1.4 : 1.0,
          saturation: toolId === 'deep-fry-photo' ? 2.5 : (toolId === 'anime-effect' ? 1.3 : 1.0),
        });
        outExt = options.format || 'jpg';
        mimeType = `image/${outExt === 'jpg' ? 'jpeg' : outExt}`;
        break;
      }
      case 'convert-dpi': {
        resultBuffer = await imageService.convertAndCompress(file.path, {
          format: options.format || 'jpeg',
          quality: 95,
        });
        outExt = options.format || 'jpg';
        mimeType = `image/${outExt === 'jpg' ? 'jpeg' : outExt}`;
        break;
      }
      case 'a4-resize':
      case 'passport-size-photo':
      case 'passport-red-bg':
      case 'passport-white-bg':
      case 'resize-35x45mm':
      case 'resize-2x2inch':
      case 'resize-4x6':
      case 'wallet-size-photo':
      case 'instagram-crop':
      case 'instagram-grid':
      case 'youtube-banner':
      case 'twitter-header':
      case 'facebook-cover':
      case 'linkedin-banner':
      case 'pan-card-photo':
      case 'ssc-upsc-photo':
      case 'signature-resize':
      case 'whatsapp-dp': {
        let width = options.width ? parseInt(options.width, 10) : undefined;
        let height = options.height ? parseInt(options.height, 10) : undefined;
        if (toolId === 'a4-resize') { width = 2480; height = 3508; }
        else if (toolId === 'passport-size-photo' || toolId === 'resize-35x45mm' || toolId === 'passport-red-bg' || toolId === 'passport-white-bg') { width = 413; height = 531; }
        else if (toolId === 'resize-2x2inch') { width = 600; height = 600; }
        else if (toolId === 'resize-4x6') { width = 1200; height = 1800; }
        else if (toolId === 'wallet-size-photo') { width = 750; height = 1050; }
        else if (toolId === 'instagram-crop') { width = 1080; height = 1080; }
        else if (toolId === 'youtube-banner') { width = 2560; height = 1440; }
        else if (toolId === 'twitter-header') { width = 1500; height = 500; }
        else if (toolId === 'facebook-cover') { width = 820; height = 312; }
        else if (toolId === 'linkedin-banner') { width = 1584; height = 396; }
        else if (toolId === 'pan-card-photo') { width = 213; height = 213; }
        else if (toolId === 'signature-resize') { width = 140; height = 60; }
        else if (toolId === 'ssc-upsc-photo') { width = 350; height = 450; }
        else if (toolId === 'whatsapp-dp') { width = 1080; height = 1080; }

        resultBuffer = await imageService.resizeImage(file.path, {
          width: width || 800,
          height: height || 600,
          fit: options.fit || 'inside',
          format: options.format || 'jpg',
          quality: options.quality ? parseInt(options.quality, 10) : 85,
        });
        outExt = options.format || 'jpg';
        mimeType = `image/${outExt === 'jpg' ? 'jpeg' : outExt}`;
        break;
      }
      case 'compress-png': {
        resultBuffer = await imageService.convertAndCompress(file.path, {
          format: 'png',
          quality: options.quality || 80,
        });
        outExt = 'png';
        mimeType = 'image/png';
        break;
      }
      case 'compress-to-size-kb':
      case 'compress-gif': {
        resultBuffer = await imageService.convertAndCompress(file.path, {
          format: 'jpeg',
          quality: options.quality || 60,
        });
        outExt = 'jpg';
        mimeType = 'image/jpeg';
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
      case 'image-to-text': {
        const ocrData = await pdfService.ocrDocument(file.path, options);
        try { fs.unlinkSync(file.path); } catch (_) {}
        const durationMs = Date.now() - startTime;
        await recordJob({ user: req.user, toolId, status: 'completed', durationMs });
        return res.json({
          success: true,
          toolId,
          data: ocrData,
          processingTimeMs: durationMs,
        });
      }
      case 'base64-encode': {
        const fileBytes = fs.readFileSync(file.path);
        const meta = await imageService.getImageMetadata(file.path);
        const b64 = fileBytes.toString('base64');
        const mime = `image/${meta.format || 'png'}`;
        const dataUri = `data:${mime};base64,${b64}`;
        try { fs.unlinkSync(file.path); } catch (_) {}
        const durationMs = Date.now() - startTime;
        await recordJob({ user: req.user, toolId, status: 'completed', durationMs });
        return res.json({
          success: true,
          toolId,
          data: {
            base64: b64,
            dataUri,
            sizeBytes: fileBytes.length,
            mimeType: mime,
          },
          processingTimeMs: durationMs,
        });
      }
      case 'svg-optimizer': {
        const rawSvg = fs.readFileSync(file.path, 'utf8');
        const optimized = rawSvg.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim();
        resultBuffer = Buffer.from(optimized, 'utf8');
        outExt = 'svg';
        mimeType = 'image/svg+xml';
        break;
      }
      case 'increase-image-size-kb': {
        const targetKb = parseInt(options.targetKb, 10) || 500;
        const targetBytes = targetKb * 1024;
        let buf = await sharp(file.path).jpeg({ quality: 100, chromaSubsampling: '4:4:4' }).toBuffer();
        if (buf.length < targetBytes) {
          const padLength = targetBytes - buf.length;
          const padding = Buffer.alloc(padLength, 0);
          buf = Buffer.concat([buf, padding]);
        }
        resultBuffer = buf;
        outExt = 'jpg';
        mimeType = 'image/jpeg';
        break;
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
      case 'reorder-pdf':
      case 'organize-pdf': {
        let order = [1];
        if (options.order) {
          if (Array.isArray(options.order)) order = options.order;
          else if (typeof options.order === 'string' && options.order.startsWith('[')) {
            try { order = JSON.parse(options.order); } catch (_) { order = [1]; }
          } else if (typeof options.order === 'string') {
            order = options.order.split(',').map((n) => parseInt(n.trim(), 10)).filter(Boolean);
          }
        }
        resultBuffer = await pdfService.reorderPdfPages(files[0].path, { order });
        outName = files[0].originalname;
        break;
      }
      case 'delete-pdf-pages':
      case 'remove-pdf-pages': {
        let pages = [1];
        if (options.pages) {
          if (Array.isArray(options.pages)) pages = options.pages;
          else if (typeof options.pages === 'string' && options.pages.startsWith('[')) {
            try { pages = JSON.parse(options.pages); } catch (_) { pages = [1]; }
          } else if (typeof options.pages === 'string') {
            pages = options.pages.split(',').map((n) => parseInt(n.trim(), 10)).filter(Boolean);
          }
        }
        resultBuffer = await pdfService.deletePdfPages(files[0].path, { pagesToDelete: pages });
        outName = files[0].originalname;
        break;
      }
      case 'extract-pdf-pages': {
        const primaryFile = files[0];
        const splitResult = await pdfService.splitPdf(primaryFile.path, {
          mode: options.mode || 'range',
          ranges: options.ranges || '1',
        });
        resultBuffer = splitResult.buffer;
        outName = 'extracted_pages.pdf';
        break;
      }
      case 'watermark-pdf':
      case 'add-watermark-pdf': {
        resultBuffer = await pdfService.addWatermark(files[0].path, options);
        outName = files[0].originalname;
        break;
      }
      case 'page-numbers-pdf':
      case 'add-page-numbers': {
        resultBuffer = await pdfService.addPageNumbers(files[0].path, options);
        outName = files[0].originalname;
        break;
      }
      case 'repair-pdf': {
        resultBuffer = fs.readFileSync(files[0].path);
        outName = `repaired_${files[0].originalname}`;
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
      case 'crop-pdf': {
        resultBuffer = await pdfService.cropPdf(files[0].path, options);
        outName = `cropped_${files[0].originalname}`;
        break;
      }
      case 'redact-pdf': {
        resultBuffer = await pdfService.redactPdf(files[0].path, options);
        outName = `redacted_${files[0].originalname}`;
        break;
      }
      case 'jpg-to-pdf':
      case 'images-to-pdf': {
        const imageBuffers = files.map((f) => fs.readFileSync(f.path));
        resultBuffer = await pdfService.imagesToPdf(imageBuffers, options);
        outName = 'converted_images.pdf';
        break;
      }
      case 'ai-pdf-summarizer':
      case 'translate-pdf':
      case 'pdf-to-markdown': {
        const extracted = await pdfService.extractTextFromPdf(files[0].path);
        let task = 'summarize';
        if (toolId === 'translate-pdf') task = 'translate';
        if (toolId === 'pdf-to-markdown') task = 'markdown';
        const aiResult = await aiService.processDocumentAi(extracted.text, task, options);
        files.forEach((f) => { try { fs.unlinkSync(f.path); } catch (_) {} });
        return res.json({
          success: true,
          toolId,
          data: aiResult,
          processingTimeMs: Date.now() - startTime,
        });
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
    else if (toolId === 'translate-document' || toolId === 'translate-pdf') task = 'translate';
    else if (toolId === 'pdf-to-markdown') task = 'markdown';
    else if (toolId === 'ai-pdf-summarizer' || toolId === 'summarize-pdf') task = 'summarize';

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
