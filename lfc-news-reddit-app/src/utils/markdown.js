/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Markdown rendering configuration with GitHub-flavoured markdown support.
 *              Configures safe link handling and code block styling.
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '../components/shared/CodeBlock';

/**
 * @param {string} content - Markdown content to render
 * @return {Object|null} ReactMarkdown component configuration or null if no content
 */
export const renderMarkdown = (content) => {
  if (!content) return null;
  
  return {
    Component: ReactMarkdown,
    props: {
      children: content,
      remarkPlugins: [remarkGfm],
      components: {
        a: ({ href, children }) => {
          // Extract text content for aria-label (WHY: screen readers need descriptive label for external links)
          const linkText = typeof children === 'string' ? children : 'link';
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${linkText} (opens in new tab)`}
            >
              {children}
            </a>
          );
        },
        code: ({ inline, className, children }) => (
          <CodeBlock inline={inline} className={className}>
            {children}
          </CodeBlock>
        )
      }
    }
  };
};

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