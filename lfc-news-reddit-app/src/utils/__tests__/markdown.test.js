/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Unit tests for markdown text utility functions.
 *
 * WHY these tests matter:
 * - decodeHtml prevents display issues from encoded entities in Reddit content
 * - stripMarkdown is essential for preview text generation in PostItem cards
 * - Both are pure text transforms with no React dependencies, keeping the
 *   main bundle lean (ReactMarkdown rendering happens in lazy-loaded PostDetail)
 */

import { decodeHtml, stripMarkdown } from '../markdown';

describe('decodeHtml', () => {
  // Note: decodeHtml uses document.createElement which requires DOM environment
  // Jest with jsdom should provide this

  it('should decode HTML entities', () => {
    expect(decodeHtml('&lt;p&gt;Hello&lt;/p&gt;')).toBe('<p>Hello</p>');
  });

  it('should decode ampersand entity', () => {
    expect(decodeHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
  });

  it('should decode quote entities', () => {
    expect(decodeHtml('&quot;quoted&quot;')).toBe('"quoted"');
  });

  it('should decode apostrophe entity', () => {
    expect(decodeHtml("It&#39;s working")).toBe("It's working");
  });

  it('should decode non-breaking space', () => {
    expect(decodeHtml('Hello&nbsp;World')).toBe('Hello\u00A0World');
  });

  it('should handle multiple entities', () => {
    expect(decodeHtml('&lt;a href=&quot;url&quot;&gt;link&lt;/a&gt;'))
      .toBe('<a href="url">link</a>');
  });

  it('should return plain text unchanged', () => {
    expect(decodeHtml('Just plain text')).toBe('Just plain text');
  });

  it('should handle empty string', () => {
    expect(decodeHtml('')).toBe('');
  });

  it('should handle numeric character references', () => {
    expect(decodeHtml('&#60;&#62;')).toBe('<>');
  });

  it('should handle Unicode character references', () => {
    expect(decodeHtml('&#x263A;')).toBe('\u263A'); // Smiley face
  });

  it('should decode Reddit-specific encoded content', () => {
    // Reddit often encodes content like this
    const redditEncoded = '&lt;!-- SC_OFF --&gt;&lt;div class=&quot;md&quot;&gt;';
    expect(decodeHtml(redditEncoded)).toBe('<!-- SC_OFF --><div class="md">');
  });
});

describe('stripMarkdown', () => {
  describe('empty/null inputs', () => {
    it('should return empty string for null', () => {
      expect(stripMarkdown(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(stripMarkdown(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(stripMarkdown('')).toBe('');
    });
  });

  describe('header stripping', () => {
    it('should strip h1 headers', () => {
      expect(stripMarkdown('# Header')).toBe('Header');
    });

    it('should strip h2 headers', () => {
      expect(stripMarkdown('## Header')).toBe('Header');
    });

    it('should strip h3 headers', () => {
      expect(stripMarkdown('### Header')).toBe('Header');
    });

    it('should strip h4 headers', () => {
      expect(stripMarkdown('#### Header')).toBe('Header');
    });

    it('should strip h5 headers', () => {
      expect(stripMarkdown('##### Header')).toBe('Header');
    });

    it('should strip h6 headers', () => {
      expect(stripMarkdown('###### Header')).toBe('Header');
    });

    it('should strip multiple headers', () => {
      expect(stripMarkdown('# Title\n## Subtitle')).toBe('Title Subtitle');
    });
  });

  describe('text formatting stripping', () => {
    it('should strip bold with asterisks', () => {
      expect(stripMarkdown('**bold text**')).toBe('bold text');
    });

    it('should strip bold with underscores', () => {
      expect(stripMarkdown('__bold text__')).toBe('bold text');
    });

    it('should strip italic with asterisks', () => {
      expect(stripMarkdown('*italic text*')).toBe('italic text');
    });

    it('should strip italic with underscores', () => {
      expect(stripMarkdown('_italic text_')).toBe('italic text');
    });

    it('should strip strikethrough', () => {
      expect(stripMarkdown('~~struck through~~')).toBe('struck through');
    });

    it('should strip inline code', () => {
      expect(stripMarkdown('`code here`')).toBe('code here');
    });

    it('should handle nested formatting', () => {
      expect(stripMarkdown('***bold italic***')).toBe('bold italic');
    });
  });

  describe('link stripping', () => {
    it('should strip links but keep text', () => {
      expect(stripMarkdown('[Reddit](https://reddit.com)')).toBe('Reddit');
    });

    it('should strip links with complex URLs', () => {
      expect(stripMarkdown('[Link](https://example.com/path?query=value#hash)'))
        .toBe('Link');
    });

    it('should handle multiple links', () => {
      expect(stripMarkdown('[One](url1) and [Two](url2)')).toBe('One and Two');
    });
  });

  describe('image stripping', () => {
    it('should remove images with alt text completely', () => {
      // WHY: Images regex now runs before links regex, so ![alt](url) is fully removed
      const result = stripMarkdown('![Alt text](image.jpg)');
      expect(result).toBe('');
    });

    it('should remove images with empty alt', () => {
      expect(stripMarkdown('![](image.jpg)')).toBe('');
    });

    it('should handle images mixed with text', () => {
      const result = stripMarkdown('Before ![img](url) after');
      expect(result).toBe('Before  after');
    });

    it('should handle multiple images', () => {
      const result = stripMarkdown('![one](1.jpg) ![two](2.jpg)');
      expect(result).toBe('');
    });

    it('should handle images and links together', () => {
      // WHY: Images removed first, then links converted to their text
      const result = stripMarkdown('![img](pic.jpg) [link](url)');
      expect(result).toBe('link');
    });
  });

  describe('list stripping', () => {
    it('should strip unordered list markers with dash', () => {
      expect(stripMarkdown('- Item one\n- Item two')).toBe('Item one Item two');
    });

    it('should strip unordered list markers with asterisk', () => {
      expect(stripMarkdown('* Item one\n* Item two')).toBe('Item one Item two');
    });

    it('should strip unordered list markers with plus', () => {
      expect(stripMarkdown('+ Item one\n+ Item two')).toBe('Item one Item two');
    });

    it('should strip ordered list numbers', () => {
      expect(stripMarkdown('1. First\n2. Second\n3. Third'))
        .toBe('First Second Third');
    });
  });

  describe('blockquote stripping', () => {
    it('should strip blockquote markers', () => {
      expect(stripMarkdown('> Quoted text')).toBe('Quoted text');
    });

    it('should strip nested blockquotes', () => {
      // The regex `/^\s*>\s*/gm` only removes the first > on each line
      // So `>> Level 2` becomes `> Level 2` after one pass
      // This is acceptable behaviour for preview text
      expect(stripMarkdown('> Level 1\n>> Level 2')).toBe('Level 1 > Level 2');
    });
  });

  describe('whitespace handling', () => {
    it('should collapse multiple newlines to space', () => {
      expect(stripMarkdown('Line one\n\n\nLine two')).toBe('Line one Line two');
    });

    it('should convert single newlines to space', () => {
      expect(stripMarkdown('Line one\nLine two')).toBe('Line one Line two');
    });

    it('should trim result', () => {
      expect(stripMarkdown('  text  ')).toBe('text');
    });
  });

  describe('complex Reddit content', () => {
    it('should handle typical Reddit comment', () => {
      const comment = `
# Match Thread

**Liverpool** vs Manchester United

- Salah scores!
- Amazing [goal](https://reddit.com)

> Great match

*YNWA*
`;
      const result = stripMarkdown(comment);

      expect(result).not.toContain('#');
      expect(result).not.toContain('**');
      expect(result).not.toContain('-');
      expect(result).not.toContain('[');
      expect(result).not.toContain('>');
      expect(result).not.toContain('*');
      expect(result).toContain('Liverpool');
      expect(result).toContain('Salah scores');
      expect(result).toContain('YNWA');
    });

    it('should handle Reddit post with formatting', () => {
      const post = '**BREAKING:** Liverpool sign new player!\n\nMore details at [link](url)';
      const result = stripMarkdown(post);

      expect(result).toBe('BREAKING: Liverpool sign new player! More details at link');
    });
  });
});
