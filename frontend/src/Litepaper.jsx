import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import './Litepaper.css';

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

function Litepaper() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/litepaper.md')
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch((err) => console.error("Error fetching litepaper:", err));
  }, []);

  useEffect(() => {
    if (content) {
      setTimeout(() => {
        mermaid.run({
          querySelector: '.mermaid'
        }).catch(e => console.error("Mermaid render error:", e));
      }, 100);
    }
  }, [content]);

  return (
    <div className="litepaper-container">
      <div className="litepaper-content">
        <ReactMarkdown
          components={{
            code(props) {
              const {children, className, ...rest} = props;
              const match = /language-(\w+)/.exec(className || '');
              if (match && match[1] === 'mermaid') {
                return (
                  <div className="mermaid">
                    {String(children).replace(/\n$/, '')}
                  </div>
                );
              }
              return (
                <code {...rest} className={className}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default Litepaper;
