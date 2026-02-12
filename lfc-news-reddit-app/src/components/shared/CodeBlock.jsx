import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * CodeBlock — syntax-highlighted code with copy-to-clipboard.
 * Used by markdown renderer for code blocks in posts/comments.
 * Supports language detection from className and line numbers for long blocks.
 */
const CodeBlock = React.memo(({ children, className, inline }) => {
  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  const code = String(children).replace(/\n$/, '');

  if (inline) {
    return (
      <code
        className={cn(
          'rounded px-1.5 py-0.5 font-mono text-[0.875em]',
          'bg-secondary text-primary border border-border'
        )}
      >
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy code — try selecting and copying manually');
    }
  };

  const showLineNumbers = code.split('\n').length > 5;

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border border-border bg-card"
      data-testid="code-block"
    >
      {/* Header: language badge + copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border/50">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            'inline-flex items-center gap-1.5 rounded px-2 py-1',
            'text-xs font-medium text-muted-foreground',
            'border border-border/50 bg-transparent',
            'transition-all duration-200',
            'hover:bg-secondary hover:text-foreground hover:border-border',
            'active:scale-95'
          )}
          aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax-highlighted code */}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        wrapLines={true}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 0.5rem 0.5rem',
          fontSize: '0.875rem',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
