import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty) => {
  if (!dirty) return '';
  
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b',
      'a', 'ul', 'ol', 'li', 'blockquote', 'code',
      'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'del', 'sup', 'sub', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'],
    FORCE_BODY: true,
    RETURN_TRUSTED_TYPE: false
  };
  
  const clean = DOMPurify.sanitize(dirty, config);
  
  return clean;
};

export const sanitizeText = (text) => {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const sanitizeUrl = (url) => {
  if (!url) return '#';
  
  const allowedProtocols = ['http:', 'https:', 'mailto:'];
  
  try {
    const urlObj = new URL(url);
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return '#';
    }
    return url;
  } catch {
    if (url.startsWith('/')) {
      return url;
    }
    return '#';
  }
};

export const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const addSecureLinksAttributes = (html) => {
  if (!html) return '';
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = doc.querySelectorAll('a');
  
  links.forEach(link => {
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('target', '_blank');
  });
  
  return doc.body.innerHTML;
};