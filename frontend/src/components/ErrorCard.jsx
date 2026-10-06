import React from 'react';

export default function ErrorCard({ error, details, isNetworkError, onRetry }) {
  if (!error) return null;

  return (
    <section className="error-card-container" role="alert" aria-live="assertive">
      <div className="error-card">
        <div className="error-icon-column" aria-hidden="true">
          <div className="error-icon-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        <div className="error-body">
          <h3 className="error-title">
            {isNetworkError ? 'LexGuard AI is temporarily unavailable.' : 'Research Request Failed'}
          </h3>
          <p className="error-description">
            {isNetworkError
              ? 'Please make sure the backend services are running and try again.'
              : error}
          </p>

          {isNetworkError && (
            <div className="error-troubleshooting">
              <span className="troubleshoot-title">Troubleshooting:</span>
              <ul>
                <li>Confirm the Orchestrator service is started on <code>http://127.0.0.1:8000</code></li>
                <li>Verify retrieval agent (port 8002) and verification agent (port 8004) are running</li>
                <li>Check network or browser CORS permissions if accessing from an external host</li>
              </ul>
            </div>
          )}

          {details && !isNetworkError && (
            <p className="error-extra-details">{details}</p>
          )}

          {onRetry && (
            <div className="error-actions">
              <button 
                type="button" 
                className="retry-btn" 
                onClick={onRetry}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                </svg>
                <span>Retry Query</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
