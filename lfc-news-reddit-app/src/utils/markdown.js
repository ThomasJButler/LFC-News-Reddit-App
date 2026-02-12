/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Text utilities for markdown content: HTML entity decoding and
 *              markdown-to-plaintext stripping for post previews.
 */

/**
 * @param {string} html - HTML-encoded string to decode
 * @return {string} Decoded plain text with HTML entities converted
 */
export const decodeHtml = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

/**
 * @param {string} text - Markdown text to strip
 * @return {string} Plain text with markdown formatting removed
 */
export const stripMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s*/g, '')           // Headers
    .replace(/\*\*(.+?)\*\*/g, '$1')     // Bold
    .replace(/\*(.+?)\*/g, '$1')         // Italic
    .replace(/__(.+?)__/g, '$1')         // Bold (alt)
    .replace(/_(.+?)_/g, '$1')           // Italic (alt)
    .replace(/~~(.+?)~~/g, '$1')         // Strikethrough
    .replace(/`(.+?)`/g, '$1')           // Inline code
    .replace(/!\[.*?\]\(.+?\)/g, '')     // Images (WHY: must run before links regex to avoid leaving `!alt text`)
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')  // Links
    .replace(/^\s*[-*+]\s+/gm, '')       // Unordered lists
    .replace(/^\s*\d+\.\s+/gm, '')       // Ordered lists
    .replace(/^\s*>\s*/gm, '')           // Blockquotes
    .replace(/\n{2,}/g, ' ')             // Multiple newlines
    .replace(/\n/g, ' ')                 // Single newlines
    .trim();
};