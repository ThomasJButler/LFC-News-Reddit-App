/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Markdown rendering configuration with GitHub-flavoured markdown support.
 *              Configures safe link handling and code block styling.
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        code: ({ inline, children }) => (
          inline ? 
            <code className="inline-code">{children}</code> :
            <pre className="code-block"><code>{children}</code></pre>
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