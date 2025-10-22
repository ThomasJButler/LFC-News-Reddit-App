/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description URL and HTML sanitisation utilities to prevent XSS attacks.
 *              Validates URL protocols and strips dangerous HTML patterns.
 */

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'];

/**
 * @param {string} url - URL string to validate and sanitise
 * @return {string} Sanitised URL or '#' fallback if invalid or dangerous
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  const cleanUrl = url.trim();

  // Relative URLs are safe for internal navigation
  if (cleanUrl.startsWith('/') || cleanUrl.startsWith('./') || cleanUrl.startsWith('../')) {
    return cleanUrl;
  }

  try {
    const urlObj = new URL(cleanUrl);

    // Whitelist approach prevents javascript:, data:, and other dangerous protocols
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
      return '#';
    }

    return cleanUrl;
  } catch (error) {
    return '#';
  }
};

/**
 * @param {string} html - HTML string to sanitise
 * @return {string} HTML with script tags and event handlers removed
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Pattern 1: Remove script tags and their contents
  // Pattern 2: Strip event handler attributes (onclick, onerror, etc.)
  // Pattern 3: Remove javascript: protocol from inline attributes
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
};