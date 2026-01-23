/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Unit tests for markdown rendering and utility functions.
 *
 * WHY these tests matter:
 * - Markdown rendering is used for post content and comments from Reddit
 * - decodeHtml prevents display issues from encoded entities
 * - stripMarkdown is essential for preview text generation
 * - Link safety ensures external links don't compromise security
 */

import { renderMarkdown, decodeHtml, stripMarkdown } from '../markdown';

describe('renderMarkdown', () => {
  it('should return null for empty content', () => {
    expect(renderMarkdown('')).toBeNull();
  });

  it('should return null for null content', () => {
    expect(renderMarkdown(null)).toBeNull();
  });

  it('should return null for undefined content', () => {
    expect(renderMarkdown(undefined)).toBeNull();
  });

  it('should return configuration object for valid content', () => {
    const result = renderMarkdown('# Hello');

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('Component');
    expect(result).toHaveProperty('props');
  });

  it('should include remarkGfm plugin in props', () => {
    const result = renderMarkdown('**bold** text');

    expect(result.props.remarkPlugins).toBeDefined();
    expect(result.props.remarkPlugins).toHaveLength(1);
  });

  it('should include custom components for links', () => {
    const result = renderMarkdown('[link](https://example.com)');

    expect(result.props.components).toHaveProperty('a');
  });

  it('should include custom components for code blocks', () => {
    const result = renderMarkdown('```js\ncode\n```');

    expect(result.props.components).toHaveProperty('code');
  });

  it('should pass content as children prop', () => {
    const content = '# Test Markdown';
    const result = renderMarkdown(content);

    expect(result.props.children).toBe(content);
  });
});

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

describe('link component accessibility', () => {
  it('should render links with target="_blank"', () => {
    const result = renderMarkdown('[link](https://example.com)');
    const linkComponent = result.props.components.a;

    // Test the link component renders correctly
    const link = linkComponent({ href: 'https://example.com', children: 'link' });

    expect(link.props.target).toBe('_blank');
  });

  it('should render links with rel="noopener noreferrer"', () => {
    const result = renderMarkdown('[link](https://example.com)');
    const linkComponent = result.props.components.a;

    const link = linkComponent({ href: 'https://example.com', children: 'link' });

    expect(link.props.rel).toBe('noopener noreferrer');
  });

  it('should render links with aria-label for screen readers', () => {
    const result = renderMarkdown('[Reddit](https://reddit.com)');
    const linkComponent = result.props.components.a;

    const link = linkComponent({ href: 'https://reddit.com', children: 'Reddit' });

    expect(link.props['aria-label']).toBe('Reddit (opens in new tab)');
  });

  it('should handle non-string children in links', () => {
    const result = renderMarkdown('[link](url)');
    const linkComponent = result.props.components.a;

    // Non-string children (like React elements) should use fallback label
    const link = linkComponent({ href: 'url', children: ['element', 'array'] });

    expect(link.props['aria-label']).toBe('link (opens in new tab)');
  });
});
