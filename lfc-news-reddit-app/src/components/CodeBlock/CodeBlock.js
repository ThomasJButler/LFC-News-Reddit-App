import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Icon from '../Icon/Icon';
import styles from './CodeBlock.module.css';

/**
 * CodeBlock component for rendering syntax-highlighted code blocks
 *
 * WHY: Provides better readability for code in posts/comments with syntax highlighting,
 * copy-to-clipboard functionality, and language indicators. Essential for technical discussions.
 *
 * Features:
 * - Syntax highlighting using Prism with VSCode Dark+ theme
 * - One-click copy to clipboard with visual feedback
 * - Language indicator badge
 * - Line numbers for longer code blocks
 * - Horizontal scroll for long lines
 * - Theme-aware styling that works with all three LFC themes
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The code content to display
 * @param {string} props.className - Optional className from markdown (format: "language-xxx")
 * @param {boolean} props.inline - Whether this is inline code (no highlighting needed)
 */
const CodeBlock = React.memo(({ children, className, inline }) => {
  const [copied, setCopied] = useState(false);

  // Extract language from className (format: "language-javascript")
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';

  // Get the actual code content
  const code = String(children).replace(/\n$/, '');

  // Handle inline code (no syntax highlighting)
  if (inline) {
    return <code className={styles.inlineCode}>{children}</code>;
  }

  // Copy to clipboard handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Determine if line numbers should be shown (for code blocks > 5 lines)
  const showLineNumbers = code.split('\n').length > 5;

  return (
    <div className={styles.codeBlockWrapper}>
      {/* Language indicator and copy button */}
      <div className={styles.codeHeader}>
        <span className={styles.languageBadge}>
          {language}
        </span>
        <button
          onClick={handleCopy}
          className={styles.copyButton}
          aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <Icon name="Check" size="sm" ariaHidden={true} />
              <span className={styles.copyText}>Copied!</span>
            </>
          ) : (
            <>
              <Icon name="Copy" size="sm" ariaHidden={true} />
              <span className={styles.copyText}>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax highlighted code */}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        wrapLines={true}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-mono)',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono)',
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

CodeBlock.propTypes = {
  // The code content to display
  children: PropTypes.node.isRequired,
  // Optional className from markdown (format: "language-xxx")
  className: PropTypes.string,
  // Whether this is inline code (no highlighting needed)
  inline: PropTypes.bool
};

export default CodeBlock;
