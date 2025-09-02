/**
 * URL sanitization utility for security
 */

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'];

export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  // Remove any whitespace
  const cleanUrl = url.trim();
  
  // If it's a relative URL, allow it
  if (cleanUrl.startsWith('/') || cleanUrl.startsWith('./') || cleanUrl.startsWith('../')) {
    return cleanUrl;
  }

  try {
    const urlObj = new URL(cleanUrl);
    
    // Check if protocol is allowed
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
      return '#';
    }
    
    return cleanUrl;
  } catch (error) {
    // If URL is invalid, return safe fallback
    return '#';
  }
};

/**
 * Sanitize HTML content (basic implementation)
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Basic HTML sanitization - remove script tags and event handlers
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
};