import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import './Litepaper.css';

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

function MermaidChart({ chart }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    if (chart) {
      // Use a unique ID for the mermaid render
      const id = 'mermaid-svg-' + Math.random().toString(36).substr(2, 9);
      mermaid.render(id, chart)
        .then((result) => {
          setSvg(result.svg);
        })
        .catch((err) => console.error('Mermaid render error:', err));
    }
  }, [chart]);

  return <div dangerouslySetInnerHTML={{ __html: svg }} style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }} />;
}

function Litepaper() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/litepaper.md')
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch((err) => console.error("Error fetching litepaper:", err));
  }, []);

  return (
    <div className="litepaper-container">
      <div className="litepaper-content">
        <ReactMarkdown
          components={{
            code(props) {
              const {children, className, ...rest} = props;
              const match = /language-(\w+)/.exec(className || '');
              if (match && match[1] === 'mermaid') {
                return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
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
