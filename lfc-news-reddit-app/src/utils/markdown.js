import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

export const decodeHtml = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};