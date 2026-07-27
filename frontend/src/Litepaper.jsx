import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './Litepaper.css'; // We will create this for markdown styling

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
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default Litepaper;
