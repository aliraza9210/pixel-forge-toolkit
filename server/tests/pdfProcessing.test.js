/**
 * @jest-environment node
 */
'use strict';

process.env.NODE_ENV = 'test';

const { PDFDocument, StandardFonts } = require('pdf-lib');
const sharp = require('sharp');
const pdfService = require('../src/services/pdfService');

describe('PDF Processing Service', () => {
  jest.setTimeout(20000);
  let samplePdf1;
  let samplePdf2;

  beforeAll(async () => {
    // PDF 1 with 2 pages
    const doc1 = await PDFDocument.create();
    const font1 = await doc1.embedFont(StandardFonts.Helvetica);
    const p1 = doc1.addPage([300, 400]);
    p1.drawText('Page One of Document One', { font: font1, size: 12 });
    const p2 = doc1.addPage([300, 400]);
    p2.drawText('Page Two of Document One', { font: font1, size: 12 });
    samplePdf1 = Buffer.from(await doc1.save({ useObjectStreams: false }));

    // PDF 2 with 1 page
    const doc2 = await PDFDocument.create();
    const font2 = await doc2.embedFont(StandardFonts.Helvetica);
    const dp1 = doc2.addPage([300, 400]);
    dp1.drawText('Document Two Content for merging', { font: font2, size: 12 });
    samplePdf2 = Buffer.from(await doc2.save({ useObjectStreams: false }));
  });

  test('merges multiple PDF documents', async () => {
    const mergedBytes = await pdfService.mergePdfs([samplePdf1, samplePdf2]);
    const mergedDoc = await PDFDocument.load(mergedBytes);
    expect(mergedDoc.getPageCount()).toBe(3);
  });

  test('splits PDF by page range', async () => {
    const splitResult = await pdfService.splitPdf(samplePdf1, {
      mode: 'range',
      ranges: '1',
    });
    expect(splitResult.type).toBe('pdf');
    const splitDoc = await PDFDocument.load(splitResult.buffer);
    expect(splitDoc.getPageCount()).toBe(1);
  });

  test('rotates PDF pages by 90 degrees', async () => {
    const rotatedBytes = await pdfService.rotatePdfPages(samplePdf1, {
      angle: 90,
      pageNumbers: [1],
    });
    const rotatedDoc = await PDFDocument.load(rotatedBytes);
    const page1 = rotatedDoc.getPage(0);
    expect(page1.getRotation().angle).toBe(90);
  });

  test('adds watermark to all pages of a PDF', async () => {
    const watermarkedBytes = await pdfService.addWatermark(samplePdf1, {
      text: 'PIXELFORGE TEST',
      fontSize: 24,
    });
    const doc = await PDFDocument.load(watermarkedBytes);
    expect(doc.getPageCount()).toBe(2);
  });

  test('adds page numbers to a PDF', async () => {
    const numberedBytes = await pdfService.addPageNumbers(samplePdf1, {
      position: 'bottom-center',
      format: 'Page {n} of {total}',
    });
    const doc = await PDFDocument.load(numberedBytes);
    expect(doc.getPageCount()).toBe(2);
  });

  test('extracts text and metadata statistics from a PDF', async () => {
    const extracted = await pdfService.extractTextFromPdf(samplePdf1);
    expect(extracted.pageCount).toBe(2);
    expect(extracted.text).toContain('Page One');
    expect(extracted.statistics.wordCount).toBeGreaterThan(0);
    expect(extracted.statistics.characterCount).toBeGreaterThan(0);
  });

  test('converts plain text to a multi-page PDF', async () => {
    const textContent = 'PixelForge Text to PDF generation.\nLine 2 of test document.\nLine 3 of document.';
    const pdfBytes = await pdfService.textToPdf(textContent, { title: 'Test PDF' });
    const doc = await PDFDocument.load(pdfBytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  test('converts images into a multi-page PDF', async () => {
    const testImg1 = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } },
    }).jpeg().toBuffer();

    const testImg2 = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 0, g: 255, b: 0 } },
    }).png().toBuffer();

    const pdfBytes = await pdfService.imagesToPdf([testImg1, testImg2]);
    const doc = await PDFDocument.load(pdfBytes);
    expect(doc.getPageCount()).toBe(2);
  });

  test('compares two PDFs and returns similarity metrics', async () => {
    const comparison = await pdfService.comparePdfs(samplePdf1, samplePdf2);
    expect(comparison.doc1.pageCount).toBe(2);
    expect(comparison.doc2.pageCount).toBe(1);
    expect(typeof comparison.comparison.similarityPercentage).toBe('number');
  });
});
