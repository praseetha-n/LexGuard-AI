import React, { useState } from 'react';

export default function AnswerCard({ answer }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API restricted
      setCopied(false);
    }
  };

  return (
    <article className="result-card answer-card" aria-labelledby="answer-heading">
      <div className="card-header">
        <h3 id="answer-heading" className="card-title">Answer</h3>

        <button 
          type="button" 
          className="copy-btn" 
          onClick={handleCopy}
          title="Copy synthesized answer to clipboard"
          aria-label="Copy legal answer text"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="answer-body">
        <p className="answer-text">{answer}</p>
      </div>
    </article>
  );
}
