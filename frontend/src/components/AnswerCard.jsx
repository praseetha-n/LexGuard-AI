import React, { useState } from 'react';

export default function AnswerCard({ answer, query }) {
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
        <div className="card-header-left">
          <div className="card-icon card-icon--navy" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h3 id="answer-heading" className="card-title">Synthesized Legal Analysis</h3>
            {query && <p className="card-query-reference">Inquiry: “{query}”</p>}
          </div>
        </div>

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

      <div className="answer-footer">
        <span className="pipeline-source-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 8 8 12 12 16 12 8" />
          </svg>
          Multi-agent synthesis — see verification audit and cited passages below
        </span>
      </div>
    </article>
  );
}
