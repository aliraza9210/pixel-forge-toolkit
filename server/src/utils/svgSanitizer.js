'use strict';

/**
 * Robust, dependency-safe SVG sanitizer for Node.js CommonJS environment.
 * Strips script tags, on* event handlers, foreignObject, iframe, embed, object,
 * and dangerous URI schemes (javascript:, data:text/html, vbscript:).
 *
 * @param {string|Buffer} svgContent
 * @returns {string} Sanitized SVG string
 */
function sanitizeSvg(svgContent) {
  if (!svgContent) return '';
  let str = Buffer.isBuffer(svgContent) ? svgContent.toString('utf8') : String(svgContent);

  // 1. Remove dangerous XML/HTML tags and their contents completely
  const forbiddenTags = [
    'script',
    'foreignObject',
    'iframe',
    'object',
    'embed',
    'applet',
    'meta',
    'link',
    'style',
  ];

  for (const tag of forbiddenTags) {
    const tagRegex = new RegExp(`<\\s*${tag}\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*${tag}\\s*>`, 'gi');
    str = str.replace(tagRegex, '');
    const selfClosingRegex = new RegExp(`<\\s*${tag}\\b[^>]*\\/?>`, 'gi');
    str = str.replace(selfClosingRegex, '');
  }

  // 2. Strip inline JavaScript event handlers (e.g. onload, onclick, onmouseover, onerror)
  str = str.replace(/\b(on[a-z]{3,20})\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');

  // 3. Strip dangerous href protocols (javascript:, vbscript:, data:text/html)
  str = str.replace(
    /\b(href|xlink:href)\s*=\s*["']\s*(javascript|vbscript|data\s*:\s*text\/html)[^"']*["']/gi,
    'href="#"'
  );

  return str;
}

module.exports = { sanitizeSvg };
