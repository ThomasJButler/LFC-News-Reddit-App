/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Unit tests for URL and HTML sanitisation utilities.
 *
 * WHY these tests matter:
 * - Sanitisation is critical for preventing XSS attacks from Reddit content
 * - User-generated content from Reddit can contain malicious scripts/URLs
 * - OWASP Top 10 security vulnerabilities must be prevented
 */

import { sanitizeUrl, sanitizeHtml } from '../sanitize';

describe('sanitizeUrl', () => {
  describe('valid URLs', () => {
    it('should allow https URLs', () => {
      expect(sanitizeUrl('https://reddit.com')).toBe('https://reddit.com');
    });

    it('should allow http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should allow mailto URLs', () => {
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    });

    it('should preserve URL query parameters', () => {
      const url = 'https://reddit.com/r/LiverpoolFC?sort=hot&t=day';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should preserve URL fragments', () => {
      const url = 'https://reddit.com/r/LiverpoolFC#comments';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should preserve complex URLs with paths', () => {
      const url = 'https://reddit.com/r/LiverpoolFC/comments/abc123/post_title';
      expect(sanitizeUrl(url)).toBe(url);
    });
  });

  describe('relative URLs', () => {
    it('should allow root-relative URLs starting with /', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    });

    it('should allow relative URLs starting with ./', () => {
      expect(sanitizeUrl('./relative/path')).toBe('./relative/path');
    });

    it('should allow parent-relative URLs starting with ../', () => {
      expect(sanitizeUrl('../parent/path')).toBe('../parent/path');
    });
  });

  describe('dangerous protocols', () => {
    it('should block javascript: protocol URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
    });

    it('should block javascript: with mixed case', () => {
      expect(sanitizeUrl('JavaScript:alert(1)')).toBe('#');
      expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('#');
      expect(sanitizeUrl('jAvAsCrIpT:alert(1)')).toBe('#');
    });

    it('should block data: protocol URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
    });

    it('should block vbscript: protocol URLs', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#');
    });

    it('should block file: protocol URLs', () => {
      expect(sanitizeUrl('file:///etc/passwd')).toBe('#');
    });

    it('should block ftp: protocol URLs', () => {
      expect(sanitizeUrl('ftp://example.com/file')).toBe('#');
    });
  });

  describe('invalid inputs', () => {
    it('should return # for null input', () => {
      expect(sanitizeUrl(null)).toBe('#');
    });

    it('should return # for undefined input', () => {
      expect(sanitizeUrl(undefined)).toBe('#');
    });

    it('should return # for empty string', () => {
      expect(sanitizeUrl('')).toBe('#');
    });

    it('should return # for non-string inputs', () => {
      expect(sanitizeUrl(123)).toBe('#');
      expect(sanitizeUrl({})).toBe('#');
      expect(sanitizeUrl([])).toBe('#');
      expect(sanitizeUrl(true)).toBe('#');
    });

    it('should return # for malformed URLs', () => {
      expect(sanitizeUrl('not a valid url')).toBe('#');
      expect(sanitizeUrl('://missing-protocol')).toBe('#');
    });
  });

  describe('whitespace handling', () => {
    it('should trim leading/trailing whitespace', () => {
      expect(sanitizeUrl('  https://reddit.com  ')).toBe('https://reddit.com');
    });

    it('should handle URLs with only whitespace', () => {
      expect(sanitizeUrl('   ')).toBe('#');
    });
  });

  describe('XSS attack vectors', () => {
    it('should block encoded javascript URLs', () => {
      // Note: URL constructor normalises encoding, this tests edge cases
      expect(sanitizeUrl('javascript:void(0)')).toBe('#');
    });

    it('should handle javascript URL with spaces', () => {
      expect(sanitizeUrl('java script:alert(1)')).toBe('#');
    });

    it('should handle javascript URL with line breaks in encoded form', () => {
      expect(sanitizeUrl('javascript\n:alert(1)')).toBe('#');
    });
  });
});

describe('sanitizeHtml', () => {
  describe('script tag removal', () => {
    it('should remove script tags with content', () => {
      const input = '<p>Safe</p><script>alert(1)</script><p>Also safe</p>';
      expect(sanitizeHtml(input)).toBe('<p>Safe</p><p>Also safe</p>');
    });

    it('should remove script tags with src attribute', () => {
      const input = '<p>Content</p><script src="evil.js"></script>';
      expect(sanitizeHtml(input)).toBe('<p>Content</p>');
    });

    it('should remove multiple script tags', () => {
      const input = '<script>alert(1)</script><p>Safe</p><script>alert(2)</script>';
      expect(sanitizeHtml(input)).toBe('<p>Safe</p>');
    });

    it('should handle script tags with attributes', () => {
      const input = '<script type="text/javascript" async>code</script>';
      expect(sanitizeHtml(input)).toBe('');
    });

    it('should remove script tags case-insensitively', () => {
      const input = '<SCRIPT>alert(1)</SCRIPT><Script>alert(2)</Script>';
      expect(sanitizeHtml(input)).toBe('');
    });
  });

  describe('event handler removal', () => {
    it('should remove onclick handlers with double quotes', () => {
      const input = '<button onclick="alert(1)">Click</button>';
      expect(sanitizeHtml(input)).toBe('<button >Click</button>');
    });

    it('should remove onclick handlers with single quotes', () => {
      const input = "<button onclick='alert(1)'>Click</button>";
      expect(sanitizeHtml(input)).toBe('<button >Click</button>');
    });

    it('should remove onerror handlers', () => {
      const input = '<img src="x" onerror="alert(1)">';
      expect(sanitizeHtml(input)).toBe('<img src="x" >');
    });

    it('should remove onload handlers', () => {
      const input = '<body onload="alert(1)">Content</body>';
      expect(sanitizeHtml(input)).toBe('<body >Content</body>');
    });

    it('should remove onmouseover handlers', () => {
      const input = '<div onmouseover="alert(1)">Hover</div>';
      expect(sanitizeHtml(input)).toBe('<div >Hover</div>');
    });

    it('should remove onfocus handlers', () => {
      const input = '<input onfocus="alert(1)">';
      expect(sanitizeHtml(input)).toBe('<input >');
    });

    it('should remove multiple event handlers from one element', () => {
      const input = '<div onclick="a()" onmouseover="b()" onfocus="c()">Text</div>';
      const result = sanitizeHtml(input);
      // Multiple handlers removed, exact spacing may vary
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onmouseover');
      expect(result).not.toContain('onfocus');
      expect(result).toContain('Text');
    });

    it('should handle event handlers case-insensitively', () => {
      const input = '<button ONCLICK="alert(1)" OnClick="alert(2)">Click</button>';
      expect(sanitizeHtml(input)).toBe('<button  >Click</button>');
    });
  });

  describe('javascript: protocol removal', () => {
    it('should remove javascript: from href attributes', () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      expect(sanitizeHtml(input)).toBe('<a href="alert(1)">Link</a>');
    });

    it('should remove javascript: case-insensitively', () => {
      const input = '<a href="JAVASCRIPT:alert(1)">Link</a>';
      expect(sanitizeHtml(input)).toBe('<a href="alert(1)">Link</a>');
    });

    it('should remove javascript: from src attributes', () => {
      const input = '<iframe src="javascript:alert(1)"></iframe>';
      expect(sanitizeHtml(input)).toBe('<iframe src="alert(1)"></iframe>');
    });
  });

  describe('invalid inputs', () => {
    it('should return empty string for null input', () => {
      expect(sanitizeHtml(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(sanitizeHtml(undefined)).toBe('');
    });

    it('should return empty string for empty string input', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should return empty string for non-string inputs', () => {
      expect(sanitizeHtml(123)).toBe('');
      expect(sanitizeHtml({})).toBe('');
      expect(sanitizeHtml([])).toBe('');
    });
  });

  describe('safe content preservation', () => {
    it('should preserve safe HTML tags', () => {
      const input = '<p>Paragraph</p><strong>Bold</strong><em>Italic</em>';
      expect(sanitizeHtml(input)).toBe(input);
    });

    it('should preserve safe attributes', () => {
      const input = '<a href="https://reddit.com" class="link">Reddit</a>';
      expect(sanitizeHtml(input)).toBe(input);
    });

    it('should preserve inline styles (not event handlers)', () => {
      const input = '<div style="color: red;">Styled</div>';
      expect(sanitizeHtml(input)).toBe(input);
    });

    it('should preserve data attributes', () => {
      const input = '<div data-id="123" data-name="test">Content</div>';
      expect(sanitizeHtml(input)).toBe(input);
    });

    it('should preserve images with safe src', () => {
      const input = '<img src="https://example.com/image.jpg" alt="Description">';
      expect(sanitizeHtml(input)).toBe(input);
    });
  });

  describe('complex XSS attack patterns', () => {
    it('should handle nested malicious content', () => {
      const input = '<p onclick="alert(1)"><script>code</script><span onmouseover="alert(2)">Text</span></p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('script');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onmouseover');
    });

    it('should handle SVG-based XSS', () => {
      const input = '<svg onload="alert(1)"><circle r="50"></circle></svg>';
      expect(sanitizeHtml(input)).toBe('<svg ><circle r="50"></circle></svg>');
    });

    it('should handle combined attack vectors', () => {
      const input = '<a href="javascript:alert(1)" onclick="alert(2)">Click me</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('onclick');
    });
  });

  describe('Reddit-specific content', () => {
    it('should preserve Reddit markdown rendered HTML', () => {
      const input = '<p>Check out <a href="https://reddit.com/r/LiverpoolFC">r/LiverpoolFC</a></p>';
      expect(sanitizeHtml(input)).toBe(input);
    });

    it('should preserve blockquotes', () => {
      const input = '<blockquote>Quoted text</blockquote>';
      expect(sanitizeHtml(input)).toBe(input);
    });

    it('should preserve code blocks', () => {
      const input = '<pre><code>console.log("test");</code></pre>';
      expect(sanitizeHtml(input)).toBe(input);
    });
  });
});
